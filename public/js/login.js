let myModal = document.getElementById('modalID')

// Adding event listener to start the signup process
document.getElementById('signupButton').addEventListener('click', function(e) {

    // Creating container for modal content
    let modalContentSignup = "<div class='modal-header'><p class='modalTitle'>Singup</p><button type='button' class='close'" +
    "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
    "<div class='modal-body'><p class='signupHeader'>Email</p>" + 
    "<input placeholder='Email' type='text' id='email'><p class='signupHeader'>Password</p><input placeholder='Password' type='password' id='password'>" + 
    "</div><div class='modal-footer'><button type='button' class='btn btn-sm btn-outline-secondary'  id='signup' onclick='signup()'>Submit</button><button type='button' class='btn btn-sm btn-outline-secondary' id='cancel' data-dismiss='modal'>Cancel</button></div>"
    
    // Initializing new modal
    let modalInitJS = new Modal(myModal, {
        content: modalContentSignup,
        backdrop: 'static'
    })

    // Showing initialized Modal
    modalInitJS.show()

}, false)

// Adding event listener to start login process
document.getElementById('loginButton').addEventListener('click', function() {

    // Setting content for modal
    let modalContentSignup = "<div class='modal-header'><p class='modalTitle'>Login</p><button type='button' class='close'" +
    "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
    "<div class='modal-body'><div class='input-group mb-3'><div class='input-group-prepend'><span class='input-group-text' id='inputGroup-sizing-default'>Email</span></div> <input type='text' class='form-control' aria-label='Default' aria-describedby='inputGroup-sizing-default' id='loginEmail'></div>" +
    "<div class='input-group mb-3'><div class='input-group-prepend'><span class='input-group-text' id='inputGroup-sizing-default'>Password</span></div> <input type='password' class='form-control' aria-label='Default' aria-describedby='inputGroup-sizing-default' id='loginPassword'></div><div class='modal-footer'><div id='incorrect'>Password Incorrect</div><button type='button' class='btn btn-sm btn-outline-secondary' id='login' onclick=login()>Login</button><button type='button' class='btn btn-sm btn-outline-secondary' id='cancel' data-dismiss='modal'>Cancel</button></div>"
    
    // Initializing modal using modal content
    let modalInitJS = new Modal(myModal, {
        content: modalContentSignup,
        backdrop: 'static'
    })

    // Showing initialized modal
    modalInitJS.show()

})

// Signup function for dynamically generated signup button located in modal
const signup = () => {

    // Setting relevant data needed for login
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    // Creating new XMLHttpRequest
    let request = new XMLHttpRequest();

    // Opening new post route at /signup
    request.open('POST', '/signup')

    // Setting request header
    request.setRequestHeader('Content-Type', 'application/JSON');

    // On response from server run below function
    request.onload = function() {

        // If successful signup run below
        if (request.status = 200) {

            // Parse out response from server
            let data = JSON.parse(request.responseText)

            console.log(data)

            // If email is detected show message to chec kemail for verification
            if (data.email) {

                let modalContentSuccessfulSignup = "<div class='modal-header'><h3 class='modalTitle'>Signup Successful</h3><button type='button' class='close'" +
                "data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>" + 
                "<div class='modal-footer'><p>Account creation successful! Please check your email for a verification link to complete the authentication process.</p><button id='cancel' data-dismiss='modal'>Close</button></div>"

                let modalInitJS = new Modal (myModal, {
                    content: modalContentSuccessfulSignup,
                    backdrop: 'static'
                })

                modalInitJS.show()

            }
        }           
    }
    // Sending email and password
    request.send(JSON.stringify({
        email: email,
        password: password
    }))


}

// Login function for dynamically generated signin button
const login = () => {

    // Grabbing data relevant to the login
    let email = document.getElementById('loginEmail').value
    let password = document.getElementById('loginPassword').value

    // Creating new XMLHTTPRequest
    let request = new XMLHttpRequest();

    // Opening Post route at login
    request.open('POST', '/login')

    // Setting header
    request.setRequestHeader('Content-Type', 'application/JSON');
    
    // On response run below function
    request.onload = function() {

        // If successful response run below
        if (request.status = 200) {

            // Parsing out response object
            let data = JSON.parse(request.response);

            // If login failed display below text
            if (data.login === false) {
                // console.log(data)
                // Show incorrect login message
                document.getElementById('incorrect').style.display = 'inline';
                document.getElementById('incorrect').innerHTML = data.message;
                
            }

            // If login was successful show correct HTML elements
            else if (data.login === true){

                // Hiding elements no longer relevant after login is successful
                document.getElementById('loginButton').style.visibility = 'hidden';
                document.getElementById('signupButton').style.visibility = 'hidden';

                // Setting authentication token
                sessionStorage.setItem('accessToken=', data.customToken);
                
                // Begin authentication
                let authenticateRequest = new XMLHttpRequest();

                //Open post route at authenticate route
                authenticateRequest.open('POST', 'authenticate');

                //Setting header
                authenticateRequest.setRequestHeader('Content-Type', 'application/JSON');

                //On response from server run below function to set logged in parameters
                authenticateRequest.onload = function() {

                    // If successful login set HTML elements
                    if (authenticateRequest.status = 200) {

                        // Parse out response data
                        let authenticateData = JSON.parse(authenticateRequest.response);

                        if (authenticateData.email) {

                            // Add authenticated email to dropdown button
                            document.getElementById('signedIn').textContent += 'Signed in as ' + authenticateData.email;

                            // Show button
                            document.getElementById('signedIn').style.display = 'inline';
                            
                            // Add drop down options
                            document.getElementById('signedIn').innerHTML = "<div class='dropdown'><button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                            + authenticateData.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href=''>Account</a><a class='dropdown-item' href=''>Recent Searches</a><a class='dropdown-item' id='logout' onclick='logout()' href=''>Logout</a></div></div>";

                        }     

                        // Hiding modal after successful login
                        let myModalInstance = new Modal(myModal)
                        myModalInstance.hide()
                    }

                    // Grabbing dropdown menu element created above
                    let myDropdown = document.getElementById('dropdownMenuButton')
                    
                    // Initiate dropdown functionality for bootstrap dropdown menu
                    let myDropdownInit = new Dropdown (myDropdown);
                }

                // Sending sccessToken if detected
                authenticateRequest.send(JSON.stringify({
                    accessToken: sessionStorage.getItem("accessToken=")
                }))


            }
        }
    }

    // Send email and password to authenticate
    request.send(JSON.stringify({
        email: email,
        password: password
    }))
}


// Logout function
const logout = () => {

   let request = new XMLHttpRequest();

    // Opening Post route at login
    request.open('POST', '/logout')

    // Setting header
    request.setRequestHeader('Content-Type', 'application/JSON');
    
    // On response run below function
    request.onload = function() {

        // If a successful logout is acheived run below code
        if (request.status = 200) {

        // Removing access token if successfully logged out
        sessionStorage.removeItem('accessToken=')

        // Hide and show relevant elements after logout is successful
        document.getElementById('loginButton').style.display = 'inline'
        document.getElementById('loginButton').style.visibility = 'initial'
        document.getElementById('signupButton').style.display = 'inline';
        document.getElementById('signupButton').style.visibility = 'initial';
        document.getElementById('signedIn').style.display = 'none'  

        }

    }

    // Calling post method
    request.send()

}