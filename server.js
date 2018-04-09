var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var firebase = require("firebase")
var googleMapsClient = require('@google/maps')
// var config = require('./config')
var config = require("./config/config.js")
require("firebase/database")
require("firebase/auth")
var app = express();
var PORT = process.env.PORT || 8000;




firebase.initializeApp(config);

var user = firebase.auth().currentuser

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

    } else {
      // No user is signed in.
    }
  });
  
// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Static directory
app.use(express.static("public"));

require("./routes/html-routes.js")(app);

require("./routes/api-routes.js")(app);

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});