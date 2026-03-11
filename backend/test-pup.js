import puppeteer from "puppeteer";

(async () => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        console.log("✅ Chromium lanzado correctamente");
        await browser.close();
    } catch (err) {
        console.error("❌ Error al lanzar Chromium:", err);
    }
})();