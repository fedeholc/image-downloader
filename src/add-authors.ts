import sqlite3 from "sqlite3";
import fs from "fs";
import { fileURLToPath } from "url";
import { AuthorSchema } from "./types/Author";
import { AuthorFields } from "./types/Author";
import { TableNames } from "./types/Tables";
import { Author } from "./types/Author";
import { createDbConnection, deleteDbFile, deleteTable, closeDbConnection } from "./utils/utils-db";
import { config } from "./config";
import path from "path";
//* MAIN *
const __dirname = import.meta.dirname;

const files = fs.readdirSync(config.authorsPath);

const authorFiles = files.filter((file) => file.match(/\.(json)$/));

if (authorFiles.length === 0) {
  console.error("No author files found in directory: ", config.authorsPath);
  process.exit(1);
}

let dbFilename = config.dbPath;
if (!fs.existsSync(dbFilename)) {
  console.error("DB file not found:", dbFilename);
  process.exit(1);
}
// read file

const db = createDbConnection(dbFilename);

authorFiles.forEach((filename) => {
  console.log("Processing ", filename)
  const author: Author = JSON.parse(fs.readFileSync(path.join(config.authorsPath, filename), "utf8"));

  try {
    const validatedData = AuthorSchema.parse(author);
    console.log('Validation succeeded:', validatedData);
  } catch (error) {
    console.error('Validation failed:', error.errors);
    process.exit(1);
  }
  insertAuthor(author, db);
});

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
