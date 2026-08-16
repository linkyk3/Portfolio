import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- CONFIGURATION ---
const ACCOUNT_ID = '994bc6536c40f4b32768fb3be7a92a22';
const ACCESS_KEY_ID = '9c215c13f93f4a9c2454b92c82743f7c';
const SECRET_ACCESS_KEY = '28f3b1ece6db0855720127b4d5b3c903c8c1d224784f920cdc78d2418e40427a';
const BUCKET_NAME = 'portfolio-assets';
const LOCAL_FOLDER = 'C:/Users/seppe/Documents/DOCUMENTS/portfolio-assets';
const R2_PREFIX = ''; // Destination prefix in R2

// Only these file types will ever be touched
const ALLOWED_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.pdf', '.svg']);
// ----------------------

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.svg': 'image/svg+xml',
  };
  return map[ext] || 'application/octet-stream';
}

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function hash(string) {
  return crypto.createHash('sha256').update(string, 'utf8').digest('hex');
}

function getAuthHeaders(method, canonicalUri, queryString, bodyBuffer, contentType = '') {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const payloadHash = hash(bodyBuffer);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const region = 'auto';
  const service = 's3';

  let canonicalHeaders = '';
  let signedHeaders = '';

  if (contentType) {
    canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  } else {
    canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  }

  const canonicalRequest = `${method}\n${canonicalUri}\n${queryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hash(canonicalRequest)}`;

  const kDate = hmac(`AWS4${SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'Authorization': authHeader,
  };
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

// Fetch all keys currently existing in the R2 bucket
async function getExistingR2Keys() {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}`;
  let continuationToken = '';
  const existingKeys = new Set();

  do {
    const query = continuationToken
      ? `continuation-token=${encodeURIComponent(continuationToken)}&list-type=2`
      : 'list-type=2';

    const headers = getAuthHeaders('GET', canonicalUri, query, '');
    const url = `https://${host}/${BUCKET_NAME}?${query}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.warn('Could not fetch existing bucket files, will upload all filtered files.');
      return existingKeys;
    }

    const xml = await res.text();
    const keyMatches = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => m[1]);
    keyMatches.forEach(k => existingKeys.add(decodeURIComponent(k)));

    const nextTokenMatch = xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/);
    continuationToken = nextTokenMatch ? nextTokenMatch[1] : '';
  } while (continuationToken);

  return existingKeys;
}

// Recursively find ONLY allowed media formats
function getLocalFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip hidden folders (.git, .cache, etc.)

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getLocalFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  }
  return arrayOfFiles;
}

async function uploadFile(fullPath, cleanKey) {
  const fileBuffer = fs.readFileSync(fullPath);
  const contentType = getMimeType(fullPath);
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET_NAME}/${encodeURI(cleanKey)}`;
  const url = `https://${host}/${BUCKET_NAME}/${encodeURI(cleanKey)}`;

  const headers = getAuthHeaders('PUT', canonicalUri, '', fileBuffer, contentType);

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
}

async function run() {
  console.log('1. Scanning local folder for valid images & PDFs...');
  const localFiles = getLocalFiles(LOCAL_FOLDER);
  console.log(`Found ${localFiles.length} valid media files locally.`);

  console.log('2. Checking existing files in Cloudflare R2...');
  const existingR2Keys = await getExistingR2Keys();
  console.log(`Found ${existingR2Keys.size} files already in R2.`);

  // Determine what is new
  const filesToUpload = localFiles.filter(filePath => {
    const relPath = path.relative(LOCAL_FOLDER, filePath).replace(/\\/g, '/');
    const targetKey = R2_PREFIX ? `${R2_PREFIX}/${relPath}` : relPath;
    return !existingR2Keys.has(targetKey);
  });

  if (filesToUpload.length === 0) {
    console.log('All media files are already synced with R2! Nothing to upload.');
    return;
  }

  console.log(`\n3. Uploading ${filesToUpload.length} new file(s)...`);

  for (const [index, filePath] of filesToUpload.entries()) {
    const relPath = path.relative(LOCAL_FOLDER, filePath).replace(/\\/g, '/');
    const targetKey = R2_PREFIX ? `${R2_PREFIX}/${relPath}` : relPath;

    try {
      await uploadFile(filePath, targetKey);
      console.log(`[${index + 1}/${filesToUpload.length}] Uploaded: ${targetKey}`);
    } catch (err) {
      console.error(`Failed ${targetKey}:`, err.message);
    }
  }

  console.log('\nSync finished successfully!');
}

run();