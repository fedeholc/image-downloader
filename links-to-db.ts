import fs from "fs";
import sqlite3 from "sqlite3";
const filepath = "./images.db";

const linksFile = "./images-smith/filteredLinks.json";

// read json file to an array
const links = JSON.parse(fs.readFileSync(linksFile, "utf-8"));
console.log(links);


const db = createDbConnection();


function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
    console.log("Connection with SQLite has been established");
    return db;
  }
}
