var createError = require("http-errors");
const auth = require("./middleware/auth")
var express = require("express");
var path = require("path");
require("dotenv").config();
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");

const loginRouter = require("./routes/login")
const searchRouter = require("./routes/search")
const resultsRouter = require("./routes/results")

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", loginRouter);
app.use(auth);
app.use("/search", searchRouter);
app.use("/results", resultsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;