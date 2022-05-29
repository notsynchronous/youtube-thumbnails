const chromium = require("chrome-aws-lambda");
const fs = require("fs").promises;
const path = require("path");

exports.handler = async function (event, context) {
  const { title, tagColor, tagTitle, imageURL } = JSON.parse(event.body);
  let screenshot = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      executablePath: process.env.URL.includes("localhost")
        ? null
        : await chromium.executablePath,
    });

    const page = await browser.newPage();
    const html = await fs.readFile(path.join(__dirname, "./template.html"), {
      encoding: "utf-8",
    });

    await page.setContent(html);
    // "https://n-magazine.com/wp-content/uploads/2021/04/spotify-icon-green-logo-8.png"

    await page.evaluate(
      (title, tagColor, tagTitle, imageURL) => {
        document.querySelector("#title").innerHTML = title;
        document.querySelector(".tag").innerHTML = tagTitle;
        document.querySelector(".tag").style.backgroundColor = tagColor;
        document.querySelector("#image").setAttribute("src", imageURL);
      },
      title,
      tagColor,
      tagTitle,
      imageURL
    );

    screenshot = await page.screenshot({ encoding: "binary" });
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err,
      }),
    };
  } finally {
    await browser.close();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      buffer: screenshot,
    }),
  };
};
