const request = require('request');
const cheerio = require('cheerio');
const	async = require('async');
const mongoose = require ('mongoose');

const appUrl3 = 'http://www.amazon.com/Toca-Boca-Kitchen-2/dp/B00ZU33BBC/ref=zg_bs_mobile-apps_68';
const appUrl1 = 'http://www.amazon.com/Nickelodeon-Blaze-Monster-Machines-Fire/dp/B00S1U8M1U/ref=lp_2478846011_1_15?s=mobile-apps&ie=UTF8&qid=1438962859&sr=1-15';
const appUrl2 = 'http://www.amazon.com/gp/product/B008KSGYFO/ref=s9_simh_bw_p405_d3_i3?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-6&pf_rd_r=081YPMFRZQTEHAC93SS6&pf_rd_t=101&pf_rd_p=1616335022&pf_rd_i=2350149011';
const appList = [appUrl1,appUrl2,appUrl3];
//MAIN

//making a connection to the mongoDB
var connection = mongoose.connect('mongodb://localhost:27017/test_db');

//create database schemas
var reviewSchema = new mongoose.Schema({
	rvID: String,
	rvUserName: String,
	rvUserUrl: String,
	rvTitle: String,
	rvRating: String,
	rvDate: String,
	rvDetails: String,
	rvHelpfulCount: String
});

var Review = connection.model('Review',reviewSchema);

var appSchema = new mongoose.Schema({
	ASIN: String,
	name: String,
	url: String,
	developer: String,
	rating: String,
	price: String,
	seller: String,
	thumbnails: Array,
	offers: String,
	update: String,
	releaseDate: String,
	features: String,
	descriptions: String,
	appSize: String,
	appVer: String,
	permissions: String,
	osRequire: String,
	reviews : [Review.schema] 
});

var App = connection.model('AmazonApp',appSchema);

mongoose.connection.on('connected',function() {
	console.log('connected to DB server');
	async.series([
		function (callback){
			//for parsing applist
			console.log('parsing list app');
			callback(null);
		},

		function (callback) {
			var limit = 2;
			async.eachLimit(appList, limit, function (appUrl,callback){
				getAppData (appUrl,function (results) {
					
					var appTemp = new App({
						ASIN: results[0].ASIN,
						name: results[0].name,
						developer: results[0].developer,
						rating: results[0].rating,			
						price: results[0].price,
						seller: results[0].seller,
						appImages: [],
						specialOffer: results[0].specialOffer,
						update: results[0].update,
						releaseDate: results[0].releaseDate,
						features: results[0].features,
						descriptions: results[0].descriptions,
						appSize: results[0].appSize,
						appVer: results[0].appVer,
						permissions: results[0].permissions,
						osRequire: results[0].osRequire
						})

					var cmts = results[1];					
					console.log('\nnumber of comments: ' + cmts.length);
					for (var i = 0; i < cmts.length; i++) {
					 	//console.log("\n---- Cmt# " + (i+1) + " ----")
					 	//printCmt(cmts[i]);
					 	var review = new Review({
					 		rvID: cmts[i].ID,
					 		rvUserName: cmts[i].user,
							rvUserUrl: cmts[i].userUrl,
							rvTitle: cmts[i].cmtTitle,
							rvRating: cmts[i].rating,
							rvDate: cmts[i].date,
							rvDetails: cmts[i].details,
							rvHelpfulCount: cmts[i].helpfulCount
					 	})
					 	appTemp.reviews.push(review);
					 	//console.log('pushed a review into db');
						
					};
					
					appTemp.save(function (err){

						if(err) {
							callback(err,appTemp);
						}
						else {
							console.log('success added');
							//console.log(appTemp);
							callback(err,appTemp);
						}
										
					})
				})
					
			}, function (callback) {
			 	console.log('finished saving to DB');

			 	App.find( {},function (err,docs){
					if(docs.length ==  0 )
					{ 
						console.log('----- not found -----');
						mongoose.connection.close(function (){
						console.log('close connection');
						//callback(null);
					});
					}
					else 
					{
						console.log('----- found -----'+ docs.length);
						console.log(docs);
						mongoose.connection.close(function (){
						console.log('close connection');
						//callback(null);
					});
					}
				});

				// mongoose.connection.close(function (){
				// 	console.log('close connection');
				 	callback(null);
				// });
		 	}
			)
		}
		]
	)
});

//FUNCTION DECLARATIONS
function getAppData (appUrl,callback) {
	async.waterfall([
		function (wtcallback) {
			getCommentPageUrl(appUrl,function (cmtUrl){
				wtcallback(null,cmtUrl);
			})
		},
		function (cmtUrl,callback){
			async.parallel([
				function (paraCallback){
					console.log('\nstart getting app data from: '+ appUrl);
					getAppGeneralInfo(appUrl,function (appGeneralInfo) {
						return paraCallback(null,appGeneralInfo);
					});
				},
				function (paraCallback){
					console.log('\nstart getting cmts from : '+ cmtUrl);
					getAllCmt (cmtUrl, function (err,cmtList){
						//console.log('got ' + cmtList.length + ' cmts');
						return paraCallback(null,cmtList);
					});
				}

				],	function (err,results) {
					return callback(null,results);
				});
		}

	], function (err,results){
		return callback(results);
	});

}


function printCmt(comment){	
	console.log(comment.ID);
	console.log(comment.user);
	console.log(comment.userUrl);
	console.log(comment.cmtTitle);
	console.log(comment.rating);
	console.log(comment.date);
	console.log(comment.details);
	console.log(comment.helpfulCount);
}

function printObject(data) {
	console.log('----App name:----\n' + data.name);
	console.log('----Developer:----\n' + data.developer);
	console.log('----Rating:----\n' + data.rating);
	console.log('----Price:----\n' + data.price);
	console.log('----Seller:----\n' + data.seller);
	console.log('----images:----\n' + data.appImages);
	console.log('----Offer:----\n' + data.specialOffer);
	console.log('----Update:----\n' + data.update);
	console.log('----ASIN releaseDate avgStar:----\n' + data.ASIN + '\n' + data.releaseDate);
	console.log('----features:----\n' + data.features);
	console.log('----descriptions:----\n' + data.descriptions);
	console.log ('----permissions:----\n' +  data.permissions);
	console.log('----App size:----\n' + data.appSize + '\n' + data.appVer);
	console.log('----os req:----\n' + data.osRequire);
}

function getPageAmount(baseCmtUrl,callback) {
	request(baseCmtUrl,function (err,res,html){
		var $ = cheerio.load(html);
		var temp = [];
		$('#cm_cr-pagination_bar li').each(function() {
			var a = $(this).text();
			temp.push(a);
			//console.log(a);
		})
		var pages = temp[temp.length-2];
		callback(pages);
	})
}

function checkUpdate(appUrl,callback){
	request (appUrl,function (err,res,html){
		var $ = cheerio.load(html);
		var update = null;
		update = $('h2:contains("Latest Updates")');
		//console.log(update.text());

		if (update.text() == "Latest Updates") {
			//console.log('update avail');
			callback(true);
		} else {
			//console.log('no update');
			callback(false);
		};
	})
}

function getAllCmtInAPage (cmtUrl,callback) {
	request(cmtUrl,function (err,res,html) {
		var $ = cheerio.load(html);
		var temp = [];
		var cmtList = [];
		//console.time("getcmt");
		//get cmt list
		temp = [];
		$('#cm_cr-review_list .a-section.review').each(function() {
			var a = $(this);
			var comment = {
				ID:null,
				user: null,
				userUrl: null,
				cmtTitle: null,
				rating: null,
				date: null,
				details: null,
				helpfulCount: null,
			}
			//parse cmt
			comment.ID 				 = $(a).attr('id');
			comment.user 			 = $(a).find('.author').text();
			comment.userUrl 		 = $(a).find('a.a-size-base.a-link-normal.author').attr('href');
			comment.userUrl			 = "www.amazon.com" + comment.userUrl;
			comment.cmtTitle 		 = $(a).find('.review-title.a-color-base.a-text-bold').text();
			comment.rating			 = $(a).find('.a-link-normal .a-icon-alt').text();
			comment.date 			 = $(a).find('.review-date').text();
			comment.details			 = $(a).find('.a-size-base.review-text').text();
			if ($(a).find('.a-size-small.a-color-secondary.review-votes').text()) {
				comment.helpfulCount = $(a).find('.a-size-small.a-color-secondary.review-votes').text();
			} else{
				comment.helpfulCount = 0;
			};
			cmtList.push(comment);
			//console.log("finish parsing a cmt ");
			//printCmt(comment);
		})
		callback(null,cmtList);
	})
	
}

function getAllCmt(baseCmtUrl,callback) {
	var pageNumber;
	var allCmtList = [];
	var curPage = 1;


	async.waterfall([
		function (wtcallback){
			getPageAmount (baseCmtUrl,function (pages){
				console.log('In total of: ' + pages + ' comment pages for this app');
				wtcallback(null,pages);
			})
		},
		function (pages,wtcallback) {

			async.doWhilst(
				function (innerCallback) {
					var cmtUrl = baseCmtUrl + '&pageNumber=' + curPage;

					getAllCmtInAPage (cmtUrl,function (err,cmtList) {
						curPage++;
						if (cmtList.length != 0) {
							//console.log(cmtList.length);
							allCmtList = allCmtList.concat(cmtList);
						}
						return innerCallback(err);
					})
			}, function () {return curPage <= pages;},

			function (err) {
				//console.log('finished parsing cmt for all pages');				
				return callback(err,allCmtList);
			})
		}
	]);
}





function getCommentPageUrl(appUrl,callback) {
	request (appUrl,function (err,res,html){
		var $ = cheerio.load(html);
		var commentUrl = $('#seeAllReviewsUrl').attr('href');
		callback(commentUrl);
	})
}




function getAppGeneralInfo(appUrl,callback) {
////console.log('getting general data from: \n' + appUrl);
	request(appUrl,function (err,res,html) {
		var $ = cheerio.load(html);
		var data = {
			url: appUrl,
			name: null,
			developer: null,
			rating: null,			
			price: null,
			seller: null,
			appImages: [],
			specialOffer: null,
			update: null,
			ASIN: null,
			releaseDate: null,
			features: null,
			descriptions: null,
			appSize: null,
			appVer: null,
			permissions: null,
			osRequire: null,
		}
		//get name
		data.name = $('#btAsinTitle').text();
		
		//get developer
		data.developer = $('#center-col .buying span a').text();

		//get rating
		data.rating = $('#acr .acrRating').text();

		//get price
		data.price = $('.priceLarge').text().trim();
		
		//get seller
		var tempSeller = [];
		$('#sold-by span').each(function(){
			var a = $(this);
			tempSeller.push(a.text().trim());
		});
		data.seller = tempSeller[1];

		//get app images
		$('#thumbs-image img').each(function(){
			var a = $(this);
			data.appImages.push(a.attr('src'));
		});

		//get offer
		var temp = [];
		data.specialOffer = $('#quickPromoBucketContent .amabot_widget').text().trim();

		$('#productDetailsTable li').each(function(){
					var a = $(this);
					temp.push(a.text().trim());
				});
				data.ASIN = (temp[0]).replace('ASIN: ','');
				data.releaseDate = (temp[1]).replace('Release Date: ','');

			
		//get app feature 
		data.features = $('#feature-bullets-btf .content').text().trim();
			
		//get description
			
		data.descriptions = $('#mas-product-description .a-row.masrw-content-row').text();
			
		//appsize, appver, osrequire, permissions 

		var temp = [];
		$('#mas-technical-details .a-section.a-spacing-none').each(function() {
			var a = $(this);
			temp.push(a);
		});

		data.appSize = temp[0].text().trim();

		data.appVer = temp[1].text().trim();

		data.osRequire = temp[4].text().trim();

		data.osRequire = (data.osRequire).replace('Minimum Operating System: ', '');

		//get and process permission info
		data.permissions = $('#mas-app-permissions').text();
				
		data.permissions = (data.permissions).replace('Application Permissions:', '');

		data.permissions = (data.permissions).replace(/(\r\n|\n|\r|\t)/gm, '');

		data.permissions = (data.permissions).replace('Help me understand what permissions mean', '');

		data.permissions = (data.permissions).replace('(', '');

		data.permissions = (data.permissions).replace(')', '');		

		data.permissions = (data.permissions).trim();
		
		//get update
		temp = [];
		temp = $('.bucket .content');

		checkUpdate (appUrl,function (flag) {
			if (flag == true) {
				//console.log('true');
				data.update = ($(temp[1]).text().trim());
				callback(data);

			} else{
				//console.log('false');
				data.update = null;
				callback(data);
			};
			
		});

	});

}



