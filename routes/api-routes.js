//Requirements
var router = require("express").Router();
var firebase = require("firebase")
var config = require("../config/config.js")
var googleMapsClient = require("@google/maps")
var request = require('request')
var weather = require('weather-js')
var Forecast = require('forecast')

//Global Variables
var database = firebase.database()
var apiKey = config.googleDirectionsApiKey
var sendData = {}


// Initialize new forecast object to call weather info
var forecast = new Forecast({
    service: 'darksky',
    key: config.darkSkyApiKey,
    units: 'fahrenheit',
    cache: true,      // Cache API requests 
    ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
      minutes: 27,
      seconds: 45
    }
});

module.exports = function(app) {

    //Fired on submission of primary search
    app.post("/search", function(req, res) {

        //Storing data passed from AJAX
        var data = req.body

        //Setting firebase data with new search paramaters
        firebasePost(data, database)
        googleDirections(data, res)

    })
}

var temperature

//Placeholder for function to embed map data
function googleMapsDirectionEmbed(data) {

}


//Querying google Directions API to grab route data
function googleDirections(data, res) {
    googleMapsClient.createClient({
        key: apiKey
    }).directions({
        origin: data.startCity,
        destination: data.endCity
    }, function(err, response) {

        //Storing main trip data as placeholder for easier use later
        var trip = response.json.routes[0].legs[0]

        //Calling weather after response from directions API.  Passing it trip data and our res object along with our send data object
        weatherCall(trip, sendData, res)
    })
}


//Function for start and end city weather data
function weatherCall(trip, sendData, res) {

     //Weather call for Start City
     forecast.get([trip.start_location.lat, trip.start_location.lng], function(err, weather) {
        sendData.startTemperature = weather.currently.temperature
        sendData.startCity = trip.start_address
        sendData.endCity = trip.end_address
    
        //Weather call for End City
        forecast.get([trip.end_location.lat, trip.end_location.lng],sendData, function(err, weather) {
            sendData.endTemperature = weather.currently.temperature
            res.send(sendData)
        })    

    })
}

//Function to post query information to database
function firebasePost(data, database) {
    database.ref().push({
        data
    })
}