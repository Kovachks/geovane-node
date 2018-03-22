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

function initMap(data) {
    var markerObject = {}
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
}


$(document).ready(function() {

})


        // document.getElementById('submit').addEventListener('click', function() {
        //   calculateAndDisplayRoute(directionsService, directionsDisplay);
        // });
