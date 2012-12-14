var http 	= require('http');
var cheerio = require('cheerio');
var async 	= require('async');
var qs 		= require('qs');
var needle	= require('needle');

module.exports = {
	getHTML: function( url, callback ) {
		return getHTML( url, callback );
	},
	getDirectoryURLs: function( callback ) {
		return getDirectoryURLs( callback );
	},
	getItems: function( callback ) {

		var allItems = [];
		getDirectoryURLs( function( links ) {

			async.forEach( links, function( url, callback ) {

				getItemsForURL( url, function( items ) {

					allItems = allItems.concat( items );
					callback();
				});

			}, function() {
				callback( allItems );
			} );

		} );

	},
	addItem: function( item, callback ) {
		
		var data = { form: { item: 'Plastic Coat Hanger', Submit: 'Submit', formId: '28' } };
		//var options = {};

		needle.post('http://www.derbyshiredales.gov.uk/a-z-guide-on-waste-new-item', data, function(err, resp, body){
  			// you can pass params as a string or as an object
  			
  			var options = { headers: { Cookie: resp.headers['set-cookie'][0].split(';')[0] } };

  			needle.post('http://www.derbyshiredales.gov.uk/a-z-guide-on-waste-new-item', data, options, function(err, resp, body){

				if ( body.match( 'Thank you, your submission has been recorded') )
					callback( 'success' );
				else
					callback( 'error' );
			} );
		});

	}
}

var getHTML = function( url, callback ) {
	http.get( url, function( res ) {
		var content = '';

		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			callback( content );
		});
	});
} 

var getDirectoryURLs = function( callback ) {

	var links = [];

	getHTML( 'http://www.derbyshiredales.gov.uk/environment-and-waste/waste-a-recycling/a-to-z-of-waste', function( data ) {
		var $ = cheerio.load( data );
		$( 'a' ).filter( function() {
			return this.text().trim() != '' && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf( this.text().trim() ) > -1;
		}).each( function( key ) {
			links.push( 'http://www.derbyshiredales.gov.uk' + this.attr( 'href' ) );
		});

		callback( links );
	} );
}

var getItemsForURL = function( url, callback ) {

	var items = [];

	getHTML( url, function( data ) {
		var $ = cheerio.load( data );
		$( '#1 tbody tr' ).each( function() {
			var item = {}

			item.name = this.find( 'td').first().text();
			item.container = this.find( 'td').last().text();
			items.push( item );
		});

		callback( items );
	} );
}