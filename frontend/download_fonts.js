const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  try {
    console.log('Downloading Cairo-Regular...');
    await downloadFile('https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Regular.ttf', path.join(dir, 'Cairo-Regular.ttf'));
    console.log('Downloading Cairo-Bold...');
    await downloadFile('https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Bold.ttf', path.join(dir, 'Cairo-Bold.ttf'));
    console.log('Fonts downloaded successfully');
  } catch (err) {
    console.error('Download failed:', err);
  }
})();
