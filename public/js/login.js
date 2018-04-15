if (localStorage.getItem("uid=")) {

    var data = {
        uid: localStorage.getItem("uid=")
    }
    console.log("this is a test fire for local storages")
    $.ajax({
        method: "POST",
        url: "/authenticate",
        data: localStorage.getItem("uid=")
    })
    .then(function(data) {
        if (data.email) {
            $("#signedIn").show().text("Signed in as " + data.email)
            $("#loginDiv").hide()
            $("#signupButton").hide()
            $("#logout").show()
            localStorage.setItem('uid=', data.uid)
        }
        //Invalid responding with the data provided from the server which is an alert.  Switch to modal in future
        else {
            alert(data)
        }
    })
}

//Displaying input fields for signing up
$(document).on('click', "#signupButton", function() {
    $("#loginButton").show()
    $("#loginDiv").hide()
    $("#signupDiv").show()
    $("#signupButton").hide()
    $("#searchDiv").hide()
    $("#newTrip").show()
})

//Displaying input fields for loging in
$(document).on('click', "#loginButton", function() {
    $("#signupButton").show()
    $("#signupDiv").hide()
    $("#loginDiv").show()
    $("#loginButton").hide()
    $("#searchDiv").hide()
    $("#newTrip").show()
})

//Ajax call in order for a user to signup.  Passing user email and password.  User will get an email for email authentication
$(document).on("click", "#signup", function() {

    //Grabbing input values and building out our data object
    let email = $("#username").val()
    let password = $("#password").val()
    let data = {
        email: email,
        password: password
    }

    //Post ajax route for our signup
    $.ajax({
        method: "POST",
        url: "/signup",
        data: data
    })
    //promise from server that returns our login info is successful
    .then(function(data) {
        console.log(data)
       if (data.email) {

            //Change this alert to modal in future on successful login
           alert("Please check your email for a verification link")
       } else {

            //Change this alert to modal in future on unsuccessful login
            alert("Signup failed")
       }
    })
})

//Logout click handler
$(document).on("click", "#logout", function() {
    
    //AJAX post route for logout
    $.ajax({
        method: "POST",
        url: "/logout"
    })
    
    //promise from server for logout.  Hiding and showing data after.
    .then(function(data) {
        $("#logout").hide()
        $("#loginButton").show()
        $("#signupButton").show()
        $("#signedIn").hide().text()
    })
})

//Click handler for login attempt
$(document).on("click", "#login", function() {

    //Building out our data object with input values from user.
    let email = $("#loginUsername").val()
    let password = $("#loginPassword").val()
    let data = {
        email: email,
        password: password
    }
    console.log(data)

    //AJAX post request for login.  Passing data object built above.
    $.ajax({
        method: "POST",
        url: "/login",
        data: data
    })
    
    //Promise from server for login function.
    .then(function(data) {
        console.log(data)

        //Validating if there was a successful email login.  If yes then display users email
        if (data.email) {
            $("#signedIn").show().text("Signed in as " + data.email)
            $("#loginDiv").hide()
            $("#signupButton").hide()
            $("#logout").show()
            localStorage.setItem('uid=', data.uid)
        }
        //Invalid responding with the data provided from the server which is an alert.  Switch to modal in future
        else {
            alert(data)
        }
    })
})
