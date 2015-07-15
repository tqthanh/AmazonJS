const request = require('request');
const cheerio = require('cheerio');
const	async = require('async');


var appUrl = '';


//get general information and comments 
function getAppData(appUrl,callback) {
	console.log('getting data from: ' + appUrl);
	var commentUrl = null;
	var comments = [];

	async.parallel([
		function (innerCallback) {

		},
		function (innerCallback) {

		}],

	
	)


}

function getAppGeneralInfo (appUrl,callback) {
	console.log('getting general data from: ' + appUrl);
	request(appUrl,function (err,res,html) {
		var $ = cheerio.load(html);
		var data = {
			url: appUrl,
			name: null,
			developer: null,
			rated: null,			
			price: null,
			appImages: [],
			specialOffer: null,
			update: null,
			ASIN: null,
			releaseDate: null,
			avgStar: null,
			features: [],
			description: null,
			size: null,
			version: null,
			permissions: null,
			osRequire: null,
		}
		//get name
		data.name = $('#btAsinTitle').text();

		//get developer
		data.developer = $('//*[@id="divsinglecolumnminwidth"]/div[5]/span/a').text();
	})
}

//traverse through the comment pages and get comments then return a list of comments 
function getAppComments(baseCommentUrl,callback) {
	request(baseCommentUrl, function (err,res,html){
		var $ = cheerio.load(html);
		
		}
	})

}

//scan for a single comment page and get all comments
function getAllCommentsInAPage(commentUrl,callback) {
	request(commentUrl, function (err,res,html) {
		var $ = cheerio.load(html);
		var 
	})

}