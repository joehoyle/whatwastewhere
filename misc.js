var http 	= require('http');
var cheerio = require('cheerio');
var async 	= require('async');

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