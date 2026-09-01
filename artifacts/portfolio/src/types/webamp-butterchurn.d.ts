// webamp@2.3.1 ships built/types/js/webampWithButterchurn.d.ts but its package.json
// "./butterchurn" export points at the non-existent "butterchurn.d.ts" - patch it here.
declare module 'webamp/butterchurn' {
  import WebampWithButterchurn from 'webamp/built/types/js/webampWithButterchurn';
  export default WebampWithButterchurn;
}
