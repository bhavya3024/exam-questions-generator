require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { put } = require('@vercel/blob');
const crypto = require("crypto");
if (!global.crypto) {
  global.crypto = crypto.webcrypto || crypto;
}

const NCERT_BOOKS = [
  // Class 9
  { class: "9", subject: "Mathematics", code: "iemh1", chapters: 12, title: "Mathematics (Class IX)" },
  { class: "9", subject: "Science", code: "iesc1", chapters: 12, title: "Science (Class IX)" },
  { class: "9", subject: "Social Science", code: "iess1", chapters: 5, title: "India and the Contemporary World - I (History)" },
  { class: "9", subject: "Social Science", code: "iess2", chapters: 6, title: "Contemporary India - I (Geography)" },
  { class: "9", subject: "Social Science", code: "iess3", chapters: 5, title: "Democratic Politics - I (Civics)" },
  { class: "9", subject: "Social Science", code: "iess4", chapters: 4, title: "Economics (Class IX)" },
  { class: "9", subject: "English Language and Literature", code: "iebe1", chapters: 11, title: "Beehive (Class IX)" },
  { class: "9", subject: "Hindi", code: "ihks1", chapters: 17, title: "Kshitij I (Hindi Class IX)" },
  { class: "9", subject: "Information Technology", code: "ieit1", chapters: 12, title: "Information Technology (Class IX)" },

  // Class 10
  { class: "10", subject: "Mathematics (Standard)", code: "jemh1", chapters: 14, title: "Mathematics (Class X)" },
  { class: "10", subject: "Mathematics (Basic)", code: "jemh1", chapters: 14, title: "Mathematics (Class X)" },
  { class: "10", subject: "Science", code: "jesc1", chapters: 13, title: "Science (Class X)" },
  { class: "10", subject: "Social Science", code: "jess1", chapters: 5, title: "India and the Contemporary World - II (History)" },
  { class: "10", subject: "Social Science", code: "jess2", chapters: 7, title: "Contemporary India - II (Geography)" },
  { class: "10", subject: "Social Science", code: "jess3", chapters: 5, title: "Democratic Politics - II (Civics)" },
  { class: "10", subject: "Social Science", code: "jess4", chapters: 5, title: "Understanding Economic Development (Economics)" },
  { class: "10", subject: "English Language and Literature", code: "jeff1", chapters: 11, title: "First Flight (Class X)" },
  { class: "10", subject: "Hindi Course A", code: "jhks1", chapters: 17, title: "Kshitij II (Hindi Class X)" },
  { class: "10", subject: "Hindi Course B", code: "jhsp1", chapters: 17, title: "Sparsh II (Hindi Class X)" },
  { class: "10", subject: "Computer Applications", code: "jeca1", chapters: 8, title: "Computer Applications (Class X)" },
  { class: "10", subject: "Information Technology", code: "jeit1", chapters: 12, title: "Information Technology (Class X)" }
];

const CBSE_SYLLABI = [
  { class: "9", subject: "Mathematics", filename: "Maths_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Maths_Sec_2025-26.pdf" },
  { class: "9", subject: "Science", filename: "Science_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Science_Sec_2025-26.pdf" },
  { class: "10", subject: "Mathematics (Standard)", filename: "Maths_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Maths_Sec_2025-26.pdf" },
  { class: "10", subject: "Science", filename: "Science_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Science_Sec_2025-26.pdf" },
  { class: "11", subject: "Physics", filename: "Physics_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Physics_SrSec_2025-26.pdf" },
  { class: "11", subject: "Chemistry", filename: "Chemistry_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Chemistry_SrSec_2025-26.pdf" },
  { class: "12", subject: "Physics", filename: "Physics_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Physics_SrSec_2025-26.pdf" },
  { class: "12", subject: "Chemistry", filename: "Chemistry_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Chemistry_SrSec_2025-26.pdf" },
];

const CBSE_PAST_PAPERS = [
  { class: "9", subject: "Mathematics", filename: "Maths_SecP1IX_2026-27.pdf", url: "" },
  { class: "10", subject: "Mathematics (Standard)", filename: "Maths_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Maths_SecP1_2025-26.pdf" },
  { class: "10", subject: "Science", filename: "Science_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Science_SecP1_2025-26.pdf" },
  { class: "10", subject: "Science", filename: "Science_SecP1_2026-27.pdf", url: "" },
];

async function run() {
  const mongoUrl = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "examgen";
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  console.log(`Connecting to MongoDB at: ${mongoUrl}`);
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("curriculum_assets");

  // Idempotent: skip clearing, use findOne below to avoid duplicates
  
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
  
  console.log(`Found ${files.length} PDF files in public/uploads`);
  
  let count = 0;
  
  for (const file of files) {
    const parts = file.split('-');
    const baseName = parts.length > 1 ? parts.slice(1).join('-') : file;
    
    // Find matching metadata
    let doc = null;
    
    // 1. Try Textbook match
    for (const book of NCERT_BOOKS) {
      if (baseName.startsWith(book.code)) {
        // extract chapter number
        const chStr = baseName.replace(book.code, '').replace('.pdf', '');
        const isLemh2 = book.code === "lemh2";
        let actualCh = parseInt(chStr);
        if (isNaN(actualCh)) {
            // handle answers/prelims like jesc1ps.pdf or jesc1an.pdf
            actualCh = chStr;
        }
        
        doc = {
          cbse_class: book.class,
          subject: book.subject,
          category: "textbook",
          filename: `${book.title} - Chapter ${actualCh}`,
          size_bytes: fs.statSync(path.join(uploadsDir, file)).size,
          uploaded_at: new Date().toISOString()
        };
        break;
      }
    }
    
    // 2. Try Syllabus match
    if (!doc) {
      for (const syllabus of CBSE_SYLLABI) {
        if (baseName === syllabus.filename || baseName.includes(syllabus.filename)) {
          doc = {
            cbse_class: syllabus.class,
            subject: syllabus.subject,
            category: "syllabus",
            filename: `CBSE Official Syllabus 2025-26 - ${syllabus.subject}`,
            size_bytes: fs.statSync(path.join(uploadsDir, file)).size,
            uploaded_at: new Date().toISOString()
          };
          break;
        }
      }
    }
    
    // 3. Try Past Papers match
    if (!doc) {
      for (const paper of CBSE_PAST_PAPERS) {
        if (baseName === paper.filename || baseName.includes(paper.filename)) {
          doc = {
            cbse_class: paper.class,
            subject: paper.subject,
            category: "past_paper",
            filename: `CBSE Official Sample Paper - ${paper.subject}`,
            size_bytes: fs.statSync(path.join(uploadsDir, file)).size,
            uploaded_at: new Date().toISOString()
          };
          break;
        }
      }
    }
    
    if (!doc) {
      console.log(`Warning: Could not match ${file} to any known curriculum metadata. Adding as generic asset.`);
      doc = {
          cbse_class: "10",
          subject: "Generic",
          category: "other",
          filename: baseName,
          size_bytes: fs.statSync(path.join(uploadsDir, file)).size,
          uploaded_at: new Date().toISOString()
      };
    }
    
    console.log(`Uploading ${file} to Vercel Blob...`);
    const fileBuffer = fs.readFileSync(path.join(uploadsDir, file));
    const blob = await put(`exam-docs/${baseName}`, fileBuffer, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    doc.url = blob.url;
    
    // Avoid duplicates
    const existing = await collection.findOne({ url: doc.url });
    if (!existing) {
      await collection.insertOne(doc);
      console.log(`Uploaded and saved: ${doc.filename} -> ${doc.url}`);
      count++;
    } else {
      console.log(`Already exists in DB: ${doc.filename} -> ${doc.url}`);
    }
  }
  
  console.log(`\nSuccessfully uploaded and seeded ${count} documents from public/uploads!`);
  await client.close();
}

run().catch(console.error);
