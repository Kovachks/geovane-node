document.getElementById('aboutButton').addEventListener('click', function() {
   
    // Creating container for modal content
    let modalContentSignup = "<div class='modal-header'><h4 class='modalTitle'>About WeatherNav</h4><button type='button' class='close'" +
    "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
    "<div class='modal-body'>" + 
    "<p>WeatherNav plots weather related data on a requested driving route.  First, it finds the optimal route for your trip.  Then, along your route WeatherNav will gather a set of locations which will then be plotted on the map.  Weather data is then collected for these locations.  This weather data is time delayed for when a user would normally be driving through the area as to best predict the weather on the trip.</p>" + 
    "<p>WeatherNav was built with long distance travelers in mind.  The goal is to keep drivers up to date on any possible weather scenario in order for them to better be prepared and stay safe on their long journeys.</p>" +
    "<p>Thank you for using my site for your travel needs.</p>"
    "</div><div class='modal-footer'><button type='button' class='btn btn-sm btn-outline-secondary' id='cancel' data-dismiss='modal'>Close</button></div>"
    
    // Initializing new modal
    let modalInitJS = new Modal(myModal, {
        content: modalContentSignup,
        backdrop: 'static'
    })

    // Showing initialized Modal
    modalInitJS.show()

}, false)


window.onload = function() {

    document.getElementById('getLocation').addEventListener('click', function() {

        var startPos;
        var geoSuccess = function(position) {
          startPos = position;
          document.getElementById('startLat').innerHTML = startPos.coords.latitude;
          document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        };
        var geoError = function(error) {
          console.log('Error occurred. Error code: ' + error.code);
          // error.code can be:
          //   0: unknown error
          //   1: permission denied
          //   2: position unavailable (error response from location provider)
          //   3: timed out
        };
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    })

  };