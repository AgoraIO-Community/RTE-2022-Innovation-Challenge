const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const os = require('os');
const appInfo = require('./app.json');
const packageInfo = require('./package.json');

console.log(appInfo);

async function eZip() {
  const filesPath = path.join(__dirname, 'dist');
  appInfo.version = packageInfo.version;
  await fs.writeFileSync(
    path.join(__dirname, 'dist/app.json'),
    JSON.stringify(appInfo),
  );
  const output = fs.createWriteStream(
    path.join(
      __dirname,
      `dist_v${packageInfo.version.replaceAll('.', '_')}_${Date.now()}.zip`,
    ),
  );
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });
  archive.pipe(output);
  archive.directory(filesPath, 'dist');
  archive.finalize();
}

eZip();
