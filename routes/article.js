var express = require('express')
// var logger = require("morgan");
var router = express.Router();

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

var Article = require("../models/Article");
var Note = require("../models/Note");

// A GET route for scraping the echoJS website
router.get("/", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://nypost.com/metro/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // console.log($(".article"))
    // Now, we grab every h2 within an article tag, and do the following:
    $(".article").each(function (i, element) {
      // $(".entry-header h3").each(function(i, element) {
      // Save an empty result object
      // console.log($(this).children(".entry-header").children("h3").children("a").text())
      var result = {};
      // let div = element.children(".entry-header h3 a")
      // Add the text and href of every link, and save them as properties of the result object
      // result.title = $(this).children("div.entry-header").children("a").text();
      result.title = $(this).children(".entry-header").children("h3").children("a").text();
      result.img = $(this).children(".entry-thumbnail").children("a").children("picture").children("source").attr("data-srcset");
      // console.log(result)
      result.description = $(this).children(".entry-content").text();
      result.link = $(this).children(".entry-header").children("h3").children("a").attr("href");
      console.log(result)
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
      var query = { title: result.title /* query */ };
      // Create a new Article using the `result` object built from scraping
      // Article.create(result)
      Article.findOneAndUpdate(query, result, options)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
          // Insert articule on array to render the page
        })
        .catch(function (err) {
          // If an error occurred, log it
          // console.log(err);
        });
    });

    // Send a message to the client
    res.redirect("/articles");
    // res.send(result);
  });
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  Article.find({}).sort({ _id: -1 })
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(dbArticle);
      const articles = {
        articles: dbArticle
      }
      res.render("index", articles);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      // res.json(err);
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate('notes')
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      // console.log(dbArticle)
      res.send(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.send(err);
    });
});



// Route for saving/updating an Article's associated Note
router.post("/note/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      // return Article.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true });
      return Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
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

// Route for saving/updating an Article's associated Note
router.put("/note/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log("body",req.body)
  Note.findOneAndUpdate({_id: req.params.id }, { $set : {title : req.body.title, body: req.body.body}})
    .then(function (dbNote) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbNote);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// delete the note from notes model
router.delete("/note/:id/:artId", (req, res) => {
  Article.findOneAndUpdate({ _id: req.params.artId }, { $pull: { notes: req.params.id } })
    // .then(note => res.json(note)).catch(err => res.json(err))
  Note.remove({ _id: req.params.id }).then(note => res.json(note)).catch(err => res.json(err))
})

module.exports = router;