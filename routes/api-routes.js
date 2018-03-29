//Requirements
var router = require("express").Router();
var firebase = require("firebase")
var config = require("../config/config.js")
var googleMapsClient = require("@google/maps")
var request = require('request')
var weather = require('weather-js')
var Forecast = require('forecast')
var passwordHash = require('password-hash')
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

    app.post("/signup", function(req, res) {
        console.log(req.body)
        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(user) {
            console.log(user)
            user.sendEmailVerification().then(function() {
                // Email sent.
              }).catch(function(error) {
                // An error happened.
              });
            res.send(user)
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
        })
    })

    app.post("/logout", function(req, res) {
        console.log("test")
        firebase.auth().signOut().then(function() {
            res.send("logged out")
          }, function(error) {
            console.log(error)
          });
    })

    app.post("/login", function(req, res) {
        console.log(req.body)

        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(user) {
            var userCheck = firebase.auth().currentUser
            if (userCheck.emailVerified === true) {
                user.hashPass = passwordHash.generate(req.body.password)
                console.log(user.hashPass)
                res.send(user)
            } else {
                firebase.auth().signOut().then(function() {
                    res.send("Email Not Verified")
                })
            }
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage)
            if (errorMessage === "There is no user record corresponding to this identifier. The user may have been deleted."){
                res.send("No user with that login email")
                }
            else if (errorMessage === "The email address is badly formatted.") {
                    res.send("Please enter a valid email")
            } 
            else if (errorMessage === "The password is invalid or the user does not have a password.") {
                res.send("Password is invalid")
            }
            else {
                console.log(errorMessage)
                res.send("logged in")
            }
        })
    });

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
        console.log(response.json.routes[0].legs[0].steps)

        //Calling weather after response from directions API.  Passing it trip data and our res object along with our send data object
        weatherCall(trip, sendData, res)
    })
}


//Function for start and end city weather data
function weatherCall(trip, sendData, res) {
    // console.log(trip.steps)
     //Weather call for Start City
     forecast.get([trip.start_location.lat, trip.start_location.lng], function(err, weather) {
        //  console.log(trip)
        sendData.startTemperature = weather.currently.temperature
        sendData.startCity = trip.start_address
        sendData.startGps = trip.start_location
        sendData.startWeather = weather.currently.icon
        sendData.endCity = trip.end_address
        sendData.endGps = trip.end_location
    
        //Weather call for End City
        forecast.get([trip.end_location.lat, trip.end_location.lng],sendData, function(err, weather) {
            sendData.endTemperature = weather.currently.temperature
            sendData.endWeather = weather.currently.icon
            weatherLoop(trip, sendData, res)
        })    

    })
}

function weatherLoop(trip, sendData, res) {
    // console.log(trip.steps)
    var j = 0
    sendData["allSteps"] = []
    for(var i = 0; i <= trip.steps.length -1; i += 1) {
        if (trip.steps[i].distance.value > 15000) {
            sendData.allSteps[j] = {
                stepDistanceMeter: trip.steps[i].distance.value,
                stepDistanceMiles: trip.steps[i].distance.text,
                stepLat: trip.steps[i].start_location.lat,
                stepLng: trip.steps[i].start_location.lng
            }
            j += 1
            console.log("This is greater than 8000meters: " + trip.steps[i].distance.value)
        } else {
            console.log("This is not greater: " + trip.steps[i].distance.value)
        }
    }
    // console.log(sendData.allSteps.length)
    // console.log(sendData)
    weatherLoopQuery(sendData, res)
}

function weatherLoopQuery(sendData, res) {
    console.log(JSON.stringify(sendData))
    let k = sendData.allSteps.length
    console.log("initial K value: " + k)
    for (let i = 0; i < sendData.allSteps.length; i+= 1) {
        forecast.get([sendData.allSteps[i].stepLat, sendData.allSteps[i].stepLng], function(err, weather) {
            console.log(weather)
            console.log(weather.currently.temperature)
            sendData.allSteps[i].currentTemp = weather.currently.temperature;
            sendData.allSteps[i].currentWeather = weather.currently.icon;
            k--     
            if (k == 0) {
                done(res, sendData)
         }       
        })
        console.log("this is the end K value: " + k)
    }
}

function done(res, sendData) {
    console.log("this is the final sendData: " + JSON.stringify(sendData))
    res.send(sendData)
}

//Function to post query information to database
function firebasePost(data, database) {
    database.ref().push({
        data
    })
}