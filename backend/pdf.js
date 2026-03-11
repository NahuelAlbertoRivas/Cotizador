import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generatePDF(data) {
    // Ruta absoluta del template
    const templatePath = path.join(__dirname, "template.html");
    
    try{
        let html = fs.readFileSync(templatePath, "utf8");

        // Convertimos logo a base64
        const logoPath = path.join(__dirname, "logo.png");
        const logoData = fs.readFileSync(logoPath).toString("base64");
        html = html.replace(
        'src="logo.png"',
        `src="data:image/png;base64,${logoData}"`
        );

        const rows = data.items
            .map(
                (i) => `
                    <tr>
                    <td>${i.nombre}</td>
                    <td>${i.cantidad}</td>
                    <td>$${i.subtotal}</td>
                    </tr>
                    `
            )
            .join("");

        html = html
            .replace("{{cliente}}", data.cliente)
            .replace("{{asesor}}", data.asesor)
            .replace("{{fechaEmision}}", data.fechaEmision)
            .replace("{{fechaCaducidad}}", data.fechaCaducidad)
            .replace("{{rows}}", rows)
            .replace("{{descuento}}", data.descuento)
            .replace("{{total}}", data.total);

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        await page.setContent(html);

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        return pdf;
    } catch (err) {
        console.error("No se pudo leer template.html:", err);
        throw err; // para que el 500 siga ocurriendo pero con log claro
    }
    
}
