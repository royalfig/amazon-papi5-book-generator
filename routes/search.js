var express = require("express");
var router = express.Router();

/* GET home page. */
router.use("/", function (req, res, next) {
  res.render("search", {
    title: "Search the BRL Generator"
  });
});



module.exports = router;