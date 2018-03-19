




$(document).on("click", "#search", function() {
    
    let startCity = $("#startCity").val()
    let startState = $("#startState").val()
    let endCity = $("#endCity").val()
    let endState = $("#endState").val()
    
    $.ajax({
        method: "PUT",
        url: "/search"
    }).then(function(data) {
        console.log(test)
    })
})