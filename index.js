import { load } from "cheerio";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

async function getSubPages(pageUrl, subPageMustInclude) {
  try {
    const response = await fetch(pageUrl);
    const html = await response.text();

    // Cargar el HTML en cheerio
    const $ = load(html);

    // Buscar todas las etiquetas de enlace
    const subPages = $("a")
      .map((i, link) => $(link).attr("href"))
      .get();

    const filteredSubPages = new Set(
      subPages.filter((link) => link.includes(subPageMustInclude))
    );

    return filteredSubPages;
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
  }
}

async function downloadImages(imagesUrls, imgMustInclude) {
  try {
    if (!fs.existsSync(imgOutputDir)) {
      fs.mkdirSync(imgOutputDir);
    }

    console.log("t1", typeof imagesUrls);

    for (let imgUrl of imagesUrls) {
      // VER Sería para resolver URLs relativas (no lo probé aún)

      console.log("t2", typeof imgUrl, imgUrl);

      if (imgUrl.startsWith("//")) {
        imgUrl = "http:" + imgUrl;
      } else if (imgUrl.startsWith("/")) {
        const url = new URL(imagesUrls);
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

        // Filtrar imágenes por tamaño
        if (metadata.width > 100 || metadata.height > 100) {
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

async function getImagesUrls(pageUrl) {
  try {
    // Evitar visitar la misma URL más de una vez
    if (visitedUrls.has(pageUrl)) {
      return;
    }
    visitedUrls.add(pageUrl);

    const response = await fetch(pageUrl);
    const html = await response.text();

    // Cargar el HTML en cheerio
    const $ = load(html);

    // Buscar todas las etiquetas de imagen
    const imgUrls = $("img")
      .map((i, img) => $(img).attr("src"))
      .get();

    const uniqueImgUrls = new Set(imgUrls);

    return uniqueImgUrls;
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
  }
}

async function getImages(pages, imgMustInclude) {
  const imagesList = new Set();
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
      imagesList.add(...urls);
    }
  }

  await downloadImages(Array.from(imagesList), imgMustInclude);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visitedUrls = new Set();

const pageName = "robert-capa";
const pageUrl = "https://www.magnumphotos.com/photographer/robert-capa/";

const subPageMustInclude = "par";
const imgMustInclude = "overlay";

const imgOutputDir = path.join(__dirname, "images-" + pageName);
const imgUrlsFile = path.join(imgOutputDir, "imgUrls.txt");

if (!fs.existsSync(imgOutputDir)) {
  fs.mkdirSync(imgOutputDir);
}
fs.appendFileSync(imgUrlsFile, `Downloaded from ${pageUrl}\n`);

const subpages = await getSubPages(pageUrl, subPageMustInclude);
subpages.add(pageUrl);

//console.log("Subpages:", subpages.size, subpages);

await getImages(subpages, imgMustInclude);
