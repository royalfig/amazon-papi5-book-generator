var express = require("express");
var router = express.Router();
var ama = require("../middleware/amazon");

router.post("/", async function (req, res, next) {
  const data = await ama.bookParse(req.body.titles);
  const titles = data.books;
  const errors = data.errors;

  console.log(errors);

  res.render("results", {
    title: "Search Results",
    titles: titles,
    titleNum: titles.length,
    errors: errors
  });
});

module.exports = router;