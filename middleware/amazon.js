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
    const books = input.split(/\r\n/);
    const obj = await getBookInfo(books);
    return obj;
  } catch {
    throw new Error("Something went wrong");
  }
};

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

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
          if (res.data.SearchResult) {
            const base = res.data.SearchResult.Items[0] || "";
            const title = base.ItemInfo.Title.DisplayValue || "";
            const img = base.Images.Primary.Large.URL || "";
            const url = base.DetailPageURL || "";
            const author = base.ItemInfo.ByLineInfo
              ? base.ItemInfo.ByLineInfo.Contributors[0].Name
              : "";
            const last = author.match(/(.+),/)[1].trim() || "";
            const first = author.match(/,(.+)/)[1].trim() || "";
            const fullName = first + " " + last || author;
            const html = `<div class="ama-body-item"><a class="ama-body-link" href="${url}" target="_blank" rel="noopener noreferrer"><img class="ama-body-image" src="${img}" alt="${title} by ${fullName}"></a></div>`;
            const htmlStructured = `<div class="ama-body-item">
                <a class="ama-body-link" href="${url}" target="_blank" rel="noopener noreferrer">
                    <img class="ama-body-image" src="${img}" alt="${title} by ${fullName}">
                </a>
            </div>`;

            console.log(`Fetching ${title} by ${fullName}`);

            const titleObj = {
              title: title,
              img: img,
              url: url,
              author: author,
              last: last,
              first: first,
              fullName: fullName,
              html: html,
              htmlString: htmlStructured
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            };
            console.log(titleObj.htmlString);
            fs.appendFile(
              "./public/amazon_continued.html",
              titleObj.html,
              err => {
                if (err) return console.log(err);
              }
            );
            fs.writeFile("./public/amazon.html", titleObj.html, err => {
              if (err) return console.log(err);
            });
            return titleObj;
          }
          errorArr.push(book);
          throw Error(`Title not found: ${book}`);
        })
        .then(titleObj => {
          bookArr.push(titleObj);
        })
        .catch(err => {
          console.error(err.message);
        });
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }
  return { books: bookArr, errors: errorArr };
};

exports.bookParse = bookParse;
