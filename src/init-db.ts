//Uso: tsx init-db.ts <filename.db>
// si no se especifica el nombre del archivo, se usa el valor por defecto en config.ts

import sqlite3 from "sqlite3";
import fs from "fs";
import readline from "readline";
import { AlbumFields } from "./types/Album";
import { AuthorFields } from "./types/Author";
import { ImageFields } from "./types/Image";
import { TableNames } from "./types/Tables";
import { SourceFields } from "./types/Source"
import { createDbConnection, deleteDbFile, deleteTable, closeDbConnection } from "./utils-db";
import path from "path";
import { config } from "./config";

//* MAIN *

// directorio en el cual se encuentra el archivo ejecutado
const __dirname = import.meta.dirname;
// ruta del archivo ejecutado
const __filename = import.meta.filename;

//argv[0] es el path del ejecutable de node
//argv[1] es el path del archivo ejecutado
//argv[2] es el primer argumento pasado al archivo ejecutado

let filepath = "";
if (process.argv.length >= 3) {
  try {
    filepath = await checkFilePath(process.argv[2]);
  } catch (error) {
    console.error("Error accesing database file: ", process.argv[2], error);
    process.exit(1);
  }
} else {
  try {
    filepath = await checkFilePath(config.dbPath);
  } catch (error) {
    console.error("Error accesing database file: ", config.dbPath, error);
    process.exit(1);
  }
}

console.log("DB: ", filepath);

const db = createDbConnection(filepath);
console.log(db);
createTables(db);
await closeDbConnection(db);

process.exit(0);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//* FUNCTIONS *

async function checkFilePath(filepath: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (fs.existsSync(filepath)) {
    console.log("The database already exists.");
    const answer = await askQuestion("Do you want to delete it? (y/n): ", rl);
    if (answer === "y") {
      await deleteDbFile(filepath);
    } else {
      const newName = await askQuestion("Enter the new path/name of the database (Enter to abort): ", rl) as string;
      if (!newName) {
        console.log("You must enter a valid path/name.");
        process.exit(1);
      }
      return newName;
    }
    rl.close();

  }
  return filepath;
}

function askQuestion(query: string, rl: readline.Interface) {
  return new Promise(resolve => {
    return rl.question(query, (value) => resolve(value));
  });
}


function createTables(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {

    db.exec(
      `CREATE TABLE IF NOT EXISTS ${TableNames.image} (
    ${ImageFields.id} TEXT PRIMARY KEY,
    ${ImageFields.url} TEXT NOT NULL,
    ${ImageFields.description} TEXT,
    ${ImageFields.source} TEXT,
    ${ImageFields.albumId} TEXT,
    ${ImageFields.authorId} TEXT,
    FOREIGN KEY(${ImageFields.authorId}) REFERENCES ${TableNames.author}(id),
    FOREIGN KEY(${ImageFields.albumId}) REFERENCES ${TableNames.album}(id)
  )`,
      (error) => {
        if (error) {
          console.error(error.message);
          reject(error);

        } else {
          console.log("Table created.");
        }
      }
    );

    db.exec(
      `CREATE TABLE IF NOT EXISTS ${TableNames.author} (
    ${AuthorFields.id} TEXT PRIMARY KEY,
    ${AuthorFields.name} TEXT NOT NULL,
    ${AuthorFields.description} TEXT,
    ${AuthorFields.image} TEXT)`,
      (error) => {
        if (error) {
          console.error(error.message);
          reject(error);

        }
        else {
          console.log("Table created.");
        }
      }
    );

    db.exec(
      `CREATE TABLE IF NOT EXISTS ${TableNames.album} (
    ${AlbumFields.id} TEXT PRIMARY KEY,
    ${AlbumFields.name} TEXT NOT NULL,
    ${AlbumFields.description} TEXT,
    ${AlbumFields.image} TEXT,
    ${AlbumFields.dateCreated} TEXT)`,

      (error) => {
        if (error) {
          console.error(error.message);
          reject(error);

        }
        else {
          console.log("Table created.");
        }
      }
    );

    db.exec(
      `CREATE TABLE IF NOT EXISTS ${TableNames.source} (
    ${SourceFields.id} TEXT PRIMARY KEY,
    ${SourceFields.name} TEXT NOT NULL,
    ${SourceFields.url} TEXT)`,

      (error) => {
        if (error) {
          console.error(error.message);
          reject(error);

        }
        else {
          console.log("Table created.");
        }
      }
    );
    resolve();

  });
}

