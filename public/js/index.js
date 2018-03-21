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
        $("#tripDistance").html("The current temperature of " + data.startCity + " is: " + data.startTemperature + "F<br>"
         + "The current temperature of " + data.endCity + " is: " + data.endTemperature + 'F')
    })
})