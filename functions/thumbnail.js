const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath,
  headless: true,
});

await browser.close();
