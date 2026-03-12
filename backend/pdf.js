import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generatePDF(data) {
    try {
        console.log("Generando PDF...");

        const templatePath = path.join(__dirname, "template.html");
        console.log("Template path:", templatePath);

        let html = fs.readFileSync(templatePath, "utf8");

        const logoPath = path.join(__dirname, "logo.png");
        console.log("Logo path:", logoPath);

        const logoData = fs.readFileSync(logoPath).toString("base64");

        html = html.replace(
            'src="logo.png"',
            `src="data:image/png;base64,${logoData}"`
        );

        console.log("Datos recibidos:", JSON.stringify(data, null, 2));

        const rows = data.items.map(
            i => `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>$${i.subtotal}</td></tr>`
        ).join("");

        html = html.replace("{{cliente}}", data.cliente)
                   .replace("{{asesor}}", data.asesor)
                   .replace("{{fechaEmision}}", data.fechaEmision)
                   .replace("{{fechaCaducidad}}", data.fechaCaducidad)
                   .replace("{{rows}}", rows)
                   .replace("{{descuento}}", data.descuento)
                   .replace("{{total}}", data.total);

        console.log("Template cargado correctamente");
        console.log("Iniciando Puppeteer...");

        const binPath = path.join("node_modules/@sparticuz/chromium-min/bin");
        console.log("Chromium bin path exists?", fs.existsSync(binPath));

        const executablePath = await chromium.executablePath();

        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/chromium-browser",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: "A4", printBackground: true });

        await browser.close();
        console.log("PDF generado correctamente");
        return pdf;

    } catch (err) {
        console.error("Error en generatePDF:", err);
        throw err;
    }
}
