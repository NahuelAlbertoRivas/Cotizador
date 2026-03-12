import puppeteer from "puppeteer";
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

        console.log("Template cargado correctamente");

        console.log("Iniciando Puppeteer...");
        console.log("Chrome executable path:", puppeteer.executablePath());

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', // o /usr/bin/google-chrome
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        console.log("Chromium iniciado");

        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        console.log("Contenido HTML cargado en la página.");

        await browser.close();

        console.log("PDF generado correctamente");

        console.log("Navegador cerrado, PDF generado correctamente.");

        return pdf;

    } catch (err) {
        console.error("Error en generatePDF:", err);
        throw err;
    }
}
