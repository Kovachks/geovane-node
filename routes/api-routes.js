//NPM's
var router = require("express").Router();
var firebase = require("firebase")
var config = require("../config/config.js")
var googleMapsClient = require("@google/maps")
var request = require('request')
var weather = require('weather-js')
var Forecast = require('forecast')
var passwordHash = require('password-hash')
var geocoder = require('geocoder')
var cities = require('smart-city-finder')
var geoTz= require('geo-tz')

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

        //This definitely needs to be moved.  Reorder of where sendData is first called
        sendData.options = req.body.options

        //Setting firebase data with new search paramaters
        firebasePost(data, database)
        googleDirections(data, res)

    })
}

var temperature

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
        console.log(trip)

        //Storing total triptime for use later with weather calls in order to time delay weather information
        sendData.tripTime = Math.round(response.json.routes[0].legs[0].duration.value /60 /60)
        sendData.tripTimeMinutes = Math.round(response.json.routes[0].legs[0].duration.value /60)
        // console.log(response.json.routes[0].legs[0])

        //Calling weather after response from directions API.  Passing it trip data and our res object along with our send data object
        weatherCall(trip, sendData, res)
    })
}


//Function for start and end city weather data
function weatherCall(trip, sendData, res) {
     //Weather call for Start City
     forecast.get([trip.start_location.lat, trip.start_location.lng], function(err, weather) {
         console.log(weather)

        //Setting initial data for start and end trips
        sendData.startTemperature = weather.currently.temperature
        sendData.startCity = trip.start_address
        sendData.startGps = trip.start_location
        sendData.startWeather = weather.currently.icon
        sendData.endCity = trip.end_address
        sendData.endGps = trip.end_location
        sendData.startPrecip = weather.currently.precipProbability
        sendData.startTimezone = geoTz.tz(trip.start_location.lat, trip.start_location.lng)
        sendData.endTimezone = geoTz.tz(trip.end_location.lat, trip.end_location.lng)
    
        //Weather call for End City
        forecast.get([trip.end_location.lat, trip.end_location.lng],sendData, function(err, weather) {

            //Grabbing weather data that is delayed for trip time
            sendData.endTemperature = weather.hourly.data[sendData.tripTime].temperature
            sendData.endWeather = weather.hourly.data[sendData.tripTime].icon
            sendData.endPrecip = weather.hourly.data[sendData.tripTime].precipProbability

            //Passing arguments to weatherLoop function to loop through steps on route
            weatherLoop(trip, sendData, res)
        })    

    })
}

function weatherLoop(trip, sendData, res) {
    // console.log(trip.steps)
    sendData["allSteps"] = []
    if (sendData.tripTime <= 2) {
        weatherLoopCall(trip, sendData, res, 15000)
    }
    else if (sendData.tripTime > 2 && sendData.tripTime <=8) {
        weatherLoopCall(trip, sendData, res, 30000)
}
    else if (sendData.tripTime > 8) {        
        weatherLoopCall(trip, sendData, res, 60000)
    }
    // console.log(sendData.allSteps.length)
    // console.log(sendData)

    //If there are steps send them to the weather loop
    if (sendData.allSteps[0]) {
    weatherLoopQuery(sendData, res)
    }
    
    //Otherwise send all data back to the client
    else {
    res.send(sendData)
    }
}

//Really bad function name.  Fix later
function weatherLoopCall(trip, sendData, res, distance) {
    var j = 0
    var tripTime = 0
    console.log(trip.steps[8])
    console.log("trip array length" + trip.steps.length)

    //Looping through each step to determine if step is worth grabbing weather data for
    for(var i = 0; i < trip.steps.length; i += 1) {

        //Adding current steps time to variable storing combined trip duration
        tripTime = tripTime + trip.steps[i].duration.value

        //Checking step distance against predetermined distance metric
        if (trip.steps[i].distance.value > distance) {
            console.log(sendData.tripTimeMinutes - (tripTime/60))
            //Checking to see if step is too close to end destination
            if(sendData.tripTimeMinutes - (tripTime/60) > 30) {
                sendData.allSteps[j] = {
                    stepDistanceMeter: trip.steps[i].distance.value,
                    stepDistanceMiles: trip.steps[i].distance.text,
                    stepLat: trip.steps[i].end_location.lat,
                    stepLng: trip.steps[i].end_location.lng,
                    time: tripTime,
                    stepTimeZone: geoTz.tz(trip.steps[i].end_location.lat,trip.steps[i].end_location.lng)
                }
            }
            j += 1
            console.log("This is greater than " + distance + " meters: " + trip.steps[i].distance.value)
        } else {
            console.log("This is not greater: " + trip.steps[i].distance.value)
        }
    }
}


function weatherLoopQuery(sendData, res) {
    // console.log(JSON.stringify(sendData))
    let k = sendData.allSteps.length
    for (let i = 0; i < sendData.allSteps.length; i+= 1) {
        forecast.get([sendData.allSteps[i].stepLat, sendData.allSteps[i].stepLng], function(err, weather) {
            // console.log(weather.hourly.data)
            var durationHour = Math.round(sendData.allSteps[i].time / 60 /60)
            sendData.allSteps[i].time = Math.round(sendData.allSteps[i].time / 60)
            // console.log(weather.currently.temperature)
            sendData.allSteps[i].currentTemp = weather.hourly.data[durationHour].temperature;
            sendData.allSteps[i].currentWeather = weather.hourly.data[durationHour].icon;
            sendData.allSteps[i].precip = weather.hourly.data[durationHour].precipProbability;
            k--     
            if (k == 0) {
                cityLookup(res, sendData)
         }       
        })
    }
}

//Function for looking up city data along route.  Now just pulling city/state of each step
function cityLookup(res, sendData) {
    let k = sendData.allSteps.length
    for (let i = 0; i < sendData.allSteps.length; i += 1) {
        
        //Setting the cityinfo key inside the current step with the cities info pulled from smart-cities
        sendData.allSteps[i].cityInfo = cities.gps_lookup(sendData.allSteps[i].stepLat, sendData.allSteps[i].stepLng)
        
        k--
        
        if (k == 0) {
            done(res, sendData)
        }
    }
}

//Simple function to end server response
function done(res, sendData) {
    res.send(sendData)
}

//Function to post query information to database
function firebasePost(data, database) {
    database.ref().push({
        data
    })
}