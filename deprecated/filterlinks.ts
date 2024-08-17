import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const imgUrlsFile = "images-urls.json";
const imgFilteredUrlsFile = "images-filtered-urls.json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read filename from argument
if (process.argv.length < 3) {
  console.error("Usage: node filterlinks.js <directory>");
  process.exit(1);
}

// check if filename exists and its a json file
const directory = path.join(__dirname, process.argv[2]);
const linksFile = path.join(directory, imgUrlsFile);
console.log(linksFile);
if (!fs.existsSync(linksFile)) {
  console.error("File with links not found");
  process.exit(1);
}

//create an array with all the files in directory
const imagesFiles = fs.readdirSync(directory);

//filter only files with extensions jpg, jpeg, png, webp
const files = imagesFiles.filter((file) =>
  file.match(/\.(jpg|jpeg|png|webp)$/)
);

if (files.length === 0) {
  console.error("No image files (jpg, jpeg, png, webp) found in directory");
  process.exit(1);
}



const links = JSON.parse(fs.readFileSync(linksFile, "utf-8"));
console.log(links);

let filteredLinks = new Set();
for (let link of links) {
  for (let file of imagesFiles) {
    //check if last part of link (a filename) is in the file string
    if (link.includes(file)) {
      console.log(link, file);
      filteredLinks.add(link);
    }
  }
}

console.log(filteredLinks);

//TODO: usar path.join
//write filteredLinks to a json file
fs.writeFileSync(
  directory + "/" + imgFilteredUrlsFile,
  JSON.stringify([...filteredLinks], null, 2)
);

//write filteredLinks to a new  text file
fs.writeFileSync(
  directory + "/filteredLinks.txt",
  [...filteredLinks].join("\n")
);
