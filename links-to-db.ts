//TODOS:
// cambiar para no tener que pasarle directorio (y que busque archivo de links ahí), sino pasarle directamente el path al archivo
// por otra parte no tiene sentido pasarle el archivo de source con los datos del album por separado
// en el mismo archivo de source deberíamos agregar los links
import fs from "fs";
import sqlite3 from "sqlite3";
import { Album, AlbumSchema, AlbumFields } from "./types/Album";
import { Image, ImageFields } from "./types/Image";
import { TableNames } from "./types/Tables";
import path from "path";

import { fileURLToPath } from "url";
import { createDbConnection, closeDbConnection } from "./utils-db";
import { Source, SourceFields } from "./types/Source.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read filename from argument
if (process.argv.length < 3) {
  console.error("Usage: node links-to-db.ts <album source file>");
  process.exit(1);
}



const sourceFile = path.join(__dirname, process.argv[2]);
if (!fs.existsSync(sourceFile)) {
  console.error("File with source not found");
  process.exit(1);
}


const filepath = "./images.db";
const db = createDbConnection(filepath);

const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
if (!data.album) {
  console.error("No album found in file");
  process.exit(1);
}
if (!data.authorId) {
  data.authorId = ""; // igual debería venir así en el archivo
}
const authorId: string = data.authorId;
const source: Source = data.source;
const album: Album = data.album;
try {
  const validatedData = AlbumSchema.parse(album);
  console.log('Validation succeeded:', validatedData);
} catch (error) {
  console.error('Validation failed:', error.errors);
  process.exit(1);
}


insertAlbum(album, db);
insertSource(source, db);

// read json file to an array
const links = data.imgLinks;
if (links.length === 0) {
  console.error("No links found in file");
  process.exit(1);
}

links.forEach((link: string) => {
  const image: Image = { id: 0, url: link, description: "", source: source.id, albumId: album.id, authorId: authorId };
  console.log("Adding image: ", image);

  // insert image into database
  insertImage(image, db);

});

console.log("Images added to database");

closeDbConnection(db);

//* * * 

function insertAlbum(album: Album, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.album} (${AlbumFields.id},${AlbumFields.name},${AlbumFields.description},${AlbumFields.image}, ${AlbumFields.dateCreated}) VALUES (?,?,?,?,?)`,
    [album.id, album.name, album.description, album.image, album.dateCreated],
    function (error) {
      if (error) {
        console.error(error.message);
      } else {
        console.log(`Inserted a row`);

      }
    }
  );
}

function insertSource(source: Source, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.source} (${SourceFields.id},${SourceFields.name},${SourceFields.url}) VALUES (?,?,?)`,
    [source.id, source.name, source.url],
    function (error) {
      if (error) {
        console.error(error.message);
      } else {
        console.log(`Inserted a row`);

      }
    }
  );
}

function insertImage(image: Image, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.image} (${ImageFields.albumId},${ImageFields.authorId},${ImageFields.description},${ImageFields.source},${ImageFields.url}) VALUES (?, ?, ?,?,?)`,
    [image.albumId, image.authorId, image.description, image.source, image.url],
    function (error) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Inserted a row with the ID: ${this.lastID}`);
    }
  );
}

