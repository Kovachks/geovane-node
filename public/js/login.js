$(document).ready(function() {
    $("#signupDiv").hide()
    $("#loginDiv").hide()
    $("#logout").hide()
})

$(document).on('click', "#signupButton", function() {
    $("#loginButton").show()
    $("#loginDiv").hide()
    $("#signupDiv").show()
    $("#signupButton").hide()
})

$(document).on('click', "#loginButton", function() {
    $("#signupButton").show()
    $("#signupDiv").hide()
    $("#loginDiv").show()
    $("#loginButton").hide()
})

$(document).on("click", "#signup", function() {
    let email = $("#username").val()
    let password = $("#password").val()
    let data = {
        email: email,
        password: password
    }
    $.ajax({
        method: "POST",
        url: "/signup",
        data: data
    }).then(function(data) {
        console.log(data)
       if (data.email) {
           alert("Please check your email for a verification link")
       } else {
            alert("Signup failed")
       }
        // $.ajax({
        //     method: "POST",
        //     url: "/signin",
        // })
    })
})

$(document).on("click", "#logout", function() {
    $.ajax({
        method: "POST",
        url: "/logout"
    }).then(function(data) {
        $("#logout").hide()
        $("#loginButton").show()
        $("#signupButton").show()
        $("#signedIn").hide().text()
    })
})

$(document).on("click", "#login", function() {
    let email = $("#loginUsername").val()
    let password = $("#loginPassword").val()
    let data = {
        email: email,
        password: password
    }
    console.log(data)
    $.ajax({
        method: "POST",
        url: "/login",
        data: data
    }).then(function(data) {
        console.log(data)
        if (data.email) {
            $("#signedIn").show().text("Signed in as " + data.email)
            $("#loginDiv").hide()
            $("#signupButton").hide()
            $("#logout").show()
            // window.localStorage.setItem("user", data.uid)
            document.cookie = "uid=" + data.uid
        }
        else {
            alert(data)
        }
    })
})
