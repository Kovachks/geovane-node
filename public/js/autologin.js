const sessionLogin = () => {
   
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
                $("#signedIn").show()
                $("#signedIn").html("<div class='dropdown'><button class='btn btn-sm btn-outline-secondary' dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                + data.email + "</button><div class='dropdown-menu' aria-labelledy='dropdownMenuButton'><a class='dropdown-item' href='#'>Account</a><a class='dropdown-item' href='#'>Recent Searches</a><a class='dropdown-item' id='logout' href='#'>Logout</a></div></div>")
            }
        })
    }

}

sessionLogin()

export function sessionLogin()