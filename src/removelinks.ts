import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { addZerosToId } from "./utils/utils";
import type { Image } from "./types/Image";
const imgUrlsFile = "images-urls.json";
const imgFilteredUrlsFile = "images-filtered-urls.json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read filename from argument
if (process.argv.length < 4) {
  console.error("Usage: tsx removelinks.ts <imgages directory> <source-file.json>");
  process.exit(1);
}

// check if filename exists and its a json file
const imgDirectory = path.join(__dirname, process.argv[2]);
const sourceFile = path.join(__dirname, process.argv[3]);

console.log(imgDirectory);
console.log(sourceFile);


if (!fs.existsSync(sourceFile)) {
  console.error("Source File not found");
  process.exit(1);
}

const imagesFiles = fs.readdirSync(imgDirectory);



//VER: Ojo, antes checkiaba por tipo de archivo, pero resulta que hay links que apunta a una imagen que no tiene extension porque le agregan data al final, por ejemplo: "https://d7hftxdivxxvm.cloudfront.net?height=801&quality=1&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FjZtOTWB_7VaBmzOv50rJRg%2Fsmall.jpg&width=801"

/* const files = imagesFiles.filter((file) =>
  file.match(/\.(jpg|jpeg|png|webp)$/)
); */


/* if (files.length === 0) {
  console.error("No image files (jpg, jpeg, png, webp) found in directory");
  process.exit(1);
} */



const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));

let okLinks: string[] = [];
let rejectedLinks: string[] = [];
for (let link of data.imgLinks) {
  let found = false;
  for (let file of imagesFiles) {
    //check if last part of link (a filename) is in the file string
    if (link.includes(file)) {
      okLinks.push(link);
      found = true;
    }
  }
  console.log(found);
  if (!found) {
    rejectedLinks.push(link);
  }
}

let okImages: Image[] = [];
let rejectedImages: Image[] = [];
for (let image of data.images) {
  let found = false;

  for (let file of imagesFiles) {
    //check if last part of link (a filename) is in the file string
    if (image.url.includes(file)) {
      okImages.push(image);
      found = true;
    }
    if (!found) {
      rejectedImages.push(image);
    }
  }
}

let index = 0;
let okImagesIdFixed: Image[] = [];
okImages.forEach((image) => {
  let newId = addZerosToId(data.album.id, okImages.length, index + 1);
  let modImage = { ...image, id: newId };
  okImagesIdFixed.push(modImage);
  index++;
});


data.images = [...okImagesIdFixed];

data.imgLinks = [...okLinks];
console.log(rejectedLinks)
data.rejectedLinks = [...rejectedLinks];

fs.writeFileSync(sourceFile, JSON.stringify(data, null, 2));

