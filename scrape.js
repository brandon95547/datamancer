const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');

(async () => {
    const url = process.env.TARGET_URL; // Read from environment variable
    const outputDir = 'temp/scraped_data';
    const outputHtmlFile = 'temp/temp.html';

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Ensure the page is fully loaded
    await page.waitForSelector('body', { visible: true });

    let content = await page.content();

    // Extract asset URLs (including all href attributes)
    const assetUrls = await page.evaluate((baseUrl) => {
        const urls = [];
        document.querySelectorAll('img, link[rel], script[src], a[href]').forEach(el => {
            let src = el.src || el.href;
            if (!src) return;

            // Handle protocol-relative URLs (e.g., //example.com/script.js)
            if (src.startsWith('//')) {
                src = window.location.protocol + src;
            }

            // Convert relative URLs to absolute
            if (src.startsWith('/')) {
                src = new URL(src, baseUrl).href;
            }

            // Ensure it's a valid URL
            if (src && !src.startsWith('data:') && !src.startsWith('mailto:') && !src.startsWith('javascript:')) {
                urls.push(src);
            }
        });
        return urls;
    }, url);

    // Generate a filename mapping
    const assetMap = {};
    for (let assetUrl of assetUrls) {
        const filename = path.basename(new URL(assetUrl).pathname);
        assetMap[assetUrl] = filename;
    }

    async function downloadFile(url, filename) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = path.join(outputDir, filename);
            fs.writeFileSync(filePath, response.data);
            console.log(`Downloaded: ${filename}`);
        } catch (error) {
            console.warn(`Failed to download ${url}: ${error.message}`);
        }
    }

    // Download all assets in parallel
    await Promise.all(Object.entries(assetMap).map(([assetUrl, filename]) => downloadFile(assetUrl, filename)));

    // Fix paths in HTML (including all href and src attributes)
    content = content.replace(/(src|href)=\"([^\"]+)\"/g, (match, attr, originalUrl) => {
        let fullUrl;
        try {
            fullUrl = new URL(originalUrl, url).href;
        } catch {
            return match; // Skip if not a valid URL
        }

        if (assetMap[fullUrl]) {
            return `${attr}="scraped_data/${assetMap[fullUrl]}"`;
        }
        return match;
    });

    fs.writeFileSync(outputHtmlFile, content, 'utf8');
    console.log(`Updated HTML saved to ${outputHtmlFile}`);

    await browser.close();
})();