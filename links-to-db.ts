import fs from "fs";
import sqlite3 from "sqlite3";
import { Album, } from "./types/Album";
import { Image, ImageFields } from "./types/Image";
import { TableNames } from "./types/Tables";
import { createDbConnection, closeDbConnection } from "./utils-db";
const filepath = "./images.db";
const linksFile = "./images-smith/filteredLinks.json";

const authorId = 0;
const album: Album = { id: 0, name: "Smith", description: "Eugene Smith's images", image: "smith.jpg", dateCreated: "2021-10-01" };

// TODO: hay que agregar el album, obtener el id para usarlo en las imagens.

const db = createDbConnection(filepath);
// read json file to an array
const links = JSON.parse(fs.readFileSync(linksFile, "utf-8"));
console.log(links);

links.forEach((link: string) => {
  const image: Image = { id: 0, url: link, description: "imagen de smith", source: "smith", albumId: album.id, authorId: authorId };
  console.log("Adding image: ", image);

  // insert image into database
  insertImage(image, db);

});

console.log("Images added to database");

closeDbConnection(db);



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

