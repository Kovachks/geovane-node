if (sessionStorage.getItem('accessToken=')) {

    //Hide login/signup elements if token found
    // document.getElementById('loginDiv').style.visibility = 'hidden'
    document.getElementById('loginButton').style.visibility = 'hidden'
    document.getElementById('signupButton').style.visibility = 'hidden'

    // Begin authentication
    let authenticateRequest = new XMLHttpRequest();

    // Open AJAX
    authenticateRequest.open('POST', 'authenticate')

    // Set Header
    authenticateRequest.setRequestHeader('Content-Type', 'application/JSON');
    
    // On return from server
    authenticateRequest.onload = function() {

        // If successful AJAX request set signed in elements
        if (authenticateRequest.status = 200) {

            // Set data object
            let authenticateData = JSON.parse(authenticateRequest.response)
            
            // If email is detected run below code
            if (authenticateData.email) {

                // Add authenticated email to dropdown button
                document.getElementById('signedIn').textContent += 'Signed in as ' + authenticateData.email;

                // Show button
                document.getElementById('signedIn').style.display = 'inline';
                
                // Add drop down options
                document.getElementById('signedIn').innerHTML = "<div class='dropdown'><button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                + authenticateData.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href=''>Account</a><a class='dropdown-item' href=''>Recent Searches</a><a class='dropdown-item' id='logout' onclick='logout()' href=''>Logout</a></div></div>";
          
            }    
        }

        // Grabbing dropdown menu element created above
        let myDropdown = document.getElementById('dropdownMenuButton')
        
        // Initiate dropdown functionality for bootstrap dropdown menu
        let myDropdownInit = new Dropdown (myDropdown);
    }

    // Send access token data to Firebase for validation
    authenticateRequest.send(JSON.stringify({
        accessToken: sessionStorage.getItem("accessToken=")
    }))
}