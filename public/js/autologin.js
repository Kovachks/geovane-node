if (sessionStorage.getItem('accessToken=')) {

    //Hide login/signup elements if token found
    // document.getElementById('loginDiv').style.visibility = 'hidden'
    document.getElementById('loginButton').style.visibility = 'hidden'
    document.getElementById('signupButton').style.visibility = 'hidden'

    // Begin authentication
    let authenticateRequest = new XMLHttpRequest();

    // Open AJAX
    authenticateRequest.open('POST', 'authenticate')
    authenticateRequest.setRequestHeader('Content-Type', 'application/JSON');
    authenticateRequest.onload = function() {

        // If successful AJAX request set signed in elements
        if (authenticateRequest.status = 200) {
            let authenticateData = JSON.parse(authenticateRequest.response)
            if (authenticateData.email) {
                $("#signedIn").show().text("Signed in as " + authenticateData.email)
                $("#signedIn").show();
                $("#signedIn").html("<div class='dropdown'><button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                    + authenticateData.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href='#'>Account</a><a class='dropdown-item' href='#'>Recent Searches</a><a class='dropdown-item' id='logout' onclick='logout()'>Logout</a></div></div>")
            }    
        }
            
    }

    // Send access token data to Firebase for validation
    authenticateRequest.send(JSON.stringify({
        accessToken: sessionStorage.getItem("accessToken=")
    }))



}