import { load } from "cheerio";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para descargar una imagen
const downloadImage = async (url, outputPath) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.promises.writeFile(outputPath, buffer);
};

async function getSubPages(pageUrl, pageMustInclude) {
  try {
    const response = await fetch(pageUrl);
    const html = await response.text();

    // Cargar el HTML en cheerio
    const $ = load(html);

    // Buscar todas las etiquetas de enlace
    const linkUrls = $("a")
      .map((i, link) => $(link).attr("href"))
      .get();

    console.log("Subpages:", linkUrls);

    const rta = new Set(
      linkUrls.filter((link) => link.includes(pageMustInclude))
    );
    return rta;
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
  }
}

// Función para extraer y descargar imágenes de una página
async function downloadImagesFromPage(pageUrl, imgMustInclude) {
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

    // Crear un directorio para guardar las imágenes
    const outputDir = path.join(__dirname, "images");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    for (let imgUrl of imgUrls) {
      // Resolver URLs relativas
      if (imgUrl.startsWith("//")) {
        imgUrl = "http:" + imgUrl;
      } else if (imgUrl.startsWith("/")) {
        const url = new URL(pageUrl);
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
          const imgName = path.basename(imgUrl);
          const outputPath = path.join(outputDir, imgName);
          await fs.promises.writeFile(outputPath, buffer);
          console.log(`Descargada: ${imgUrl}`);
        }
      } catch (err) {
        console.error(`Error al descargar ${imgUrl}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error al procesar la página ${pageUrl}: ${err.message}`);
  }
}

async function getImagesFromPages(pages, imgMustInclude) {
  console.log(pages);
  for (let linkUrl of pages) {
    // Resolver URLs relativas
    if (linkUrl && !linkUrl.startsWith("http")) {
      const url = new URL(pageUrl);
      linkUrl = url.origin + linkUrl;
    }
    console.log(linkUrl);
    // Evitar URLs vacías y anclas
    if (linkUrl && !linkUrl.startsWith("#")) {
      console.log(`Procesando: ${linkUrl}`);
      await downloadImagesFromPage(linkUrl, imgMustInclude);
    }
  }
}

const visitedUrls = new Set();
// URL de la página web
const pageUrl = "https://www.magnumphotos.com/photographer/robert-capa/"; // Reemplaza con la URL deseada

const subpages = await getSubPages(pageUrl, "par");

await getImagesFromPages(subpages, "overlay");
