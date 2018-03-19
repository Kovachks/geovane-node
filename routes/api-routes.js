//Packages
var router = require("express").Router();
var firebase = require("firebase")

//Global Variables
var database = firebase.database()


module.exports = function(app) {
    console.log(app)

    //Fired on submission of primary search
    app.post("/search", function(req, res) {

        //Storing data passed from AJAX
        var data = req.body

        //Setting firebase data with new search paramaters
        database.ref().set({
            data
        })
    })
}
