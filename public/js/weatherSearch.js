$(document).on("click", "#search", function() {

    let startCity = $("#startCity").val()
    let startState = $("#startState").val()
    let endCity = $("#endCity").val()
    let endState = $("#endState").val()
    let user = window.localStorage.getItem("user")

    var searchData = {
        startCity: startCity,
        startState: startState,
        endCity: endCity,
        endState: endState,
        user: user
    } 
    console.log(searchData)
    $.ajax({
        method: "POST",
        url: "/search",
        data: searchData
    }).then(function(data) {
        console.log("THIS IS THE DATA " + JSON.stringify(data))
        var tripdata = $()
        initMap(data)
        $("#tripDistance").html("The current temperature of " + data.startCity + " is: " + data.startTemperature + "F and the current weather is: "+ data.startWeather + "<br>"
         + "The current temperature of " + data.endCity + " is: " + data.endTemperature + 'F and the current weather is: ' + data.endWeather)
         var stepData = $("<div>")
         for (var i = 0; i < data.allSteps.length; i += 1) {
             var k = i + 1
             $("#tripDistance").append("<br>Step " + k + " Current Temp: " + data.allSteps[i].currentTemp + "current weather: " + data.allSteps[i].currentWeather)
             }

    })
})

function initMap(data) {
    var markerObject = []
    for (let i = 0; i < data.allSteps.length; i += 1) {
        markerObject[i] = {
            lat: data.allSteps[i].stepLat,
            lng: data.allSteps[i].stepLng,
            weather: data.allSteps[i].currentWeather
        }
    }
    console.log(markerObject)
    var uluru = {lat: -25.363, lng: 131.044};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: data.startGps
    });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        suppressMarkers: true
    });
    var marker = new google.maps.Marker({
      position: data.startGps,
      map: map,
      icon: "./images/" + data.startWeather + ".png"
    });
    marker = new google.maps.Marker({
        position: data.endGps,
        map: map,
        icon: "./images/" + data.endWeather + ".png"
    })
    // displayMarkers(markerObject)
    for (var i = 0; i < markerObject.length; i += 1) {
        marker = new google.maps.Marker({
            position: {lat: markerObject[i].lat, lng: markerObject[i].lng},
            map:map,
            icon: "./images/" + markerObject[i].weather + ".png"
        })
    }
    displayRoute(data.startCity, data.endCity, directionsService,
    directionsDisplay, markerObject);
}


function displayRoute(origin, destination, service, display, markerObject) {
   
   //Creating up to 5 midpoints in order to increase chances of google directions matching the map directions route
    var midStop1 = parseInt(markerObject.length / 5);
    var midStop2 = parseInt(markerObject.length * 2 / 5);
    var midStop3 = parseInt(markerObject.length * 3 / 5);
    var midStop4 = parseInt(markerObject.length * 4 / 5);
    var lateStop = parseInt(markerObject.length - 1); 

    //Setting the directions route and also adding in the waypoints defined above.
    service.route({
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING',
      avoidTolls: true,
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



