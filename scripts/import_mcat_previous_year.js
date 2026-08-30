"use strict";

// Imports locally generated MCAT practice datasets into the generic PYQ collection.
// It deliberately marks every question as generated practice, not an official PYQ.
require("dotenv").config();
const fs = require("fs"), path = require("path"), XLSX = require("xlsx");
const { connectDatabases, disconnectDatabases, ucatConnection } = require("../config/database");
const directory = path.resolve(__dirname, "../data/mcat/previous-year");
const fields = ["id","question","option_a","option_b","option_c","option_d","correct_answer","explanation","difficulty","question_type","topic_id","section"];
const sectionFor = id => id <= 82 ? "Chemical and Physical Foundations of Biological Systems" : id <= 100 ? "Critical Analysis and Reasoning Skills (CARS)" : id <= 168 ? "Biological and Biochemical Foundations of Living Systems" : "Psychological, Social, and Biological Foundations of Behavior";
const fail = message => { throw new Error(message); };

function readFile(filename) {
  const book = XLSX.readFile(filename); const sheet = book.Sheets.Questions;
  if (!sheet) fail(`${path.basename(filename)}: missing Questions worksheet`);
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (JSON.stringify(Object.keys(rows[0] || {})) !== JSON.stringify(fields)) fail(`${path.basename(filename)}: invalid column order`);
  if (rows.length !== 233) fail(`${path.basename(filename)}: expected 233 rows, found ${rows.length}`);
  for (const [i,q] of rows.entries()) {
    if (fields.some(key => q[key] === "" || q[key] === undefined)) fail(`${path.basename(filename)} row ${i + 2}: missing value`);
    if (!/^[ABCD]$/.test(q.correct_answer) || !["Easy","Medium","Hard"].includes(q.difficulty) || !Number.isInteger(q.topic_id) || q.topic_id < 1 || q.topic_id > 231 || q.section !== sectionFor(q.topic_id)) fail(`${path.basename(filename)} row ${i + 2}: invalid question data`);
  }
  return rows;
}

async function main() {
  const files = fs.readdirSync(directory).filter(f => /^MCAT_20(1[6-9]|2[0-5])\.xlsx$/.test(f)).sort();
  if (files.length !== 10) fail(`Expected 10 MCAT files, found ${files.length}`);
  const imports = files.map(file => ({ file, year: Number(file.slice(5, 9)), rows: readFile(path.join(directory, file)) }));
  const all = imports.flatMap(x => x.rows), ids = new Set(all.map(q => q.id)), text = new Set(all.map(q => q.question.trim().toLowerCase()));
  if (ids.size !== 2330 || text.size !== 2330) fail("Duplicate question IDs or question text in source files");
  await connectDatabases();
  const questions = ucatConnection.collection("mcat-questions");
  const papers = ucatConnection.collection("previous-year-questions");
  const summary = { papers_imported: 0, questions_imported: 0, skipped_papers: [] };
  for (const [index, item] of imports.entries()) {
    const name = `MCAT_${item.year}`;
    const paperId = 11 + index;
    const existingPaper = await papers.findOne({ $or: [{ name, exam_type: "mcat" }, { id: paperId }] });
    if (existingPaper) {
      if (existingPaper.name === name && existingPaper.exam_type === "mcat") { summary.skipped_papers.push(name); continue; }
      fail(`${name}: paper id ${paperId} is already assigned to a different paper`);
    }
    const existing = await questions.countDocuments({ id: { $in: item.rows.map(q => q.id) } });
    if (existing) fail(`${name}: conflicting question IDs already exist`);
    const docs = item.rows.map(q => ({ ...q, exam_type: "mcat", exam_year: item.year, source_filename: item.file, source_kind: "generated_practice", is_previous_year: false, imported_at: new Date() }));
    await questions.insertMany(docs, { ordered: true });
    await papers.insertOne({ id: paperId, name, uploaded_at: new Date(), source_filename: item.file, question_count: docs.length, exam_type: "mcat", is_active: true, institution_id: 25, uploaded_by_id: 25, question_ids: docs.map(q => q.id), source_kind: "generated_practice", is_previous_year: false });
    summary.papers_imported++; summary.questions_imported += docs.length;
  }
  console.log(JSON.stringify(summary, null, 2));
}
main().finally(() => disconnectDatabases()).catch(error => { console.error(error.message); process.exitCode = 1; });
