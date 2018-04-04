var path = require("path");

var express = require("express");

module.exports = function(app) {
	app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname,"../public/html/home.html"));    
	});
}