$(document).on("click", "#search", function() {

    let startCity = $("#startCity").val()
    let startState = $("#startState").val()
    let endCity = $("#endCity").val()
    let endState = $("#endState").val()
    let user = window.localStorage.getItem("user")
    $("#searchDiv").hide()
    $("#newTrip").show()
    $("#resultsContainer").show()

    var searchData = {
        startCity: startCity,
        startState: startState,
        endCity: endCity,
        endState: endState,
        user: user
    } 
    document.getElementById("startCity").value = ""
    document.getElementById("startState").value = ""
    document.getElementById("endCity").value = ""
    document.getElementById("endState").value = ""

    console.log(searchData)
    $.ajax({
        method: "POST",
        url: "/search",
        data: searchData
    }).then(function(data) {
        console.log("THIS IS THE DATA " + JSON.stringify(data))
        var tripdata = $()
        initMap(data)
        var tableData = $("#tr")
        $("#tripDistance").html('<table id="resultsTable"><tbody id="resultsTableBody"><tr><th>Step</th><th>Icon</th><th>Location</th><th>Temperature</th><th>Time(Minutes)</th></tr><tr><td>Start</td><td><img src="./images/' +
         data.startWeather + '.png"></td><td>' + data.startCity + '</td><td>' + Math.round(data.startTemperature) + '</td><td>0</td></tr>')
        
        for (var i = 0; i < data.allSteps.length; i += 1) {
            var counter = i + 1
            $("#tripDistance table").append('<tr><td>' + counter + '</td><td><img src="./images/' + data.allSteps[i].currentWeather +
             '.png"></td><td>' + data.allSteps[i].cityInfo.city + ", " + data.allSteps[i].cityInfo.state_abbr + '</td><td>' +
              Math.round(data.allSteps[i].currentTemp) + '</td><td>' + data.allSteps[i].time + '</td></tr>')
        }
        
        $("#tripDistance table").append('<tr>' + '<td>End</td><td><img src="./images/' + data.endWeather + '.png"></td><td>' + data.endCity +
         '</td><td>' + Math.round(data.endTemperature) + '</td><td>' + data.tripTimeMinutes + '</td></tr></tbody></table>')
    })
})

$(document).on("click", "#newTrip", function() {
    $("#searchDiv").show()
    $("#resultsContainer").hide()
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



