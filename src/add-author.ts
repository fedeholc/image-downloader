import sqlite3 from "sqlite3";
import fs from "fs";
import { fileURLToPath } from "url";
import { AuthorSchema } from "./types/Author";
import { AuthorFields } from "./types/Author";
import { TableNames } from "./types/Tables";
import { Author } from "./types/Author";
import { createDbConnection, deleteDbFile, deleteTable, closeDbConnection } from "./utils-db";


//* MAIN *

if (process.argv.length < 4) {
  console.error("Usage: node add-author.js <author-filename.json> <db-filename>");
  process.exit(1);
}

const filename = process.argv[2];
if (!fs.existsSync(filename) || !filename.endsWith(".json")) {
  console.error("File not found or not a json file");
  process.exit(1);
}

let dbFilename = process.argv[3];
if (!fs.existsSync(dbFilename)) {
  console.error("DB file not found");
  process.exit(1);
}
// read file
console.log("Processing ", filename)
const author: Author = JSON.parse(fs.readFileSync(filename, "utf8"));

try {
  const validatedData = AuthorSchema.parse(author);
  console.log('Validation succeeded:', validatedData);
} catch (error) {
  console.error('Validation failed:', error.errors);
  process.exit(1);
}

const db = createDbConnection(dbFilename);

insertAuthor(author, db);

await closeDbConnection(db);

process.exit(0);

//* FUNCTIONS *

function insertAuthor(author: Author, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.author} (${AuthorFields.id},${AuthorFields.name}, ${AuthorFields.description}, ${AuthorFields.image}) VALUES (?,?, ?, ?)`,
    [author.id, author.name, author.description, author.image],
    function (error) {
      if (error) {
        console.error(error.message);
      } else {
        console.log(`Inserted a row`);
      }
    }
  );
}
