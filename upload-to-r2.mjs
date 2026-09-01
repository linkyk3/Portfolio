import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- CONFIGURATION ---
const ACCOUNT_ID = '994bc6536c40f4b32768fb3be7a92a22';
const ACCESS_KEY_ID = '9c215c13f93f4a9c2454b92c82743f7c';
const SECRET_ACCESS_KEY = '28f3b1ece6db0855720127b4d5b3c903c8c1d224784f920cdc78d2418e40427a';
const BUCKET_NAME = 'portfolio-assets';

// Define folders to scan with their relative base path for R2
const FOLDERS_TO_SYNC = [
  {
    localPath: 'C:/Users/seppe/Documents/DOCUMENTS/portfolio-assets',
    prefix: '',
  },
  {
    localPath: 'C:/Users/seppe/Documents/DOCUMENTS/portfolio-assets/music/music-player',
    prefix: 'music/music-player',
  },
];

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.pdf', '.svg', '.mp3']);
// ----------------------

// Strict RFC 3986 encoding required for AWS SigV4
function awsUriEncode(str, isPath = true) {
  let encoded = encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  if (isPath) {
    encoded = encoded.replace(/%2F/g, '/');
  }
  return encoded;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
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

function getLocalFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

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

async function uploadFileWithRetry(fullPath, cleanKey, maxRetries = 3) {
  const fileBuffer = fs.readFileSync(fullPath);
  const contentType = getMimeType(fullPath);
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  
  // Strict percent-encoding applied to URI
  const encodedKey = awsUriEncode(cleanKey, true);
  const canonicalUri = `/${BUCKET_NAME}/${encodedKey}`;
  const url = `https://${host}/${BUCKET_NAME}/${encodedKey}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const headers = getAuthHeaders('PUT', canonicalUri, '', fileBuffer, contentType);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: fileBuffer,
      });

      if (response.ok) return;

      const errorText = await response.text();
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Attempt ${attempt}/${maxRetries}] Server error ${response.status}. Retrying in 2s...`);
        await new Promise(res => setTimeout(res, 2000));
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    } catch (err) {
      if (attempt < maxRetries && err.message.includes('fetch failed')) {
        console.warn(`[Attempt ${attempt}/${maxRetries}] Network drop. Retrying in 2s...`);
        await new Promise(res => setTimeout(res, 2000));
        continue;
      }
      throw err;
    }
  }
}

async function run() {
  console.log('1. Scanning local folders...');
  const allTasks = [];
  const seenPaths = new Set();

  for (const config of FOLDERS_TO_SYNC) {
    const files = getLocalFiles(config.localPath);
    for (const filePath of files) {
      if (seenPaths.has(filePath)) continue;
      seenPaths.add(filePath);

      const relPath = path.relative(config.localPath, filePath).replace(/\\/g, '/');
      const targetKey = config.prefix ? `${config.prefix}/${relPath}` : relPath;
      allTasks.push({ filePath, targetKey });
    }
  }

  console.log(`Found ${allTasks.length} valid media/music files locally.`);

  console.log('2. Checking existing files in Cloudflare R2...');
  const existingR2Keys = await getExistingR2Keys();
  console.log(`Found ${existingR2Keys.size} files already in R2.`);

  const filesToUpload = allTasks.filter(item => !existingR2Keys.has(item.targetKey));

  if (filesToUpload.length === 0) {
    console.log('All files are already synced with R2! Nothing to upload.');
    return;
  }

  console.log(`\n3. Uploading ${filesToUpload.length} new file(s)...`);

  for (const [index, item] of filesToUpload.entries()) {
    try {
      await uploadFileWithRetry(item.filePath, item.targetKey);
      console.log(`[${index + 1}/${filesToUpload.length}] Uploaded: ${item.targetKey}`);
    } catch (err) {
      console.error(`Failed ${item.targetKey}:`, err.message);
    }
  }

  console.log('\nSync finished successfully!');
}

run();