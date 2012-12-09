//var jsdom 	= require('jsdom');
var waste 	= require('./misc');
var express = require('express');
var items = [];
// get the page
waste.getItems( function( data ) {
	items = data;
});

var app = module.exports = express();
// this enables jsonp support
app.enable("jsonp callback");

app.get('/items', function(req, res){ 
  // important - you have to use the response.json method
  
  var newItems = items.filter( function( item ) {
  	return item.name.toLowerCase().indexOf( req.query.q.toLowerCase() ) > -1;
  });

  res.jsonp( newItems );
});

app.listen(3000);