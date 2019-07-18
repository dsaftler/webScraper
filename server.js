const express = require('express');
const logger = require('morgan')
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require("./models");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// jsTutorials
const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://tutorialzine.com/tag/javascript").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    console.log('_____________________________');

    $(".article__description").each(function (i, element) {

      var result = {};
      result.title = $(this)
        .children("h3")
        .text();
      // parents.parent.children
      result.link = $(this)
        .children("a")
        .attr("href");
      result.title = $(this)
        .children("a")
        .children("h3")
        .text();
      result.summary = $(this)
        .children("p")
      result.summary = cleanString(result.summary)
      let foundCnt = db.Article.findOne({ "link": result.link });
      console.log(foundCnt.link);

      
    //  db.Article.findOne({ "link": result.link }, function(err, res) {
    //    if (res.link!=='') { foundCnt = 999 }
    //   });
        //if the foundIt is 0, the entry is unique and good to save
        // foundIt = false;
      // foundCnt=0
      if (foundCnt === 0) {
          db.Article.create(result)
            .then(function (dbArticle) {
              console.log(dbArticle);
            })
            .catch(function (err) {
              console.log(err);
            });
        };

    });
    res.send("Scrape Complete");
  });
});

function cleanString(myString) {
  if ((myString === null) || (myString === ''))
    return '';
  else
    myString = myString.toString();
  myString = myString.replace("\n                        ", '')
  myString = myString.replace("\n                    ", '')
  myString = myString.replace(/&apos;/g, "'")
  return myString.replace(/<[^>]*>/g, '');
}


app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});