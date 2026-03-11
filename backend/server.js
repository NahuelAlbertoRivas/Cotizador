import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import db from "./database.js";
import { generatePDF } from "./pdf.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* API */

/* PRODUCTS */

app.get("/api/products", (req, res) => {
    db.all("SELECT * FROM products", (e, r) => res.json(r));
});

app.post("/api/products", (req, res) => {
    const { id, nombre, precio, descripcion } = req.body;

    db.run("INSERT INTO products VALUES (?,?,?,?)", [id, nombre, precio, descripcion], (err) => {
        if (err) return res.status(400).json({ error: "duplicado" });
        res.json({ ok: true });
    });
});

app.put("/api/products/:id", (req, res) => {
    const { nombre, precio, descripcion } = req.body;

    db.run("UPDATE products SET nombre=?,precio=?,descripcion=? WHERE id=?", [nombre, precio, descripcion, req.params.id], () => res.json({ ok: true }));
});

app.delete("/api/products/:id", (req, res) => {
    db.run("DELETE FROM products WHERE id=?", req.params.id, () => res.json({ ok: true }));
});

/* IMPORT JSON */

app.post("/api/products/import", (req, res) => {
    const duplicados = [];

    req.body.forEach((p) => {
        db.run("INSERT OR IGNORE INTO products VALUES (?,?,?,?)", [p.id, p.nombre, p.precio, p.descripcion], function () {
            if (this.changes === 0) duplicados.push(p.id);
        });
    });

    setTimeout(() => res.json({ duplicados }), 300);
});

/* CLIENTS */

app.get("/api/clients", (req, res) => {
    db.all("SELECT * FROM clients", (e, r) => res.json(r));
});

/* QUOTES */

app.post("/api/quotes", (req, res) => {
    const q = req.body;

    db.run(
        `INSERT INTO quotes
(numero,cliente,asesor,fechaEmision,fechaCaducidad,descuento,total,data)
VALUES (?,?,?,?,?,?,?,?)`,
        ["", q.cliente, q.asesor, q.fechaEmision, q.fechaCaducidad, q.descuento, q.total, JSON.stringify(q)],
        function () {
            const numero = "COT-" + String(this.lastID).padStart(5, "0");

            db.run("UPDATE quotes SET numero=? WHERE id=?", [numero, this.lastID]);

            res.json({ numero });
        }
    );
});

app.get("/api/quotes", (req, res) => {
    db.all("SELECT * FROM quotes ORDER BY id DESC", (e, r) => res.json(r));
});

/* PDF */

app.post("/api/pdf", async (req, res) => {
    try {
        const pdf = await generatePDF(req.body);
        res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cotizacion.pdf",
        });
        res.send(pdf);
    } catch (err) {
        console.error("Error generando PDF:", err);
        res.status(500).json({ error: "Error generando PDF" });
    }
});

/* FRONTEND STATIC */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
