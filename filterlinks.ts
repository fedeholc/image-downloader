import fs from "fs";
import { imgUrlsFile } from "./Paths.ts";


// TODO: tiene que ser un argumento la carpeta, y checkiar que este el archivo

const directory = "./images-smith";
const linksFile = "./images-smith/" + imgUrlsFile;

//create an array with all the files in directory
const files = fs.readdirSync(directory);
console.log(files);

//read linksFile line by line and check if the line string contains any of the strings in files

const links = fs.readFileSync(linksFile, "utf-8").split("\n");
console.log(links);

let filteredLinks = new Set();
for (let link of links) {
  for (let file of files) {
    //check if last part of link (a filename) is in the file string
    if (link.includes(file)) {
      console.log(link, file);
      filteredLinks.add(link);
    }
  }
}

console.log(filteredLinks);

//write filteredLinks to a json file
fs.writeFileSync(
  directory + "/filteredLinks.json",
  JSON.stringify([...filteredLinks], null, 2)
);

//write filteredLinks to a new  text file
fs.writeFileSync(
  directory + "/filteredLinks.txt",
  [...filteredLinks].join("\n")
);
