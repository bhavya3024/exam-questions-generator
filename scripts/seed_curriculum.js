const { MongoClient } = require("mongodb");
const crypto = require("crypto");
if (!global.crypto) {
  global.crypto = crypto.webcrypto || crypto;
}

const CBSE_CLASSES = {
  "9": "Class IX (Secondary)",
  "10": "Class X (Secondary - Board)",
  "11": "Class XI (Senior Secondary)",
  "12": "Class XII (Senior Secondary - Board)",
};

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
  { class: "10", subject: "Information Technology", code: "jeit1", chapters: 12, title: "Information Technology (Class X)" },

  // Class 11
  { class: "11", subject: "Physics", code: "keph1", chapters: 8, title: "Physics Part I (Class XI)" },
  { class: "11", subject: "Physics", code: "keph2", chapters: 6, title: "Physics Part II (Class XI)" },
  { class: "11", subject: "Chemistry", code: "kech1", chapters: 5, title: "Chemistry Part I (Class XI)" },
  { class: "11", subject: "Chemistry", code: "kech2", chapters: 4, title: "Chemistry Part II (Class XI)" },
  { class: "11", subject: "Mathematics", code: "kemh1", chapters: 14, title: "Mathematics (Class XI)" },
  { class: "11", subject: "Biology", code: "kebo1", chapters: 19, title: "Biology (Class XI)" },
  { class: "11", subject: "Economics", code: "kesc1", chapters: 9, title: "Statistics for Economics (Class XI)" },
  { class: "11", subject: "Economics", code: "keec1", chapters: 6, title: "Introductory Microeconomics (Class XI)" },
  { class: "11", subject: "Geography", code: "kegm1", chapters: 16, title: "Fundamentals of Physical Geography (Class XI)" },
  { class: "11", subject: "Geography", code: "kegp1", chapters: 7, title: "India: Physical Environment (Class XI)" },
  { class: "11", subject: "History", code: "kehs1", chapters: 4, title: "Themes in World History (Class XI)" },
  { class: "11", subject: "English Core", code: "kehb1", chapters: 8, title: "Hornbill (Class XI)" },
  { class: "11", subject: "Hindi Core", code: "kahr1", chapters: 20, title: "Aroh I (Hindi Class XI)" },
  { class: "11", subject: "Business Studies", code: "kebs1", chapters: 12, title: "Business Studies (Class XI)" },
  { class: "11", subject: "Accountancy", code: "keac1", chapters: 8, title: "Financial Accounting Part I (Class XI)" },
  { class: "11", subject: "Accountancy", code: "keac2", chapters: 5, title: "Financial Accounting Part II (Class XI)" },
  { class: "11", subject: "Political Science", code: "keps1", chapters: 10, title: "Indian Constitution at Work (Class XI)" },
  { class: "11", subject: "Political Science", code: "keps2", chapters: 10, title: "Political Theory (Class XI)" },
  { class: "11", subject: "Psychology", code: "kepy1", chapters: 9, title: "Introduction to Psychology (Class XI)" },
  { class: "11", subject: "Computer Science (Python)", code: "kecs1", chapters: 14, title: "Computer Science (Class XI)" },

  // Class 12
  { class: "12", subject: "Physics", code: "leph1", chapters: 8, title: "Physics Part I (Class XII)" },
  { class: "12", subject: "Physics", code: "leph2", chapters: 6, title: "Physics Part II (Class XII)" },
  { class: "12", subject: "Chemistry", code: "lech1", chapters: 5, title: "Chemistry Part I (Class XII)" },
  { class: "12", subject: "Chemistry", code: "lech2", chapters: 4, title: "Chemistry Part II (Class XII)" },
  { class: "12", subject: "Mathematics", code: "lemh1", chapters: 6, title: "Mathematics Part I (Class XII)" },
  { class: "12", subject: "Mathematics", code: "lemh2", chapters: 7, title: "Mathematics Part II (Class XII)" },
  { class: "12", subject: "Biology", code: "lebo1", chapters: 16, title: "Biology (Class XII)" },
  { class: "12", subject: "Economics", code: "leec1", chapters: 6, title: "Introductory Macroeconomics (Class XII)" },
  { class: "12", subject: "Economics", code: "leec2", chapters: 6, title: "Introductory Microeconomics (Class XII)" },
  { class: "12", subject: "Geography", code: "legy1", chapters: 10, title: "Fundamentals of Human Geography (Class XII)" },
  { class: "12", subject: "Geography", code: "legy2", chapters: 12, title: "India: People and Economy (Class XII)" },
  { class: "12", subject: "History", code: "lehs1", chapters: 4, title: "Themes in Indian History Part I (Class XII)" },
  { class: "12", subject: "History", code: "lehs2", chapters: 5, title: "Themes in Indian History Part II (Class XII)" },
  { class: "12", subject: "History", code: "lehs3", chapters: 6, title: "Themes in Indian History Part III (Class XII)" },
  { class: "12", subject: "English Core", code: "lefl1", chapters: 8, title: "Flamingo (Class XII)" },
  { class: "12", subject: "Hindi Core", code: "lehr1", chapters: 18, title: "Aroh II (Hindi Class XII)" },
  { class: "12", subject: "Business Studies", code: "lebs1", chapters: 8, title: "Business Studies Part I (Class XII)" },
  { class: "12", subject: "Business Studies", code: "lebs2", chapters: 4, title: "Business Studies Part II (Class XII)" },
  { class: "12", subject: "Accountancy", code: "leac1", chapters: 5, title: "Partnership Accounts (Class XII)" },
  { class: "12", subject: "Accountancy", code: "leac2", chapters: 6, title: "Company Accounts (Class XII)" },
  { class: "12", subject: "Political Science", code: "leps1", chapters: 9, title: "Contemporary World Politics (Class XII)" },
  { class: "12", subject: "Political Science", code: "leps2", chapters: 9, title: "Politics in India Since Independence (Class XII)" },
  { class: "12", subject: "Psychology", code: "lepy1", chapters: 9, title: "Psychology (Class XII)" },
  { class: "12", subject: "Computer Science (Python)", code: "lecs1", chapters: 13, title: "Computer Science (Class XII)" },
];

const CBSE_SYLLABI = [
  // Class 9
  { class: "9", subject: "Mathematics", filename: "Maths_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Maths_Sec_2025-26.pdf" },
  { class: "9", subject: "Science", filename: "Science_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Science_Sec_2025-26.pdf" },
  { class: "9", subject: "English Language and Literature", filename: "English_Lang_Lit_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/English_Lang_Lit_Sec_2025-26.pdf" },

  // Class 10
  { class: "10", subject: "Mathematics (Standard)", filename: "Maths_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Maths_Sec_2025-26.pdf" },
  { class: "10", subject: "Mathematics (Basic)", filename: "Maths_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Maths_Sec_2025-26.pdf" },
  { class: "10", subject: "Science", filename: "Science_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/Science_Sec_2025-26.pdf" },
  { class: "10", subject: "English Language and Literature", filename: "English_Lang_Lit_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/English_Lang_Lit_Sec_2025-26.pdf" },
  { class: "10", subject: "Hindi Course A", filename: "HindiA_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/HindiA_Sec_2025-26.pdf" },
  { class: "10", subject: "Hindi Course B", filename: "HindiB_Sec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-Secondary/HindiB_Sec_2025-26.pdf" },

  // Class 11
  { class: "11", subject: "Physics", filename: "Physics_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Physics_SrSec_2025-26.pdf" },
  { class: "11", subject: "Chemistry", filename: "Chemistry_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Chemistry_SrSec_2025-26.pdf" },
  { class: "11", subject: "Mathematics", filename: "Maths_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Maths_SrSec_2025-26.pdf" },
  { class: "11", subject: "English Core", filename: "EnglishCore_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/EnglishCore_SrSec_2025-26.pdf" },
  { class: "11", subject: "Hindi Core", filename: "HindiCore_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/HindiCore_SrSec_2025-26.pdf" },

  // Class 12
  { class: "12", subject: "Physics", filename: "Physics_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Physics_SrSec_2025-26.pdf" },
  { class: "12", subject: "Chemistry", filename: "Chemistry_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Chemistry_SrSec_2025-26.pdf" },
  { class: "12", subject: "Mathematics", filename: "Maths_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/Maths_SrSec_2025-26.pdf" },
  { class: "12", subject: "English Core", filename: "EnglishCore_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/EnglishCore_SrSec_2025-26.pdf" },
  { class: "12", subject: "Hindi Core", filename: "HindiCore_SrSec_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/Curriculum26/Main-SeniorSec/HindiCore_SrSec_2025-26.pdf" },
];

const CBSE_PAST_PAPERS = [
  // Class 10
  { class: "10", subject: "Mathematics (Standard)", filename: "Maths_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Maths_SecP1_2025-26.pdf" },
  { class: "10", subject: "Science", filename: "Science_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Science_SecP1_2025-26.pdf" },
  { class: "10", subject: "English Language and Literature", filename: "English_Lang_Lit_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/English_Lang_Lit_SecP1_2025-26.pdf" },
  { class: "10", subject: "Hindi Course A", filename: "HindiA_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/HindiA_SecP1_2025-26.pdf" },
  { class: "10", subject: "Hindi Course B", filename: "HindiB_SecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/HindiB_SecP1_2025-26.pdf" },

  // Class 12
  { class: "12", subject: "Physics", filename: "Physics_SrSecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Physics_SrSecP1_2025-26.pdf" },
  { class: "12", subject: "Chemistry", filename: "Chemistry_SrSecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Chemistry_SrSecP1_2025-26.pdf" },
  { class: "12", subject: "Mathematics", filename: "Maths_SrSecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths_SrSecP1_2025-26.pdf" },
  { class: "12", subject: "English Core", filename: "EnglishCore_SrSecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/EnglishCore-SQP.pdf" },
  { class: "12", subject: "Hindi Core", filename: "HindiCore_SrSecP1_2025-26.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/HindiCore-SQP.pdf" },
];

async function seed() {
  const mongoUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB || "examgen";

  console.log(`Connecting to MongoDB at: ${mongoUrl}`);
  console.log(`Database: ${dbName}`);

  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("curriculum_assets");

  console.log("Connected successfully to server");

  if (process.argv.includes("--clear")) {
    console.log("Clearing collection 'curriculum_assets'...");
    await collection.deleteMany({});
  }

  let count = 0;

  // 1. Textbooks
  console.log("Seeding NCERT Textbooks...");
  for (const book of NCERT_BOOKS) {
    const bookCode = book.code;
    const totalChapters = book.chapters;
    const isLemh2 = bookCode === "lemh2";

    for (let ch = 1; ch <= totalChapters; ch++) {
      const actualCh = isLemh2 ? ch + 6 : ch;
      const chStr = String(actualCh).padStart(2, "0");
      const filename = `${bookCode}${chStr}.pdf`;
      const url = `https://ncert.nic.in/textbook/pdf/${filename}`;

      const existing = await collection.findOne({ url });
      if (!existing) {
        await collection.insertOne({
          cbse_class: book.class,
          subject: book.subject,
          category: "textbook",
          filename: `${book.title} - Chapter ${actualCh}`,
          url,
          size_bytes: 1024 * 1024,
          uploaded_at: new Date().toISOString(),
        });
        count++;
      }
    }
  }

  // 2. Syllabi
  console.log("Seeding Syllabi...");
  for (const syllabus of CBSE_SYLLABI) {
    const existing = await collection.findOne({ url: syllabus.url });
    if (!existing) {
      await collection.insertOne({
        cbse_class: syllabus.class,
        subject: syllabus.subject,
        category: "syllabus",
        filename: `CBSE Official Syllabus 2025-26 - ${syllabus.subject}`,
        url: syllabus.url,
        size_bytes: 2 * 1024 * 1024,
        uploaded_at: new Date().toISOString(),
      });
      count++;
    }
  }

  // 3. Past Papers
  console.log("Seeding Past Papers...");
  for (const paper of CBSE_PAST_PAPERS) {
    const existing = await collection.findOne({ url: paper.url });
    if (!existing) {
      await collection.insertOne({
        cbse_class: paper.class,
        subject: paper.subject,
        category: "past_paper",
        filename: `CBSE Official Sample Paper 2025-26 - ${paper.subject}`,
        url: paper.url,
        size_bytes: 3 * 1024 * 1024,
        uploaded_at: new Date().toISOString(),
      });
      count++;
    }
  }

  // 4. Blueprints
  console.log("Seeding Blueprints...");
  const blueprints = [
    { class: "10", subject: "Mathematics (Standard)", filename: "Class 10 Mathematics Standard Exam Blueprint.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Maths_Sec_Design_2025-26.pdf" },
    { class: "10", subject: "Science", filename: "Class 10 Science Exam Blueprint.pdf", url: "https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Science_Sec_Design_2025-26.pdf" }
  ];
  for (const bp of blueprints) {
    const existing = await collection.findOne({ url: bp.url });
    if (!existing) {
      await collection.insertOne({
        cbse_class: bp.class,
        subject: bp.subject,
        category: "blueprint",
        filename: bp.filename,
        url: bp.url,
        size_bytes: 512 * 1024,
        uploaded_at: new Date().toISOString(),
      });
      count++;
    }
  }

  console.log(`\nSuccessfully seeded ${count} documents!`);
  await client.close();
}

seed().catch(console.error);
