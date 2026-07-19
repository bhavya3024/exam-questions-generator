async function test() {
  try {
    const res = await fetch("https://ncert.nic.in/textbook/pdf/jesc101.pdf");
    console.log("NCERT Status:", res.status);
    const res2 = await fetch("https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Science_SecP1_2025-26.pdf");
    console.log("CBSE Status:", res2.status);
  } catch (e) {
    console.error(e);
  }
}
test();
