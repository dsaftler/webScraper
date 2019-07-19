const express = require("express");
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const articles = require("../models/Article.js");
const notes = require("../models/Note.js");

router.get("/", function (req, res) {
  res.redirect("/articles");
});

router.get("/articles", function (req, res) {
    db.Article.find({}).sort({_id: -1})
      .exec(function(err, docs) {
        if (err) {
          console.log(err);     
        } else {
        let hBarsObj = { article: docs};
        res.render("index", hBarObj);
        res.json(dbArticle);
        }
  });
});  
router.get("/articles-json", function (req, res) {
  db.Article.find({}, function(err,docs) {
    if (err) {
      console.log(err);
    } else {
      res.json(docs);
    }
  });
});  
router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
  axios.get("https://tutorialzine.com/tag/javascript").then(function (response) {

    var $ = cheerio.load(response.data);
    console.log('_____________________________');

    $(".article__description").each(function (i, element) {

      var result = {};
      result.title = $(this)
        .children("h3")
        .text();
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
    
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          // console.log(err);
        });
      // };

    });
    res/redirect("/");
    res.send("Scrape Complete");
  });
});

router.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.render("index", hBarsObj)
    })
    .catch(function (err) {
      res.json(err);
    });
});

router.post("/oneArticle/:id", function (req, res) {
  const thisArticle = req.params.id;
  let hBarsObj = { 
    article: [],
    body: []
  };
  Article.findOne({ _id: thisArticle})
    .populate('note')
    .exec(function(err,docs) {
      if(err){
        console.log(err);
      } else {
        hBarsObj.article = docs;
        let link = docs.link;
        axios.get(link).then(function (response) {
        var $ = cheerio.load(response.data);
        $('.l-col__main').each(function(i, element) {
          hBarsObj.body = $(this).children('.c-entry-content').children('p').text();
          res.render('article', hBarsObj);
          return false;
        });
      });
    }
  });
});

router.post('/note/:id', function(req,res) {
  let title = req.body.title;
  let body = req.body.body;
  let articleId = req.params.id;
  let noteObj = {
    title: title,
    body: body
  };
  db.Note.create(req.body)
    .then(function (dbNote) {
 
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
//clear all articles for testing purposes
router.get('/clearAll', function (req, res) {
  Article.remove({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log('removed all articles');
    }
    res.redirect("/articles-json");
  });
  res.redirect('/articles-json');
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

module.exports = router;