const fs = require("fs");

const Api = require("amazon-pa-api50");
const Config = require("amazon-pa-api50/lib/config");
const resources = require("amazon-pa-api50/lib/options").Resources; // Optional for different resources
const searchIndex = require("amazon-pa-api50/lib/options").SearchIndex; // for Search Index
const myConfig = new Config();

myConfig.accessKey = process.env.ACCESS_KEY;
myConfig.secretKey = process.env.SECRET_KEY;
myConfig.partnerTag = process.env.PARTNER_TAG;

const api = new Api(myConfig);

let resourceList = resources.getItemInfo;
resourceList = resourceList.concat(resources.getImagesPrimary);

const bookParse = async input => {
  try {
    const books = input.trim().split(/\r\n/);
    const obj = await getBookInfo(books);
    return obj;
  } catch {
    throw new Error("Something went wrong");
  }
};

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

const nameParser = input => {
  if (/,/.test(input)) {
    const first = input.match(/,(.+)/)[1].trim() || "";
    const last = input.match(/(.+),/)[1].trim() || "";
    const full = `${first} ${last}`;
    const name = { first: first, last: last, full: full };
    return name;
  }

  const spaces = input.split(" ");
  const last = spaces.pop();
  let first = spaces.join(" ");
  const full = `${first} ${last}`;
  const name = { first: first, last: last, full: full };
  return name;
};

const getBookInfo = async books => {
  let bookArr = [];
  let errorArr = [];
  for (const book of books) {
    await sleep(1000);
    try {
      await api
        .search(book, {
          parameters: resourceList,
          searchIndex: searchIndex.Books
        })
        .then(res => {
          console.log(res.data.SearchResult.Items[0]);
          if (res.data.SearchResult) {
            const base = res.data.SearchResult.Items[0] || "";
            const title = base.ItemInfo.Title.DisplayValue || "";
            const img = base.Images.Primary.Large.URL || "";
            const url = base.DetailPageURL || "";
            const author = base.ItemInfo.ByLineInfo
              ? base.ItemInfo.ByLineInfo.Contributors[0].Name
              : "";

            const { first, last, full } = nameParser(author);
            const rawDate =
              new Date(
                base.ItemInfo.ContentInfo.PublicationDate.DisplayValue
              ) || "";
            const pubDate = rawDate.getFullYear() || "";
            const pages =
              base.ItemInfo.ContentInfo.PagesCount.DisplayValue || "";
            console.log(base.ItemInfo.ByLineInfo.Contributors);
            const pub =
              base.ItemInfo.ByLineInfo.Manufacturer.DisplayValue || "";
            const htmlStructured = `<div class="ama-body-item">
                <a class="ama-body-link" href="${url}" target="_blank" rel="noopener noreferrer">
                    <img class="ama-body-image" src="${img}" alt="${title} by ${full}">
                </a>
            </div>`;

            console.log(`Fetching ${title} by ${full}`);

            const titleObj = {
              title: title,
              img: img,
              url: url,
              rawAuthor: author,
              first: first,
              last: last,
              full: full,
              pub: pub,
              pubDate: pubDate,
              pages: pages,
              htmlString: htmlStructured
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            };

            // TODO Add file creation for dl

            return titleObj;
          }

          errorArr.push(book);
          throw Error(`Title not found: ${book}`);
        })
        .then(titleObj => {
          bookArr.push(titleObj);
        });
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }
  return { books: bookArr, errors: errorArr };
};

exports.bookParse = bookParse;
