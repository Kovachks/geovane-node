//Packages
var router = require("express").Router();
var firebase = require("firebase")
var config = require("../config/config.js")
var googleMapsClient = require("@google/maps")
var request = require('request')
var weather = require('weather-js')
var Forecast = require('forecast')
//Global Variables
var database = firebase.database()
var queryUrl
var apiKey = config.googleDirectionsApiKey

// Initialize 
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

// forecast.get([-33.8683, 151.2086], function(err, weather) {
//     if(err) return console.log(err);
//     console.log("_________________________________")
//     console.log(weather);
//     console.log("_________________________________")
//   });


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

function googleMapsDirectionEmbed(data) {

}

var sendData = {}

function googleDirections(data, res) {
    queryUrl = "https://maps.googleapis.com/maps/api/directions/json?origin=" + data.startCity + "&destination=" + data.endCity + "&key=" + apiKey
    googleMapsClient.createClient({
        key: apiKey
    }).directions({
        origin: data.startCity,
        destination: data.endCity
    }, function(err, response) {
        var trip = response.json.routes[0].legs[0]

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
    })
}

function firebasePost(data, database) {
    database.ref().push({
        data
    })
}