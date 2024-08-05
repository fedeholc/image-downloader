import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

//* MAIN *

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visitedUrls = new Set();

const pageName = "smith";
const pageUrl = "https://www.magnumphotos.com/photographer/w-eugene-smith/";
const subPageMustInclude = "par";
const imgMustInclude = "overlay";

const minImgSize = 200;

const imgOutputDir = path.join(__dirname, "images-" + pageName);
const imgUrlsFile = path.join(imgOutputDir, "imgUrls.txt");

if (!fs.existsSync(imgOutputDir)) {
  fs.mkdirSync(imgOutputDir);
}
fs.appendFileSync(imgUrlsFile, `Downloaded from ${pageUrl}\n`);

const subPages = await getSubPages(pageUrl, subPageMustInclude);

if (!subPages) {
  await getImages(new Set(pageUrl), imgMustInclude);
} else {
  subPages.add(pageUrl);
  await getImages(subPages, imgMustInclude);
}

//* * *

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
      if (href && href.includes(subPageMustInclude)) {
        subPages.add(href);
      }
    });


    return subPages;
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
    return;
  }
}

async function downloadImages(imagesUrls: string[], imgMustInclude: string) {
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

      if (!imgUrl.includes(imgMustInclude)) {
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
        if ((metadata.width > minImgSize || metadata.height > minImgSize)) {
          await fs.promises.writeFile(
            path.join(imgOutputDir, path.basename(imgUrl)),
            buffer
          );
          fs.appendFileSync(imgUrlsFile, `${imgUrl}\n`);
        }
      } catch (err) {
        console.error(`Error al descargar ${imgUrl}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error al procesar la página ${imagesUrls}: ${err.message}`);
  }
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

async function getImages(pages: Set<string>, imgMustInclude: string) {
  if (!pages) {
    return;
  }
  const imagesList: Set<string> = new Set();
  for (let page of pages) {
    //VER Sería para resolver URLs relativas, pero no lo probé aún
    if (page && !page.startsWith("http")) {
      const url = new URL(pageUrl);
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
  await downloadImages(Array.from(imagesList), imgMustInclude);
}

