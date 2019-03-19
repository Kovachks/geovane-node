//NPM's
var router = require("express").Router();
var firebase = require("firebase");
var config = require("../config/config.js");
var googleMapsClient = require("@google/maps");
var request = require('request');
var weather = require('weather-js');
var Forecast = require('forecast');
var passwordHash = require('password-hash');
var geocoder = require('geocoder');
var cities = require('smart-city-finder');
var geoTz= require('geo-tz');
var config = require("../config/config.js");



//Global Variables
var database = firebase.database();
var apiKey = process.env.googleDirectionsApiKey;
var sendData = {};

// Initialize new forecast object to call weather info
var forecast = new Forecast({
    service: 'darksky',
    key: process.env.darkSkyApiKey,
    units: 'fahrenheit',
    cache: true,      // Cache API requests 
    ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
      minutes: 27,
      seconds: 45
    }
});

// As httpOnly cookies are to be used, do not persist any state client side.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      console.log("Test " + JSON.stringify(email))
    } else {
      // User is signed out.
      // ...
    }
  });



//   firebase.initializeApp(config)

var admin = require("firebase-admin");

var serviceAccount = require("../config/geovane-820cc-firebase-adminsdk-pdyq3-ef6655f64e");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://geovane-820cc.firebaseio.com"
});


module.exports = function(app) {

    app.post("/authenticate", function(req, res) {
        console.log(req.body.accessToken)
        firebase.auth().signInWithCustomToken(req.body.accessToken).then(function(user) {
            res.send(user)
        }).catch(function(error) {
            console.log(error)
        })
    })

    app.post("/signup", function(req, res) {
        console.log('this is the data' + JSON.stringify(req.body))
        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(user) {
            //console.log(user)
            user.sendEmailVerification().then(function() {
                // Email sent.
              }).catch(function(error) {
                // An error happened.
              });
              console.log(user)
            res.send(user)
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error)
        })
    })

    app.post("/logout", function(req, res) {
        console.log("test for logout")
        firebase.auth().signOut().then(function() {
            res.send("logged out")
          }, function(error) {
            console.log(error)
          });
    })

    app.post("/login", function(req, res) {
        console.log(req.body)
        let data = {}
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(user) {
            var userCheck = firebase.auth().currentUser
            if (userCheck.emailVerified === true) {
                let data = {}
                  admin.auth().createCustomToken(user.uid).then(function(customToken) {
                    data.login = true
                    data.customToken = customToken
                      res.send(data)
                  })
            } else {
                firebase.auth().signOut().then(function() {
                    data.message = "Please verify your email in order to login."
                    data.login = false
                    res.send(data)
                })
            }
        }).catch(function(error) {
            data = {}
            // Handle Errors here.
            console.log(error)
            var errorCode = error.code;
            var errorMessage = error.message;
            data.success = 0
            console.log(errorMessage)
            if (errorMessage === "There is no user record corresponding to this identifier. The user may have been deleted."){
                data.message = "No user with that login email"
                data.login = false
                res.send(data)
                }
            else if (errorMessage === "The email address is badly formatted.") {
                    data.message = "Please enter a valid email" 
                    data.login = false
                    res.send(data)
            } 
            else if (errorMessage === "The password is invalid or the user does not have a password.") {
                data.message = "Password is invalid"
                data.login = false
                res.send(data)
            }
            else {
                data.success = 1
                console.log(errorMessage)
                data.message = 'logged in'
                data.login = true
                res.send(data)
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

//Querying google Directions API to grab route data
function googleDirections(data, res) {
    console.log('google directions data: ' + JSON.stringify(data))
    googleMapsClient.createClient({
        key: apiKey
    }).directions({
        origin: data.startCity,
        destination: data.endCity
    }, function(err, response) {

        //Storing main trip data as placeholder for easier use later
        var trip = response.json.routes[0].legs[0]
        // console.log(trip)
        console.log(response.json.routes[0].legs[0].steps[0])
        console.log(response.json.routes[0].legs[0].steps.length)
        sendData.directions = trip.steps
        // console.log("This is a test" + sendData.directions)
        
        //Storing total triptime for use later with weather calls in order to time delay weather information
        sendData.tripTime = Math.round(response.json.routes[0].legs[0].duration.value /60 /60)
        sendData.tripTimeMinutes = Math.round(response.json.routes[0].legs[0].duration.value /60)

        //Calling weather after response from directions API.  Passing it trip data and our res object along with our send data object
        weatherCall(trip, sendData, res)
    })
}


//Function for start and end city weather data
function weatherCall(trip, sendData, res) {
     //Weather call for Start City
     forecast.get([trip.start_location.lat, trip.start_location.lng], function(err, weather) {
        //  console.log(weather)

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
    
    // 
    var j = 0
    var tripTime = 0

    //Looping through each step to determine if step is worth grabbing weather data for
    for(var i = 0; i < trip.steps.length; i += 1) {

        //Adding current steps time to variable storing combined trip duration
        tripTime = tripTime + trip.steps[i].duration.value

        //Checking step distance against predetermined distance metric
        if (trip.steps[i].distance.value > distance) {

            //Checking to see if step is too close to end destination
            if(sendData.tripTimeMinutes - (tripTime/60) > 40) {
                sendData.allSteps[j] = {
                    stepDistanceMeter: trip.steps[i].distance.value,
                    stepDistanceMiles: trip.steps[i].distance.text,
                    stepLat: trip.steps[i].end_location.lat,
                    stepLng: trip.steps[i].end_location.lng,
                    time: tripTime,
                    stepTimeZone: geoTz.tz(trip.steps[i].end_location.lat,trip.steps[i].end_location.lng)
                }
            }
            // Increment j + 1
            j += 1
            // console.log("This is greater than " + distance + " meters: " + trip.steps[i].distance.value)
        } else {
            // console.log("This is not greater: " + trip.steps[i].distance.value)
        }
    }
}


function weatherLoopQuery(sendData, res) {
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