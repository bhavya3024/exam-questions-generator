require('dotenv').config({ path: '.env.local' });
const { put } = require('@vercel/blob');

async function testUpload() {
  try {
    console.log("Token:", process.env.BLOB_READ_WRITE_TOKEN);
    const blob = await put('test.pdf', 'hello world', { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
    console.log("Success:", blob.url);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
testUpload();
