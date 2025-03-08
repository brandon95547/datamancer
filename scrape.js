const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');

(async () => {
    const url = ''; // Target URL
    const outputDir = 'downloaded_assets';
    const outputHtmlFile = 'temp.html';

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Ensure the page is fully loaded
    await page.waitForSelector('body', { visible: true });

    let content = await page.content();

    // Extract asset URLs (both absolute and relative)
    const assetUrls = await page.evaluate((baseUrl) => {
        const urls = [];
        document.querySelectorAll('img, link[rel="stylesheet"], script[src]').forEach(el => {
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
            if (src && !src.startsWith('data:')) {
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

    // Fix Relative Paths in HTML (Handling <script> tags properly)
    content = content.replace(/(src|href)=["'](\/[^"']+)["']/g, (match, attr, relPath) => {
        const fullUrl = new URL(relPath, url).href; // Convert to absolute URL
        if (assetMap[fullUrl]) {
            return `${attr}="downloaded_assets/${assetMap[fullUrl]}"`;
        }
        return match; // If not found, return original
    });

    // Fix Absolute Paths in HTML
    Object.entries(assetMap).forEach(([assetUrl, filename]) => {
        const escapedUrl = assetUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape special characters
        content = content.replace(new RegExp(escapedUrl, 'g'), `downloaded_assets/${filename}`);
    });

    fs.writeFileSync(outputHtmlFile, content, 'utf8');
    console.log(`Updated HTML saved to ${outputHtmlFile}`);

    await browser.close();
})();
