const request = require('request');
const cheerio = require('cheerio');
const	async = require('async');


//var appUrl = 'http://www.amazon.com/gp/product/B00EDTSKLU/ref=s9_dcbhz_bw_g405_i2_pd?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-6&pf_rd_r=1NTE56D0108DQZ8XMVQH&pf_rd_t=101&pf_rd_p=1657719322&pf_rd_i=2350149011';
//var appUrl = 'http://www.amazon.com/Gluten-Free-Games-Hyena-Simulator/dp/B00W60B1Y6/ref=sr_1_5?s=mobile-apps&ie=UTF8&qid=1436974551&sr=1-5&pebp=1436978930728&perid=0MQVAWNSC4P1DV9W9X3Q';
var appUrl = 'http://www.amazon.com/Youda-Games-Holding-B-V-Stratego%C2%AE/dp/B00TSF3NQG/ref=sr_1_1?s=mobile-apps&ie=UTF8&qid=1436981588&sr=1-1&pebp=1436981591261&perid=1Z9QZTSYMANAT81PZK4E';
//var appUrl = 'http://www.amazon.com/Gluten-Free-Games-Polar-Simulator/dp/B00S3ENIAY/ref=pd_sim_405_3?ie=UTF8&refRID=10F75HDBG43S0RVX9VVS';

function removeWhiteSpace(str,callback) {
	str = str.replace(/(^\s*)|([ \t]+$)/,'');
	//str = str.replace(/[A-z.,]/,'');	
	//////console.log(str);
	callback(str);
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
	console.log('----ASIN releaseDate avgStar:----\n' + data.ASIN + '\n' + data.releaseDate + '\n' + data.avgStar);
	console.log('----features:----\n' + data.features);
	console.log('----descriptions:----\n' + data.descriptions);
	console.log ('----permissions:----\n' +  data.permissions);
	console.log('----App size:----\n' + data.appSize + '\n' + data.appVer);
	console.log('----os req:----\n' + data.osRequire);
}

function getComments(cmtUrl,callback) {
	var $ = cheerio.load(html);
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

checkUpdate (appUrl,function (flag) {
	if (flag == true) {
		console.log('true');

	} else{
		console.log('false');
	};
	console.log('done');
})
//function x() {
////console.log('getting general data from: \n' + appUrl);
	request(appUrl,function (err,res,html) {
		var $ = cheerio.load(html);
		var data = {
			url: appUrl,
			name: null,
			developer: null,
			rating: null,			
			price: null,
			selelr: null,
			appImages: [],
			specialOffer: null,
			update: null,
			ASIN: null,
			releaseDate: null,
			avgStar: null,
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
		data.developer = $('.buying a').text();

		//get rating
		data.rating = $('.mas-show-ratings').text();

		//get price
		data.price = $('.priceLarge').text().trim();
		
		//get seller
		data.seller = $('.priceBlockLabel').next().text().trim();

		//get app images
		$('#thumbs-image img').each(function(){
			var a = $(this);
			data.appImages.push(a.attr('src'));
		});

		//get offer
		data.specialOffer = $('.amabot_widget').text().trim();

		//check if the page contains update or not 
		checkUpdate (appUrl,function (flag) {
			if (flag == true) { //there are updates available
				console.log('true');
				//get update
				var temp = [];
				temp = $('.bucket .content');
				data.update = ($(temp[1]).text().trim());


				//get asin & release date & avg star
				temp=[];
				$('#productDetailsTable li').each(function(){
					var a = $(this);
					temp.push(a.text().trim());
				});
				data.ASIN = (temp[0]);
				data.releaseDate = (temp[1]);
				data.avgStar = (temp[2]);
				
				//get app feature 
				data.features = $('#feature-bullets-btf .content').text();

				//get description
				temp = [];
				var temp_2 = [];
				$('#divsinglecolumnminwidth .bucket .content').each(function(){
					var a = $(this);
					temp.push(a);
				});
				data.descriptions = (temp[4]).text().trim();
				

				//get size & version & permission
				$(temp[5]).find('li').each(function () {
					temp_2.push($(this).text());
				});

				data.permissions = $(temp[5]).find('#mas-app-permissions .mas-app-permissions-list').text();
				//appsize, appver, osrequire 

				data.appSize = (temp_2[0]);

				data.appVer  = (temp_2[1]);

				data.osRequire = (temp_2[(temp_2.length)-2]);
			} else{ //no update available
				console.log('false');
			};
		});
		

		printObject(data);
	});

//}
