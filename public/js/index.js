$(document).on("click", "#search", function() {

    let startCity = $("#startCity").val()
    let startState = $("#startState").val()
    let endCity = $("#endCity").val()
    let endState = $("#endState").val()

    var searchData = {
        startCity: startCity,
        startState: startState,
        endCity: endCity,
        endState: endState
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
        $("#tripDistance").html("The current temperature of " + data.startCity + " is: " + data.startTemperature + "F<br>"
         + "The current temperature of " + data.endCity + " is: " + data.endTemperature + 'F')
         var stepData = $("<div>")
         for (var i = 0; i < data.allSteps.length; i += 1) {
             var k = i + 1
             $("#tripDistance").append("<br>Step: " + k + " Current Temp: " + data.allSteps[i].currentTemp)
             }

    })
})

function createMarker(latlng) {
    console.log("test")
    var marker = new google.maps.Marker({
        position: latlng,
        setMap: map
    })
}

function displayMarkers(markerObject) {
    console.log("this is the markerObject: " + JSON.stringify(markerObject))
    for (var i = 0; i < markerObject.length; i += 1) {
        console.log("This is a test")
        var latlng = new google.maps.LatLng(markerObject[i].lat, markerObject[i].lng)
        createMarker(latlng)
    }
}

function initMap(data) {
    var markerObject = []
    for (let i = 0; i < data.allSteps.length; i += 1) {
        markerObject[i] = {
            lat: data.allSteps[i].stepLat,
            lng: data.allSteps[i].stepLng
        }
    }
    console.log(markerObject)
    var uluru = {lat: -25.363, lng: 131.044};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: data.startGps
    });
    var marker = new google.maps.Marker({
      position: data.startGps,
      map: map
    });
    marker = new google.maps.Marker({
        position: data.endGps,
        map: map
    })
    // displayMarkers(markerObject)
    for (var i = 0; i < markerObject.length; i += 1) {
        marker = new google.maps.Marker({
            position: {lat: markerObject[i].lat, lng: markerObject[i].lng},
            map:map
        })
    }
}


$(document).ready(function() {

})


        // document.getElementById('submit').addEventListener('click', function() {
        //   calculateAndDisplayRoute(directionsService, directionsDisplay);
        // });
