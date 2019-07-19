const express = require('express');
const logger = require('morgan')
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require("./models");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// jsTutorials
var hBars = require("express-handlebars");

const app = express();
app.engine("handlebars", hBars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(logger("dev"));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));
const router = require("./controllers/data-routes.js");
// app.use(router);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
