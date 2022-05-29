const chromium = require("chrome-aws-lambda");
const fs = require("fs");

exports.handler = async function (event, context) {
  const { title, tagColor, tagTitle, imageURL } = JSON.parse(event.body);
  const executablePath = await chromium.executablePath,
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    });

  const page = await browser.newPage();
  const html = fs.readFileSync("index.html", "utf-8");

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

  const screenshot = await page.screenshot({ encoding: "binary" });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      buffer: screenshot,
    }),
  };
};
