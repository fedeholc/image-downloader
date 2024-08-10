import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { Source, SourceSchema } from "./types/Source.ts";
import { Album, AlbumSchema } from "./types/Album.ts";
import { DownloadFilters, DownloadFiltersSchema } from "./types/DownloadFilters.ts";
import { imgUrlsFile } from "./Paths.ts";

//* MAIN *

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visitedUrls = new Set();

// read filename from argument
if (process.argv.length < 3) {
  console.error("Usage: node index.js <filename>");
  process.exit(1);
}

// check if filename exists and its a json file
const filename = process.argv[2];
if (!fs.existsSync(filename) || !filename.endsWith(".json")) {
  console.error("File not found or not a json file");
  process.exit(1);
}

// read file
console.log("Processing ", filename)
const data = JSON.parse(fs.readFileSync(filename, "utf8"));
const source: Source = data.source;
const album: Album = data.album;
const filters: DownloadFilters = data.downloadFilters;

validateData();

const imgOutputDir = path.join(__dirname, "/downloads/" + source.id);
const imgUrlsPath = path.join(imgOutputDir, imgUrlsFile);

console.log(imgOutputDir);

if (!fs.existsSync(imgOutputDir)) {
  //if not exist dir
  if (!fs.existsSync(path.join(__dirname, "/downloads/"))) {
    fs.mkdirSync(path.join(__dirname, "/downloads/"))
  }
  fs.mkdirSync(imgOutputDir);
}
//fs.appendFileSync(imgUrlsPath, `Downloaded from ${source.url}\n`);

const subPages = await getSubPages(source.url, filters.subPageMustInclude);

let downloadedLinks: string[] | undefined = [];
if (!subPages) {
  downloadedLinks = await getImages(new Set(source.url), filters.imgMustInclude);
} else {
  subPages.add(source.url);
  downloadedLinks = await getImages(subPages, filters.imgMustInclude);
}

if (!downloadedLinks) {
  console.error("No images downloaded");
  process.exit(1);
} else {
  console.log("Images downloaded successfully");
  fs.appendFileSync(imgUrlsPath, JSON.stringify([...downloadedLinks], null, 2));
}

process.exit(0);

//* * *

function validateData() {
  try {
    const validatedData = AlbumSchema.parse(album);
    console.log('Validation succeeded:', validatedData);
  } catch (error) {
    console.error('Validation failed:', error.errors);
    process.exit(1);
  }

  try {
    const validatedData = DownloadFiltersSchema.parse(filters);
    console.log('Validation succeeded:', validatedData);
  } catch (error) {
    console.error('Validation failed:', error.errors);
    process.exit(1);

  }

  try {
    const validatedData = SourceSchema.parse(source);
    console.log('Validation succeeded:', validatedData);
  } catch (error) {
    console.error('Validation failed:', error.errors);
    process.exit(1);
  }
}

async function getSubPages(pageUrl: string, subPageMustInclude: string): Promise<Set<string> | undefined> {
  try {
    const response = await fetch(pageUrl);
    const html = await response.text();

    // get subpages using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const subPages = new Set<string>();
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.includes(filters.subPageMustInclude)) {
        subPages.add(href);
      }
    });


    return subPages;
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
    return;
  }
}

async function downloadImages(imagesUrls: string[], imgMustInclude: string): Promise<string[]> {
  let downloadedImages: string[] = [];
  try {
    if (!fs.existsSync(imgOutputDir)) {
      fs.mkdirSync(imgOutputDir);
    }

    for (let imgUrl of imagesUrls) {
      // VER Sería para resolver URLs relativas (no lo probé aún)
      if (imgUrl.startsWith("//")) {
        imgUrl = "http:" + imgUrl;
      } else if (imgUrl.startsWith("/")) {
        const url = new URL(imgUrl);
        imgUrl = url.origin + imgUrl;
      }

      if (!imgUrl.includes(filters.imgMustInclude)) {
        continue;
      }

      try {
        const response = await fetch(imgUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Obtener las dimensiones de la imagen
        const metadata = await sharp(buffer).metadata();

        if (!metadata || !metadata.width || !metadata.height) {
          console.error(`No se pudo obtener metadatos de ${imgUrl}`);
          continue;
        }

        // Filtrar imágenes por tamaño
        if ((metadata.width > filters.minImageWidth || metadata.height > filters.minImageHeight)) {
          await fs.promises.writeFile(
            path.join(imgOutputDir, path.basename(imgUrl)),
            buffer
          );
          //fs.appendFileSync(imgUrlsPath, `${imgUrl}\n`);
          downloadedImages.push(imgUrl);
        }
      } catch (err) {
        console.error(`Error al descargar ${imgUrl}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error al procesar la página ${imagesUrls}: ${err.message}`);
  }
  return downloadedImages;
}

async function getImagesUrls(pageUrl: string): Promise<string[] | undefined> {
  try {
    // Evitar visitar la misma URL más de una vez
    if (visitedUrls.has(pageUrl)) {
      return;
    }
    visitedUrls.add(pageUrl);

    const response = await fetch(pageUrl);
    const html = await response.text();


    const dom = new JSDOM(html);
    const document = dom.window.document;
    const uniqueImgUrls = new Set<string>();
    const imgs = document.querySelectorAll("img");
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      if (src) {
        uniqueImgUrls.add(src);
      }
    });

    return Array.from(uniqueImgUrls);
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
  }
}

async function getImages(pages: Set<string>, imgMustInclude: string): Promise<string[] | undefined> {
  if (!pages) {
    return;
  }
  const imagesList: Set<string> = new Set();
  for (let page of pages) {
    //VER Sería para resolver URLs relativas, pero no lo probé aún
    if (page && !page.startsWith("http")) {
      const url = new URL(source.url);
      page = url.origin + page;
    }

    // Evitar URLs vacías y anclas
    if (page && !page.startsWith("#")) {
      console.log(`Procesando: ${page}`);

      let urls = await getImagesUrls(page);

      if (urls) {
        urls.forEach(element => imagesList.add(element));
      }

    }
  }

  if (imagesList.size === 0) {
    console.error("No se encontraron imágenes");
    return;
  }
  let downloadedLinks = await downloadImages(Array.from(imagesList), filters.imgMustInclude);
  return downloadedLinks;
}

