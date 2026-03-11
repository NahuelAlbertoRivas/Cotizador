import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./data.db");

db.run(`
CREATE TABLE IF NOT EXISTS products(
id TEXT PRIMARY KEY,
nombre TEXT,
precio REAL,
descripcion TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS clients(
id INTEGER PRIMARY KEY AUTOINCREMENT,
nombre TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS quotes(
id INTEGER PRIMARY KEY AUTOINCREMENT,
numero TEXT,
cliente TEXT,
asesor TEXT,
fechaEmision TEXT,
fechaCaducidad TEXT,
descuento REAL,
total REAL,
data TEXT
)
`);

export default db;
