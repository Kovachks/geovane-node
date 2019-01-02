document.getElementById('signupButton').addEventListener('click', function() {
    document.getElementById('modal-content').innerHTML = "<div class='modal-header'><h4 class='modalTitle'>Singup</h4><button type='button' class='close'" +
    "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
    "<div class='modal-body'><h5>Email</h5>" + 
    "<input placeholder='Email' type='text' id='email'><h5>Password</h5><input placeholder='Password' type='password' id='password'>" + 
    "</div><div class='modal-footer'><button type='button' class='btn btn-sm btn-outline-secondary'  id='signup' onclick='signup()'>Submit</button><button type='button' class='btn btn-sm btn-outline-secondary' id='cancel'>Cancel</button></div>"
})

document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('modal-content').innerHTML = "<div class='modal-header'><h4 class='modalTitle'>Login</h4><button type='button' class='close'" +
    "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
    "<div class='modal-body'><h5>Email</h5><input placeholder='Email' type='text' id='loginEmail'><h5>Password</h5><input placeholder='Password'" + 
    "type='password' id='loginPassword'></div><div class='modal-footer'><div id='incorrect'>Password Incorrect</div><button type='button' class='btn btn-sm btn-outline-secondary' id='login' onclick=login()>Login</button><button type='button' class='btn btn-sm btn-outline-secondary' id='cancel'>Cancel</button></div>"
})

const signup = () => {
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    let data = [{
        email: email,
        password: password
    }]

    let request = new XMLHttpRequest();

    request.open('POST', '/signup')
    request.setRequestHeader('Content-Type', 'application/JSON');
    request.onload = function() {
        if (request.status = 200) {
            let data = JSON.parse(request.responseText)
            if (data.email) {
                document.getElementById('modal-content').innerHTML = '';
                document.getElementById('modal-content').innerHTML = "<div class='modal-header'><h3 class='modalTitle'>Signup Successful</h3><button type='button' class='close'" +
                           "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
                           "<div class='modal-footer'><p>Account creation successful! Please check your email for a verification link to complete the authentication process.</p><button id='cancel'>Close</button></div>"
            }
            else {
                alert("Signup failed")
            }
        }
    }

    request.send(JSON.stringify({
        email: email,
        password: password
    }))

}

const login = () => {
    let email = document.getElementById('loginEmail').value
    let password = document.getElementById('loginPassword').value

    let request = new XMLHttpRequest();

    request.open('POST', '/login')
    request.setRequestHeader('Content-Type', 'application/JSON');
    request.onload = function() {
        if (request.status = 200) {
            let data = JSON.parse(request.response)
            if (data.login === false) {
                document.getElementById('incorrect').style.display = 'inline'
            }
            else if (data.login === true){
                
                document.getElementById('loginDiv').style.visibility = 'hidden'
                document.getElementById('loginButton').style.visibility = 'hidden'
                document.getElementById('signupButton').style.visibility = 'hidden'
                // document.getElementById('logout').style.display = 'inline'
                $('#startModal').modal('hide')

                sessionStorage.setItem('accessToken=', data.customToken)
                
                // Begin authentication
                let authenticateRequest = new XMLHttpRequest();

                authenticateRequest.open('POST', 'authenticate')
                authenticateRequest.setRequestHeader('Content-Type', 'application/JSON');
                authenticateRequest.onload = function() {
                    if (authenticateRequest.status = 200) {
                        let authenticateData = JSON.parse(authenticateRequest.response)
                        console.log(authenticateData)
                        if (authenticateData.email) {
                            $("#signedIn").show().text("Signed in as " + authenticateData.email)
                            $("#signedIn").show();
                            $("#signedIn").html("<div class='dropdown'><button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                               + authenticateData.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href='#'>Account</a><a class='dropdown-item' href='#'>Recent Searches</a><a class='dropdown-item' id='logout' href='#'>Logout</a></div></div>")
                        }    
                    }
                        
                }

                authenticateRequest.send(JSON.stringify({
                    accessToken: sessionStorage.getItem("accessToken=")
                }))


            }
        }
    }
    request.send(JSON.stringify({
        email: email,
        password: password
    }))
}


//Click handler for login attempt
// $(document).on("click", "#login", function() {

//     //Building out our data object with input values from user.
//     let email = $("#loginEmail").val()
//     let password = $("#loginPassword").val()
//     let data = {
//         email: email,
//         password: password
//     }

//     //AJAX post request for login.  Passing data object built above.
//     $.ajax({
//         method: "POST",
//         url: "/login",
//         data: data
//     })
    
//     //Promise from server for login function.
//     .then(function(data) {
//         console.log(data)

//         //Validating if there was a successful email login.  If yes then display users email
//         if (data.success === 0) {
           
//             $(".incorrect").css({'display': 'inline'})
            
//         }
//         //Invalid responding with the data provided from the server which is an alert.  Switch to modal in future
//         else {
//             $(".incorrect").css({'display': 'hidden'})
//             $("#loginDiv").hide()
//             $("#loginButton").hide()
//             $("#signupButton").hide()
//             $("#logout").show()

//             sessionStorage.setItem('accessToken=', data)

//             $("#startModal").modal('hide')
//                 var data = {
//                     // uid: sessionStorage.getItem("uid="),
//                     accessToken: sessionStorage.getItem("accessToken="),
//                     // apiKey: sessionStorage.getItem("apiKey="),
//                     // refreshToken: sessionStorage.getItem("refreshToken=")
//                 }
//                 $.ajax({
//                     method: "POST",
//                     url: "/authenticate",
//                     data: data
//                 })
//                 .then(function(data) {
//                     if (data.email) {
// //                        $("#signedIn").show().text("Signed in as " + data.email)
//                           $("#signedIn").show();
//                           $("#signedIn").html("<div class='dropdown'><button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
//                           + data.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href='#'>Account</a><a class='dropdown-item' href='#'>Recent Searches</a><a class='dropdown-item' id='logout' href='#'>Logout</a></div></div>")
//                     }
//                 })
//         }
//     })
// })


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