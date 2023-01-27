import puppeteer from "puppeteer";
import cheerio from "cheerio";

const PAGE_URL = "https://www.trustpilot.com/review/remitly.com";
const reviewContainerSelector = ".styles_reviewCard__hcAvl";

const getReviewsForPage = async (pageNum = 1) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1024 });
  await page.goto(`${PAGE_URL}?page=${pageNum}`, {
    waitUntil: "domcontentloaded",
  });

  console.log("Got To", PAGE_URL);

  const reviews = await page.$$eval(reviewContainerSelector, (elements) =>
    elements.map((item) => {
      const title = item.querySelector(
        '[data-service-review-title-typography="true"]'
      ).textContent;

      const body = item.querySelector(
        '[data-service-review-text-typography="true"]'
      ).textContent;

      const date = item
        .querySelector(
          '[data-service-review-date-of-experience-typography="true"]'
        )
        .textContent.split("Date of experience: ")[1];

      const user = item.querySelector(
        '[data-consumer-name-typography="true"]'
      ).textContent;

      const rating = item
        .querySelector(".styles_reviewHeader__iU9Px")
        .getAttribute("data-service-review-rating");

      return {
        title,
        body,
        date: Date.parse(date),
        user,
        rating: parseInt(rating, 10),
      };
    })
  );

  await browser.close();

  return reviews;
};

const getTotalPages = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1024 });
  await page.goto(`${PAGE_URL}`);

  const lastButton = await page.$eval(
    "a[name='pagination-button-last']",
    (button) => {
      return button.innerText;
    }
  );

  await browser.close();

  return parseInt(lastButton, 10);
};

const main = async () => {
  const totalPages = await getTotalPages();
  console.log("totalPages: ", totalPages);

  let allReviews = [];

  // Note - just using 3 here so we dont spam 1500 pages of reviews for a demo, would use `totalPages` for real
  for (let i = 1; i <= 5; i++) {
    console.log("GETTING PAGE", i);
    const newReviews = await getReviewsForPage(i);
    allReviews = [...allReviews, ...newReviews];
  }

  return allReviews;
};

(async () => {
  const output = await main();

  console.log("TOTAL ITEMS", output.length);

  console.log(output);
})();
