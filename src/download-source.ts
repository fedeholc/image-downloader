import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";
import { Source, SourceSchema } from "./types/Source.ts";
import { Album, AlbumSchema } from "./types/Album.ts";
import { Image } from "./types/Image.ts";
import { DownloadFilters, DownloadFiltersSchema } from "./types/DownloadFilters.ts";
import { addZerosToId } from "./utils/utils.ts";
import { config } from "./config.ts";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

//* MAIN *

const __dirname = import.meta.dirname;
const visitedUrls = new Set();
const sourceFile = getFilePath(process.argv);
const downloadsEnabled = getDownloadsEnabled(process.argv);

createBackupFile(sourceFile);

console.log("Processing ", sourceFile)
const data = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const source: Source = data.source;
const album: Album = data.album;
const filters: DownloadFilters = data.downloadFilters;

validateData();

const imgOutputDir = createDownloadDir(source.id);
console.log("Downloading files in: ", imgOutputDir);

const subPages = await getSubPages(source.url, filters);

let downloadedLinks: string[] | undefined = [];

//Si hay subpágines descargo desde ellas incluyendo la página principal
//Si no hay subpáginas descargo solo desde la página principal
if (subPages && subPages.size > 0) {
  subPages.add(source.url);
  downloadedLinks = await getImages(subPages, filters);
} else {
  downloadedLinks = await getImages(new Set(source.url), filters);
}

if (!downloadedLinks) {
  console.error("No image links found");
  process.exit(1);
}

console.log(`${downloadedLinks.length} image links added successfully`);
//TODO: si tiene sentido escribir la lista de links ahora que se guarda en cada imagen de la lista de imagenes.
data.imgLinks = downloadedLinks;

let images: Image[] = [];
downloadedLinks.forEach((link, index) => {
  //el index+1 es para no usar 0 como id
  const imageId = addZerosToId(album.id, downloadedLinks.length, index + 1);
  const image = {
    id: imageId,
    url: link,
    description: "",
    source: source.id,
    albumId: album.id,
    authorId: data.authorId
  };
  images.push(image);
});
data.images = images;
fs.writeFileSync(sourceFile, JSON.stringify(data, null, 2));

process.exit(0);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//* FUNCTIONS *

function getFilePath(argv: string[]): string {
  if (process.argv.length < 3) {
    console.error("Usage: tsx index.ts <source-file.json>");
    process.exit(1);
  }

  if (!fs.existsSync(argv[2]) || !argv[2].endsWith(".json")) {
    console.error("File not found or not a json file");
    process.exit(1);
  }
  return argv[2];
}

function getDownloadsEnabled(argv: string[]): boolean {
  if (argv.length > 3 && argv[3] === "--no-downloads") {
    return false;
  }
  return true;
}

function createBackupFile(sourceFile: string) {
  //copy file to a backup folder, add date and time to filename

  const backupDir = path.join(path.dirname(sourceFile), "/backup/");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  const backupFilename = path.join(backupDir, path.basename(sourceFile, ".json") + "-" + new Date().toISOString() + ".json");
  fs.copyFileSync(sourceFile, backupFilename);

}

function createDownloadDir(sourceId: string): string {
  const imgOutputDir = path.join(config.downloadPath, sourceId);

  try {
    // Check if the /downloads/ directory exists, if not, create it
    const baseDownloadDir = config.downloadPath;
    if (!fs.existsSync(baseDownloadDir)) {
      fs.mkdirSync(baseDownloadDir);
    }

    // Check if the sourceId directory exists, if not, create it
    if (!fs.existsSync(imgOutputDir)) {
      fs.mkdirSync(imgOutputDir);
    }
  } catch (error) {
    console.error(`Error creating directory: ${error.message}`);
    throw new Error("Failed to create download directory");
  }

  return imgOutputDir;
}


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



async function getSubPages(pageUrl: string, filters: DownloadFilters): Promise<Set<string> | undefined> {
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
      //TODO: qué pasa si no existe subPageMustInclude?? y si lo quiero hacer un array para checkiar varias cosas?
      if (href && href.includes(filters.subPageMustInclude)) {
        subPages.add(href);
      }
    });
    return subPages;
  } catch (err) {
    console.error(`Error processing ${pageUrl}: ${err.message}`);
    return;
  }
}

async function downloadImages(imagesUrls: string[], filters: DownloadFilters): Promise<string[]> {
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

      //TODO: chekiar que existan los filtros, implementar que puedan ser arrays
      if (!imgUrl.includes(filters.imgMustInclude)) {
        continue;
      }
      let exclude = false;
      if (filters.imgExclude.length > 0) {
        filters.imgExclude.forEach((item) => {
          if (imgUrl.includes(item)) {
            exclude = true;
          }
        })
      }
      if (exclude) continue;

      try {
        const response = await fetch(imgUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Obtener las dimensiones de la imagen
        const metadata = await sharp(buffer).metadata();

        if (!metadata || !metadata.width || !metadata.height) {
          console.error(`Error getting metadata from ${imgUrl}`);
          continue;
        }

        // Filtrar imágenes por tamaño
        if ((metadata.width > filters.minImageWidth || metadata.height > filters.minImageHeight)) {

          if (downloadsEnabled) {
            await fs.promises.writeFile(
              path.join(imgOutputDir, path.basename(imgUrl)),
              buffer
            );
          }
          downloadedImages.push(imgUrl);
        }
      } catch (err) {
        console.error(`Error downloading ${imgUrl}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${imagesUrls}: ${err.message}`);
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
    console.error(`Error processing ${pageUrl}: ${err.message}`);
  }
}

async function getImages(pages: Set<string>, filters: DownloadFilters): Promise<string[] | undefined> {
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
    console.error("No images found");
    return;
  }
  let downloadedLinks = await downloadImages(Array.from(imagesList), filters);
  return downloadedLinks;
}

