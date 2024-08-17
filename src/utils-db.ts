import fs from "fs";
import sqlite3 from "sqlite3";

export { createDbConnection, deleteDbFile, deleteTable, closeDbConnection };

function closeDbConnection(db: sqlite3.Database) {
  db.close((error) => {
    if (error) {
      return console.error(error.message);
    } else {
      console.log("Database connection closed");
    }
  });
}

function createDbConnection(filepath: string): sqlite3.Database {
  if (fs.existsSync(filepath)) {
    console.log("Database exists");
  } else {
    console.log("Creating database2");
  }

  let a = new sqlite3.Database(filepath, (error) => {
    if (error) {
      console.log("nueva db");
      return console.error(error.message);
    } else {
      console.log("Connection with SQLite has been established");
    }

  });
  console.log(a);
  return a;
}


async function deleteDbFile(filepath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (error) => {
        if (error) {
          console.error(error.message)
          reject(false);
        }
        else {
          console.log("Database file deleted");
          resolve(true);
        }
      });
    }
  });
}


function deleteTable(tableName: string, db: sqlite3.Database) {
  db.exec(`DROP TABLE IF EXISTS ${tableName}`, (error) => {
    if (error) {
      return console.error(error.message);
    }
    else {
      console.log("Table deleted.");
    }
  });
}