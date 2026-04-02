const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function getFollowRedirects(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(getFollowRedirects(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ` + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Fetching Cairo-Regular.ttf...');
    await getFollowRedirects('https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Regular.ttf', path.join(dir, 'Cairo-Regular.ttf'));
    
    console.log('Fetching Cairo-Bold.ttf...');
    await getFollowRedirects('https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Bold.ttf', path.join(dir, 'Cairo-Bold.ttf'));
    
    console.log('Download complete.');
    
    const sizeRegular = fs.statSync(path.join(dir, 'Cairo-Regular.ttf')).size;
    const sizeBold = fs.statSync(path.join(dir, 'Cairo-Bold.ttf')).size;
    
    console.log(`Cairo-Regular.ttf size: ${sizeRegular} bytes`);
    console.log(`Cairo-Bold.ttf size: ${sizeBold} bytes`);
  } catch (e) {
    console.error('Error:', e);
  }
})();
