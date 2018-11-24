$(document).ready(function() {
    $("#stepToggle").on("click", function() {
        $("#weatherDisplayParent").hide()
        $("#stepDisplayParent").show()
    })

    $("#weatherToggle").on("click", function() {
        console.log("this is a button test")
        $("#stepDisplayParent").hide()
        $("#weatherDisplayParent").show()
    })

    $("#stepDisplayParent").hide()
    $(".tableDisplay").hide()
})

//Click handler for our main Search
$(document).on("click", "#search", function() {

    $("#weatherDisplay table").empty()

    //Grabbing user entered data
    let startCity = $("#startCity").val()
    let endCity = $("#endCity").val()
    let traffic = $("#traffic").is(":checked")
    console.log(traffic)

    //Also grabbing user token if logged in or from Session Storage
    let user = window.localStorage.getItem("user")

    //hiding/showing relavent containers
    // $("#searchDiv").hide()
    // $("#newTrip").show()
    $("#resultsContainer").show()

    //Completing our searchData object to pass to the server
    var searchData = {
        startCity: startCity,
        endCity: endCity,
        user: user,
        options: {
            traffic: traffic
        }
    } 

    console.log(searchData)

    //Ajax call in order to send our searched data to the server
    $.ajax({
        method: "POST",
        url: "/search",
        data: searchData
    }).then(function(data) {
        
        console.log("THIS IS THE DATA " + JSON.stringify(data))
        
        //Calling initmap function for generation of google map
        initMap(data)


        $("#weatherDisplay table").append('<tr><td>Step</td><td>Weather</td><td>Location</td><td>Temp.</td><td>Precip.</td><td>Arrival Time</td></tr><tr>' + '<td>Start</td><td><img src="./images/' + data.startWeather + '.png"></td><td>' + data.startCity +
         '</td><td>' + Math.round(data.startTemperature) + '</td><td>' + Math.round((data.startPrecip * 100)) + '%</td><td>' + moment().tz(data.startTimezone).format('LT') + ' ' + moment().tz(data.startTimezone).zoneAbbr() + '</td></tr></tbody></table>')

        //Looping through the invididual steps and concatinating onto our table completed above to build out and include all data
        for (var i = 0; i < data.allSteps.length; i += 1) {
            var counter = i + 1
            $("#weatherDisplay table").append('<tr><td>' + counter + '</td><td><img src="./images/' + data.allSteps[i].currentWeather +
             '.png"></td><td>' + data.allSteps[i].cityInfo.city + ", " + data.allSteps[i].cityInfo.state_abbr + '</td><td>' +
              Math.round(data.allSteps[i].currentTemp) + '</td><td>' + Math.round((data.allSteps[i].precip * 100)) + '%</td><td>' + moment().tz(data.allSteps[i].stepTimeZone).add(data.allSteps[i].time, 'm').format('LT') + ' ' + moment().tz(data.allSteps[i].stepTimeZone).zoneAbbr() + '</td></tr>')
        }
        
        //Finishing off the table with the end points data
        $("#weatherDisplay table").append('<tr>' + '<td>End</td><td><img src="./images/' + data.endWeather + '.png"></td><td>' + data.endCity +
         '</td><td>' + Math.round(data.endTemperature) + '</td><td>' + Math.round((data.endPrecip * 100)) + '%</td><td>' + moment().tz(data.endTimezone).add(data.tripTimeMinutes, 'm').format('LT') + ' ' + moment().tz(data.endTimezone).zoneAbbr() + '</td></tr></tbody></table>')
    
        
    
    
    })
        
    $(".tableDisplay").show()
})

//Click handler for querying a new trip
$(document).on("click", "#newTrip", function() {
    $("#searchDiv").show()
    $("#newTrip").hide()
    $("#resultsContainer").hide()
    $("#signupDiv").hide()
    $("#loginDiv").hide()
    $("#signupButton").show()
    $("#loginButton").show()
})

//Function for generating google map
function initMap(data) {
    var markerObject = []

    //Looping through all the invidual steps in order to build out our marker object to post markers on the map
    for (let i = 0; i < data.allSteps.length; i += 1) {
        markerObject[i] = {
            lat: data.allSteps[i].stepLat,
            lng: data.allSteps[i].stepLng,
            weather: data.allSteps[i].currentWeather,
            temp: data.allSteps[i].currentTemp
        }
    }
    console.log(markerObject)

    //creating map opject that centers on the start lat/lng
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: data.startGps
    });

    //creating variable for the Google Directions Service
    var directionsService = new google.maps.DirectionsService;

    //Creating variable for the Google Directions Render and passing the map.  Supressing start and end markers that google provides.  we'll provide our own.
    var directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        suppressMarkers: true
    });

    //Creating weather marker for the start of the trip
    var marker = new google.maps.Marker({
      position: data.startGps,
      map: map,
    //   icon: "./images/testMarker1.png"
      icon: "./images/" + data.startWeather + ".png"
    });

    //Creating temperature marker for the start of the trip
    marker = new google.maps.Marker({
        position: data.startGps,
        map: map,
        icon: {
            url: "./images/" + Math.round(data.startTemperature) + ".png",
            anchor: new google.maps.Point(20,0)
        }
    })

    //Creating weather marker for the end of the trip
    marker = new google.maps.Marker({
        position: data.endGps,
        map: map,
        icon: "./images/" + data.endWeather + ".png",
    })

    //Creating temperature marker for the end of the trip
    marker = new google.maps.Marker({
        position: data.endGps,
        map: map,
        icon: {
            url: "./images/" + Math.round(data.endTemperature) + ".png",
            anchor: new google.maps.Point(20,0)
        }
    })

    //If traffic options is checked overlay traffic data from Google Maps (I think this needs to be moved somewhere more logical)
    if (data.options.traffic === "true") {
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
    }
    
    if(markerObject[0]) {
    //Looping through our markerObject to create a new google maps marker with each identified step which qualifies
        for (var i = 0; i < markerObject.length; i += 1) {
            marker = new google.maps.Marker({
                position: {lat: markerObject[i].lat, lng: markerObject[i].lng},
                map:map,
                icon: "./images/" + markerObject[i].weather + ".png"
            })

            let markerTemp = Math.round(markerObject[i].temp)

            marker = new google.maps.Marker({
                position: {lat: markerObject[i].lat, lng: markerObject[i].lng},
                map: map,
                icon: {
                    url: "./images/" + markerTemp + ".png",
                    anchor: new google.maps.Point(20,0)
                }
            })
        }
    }

    //Calling the display route function and passing it required arguments.
    displayRoute(data.startCity, data.endCity, directionsService,
    directionsDisplay, markerObject);
}

//Function for displaying our route on our google map initiated above
function displayRoute(origin, destination, service, display, markerObject) {
   
   //Creating up to 5 midpoints in order to increase likelyhood of google directions matching the map directions route
    var midStop1 = parseInt(markerObject.length / 5);
    var midStop2 = parseInt(markerObject.length * 2 / 5);
    var midStop3 = parseInt(markerObject.length * 3 / 5);
    var midStop4 = parseInt(markerObject.length * 4 / 5);
    var lateStop = parseInt(markerObject.length - 1); 

    //Setting the directions route and also adding in the waypoints defined above.
    
    //Setting waypoints if there are actually 
    if (markerObject[0]) {
        service.route({
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING',
        waypoints: [{
            location: {lat: markerObject[midStop1].lat, lng: markerObject[midStop1].lng},
            stopover: false
        },
        {
            location: {lat: markerObject[midStop2].lat, lng: markerObject[midStop2].lng},
            stopover: false
        },
        {
            location: {lat: markerObject[midStop3].lat, lng: markerObject[midStop3].lng},
            stopover: false
        },
        {
            location: {lat: markerObject[midStop4].lat, lng: markerObject[midStop4].lng},
            stopover: false
        },
        {
            location: {lat: markerObject[lateStop].lat, lng: markerObject[lateStop].lng},
            stopover: false
        }
        ]

        }, function(response, status) {
        if (status === 'OK') {
            display.setDirections(response);
        } else {
            alert('Could not display directions due to: ' + status);
        }
        });
    }
    
    //If marker is object render map without waypoints
    else {
        service.route({
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                display.setDirections(response);
            } else {
                alert('Could not display directions due to: ' + status);
            }
        });
    }
}