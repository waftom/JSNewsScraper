// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Comments = require("./models/Comments.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/jsnews");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.javascript.com/news", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        //console.log(html);
        $(".js-loadFeed-list li").each(function(i, element) {

            // Save an empty result object
            var result = {};

            result.link = "https://www.javascript.com" + $(this).children(".sb-bucket").children(".sb-bucket-content").children("p").children("a").attr("href");
            result.title = $(this).children(".sb-bucket").children(".sb-bucket-content").children("p").children("a").text();

            Article.findOne({
                "link": result.link,
                "title": result.title
            }, function(error, doc) {
                if(doc === null) {
                    // Using our Article model, create a new entry
                    // This effectively passes the result object to the entry (and the title and link)
                    var entry = new Article(result);

                    // Now, save that entry to the db
                    entry.save(function(err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        }
                        // Or log the doc
                        else {
                            console.log(doc);
                        }
                    });
                }
            });
        });
    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({
            "_id": req.params.id
        }, function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});

// This will get the comments of an article
app.get("/comments/:id", function(req, res) {
    // Grab every doc in the Articles array
    Comments.find({
        "article": req.params.id
    }, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// This will get the comments of an article
app.post("/delete/:id", function(req, res) {
    // Grab every doc in the Articles array
    Comments.findByIdAndRemove(req.params.id, function (error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.send("deleted");
        }
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    // And save the new comment the db
    Comments.findOneAndUpdate({
            "title": req.body.title
        }, {
            "body": req.body.body
        }).exec(function(err, doc) {
            // Log any errors
            if (err) {
                console.log(err);
            } else {
                if(doc === null) {
                    // Create a new comment and pass the req.body to the entry
                    var newComment = new Comments(req.body);
                    newComment.save(function(error, doc) {});
                }
                console.log(doc);
                res.send(doc);
            }
        });
});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});
