### **📝 Datamancer**
**Advanced Web Scraping & Data Extraction for Node.js**

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)](https://nodejs.org/)
Author: **Synexis AI** | [Website](https://synexisai.com)

---

## **📌 Overview**
**Datamancer** is a powerful, flexible, and efficient web scraping tool built with **Node.js** and **Puppeteer**. It enables developers to automate data extraction, process web pages dynamically, and save structured content for further analysis.

### **✨ Features**
✅ **Headless Browsing with Puppeteer** – Automates interaction with web pages  
✅ **Efficient Asset & Data Scraping** – Extracts images, scripts, and structured data  
✅ **Customizable Extraction Rules** – Adapt scraping logic to any website  
✅ **Handles Dynamic Content** – Supports JavaScript-heavy websites  
✅ **Concurrent Downloading** – Faster scraping with parallel requests  
✅ **Output in JSON, CSV, or Database** – Flexible data storage options  

---

## **🚀 Installation**
Make sure you have **Node.js (16+)** installed. Then, install Datamancer with:  

```sh
git clone https://github.com/synexisai/datamancer.git
cd datamancer
npm install
```

---

## **📂 Project Structure**
```
datamancer/
│── scrape.js              # Scraper script (uses environment variable for URL)
│── temp/                  # Scraped data storage
│── package.json           # Node.js dependencies
│── README.md              # Project documentation
```

---

## **🛠️ Usage**
### **1⃣ Basic Web Scraping**
To start scraping a webpage, set the URL via an environment variable and run:

```sh
cross-env TARGET_URL="https://example.com" node scrape.js
```

Alternatively, without `cross-env`:

On macOS/Linux:
```sh
TARGET_URL="https://example.com" node scrape.js
```

On Windows (cmd):
```cmd
set TARGET_URL=https://example.com && node scrape.js
```

On Windows (PowerShell):
```powershell
$env:TARGET_URL="https://example.com"; node scrape.js
```

### **2⃣ Extract Specific Data**
Modify `scraper.js` to extract specific elements like:
```js
const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.article-title'))
        .map(el => el.innerText);
});
```

### **3⃣ Save Data in JSON**
Run:
```sh
node src/index.js --url "https://example.com" --output "data.json"
```

---

## **⚙️ Configuration**
Modify the `config/settings.json` file:
```json
{
    "headless": true,
    "outputFormat": "json",
    "maxPages": 10
}
```

---

## **📝 License**
This project is licensed under the **MIT License**.

---

## **📧 Contact**
**Synexis AI**  
🌍 Website: [synexisai.com](https://synexisai.com)  
📧 Email: support@synexisai.com  

---

### **🚀 Happy Scraping!**

