require("dotenv").config({ path: ".env.local" });
const { generateClientTokenFromReadWriteToken } = require("@vercel/blob/client");

async function run() {
  try {
    const token = await generateClientTokenFromReadWriteToken({
      pathname: "test.txt",
      allowOverwrite: true,
      maximumSizeInBytes: 50 * 1024 * 1024,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log("Success:", token);
  } catch (e) {
    console.log("Error object:", e);
    console.log("Error message:", e.message);
  }
}
run();
