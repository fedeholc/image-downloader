import fs from "fs";
import sqlite3 from "sqlite3";
import { Album, } from "./types/Album";
import { Image, ImageFields } from "./types/Image";
import { TableNames } from "./types/Tables";
import { createDbConnection, closeDbConnection } from "./utils-db";
const filepath = "./images.db";
const linksFile = "./images-smith/filteredLinks.json";

// TODO: hay que pasarle el json del source para que tome de ahí los datos del album, y habría que ver si ponemos también un campo para el autor de las imagenes (authorId), pero igual antes habría que agregarlo manualmente al autor.


const authorId = "";
const album: Album = { id: "smith", name: "Smith", description: "Eugene Smith's images", image: "smith.jpg", dateCreated: "2021-10-01" };


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

