//Packages
var router = require("express").Router();
var firebase = require("firebase")
var config = require("../config/config.js")
var googleMapsClient = require("@google/maps")
//Global Variables
var database = firebase.database()
var queryUrl
var apiKey = config.googleDirectionsApiKey

// console.log(googleMapsClient.createClient().directions({origin: "Cleveland", destination: "Cincinnati", key: config.googleDirectionsApiKey}))

module.exports = function(app) {

    //Fired on submission of primary search
    app.post("/search", function(req, res) {

        //Storing data passed from AJAX
        var data = req.body

        //Setting firebase data with new search paramaters
        firebasePost(data, database)
        googleDirections(data)

    })
}

function googleMapsDirectionEmbed(data) {

}

function googleDirections(data) {
    console.log(apiKey)
    queryUrl = "https://maps.googleapis.com/maps/api/directions/json?origin=" + data.startCity + "&destination=" + data.endCity + "&key=" + apiKey
    googleMapsClient.createClient({
        key: apiKey
    }).directions({
        origin: data.startCity,
        destination: data.endCity
    }, function(err, response) {
        console.log(response.json.routes[0].legs)
    })
}

function firebasePost(data, database) {
    database.ref().push({
        data
    })
}