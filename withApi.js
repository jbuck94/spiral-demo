import puppeteer from "puppeteer";
import fetch from "node-fetch";

const PAGE_URL = "https://www.trustpilot.com/review/remitly.com";
const reviewContainerSelector = ".styles_reviewCard__hcAvl";
const PAGES_TO_CRAWL = 5;

const getReviewsForPage = async (pageNum = 1) => {
  const res = await fetch(
    `https://www.trustpilot.com/_next/data/businessunitprofile-consumersite-6913/review/remitly.com.json?page=${pageNum}&businessUnit=remitly.com`,
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        baggage:
          "sentry-environment=Production,sentry-release=businessunitprofile-consumersite%406913,sentry-transaction=%2Freview%2F%5BbusinessUnit%5D,sentry-public_key=7ac98d0742b24421b3d38448c4bf1184,sentry-trace_id=a74242319c7d411fa6fd0419f3c6ac97,sentry-sample_rate=0.0015",
        "if-none-match": '"ck4fvxe3j83av8"',
        "sec-ch-ua":
          '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sentry-trace": "a74242319c7d411fa6fd0419f3c6ac97-886062ff36071f00-0",
        "x-nextjs-data": "1",
      },
      referrer: "https://www.trustpilot.com/review/remitly.com",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );

  const resJson = await res.json();
  const reviewsRaw = resJson.pageProps.reviews;

  return reviewsRaw
    ? reviewsRaw.map((review) => ({
        title: review.title,
        body: review.text,
        date: Date.parse(review.dates.publishedDate),
        user: review.consumer.displayName,
        rating: parseInt(review.rating, 10),
      }))
    : [];
};

const main = async () => {
  let allReviews = [];

  // Note - just using 3 here so we dont spam 1500 pages of reviews for a demo, would use `totalPages` for real
  for (let i = 1; i <= PAGES_TO_CRAWL; i++) {
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
