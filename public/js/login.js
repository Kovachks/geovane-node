$(document).on("click", "#signupButton", function() {
    $(".modal-content").html(
        "<div class='modal-header'><h4 class='modalTitle'>Singup</h4><button type='button' class='close'" +
            "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
            "<div class='modal-body'><h5>Email</h5>" + 
            "<input placeholder='Email' type='text' id='email'><h5>Password</h5><input placeholder='Password' type='password' id='password'>" + 
            "</div><div class='modal-footer'><button id='signup'>Submit</button><button id='cancel'>Cancel</button></div>"
    )
})

$(document).on("click", "#loginButton", function() {
    $(".modal-content").html(
        "<div class='modal-header'><h4 class='modalTitle'>Login</h4><button type='button' class='close'" +
        "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
        "<div class='modal-body'><h5>Email</h5><input placeholder='Email' type='text' id='loginEmail'><h5>Password</h5><input placeholder='Password'" + 
        "type='password' id='loginPassword'></div><div class='modal-footer'><button id='login'>Signin</button><button id='cancel'>Cancel</button></div>"
    )
})


if (sessionStorage.getItem('accessToken=')) {
    var data = {
        // uid: sessionStorage.getItem("uid="),
        accessToken: sessionStorage.getItem("accessToken="),
        // apiKey: sessionStorage.getItem("apiKey="),
        // refreshToken: sessionStorage.getItem("refreshToken=")
    }
    $.ajax({
        method: "POST",
        url: "/authenticate",
        data: data
    })
    .then(function(data) {
        if (data.email) {
            $("#loginButton").hide()
            $("#signupButton").hide()
            $("#logout").show()
            $("#signedIn").show().text("Signed in as " + data.email)
        }
    })
}

//Ajax call in order for a user to signup.  Passing user email and password.  User will get an email for email authentication
$(document).on("click", "#signup", function() {
    console.log("test")

    //Grabbing input values and building out our data object
    let email = $("#email").val()
    let password = $("#password").val()
    let data = {
        email: email,
        password: password,
        username: username
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
           $("#startModal").modal('toggle')
       } else {
            //Change this alert to modal in future on unsuccessful login
            alert("Signup failed")
       }

    })
})

//Logout click handler
$(document).on("click", "#logout", function() {
    
    sessionStorage.removeItem('accessToken=')

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

$(document).on("click", "#cancel", function() {
    $("#startModal").modal('hide')
})

//Click handler for login attempt
$(document).on("click", "#login", function() {

    //Building out our data object with input values from user.
    let email = $("#loginEmail").val()
    let password = $("#loginPassword").val()
    let data = {
        email: email,
        password: password
    }

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
        if (data) {
            
            $("#loginDiv").hide()
            $("#loginButton").hide()
            $("#signupButton").hide()
            $("#logout").show()
            // localStorage.setItem('uid=', data.uid)
            // sessionStorage.setItem('uid=', data.uid)
            sessionStorage.setItem('accessToken=', data)
            // sessionStorage.setItem('apiKey=', data.stsTokenManager.apiKey)
            // sessionStorage.setItem('refreshToken=', data.stsTokenManager.refreshToken)
            $("#startModal").modal('hide')
                var data = {
                    // uid: sessionStorage.getItem("uid="),
                    accessToken: sessionStorage.getItem("accessToken="),
                    // apiKey: sessionStorage.getItem("apiKey="),
                    // refreshToken: sessionStorage.getItem("refreshToken=")
                }
                $.ajax({
                    method: "POST",
                    url: "/authenticate",
                    data: data
                })
                .then(function(data) {
                    if (data.email) {
                        $("#signedIn").show().text("Signed in as " + data.email)
                    }
                })
            
        }
        //Invalid responding with the data provided from the server which is an alert.  Switch to modal in future
        else {
            alert(data)
        }
    })
})
