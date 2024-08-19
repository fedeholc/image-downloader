import path from "path";

const __dirname = import.meta.dirname;
let dbPath = path.join(__dirname, "../data/images.db");
let authorsPath = path.join(__dirname, "../data/authors/");
let sourcesPath = path.join(__dirname, "../data/sources/");
let downloadsPath = path.join(__dirname, "../data/downloads/");

export const config = { dbPath: dbPath, authorsPath: authorsPath, sourcesPath: sourcesPath, downloadPath: downloadsPath };
