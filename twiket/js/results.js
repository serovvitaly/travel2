tw.layout_results = null;
tw.oResult = null;
tw.ticketParams={};
var adviser;
var allVariants = false;
if(tw.comparedPrice == null) {
	tw.comparedPrice = (readCookie("comparedPriceShow") != '' && readCookie("comparedPriceShow") == 'true')?true:false;
}
if(tw.params.compare) {
	tw.comparedPrice = tw.params.compare;
}
tw.socialShare = false;
//if(tw.language == 'ru') {tw.socialShare = true;}
$(function(){
	if((tw.source && tw.source.tag) || tw.params.allVariants){ allVariants = true; }
	tw.layout_results = document.getElementById('layout_results');
	$.template( 'tmpl_FlightBlock', $("#tmpl_FlightBlock").trim());
	$.template( 'tmpl_BaloonFlightStars', $("#tmpl_BaloonFlightStars").trim());
	$.template( 'tmpl_newAirlineFlights', $("#tmpl_newAirlineFlights").trim());
	$.template( 'tmpl_AirlineFlights', $("#tmpl_AirlineFlights").trim());
	$.template( 'tmpl_AirlineDirectionFlight', $("#tmpl_AirlineDirectionFlight").trim());
	$.template( 'tmpl_Stars', $("#tmpl_Stars").trim());
	$.template( 'tmpl_TripsStars', $("#tmpl_TripsStars").trim());
	$.template( 'tmpl_FlightsByAK', $("#tmpl_FlightsByAK").trim());
	$.template( 'tmpl_FlightsByAKarray', $("#tmpl_FlightsByAKarray").trim());
	if(tw.socialShare){
		$.template( 'tmpl_SocialShare', $("#tmpl_SocialShare").trim());
	}
	$.template( 'tmpl_Ticket', $("#tmpl_Ticket").trim());
	
	if (tw.testResult) {
		tw.currencyRates = tw.testResult.rates;
		RequestList = [];
		RequestList[0] = new RequestData();
		RequestList[0].directions[0] = new Direction({
			from: 'MOW',
			to: 'PAR',
			date: new Date()
		});
		RequestList[0].directions[1] = new Direction({
			from: 'PAR',
			to: 'MOW',
			date: new Date()
		});
		/*RequestList[0].directions[2] = new Direction({
			from: 'LON',
			to: 'LED',
			date: new Date()
		});*/
		/*RequestList[0].directions[3] = new Direction({
			from: 'PAR',
			to: 'MOW',
			date: new Date()
		});*/
		RequestList[0].json = tw.testResult;
		DrawFares(RequestList[0]);	
	}	
	//при клике-скроле убираем балун с инфой звездатости по перелету
		$('div:not([class*="stars_baloon"])').click(function(){
			removeInfoBaloon();
		});
		$(window).scroll(function(){
			removeInfoBaloon();
		});	
	$('body').delegate('.ResultTable .price_button', 'mouseover mouseout mousedown mouseup', function(e){
		if (e.type == 'mouseover' ) {
			$(this).addClass('hover');
		} else if (e.type == 'mousedown' ) {
			$(this).addClass('down');
		} else if (e.type == 'mouseup' ) {
			$(this).removeClass('down');
		} else {
			$(this).removeClass('hover');
			$(this).removeClass('down');
		}		
	});
	$(document.body).bind("changeRequest", function(){
		tw.oResult=null;
	});
	$(document.body).bind("removeMiddleSearchRotation", function(){
		$('.middleSearchRotation').remove();
	});
	$('.manyCompanies').livequery(function(){
		$(this).tooltip();
	});
	$('.infotitle').livequery(function(){
		$(this).tooltip();
	});
	
	TicketFlightStars();
	MakeAirportTooltips();
	/*$(window).scroll(function() {
		PlanePositioning();
	});
	$(window).resize(function() {
		PlanePositioning();
	});*/
	if(tw.socialShare) {
		SocialOptions();
	}
	adviser = new Adviser();
	$('.showTripInfo').live('click',function(e){
		e.preventDefault();
		var info = $(this).attr('info').split(',');
		var FlightIndex = info[0];
		var DirNum = (info[1] && info[1]!="")?info[1]:null;	
		ShowTrip(FlightIndex,DirNum);
	});
});

function SocialOptions(){
	$('.shareable').live('click',function(e){
		e.preventDefault();
		window.open($(this).attr('href'), 'sharer_' + new Date().valueOf(), 'toolbar=no,width=625,height=435,modal=yes');
	});
}
function RewriteSocialOptions(){
	if(!tw.socialShare) {
		return;
	}
	try{
		var href = encodeURIComponent("http://" + document.location.host + "/?s" + document.location.hash);
		var text="";

		if(objSearchForm.data.flightType == "multiway") {
			for (var j = 0; j < tw.oResult.allDirectionsLength; j++) {
				var date = tw.oResult.obj.directions[j].date;
				if (ref.Cities[tw.oResult.obj.directions[j].from]) {
					text += ref.getCityName(tw.oResult.obj.directions[j].from);
				} else if (ref.Airports[tw.oResult.obj.directions[j].from]) {
					text += ref.getCityName(ref.Airports[tw.oResult.obj.directions[j].from].Parent);
				}
				text += "→";
				if (ref.Cities[tw.oResult.obj.directions[j].to]) {
					text += ref.getCityName(tw.oResult.obj.directions[j].to);
				} else if (ref.Airports[tw.oResult.obj.directions[j].to]) {
					text += ref.getCityName(ref.Airports[tw.oResult.obj.directions[j].to].Parent);
				}
				text += ' ' + date.getDate() + ' ' + l10n.calendar.months_D[date.getMonth()].toLowerCase();
				
				if (j != tw.oResult.allDirectionsLength - 1) {
					text += ", ";
				}
			}
		} else {
			var date = tw.oResult.obj.directions[0].date;
			if (ref.Cities[tw.oResult.obj.directions[0].from]) {
				text += ref.getCityName(tw.oResult.obj.directions[0].from);
			} else if (ref.Airports[tw.oResult.obj.directions[0].from]) {
				text += ref.getCityName(ref.Airports[tw.oResult.obj.directions[0].from].Parent);
			}
			
			if(objSearchForm.data.flightType == "oneway") {
				text += "→";	
			} else {
				text += "⇄";
			}
			
			if (ref.Cities[tw.oResult.obj.directions[0].to]) {
				text += ref.getCityName(tw.oResult.obj.directions[0].to);
			} else if (ref.Airports[tw.oResult.obj.directions[0].to]) {
				text += ref.getCityName(ref.Airports[tw.oResult.obj.directions[0].to].Parent);
			}
			
			text += ' ' + date.getDate();
			if(tw.oResult.allDirectionsLength==2) {
				var date2 = tw.oResult.obj.directions[1].date;
				if(date.getMonth() != date2.getMonth()) {
					text+=l10n.calendar.months_D[date.getMonth()].toLowerCase();
				}
				text += '–' + date2.getDate() + ' ' + l10n.calendar.months_D[date2.getMonth()].toLowerCase();
			} else {
				text+= ' ' + l10n.calendar.months_D[date.getMonth()].toLowerCase();
			}
		}
		text+= ', ' + formatMoney(tw.oResult.MinPrice) + ' '+l10n.currency[tw.currency].Symbol;
		text = encodeURIComponent(text);
		var additionaText= encodeURIComponent(l10n.social.text);
		$('.Social .tw').attr('href','http://twitter.com/share?url=' + href + '&text=' + text);
		$('.Social .vk').attr('href','http://vkontakte.ru/share.php?url='+href+'&title='+text+'&image=http%3A%2F%2Fonetwotrip.com%2Fimages%2Flogo.png&description='+additionaText);
		$('.Social .jj').attr('href','http://www.livejournal.com/update.bml?subject=OneTwoTrip!&event=' + '<a href="' +href+ '">' +text+ '</a>' );
		$('.Social .fb').attr('href','http://www.facebook.com/share.php?u=' +href);
	} catch(e){}
}
function Adviser(){
	var self = this;
	$(document.body).bind("changeRequest mapShow", function(){
		self.hide();
	});
	$(document.body).bind("resultsShow", function(){
		if(tw.oResult && tw.oResult.obj.directions.length<3 && tw.oResult.showAdviser) {
			self.length = tw.oResult.obj.directions.length;
			self.makeJump=true;
			self.show();
		}
	});
	this.wrapper = $('#priceDynamicSpreader')[0];
	this.makeJump = false;
	this.loading = false;
	if(!readCookie("dynamic")){
		this.jump();
	}
	$(this.wrapper).bind('mouseenter mouseleave',function(e){
		if(e.type == "mouseenter") {
			self.makeJump = false;
		} else {
			self.makeJump = true;
		}
	});
	
	function MakeWord(intI){
		if(String(intI).length==1) {
			intI = "0"+intI;
		}
		var text;
		var last = parseInt( String(intI).substring(1), 10);
		if (last == 1) {
			text= parseInt(intI,10) + l10n.adviser.nights[0];
		} else if (0 < last && last < 5) {
			text=  parseInt(intI,10) + l10n.adviser.nights[1];
		} else {
			text= parseInt(intI,10) + l10n.adviser.nights[2];
		}
		var prelast = parseInt( String(intI).substring(0,1), 10);
		if (prelast == 1 && String(intI).length > 1) {
			text = intI + l10n.adviser.nights[2];
		}
		return text;
	}
	var requestOptions = {
		repeats: 1,
		backupRepeats: true,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(){
			self.show();
			self.loading=false;
			self.show();
		}
	};
	var force_abort = false;
	var $priceDynamic = $('.priceDynamic',this.wrapper);
	$priceDynamic.attr('title', l10n.adviser.buttonTitle);
	$priceDynamic.click(function(){
		MakeRequest();
	}).tooltip();
	
	function MakeRequest(){
		var hash = (decodeURI(document.location.hash)).substr(1);
		hash = (hash.indexOf('&') > 0) ? hash.substring(0, hash.indexOf('&')) : hash;
		var params = {
			route: hash.split("|")[0],
			ad: 1,
			cs: tw.oResult ? tw.oResult.obj.cs : "E"
		};
		if ($('div[class*="chooseRoutes"]:not(.selected)').hasClass('direct')) {
			params.maxStops = 0;
		}
		if (hash === '') {
			return false;
		}
		$.ajax({
			type: "get",
			dataType: "json",
			url: "https://secure.onetwotrip.com/_api/searching/flexfares/",
			data: params,
			timeout: 40000,
			beforeSend: function(xhr){
				if ( $('.Adviser_preload').length===0 ) {
					clearExtraElements();
					self.makeJump = false;
					self.loading = true;
					if (!readCookie("dynamic")) {
						setCookie({
							name: "dynamic",
							value: "1",
							days: 360
						});
					}
					addPopup({
						className: "Adviser_preload",
						close_button: true
					});
					appendLoader({
						appendTo: $('.popup')[0],
						text: l10n.adviser.priceSearch
					});
					$('.popup .close_button').click(function(){
						force_abort = true;
						removeLoader();
						xhr.abort();
					});
				}
			},
			success: function(json){
				if(!tw.oResult) {
					return;
				}
				var flex = json;
				var div = document.createElement('div');
				var route = tw.oResult.FilterObject[0].Direction.From.Code +''+tw.oResult.FilterObject[0].Direction.To.Code;
				
				var nights;
				if(self.length>1){
					var d1 = tw.oResult.obj.directions[0].date;
					var d2 = tw.oResult.obj.directions[1].date;
					nights = parseInt( (d2.valueOf()-d1.valueOf())/86400000, 10);
					nights = MakeWord(nights);
				}
				var direct = (params.maxStops||params.maxStops===0)?true:false;
				$.tmpl($("#tmpl_Adviser").trim(), flex, {len: self.length, nights: nights, direct: direct}).appendTo( div );
				
				if(String(flex.stops).indexOf('0') >-1) {
					$('div[class*="chooseRoutes"]:not(.selected)',div).click(function(){
						requestOptions.repeats = 1;
						MakeRequest();
					});
				}					
									 
				var StartMonth;
				for(var i =0, DL= flex.departures.length; i<DL;i++){
					flex.departures[i].oDate = new Date.parseAPI(flex.departures[i].date);
					if(!StartMonth || StartMonth && flex.departures[i].oDate.getMonth() != StartMonth.getMonth()){
						flex.departures[i].changedDate = flex.departures[i].oDate;
						StartMonth = flex.departures[i].oDate;
					}
					if(flex.departures[i].oDate.getDay() ===0 || flex.departures[i].oDate.getDay() ==6) {
						flex.departures[i].hol = "holiday";
					}
					if(i==3 && self.length>1) {
						flex.departures[i].start = true;
					}
					var StartPriceMonth = null;
					flex.departures[i].min = 1000;
					if(flex.departures[i].prices){
						for(var j=0, VL= flex.departures[i].prices.length; j<VL;j++){
							if(flex.departures[i].prices[j].diff1 !=null) {
								if(flex.departures[i].prices[j].diff1 < flex.departures[i].min){
									flex.departures[i].min = flex.departures[i].prices[j].diff1;
								}
							} else {
								flex.departures[i].prices[j].empty = 1;
							}
							if (self.length == 1) {
								//flex.departures[i].search = "'http://" + window.location.hostname + "?s&t="+new Date().valueOf()+"#" + flex.departures[i].oDate.format('ddmm') +route;
								flex.departures[i].search = flex.departures[i].oDate.format('ddmm') +route;
								if(tw.oResult.obj.cs=="B"){
									flex.departures[i].search+= "&"+tw.oResult.obj.cs;
								}
								//flex.departures[i].search+= "'";	
							} else {
								flex.departures[i].prices[j].oDate = new Date(flex.departures[i].oDate);
								flex.departures[i].prices[j].oDate.setDate(flex.departures[i].prices[j].oDate.getDate() + flex.departures[i].prices[j].days);
								//flex.departures[i].prices[j].search = "'http://" + window.location.hostname + "?s&t="+new Date().valueOf()+"#" + flex.departures[i].oDate.format('ddmm') + route + flex.departures[i].prices[j].oDate.format('ddmm');	
								flex.departures[i].prices[j].search = ''+flex.departures[i].oDate.format('ddmm') + route + flex.departures[i].prices[j].oDate.format('ddmm');	
								if(tw.oResult.obj.cs=="B"){
									flex.departures[i].prices[j].search+= "&"+tw.oResult.obj.cs;
								}
								//flex.departures[i].prices[j].search+= "'";
								if(flex.departures[i].prices[j].oDate.getDay() ===0 || flex.departures[i].prices[j].oDate.getDay() ==6) {
									flex.departures[i].prices[j].hol = "holiday";
								}

								if(!StartPriceMonth || StartPriceMonth && flex.departures[i].prices[j].oDate.getMonth() != StartPriceMonth.getMonth()){
									flex.departures[i].prices[j].changedDate = flex.departures[i].prices[j].oDate;
									StartPriceMonth = flex.departures[i].prices[j].oDate;
								}
							}
						}							
					}
					if(flex.departures[i].min == 1000) {
						delete flex.departures[i].min;
						flex.departures[i].empty =2;
					}
				}
				$.tmpl($("#tmpl_AdviserDays").trim(), flex).appendTo( $('#adviserWay_0',div) );					
				if (self.length >1) {
					function MoveArrow(){
						var list = $('.container',div);
						var item = $('.container.selected',div)[0];
						var number = $(list).index( item );
						var ar = $('.paper .arrow',div)[0];
						$(ar).css({'left': (number+1)*92 - 40});
					}
					function RenewSearch(){
						$('button',div).attr('search', $('#adviserWay_1 .selected',div).attr('search') );
					}
					$.tmpl($("#tmpl_AdviserSelectedDate").trim(), flex.departures[3]).prependTo($('#adviserWay_1', div));
					MoveArrow();
					RenewSearch();
					$('#adviserWay_0 div[class*="container"]', div).each(function(i){
						if( $(this).hasClass('disabled') ) {return;}
						this.info = flex.departures[i];
						$(this).click(function(){
							$('#adviserWay_0 .container').removeClass('selected');
							$(this).addClass('selected');
							$('#adviserWay_1').empty();
							$.tmpl($("#tmpl_AdviserSelectedDate").trim(), this.info).prependTo($('#adviserWay_1', div));
							MoveArrow();
							RenewSearch();
						});
					});
					
					$('#adviserWay_1 div[class*="container"]:not(.disabled)', div).live('click',function(){
						$('#adviserWay_1 .container').removeClass('selected');
						$(this).addClass('selected');
						RenewSearch();
					});
					$('button',div).live('click',function(){
						var data = objAvia.parseKey($(this).attr('search'));
						objAvia.changeRequest(objAvia.addDataToRequestsList(data));
						removePopup();
					});
				} else {
					$('#adviserWay_0 div[class*="container"]:not(.disabled)', div).live('click',function(){
						var data = objAvia.parseKey($(this).attr('search'));
						objAvia.changeRequest(objAvia.addDataToRequestsList(data));
						removePopup();
					});
				}
				
				var adClass = "Adviser color";
				if(self.length==1) {
					adClass= "Adviser single";
				}
				addPopup({
					dom: div,
					className: adClass,
					domClass: "AdviserContent",
					close_button: true
				});
				self.show();
				self.loading=false;
			},
			complete: function(xhr){
				if(!force_abort){
					xhr.url = this.url;
					checkAjaxError(xhr,requestOptions);						
				} else {
					force_abort = false;
				}
			}
		});
	}	
}
Adviser.prototype.jump = function(){
	var self = this;
	if(this.makeJump && !this.loading) {
		$(this.wrapper).animate({bottom:"+=15px"},200).animate({bottom:"-=15px"},150).animate({bottom:"+=10px"},100)
		.animate({bottom:"-=10px"},100).animate({bottom:"+=5px"},50).animate({bottom:"-=5px"},50,"swing", function(){
			setTimeout(function(){
				self.jump();
			},5000);
		});		
	} else {
		setTimeout(function(){
			self.jump();
		},5000);
	}
};
Adviser.prototype.show = function(){
	var self = this;
	$(this.wrapper).removeClass('invisible');
};
Adviser.prototype.hide = function(){
	$(this.wrapper).addClass('invisible');
	this.makeJump= false;
};

function PlanePositioning(){
	return;
	if(document.getElementById('SeatsSelection')){
		var coordLeft = $('#SeatsSelection').offset().left;
		var coordTop = $(window).scrollTop();
		$('#SeatsPlane').css({
			"position": "fixed",
			"top": -coordTop+38,
			"left": coordLeft-55
		});
	}
}
function CloneArray(arr) {
	var arr1 = [];
	for(var i in arr) {
		arr1.push(arr[i]);
	} 
	return arr1;
}

function getIntersect(arr1, arr2){
	var r = [], o = {}, l = arr2.length, i, v;
	for (i = 0; i < l; i++) {
		o[arr2[i]] = true;
	}
	l = arr1.length;
	for (i = 0; i < l; i++) {
		v = arr1[i];
		if (v in o) {
			r.push(v);
		}
	}
	return r;
}
function MakeStartDateFlightInfo(DirDate){
	var curDate = DirDate;
	var formText = ', {day} {month}, {weekday}';
	if(tw.language == 'az'){
		formText = ', {month} {day}, {weekday}';
	}
	if (isValidDate(curDate)) {
		return draw(curDate);
	} else {
		curDate = new Date.parseAPI(DirDate);
		if(isValidDate(curDate)){
			return draw(curDate);
		} else {
			return "";
		}		
	}
	function draw(dateToDraw){
		var dd = dateToDraw.getDate();
		var mm = l10n.calendar.months_D[dateToDraw.getMonth()];
		var wd = l10n.calendar.days_N[dateToDraw.getDay()];
		if(tw.language != 'de') {
			mm = mm.toLowerCase();
		}
		return formText.replaceByHash({day: dd,  month: mm,  weekday: wd});
	}
}
function MakeArrivalDateFlightInfo(DirDate){
	var curDate = new Date.parseAPI(DirDate);
	var formText = ' ({day} {month})';
	if(tw.language == 'az'){
		formText = ' ({month} {day})';
	}
	if(isValidDate(curDate)){
		return formText.replaceByHash({day: curDate.getDate(),  month: l10n.calendar.months_S[curDate.getMonth()].toLowerCase()});
	} else {
		return "";
	}
}

function ChangeLastLetterTranfer(Point){
	if(tw.language == 'ru') {
		Point = Point.split('');
		var Length = Point.length;
		if(Point[Length-1] =="а") {
			Point[Length-1] = "у";
		}
		if(Point[Length-1] =="я") {
			Point[Length-1] = "ю";
		}
		return String(Point).replace(new RegExp(",",'g'),"");		
	} else {
		return Point;
	}
}
function ChangeLastLetterFrom(Point){
	if (tw.language == 'ru') {
		Point = Point.split('');
		var Length = Point.length;
		if(Point[Length-1] =="к") {
			Point[Length-1] = "ка";
		}
		return String(Point).replace(new RegExp(",",'g'),"");
	} else {
		return Point;
	}
}
function ShortenName(name){
	name = String(name);
	var words = name.split(" ");
	if(words.length >2) {
		var tempName = words[0]+ " " + words[1];
		return tempName + '...';
	} else {
		if(name.length <16) {
			return name;
		}
		return name.substring(0,16) + '...';	
	}
}
function formatPointStringFromTo(pointName, fromto){
	var shortPoint = pointName;
	if(pointName.length > 16) { 
		shortPoint = ShortenName(pointName);
	}
	if(tw.language == 'az') {
		return shortPoint;
	} else {
		return fromto + ' ' + shortPoint;
	}
}
function formatFilterPrice(price){
	if(tw.language == 'az') {
		return '<span>' + price + '</span><span class="min_priceword">' + l10n.searchResult.filters.priceFrom + '</span>' + '&thinsp;'+ l10n.currency[tw.currency].Symbol;
	} else {
		return '<span class="min_priceword">' + l10n.searchResult.filters.priceFrom + '</span> <span>' + price +'&thinsp;'+ l10n.currency[tw.currency].Symbol + '</span>';
	}
}
function MinSeatsAvl(arr){
	arr = String(arr).split(',');
	var newArr = [];
	for(i=0,AL=arr.length;i<AL;i++){
		if(arr[i]!='') {
			newArr.push(arr[i]);
		}
	}
	return Math.min.apply( null, newArr );
}

function DrawFares(obj){
	tw.oResult = null;
	if($('.ResultTable')[0]) {
		$('.ResultTable').remove();
	}	
	if(tw.source){
		tw.source.popup = {
			airline: function(){
				if(ref.Airlines[tw.source.ak]){
					addPopup({
						error: true,
						className: "noResults",
						reason: l10n.popup.warning,
						comment: l10n.searchResult.popup.airline[0] + ref.Airlines[tw.source.ak] + l10n.searchResult.popup.airline[1],
						close_button: true,
						button: l10n.popup.close,
						actionButton: "removePopup();"
					});		
				}
			},
			time: function(){
				if(tw.source.time && String(parseInt(tw.source.time,10)).length==4){
					addPopup({
						error: true,
						className: "noResults",
						reason: l10n.popup.warning,
						comment: l10n.searchResult.popup.time[0]+ref.Airlines[tw.source.ak]+l10n.searchResult.popup.time[1]+ DurationTimeString(tw.source.time,1,1) +l10n.searchResult.popup.time[2],
						close_button: true,
						button: l10n.popup.close,
						actionButton: "removePopup();"
					});
				}
			}
		}
	}
	$(document.body).trigger("removeMiddleSearchRotation");
	removeLoader();
	if (obj.json.frsCnt > 0) {
		tw.oResult = new DrawResults(obj);
		$(document.body).trigger("resultsShow");
		RewriteSocialOptions();
		$('body').css({"overflow-y": "scroll"});
		$(tw.layout_results).animate({
			opacity: '1'
		}, 300, function(){
			$(this).removeAttr('style');
		});
	} else {
		kmqRecord({name:"FaresNotFound", obj:tw.searchFlight, prefix: 'FNF'});
		if (window.objMap) objMap.show();
		objSearchForm.update();
		addPopup({
			error: true,
			className: "noResults",
			reason: l10n.popup.warning,
			comment: l10n.searchResult.popup.noFlights,
			close_button: true,
			button: l10n.popup.close,
			actionButton: "removePopup();"
		});
		delete obj.json;
	}
}
function DrawResults(obj){
	var self = this;
	this.obj = obj;
	this.obj.DateCreated = new Date();
	this.OneWay = true;
	this.TwoWays = false;
	this.allDirections = {};
	this.allDirectionsLength = 0;
	this.initDefaultStates();
	this.initDefaultFlights();
	this.DefaultParamsForTicket();
	this.initStructure();
}
DrawResults.prototype.initDefaultStates = function(){
	var self = this;
	this.oFares = {
		max:0
	};
	for(var fareIndex=0, FaresLength=this.obj.json.frs.length; fareIndex < FaresLength; fareIndex++ ) {
		var curFare = this.obj.json.frs[fareIndex];
		if(!this.oFares[curFare.id]) {
			this.oFares[curFare.id] = {
				frKey: curFare.frKey,
				gdsInf: curFare.gdsInf,
				cur: curFare.prcInf.cur,
				amt: curFare.prcInf.amt,
				refund: true,
				gdsType: curFare.gdsType||'Unknown',
				pltCrr: curFare.pltCrr||'Unknown',
				agCnt: curFare.agCnt||'Unknown'
			};
			//sirena
				if(curFare.extId) {
					this.oFares[curFare.id].extId = curFare.extId;
				}
			if(curFare.frKeyRT){
				this.oFares[curFare.id].frKeyRT = curFare.frKeyRT;
			}
			for(var infMsgsIndex=0, infMsgsL = curFare.infMsgs.length; infMsgsIndex< infMsgsL; infMsgsIndex++) {
				if(curFare.infMsgs[infMsgsIndex].cd == "NO_REFUND") {
					this.oFares[curFare.id].refund = false;
				}
			}
			//для бонусов
			this.oFares[curFare.id].noBonus = curFare.noBonus||false;
			//для конфирма
			if(this.oFares.max < curFare.id){
				this.oFares.max = curFare.id;
			}
		}
		for(var directionIndex=0, DirectionsLength=curFare.dirs.length ; directionIndex < DirectionsLength; directionIndex++ ){
			var curDirection = curFare.dirs[directionIndex];
			var directionInfo = {
				FareId: curFare.id,
				TripIds: [[]],
				FlightNumbers: [[]],
				Classes: [[]],
				TripsSeatAvl: [[]],
				ServiceClasses: [[]],
				StopTimes:[[]],
				JourneyTime:[],
				stars: 0,
				starsInfoCount: 0,
				sourceFare: curFare
			};
			directionInfo.JourneyTime.push(curDirection.jrnTm);
			for( var i = 0, TripsLength = curDirection.trps.length; i < TripsLength; i++ ){
				var curTripIndex = curDirection.trps[i];
				var curTrip = this.obj.json.trps[curTripIndex.id];
				if (curTrip.stars) {
					directionInfo.stars += curTrip.stars;
					directionInfo.starsInfoCount++;
				} 
				/*if (curTrip.oprdBy) {
					directionInfo.OperatedBy[0] =curTrip.oprdBy;
				}*/
				if (i === 0) {
					directionInfo.AK = curTrip.airCmp;
				} else {
					directionInfo.StopTimes[0].push(curTripIndex.stpTm);
				}
				
				directionInfo.TripIds[0].push(curTripIndex.id);
				directionInfo.FlightNumbers[0].push(curTrip.fltNm);
				directionInfo.Classes[0].push(curTripIndex.cls);
				directionInfo.TripsSeatAvl[0].push(curTripIndex.stAvl);
				directionInfo.ServiceClasses[0].push(curTripIndex.srvCls);
			}
			if (!this.allDirections[curDirection.id]) {
				this.allDirections[curDirection.id] = [];
				this.allDirectionsLength++;
			}
			this.allDirections[curDirection.id].push(directionInfo);
			//}
			//free
			curDirection=null;
			directionInfo=null;
		}
	}
	this.allFlights =[];
	for (var i = 0, FirstL = this.allDirections[0].length; i < FirstL; i++) {
		var Fare = this.allDirections[0][i];
		var FareId = Fare.FareId;		
		if (this.allDirections[1]) {
			//проверка на бонусный трип
				var bonus = true;
			for (var j = 0, SecondL = this.allDirections[1].length; j < SecondL; j++) {
				var SecondFare = this.allDirections[1][j];
				if (SecondFare.FareId != FareId) {
					continue;
				}
				bonus = false;
				 //дополняем второй перелёт
				var objFare = self.CloneFare( Fare, SecondFare, 1 );
				
				if (this.allDirections[2]) {
					for (var k = 0, ThirdL = this.allDirections[2].length; k < ThirdL; k++) {
						var ThirdFare = this.allDirections[2][k];
						if (ThirdFare.FareId != FareId) {
							continue;
						}
						 // дополняем третий перелёт
						var objFare2 = self.CloneFare( objFare, ThirdFare, 2 );

						if (this.allDirections[3]) {
							for (var t = 0, FourthL = this.allDirections[3].length; t < FourthL; t++) {
								var FourthFare = this.allDirections[3][t];
								if (FourthFare.FareId != FareId) {
									continue;
								}
								 //дополняем четвертый перелёт
								var objFare3 = self.CloneFare( objFare2, FourthFare, 3 );
								//this.AddFlightField(objFare3);
								this.allFlights.push(objFare3);
							}
						} else {
							//this.AddFlightField(objFare2);
							this.allFlights.push(objFare2);
						}						
					}
				} else {
					//this.AddFlightField(objFare);
					this.allFlights.push(objFare);
				}
			}
			if(bonus){
				this.allFlights.push(Fare);
			}
		} else {
			this.allFlights.push(Fare);
		}
	}
	//если есть бонусные направления, уменьшаем кол-во дирекшинов
	if(this.allDirectionsLength > this.obj.directions.length) {
		this.allDirectionsLength = this.obj.directions.length;	
	}
	if (this.allDirectionsLength>1) {
		this.OneWay = false;
	}
	if(this.allDirectionsLength==2){
		this.TwoWays = true;
	}	
	this.DefaultAllFlights = this.allFlights;
	this.initEmptyArrays();
};
DrawResults.prototype.CloneFare = function(Fare1, Fare2, iIndex){
	var objFare = {};
	objFare.AK =Fare1.AK;
	//objFare.AmountFare =Fare1.AmountFare;
	objFare.FareId =Fare1.FareId;
	objFare.TripIds =CloneArray(Fare1.TripIds);
	objFare.FlightNumbers =CloneArray(Fare1.FlightNumbers);
	objFare.Classes =CloneArray(Fare1.Classes);
	objFare.TripsSeatAvl =CloneArray(Fare1.TripsSeatAvl);
	objFare.ServiceClasses =CloneArray(Fare1.ServiceClasses);
	objFare.StopTimes =CloneArray(Fare1.StopTimes);
	objFare.JourneyTime =CloneArray(Fare1.JourneyTime);
	objFare.stars = Fare1.stars;
	objFare.starsInfoCount = Fare1.starsInfoCount;

	objFare.TripIds[iIndex] =Fare2.TripIds[0];
	objFare.FlightNumbers[iIndex] =Fare2.FlightNumbers[0];
	objFare.Classes[iIndex] =Fare2.Classes[0];
	objFare.TripsSeatAvl[iIndex] =Fare2.TripsSeatAvl[0];
	objFare.ServiceClasses[iIndex] =Fare2.ServiceClasses[0];

	/*не добавляем данные если это бонусные направления, для отображения и правильного подсчета, сортировок*/
	/*еслинет бонусных направлений*/
	if (this.allDirectionsLength == this.obj.directions.length) {
		objFare.StopTimes[iIndex] =Fare2.StopTimes[0];
		objFare.JourneyTime[iIndex] =Fare2.JourneyTime[0];
		objFare.stars+= Fare2.stars;
		objFare.starsInfoCount+= Fare2.starsInfoCount;
	}
	//for megapegaChecking-LR
	objFare.sourceFare = Fare1.sourceFare;
	
	return objFare;	
};
/*DrawResults.prototype.AddFlightField = function(Flight){
	Flight.direct =1;
	for(var j=0, TL = Flight.TripIds.length;j<TL;j++){
		if(Flight.TripIds[j].length >1){
			Flight.direct=0;
		}
	}
	//для подсчета АК с прямыми рейсами
		if(Boolean(Flight.direct) && !AKDirectFlightsCount[Flight.AK]) {
			AKDirectFlightsCount[Flight.AK] = {};
			AKDirectCount++;
		}
	//время в пути (flight time + stops time)
	var time=0;
	for(var j=0,TL=Flight.JourneyTime.length;j<TL;j++){
		time+= DurationAPIToMinutes(Flight.JourneyTime[j]); 
	}
	Flight.totalJourneyTime = time;
	
	//нахождение мин-макc времени и цены
		if (Flight.totalJourneyTime < this.MinTime) {
			this.MinTime = Flight.totalJourneyTime;
		}
		if (Flight.AmountFare < this.MinPrice) {
			this.MinPrice = Flight.AmountFare;
		}	
};*/
DrawResults.prototype.initDefaultFlights = function(){
	var self = this;
	this.MinTime = 10000000;
	this.MinPrice = 10000000;
	this.RefundFlightCount = 0;

	//для подсчета АК с прямыми рейсами
		var AKDirectFlightsCount = {};
		var AKDirectCount = 0;
		var MaxDirectPriceCoef=0;

	var tempArray = [];
	for (var i = 0, FL = this.allFlights.length; i < FL; i++) {
		var curFlight = this.allFlights[i];
		
		//мин кол-во мест на весь путь
			curFlight.SeatAvl = MinSeatsAvl(curFlight.TripsSeatAvl);
		//мин мест для каждого направления
			curFlight.minDirSeatAvl=[];
			for (Sindex = 0, Slength = curFlight.TripsSeatAvl.length; Sindex < Slength; Sindex++) {
				curFlight.minDirSeatAvl[Sindex] = MinSeatsAvl(curFlight.TripsSeatAvl[Sindex]);
			}
		//сразу выбрасываем
		//если выбрано кол-во мест
			if(this.selectedSeats && curFlight.SeatAvl < this.selectedSeats) {
				continue;
			}
		//если выбраны только возвратные - выкидываем, считаем кол-во рефандов
			if (this.oFares[curFlight.FareId].refund) {
				this.RefundFlightCount++;
			}
			if(this.ShowRefundable && !this.oFares[curFlight.FareId].refund) {
				continue;				
			}
		curFlight.AmountFare = (this.oFares[curFlight.FareId].cur==tw.currency)? Math.ceil(this.oFares[curFlight.FareId].amt) : Math.ceil(this.oFares[curFlight.FareId].amt * this.obj.json.rates[this.oFares[curFlight.FareId].cur+''+tw.currency]);
		if(tw.comparedPrice && tw.language == 'ru'){
			curFlight.AmountFare = Math.floor(curFlight.AmountFare - curFlight.AmountFare*0.025);
		}
		//прямой перелёт
			curFlight.direct =1;
			for(var j=0, TL = this.allDirectionsLength;j<TL;j++){
				//проверяем или кол-во трипов >1 или есть ли остановки на 1 трипе
				/*if(curFlight.TripIds[j].length >1 || this.obj.json.trps[curFlight.TripIds[j][0]].stps){
					curFlight.direct=0;
				}*/
				if(curFlight.TripIds[j].length >1){
					curFlight.direct=0;
					break;
				}
			}
		//комбинированный перелёт
			curFlight.combined =0;
			if(curFlight.sourceFare.frKeyRT) {
				curFlight.combined = 1;
			}

		//для подсчета АК с прямыми рейсами
			if(Boolean(curFlight.direct) && !AKDirectFlightsCount[curFlight.AK]) {
				//лоукост не считаем
				if(curFlight.AK != "VY" && curFlight.AK != "4U" && curFlight.AK != "JK"){ //Vueling Airlines-Germanwings-Spanair
					AKDirectFlightsCount[curFlight.AK] = {};
					AKDirectCount++;
				}
			}
		//время в пути (flight time + stops time)
		var time=0;
		for(var j=0,TL=curFlight.JourneyTime.length;j<TL;j++){
			time+= DurationAPIToMinutes(curFlight.JourneyTime[j]); 
		}
		curFlight.totalJourneyTime = time;
		
		//нахождение мин-макc времени и цены
			if (curFlight.totalJourneyTime < self.MinTime) {
				self.MinTime = curFlight.totalJourneyTime;
			}
			if (curFlight.AmountFare < self.MinPrice) {
				self.MinPrice = curFlight.AmountFare;
			}
		//звездатость flight
			if(curFlight.starsInfoCount){
				curFlight.stars = parseFloat(curFlight.stars/curFlight.starsInfoCount,10);				
			}
			delete curFlight.starsInfoCount;
		tempArray.push(curFlight);
	}
	this.allFlights = tempArray;

	//mark1
	//для фильтрации АК с пересадками если у них есть прямые и дешевле
	var DirectAKFlights = {};
	tempArray = [];
		for(var i=0,FL=this.allFlights.length;i<FL;i++) {
			var curFlight = this.allFlights[i];
			 //пишем коэф-нты для фаре 
				curFlight.coefP = (this.MinPrice/curFlight.AmountFare).toFixed(5);
				curFlight.coefT = (this.MinTime/curFlight.totalJourneyTime + this.MinPrice/curFlight.AmountFare*0.07).toFixed(5);
				curFlight.coefM = ((Number(curFlight.coefP) + Number(curFlight.coefT))/2).toFixed(5);
				
			if (!allVariants) {
				//убираем из выборки если коэф ниже ХХ суммарный/2 - незачем дальше бегать и проверять что-то
				/*if (curFlight.coefM < 0.35) {
					continue;
				}*/

				//для фильтрации перелетов see: mark1
				//находим максимальный PriceCoef прямых перелётов АК и макс коеф для всех прямых перелётов
				if (Boolean(curFlight.direct)) {
					if (!DirectAKFlights[curFlight.AK]) {
						DirectAKFlights[curFlight.AK] = {
							coefP: curFlight.coefP
						};
					}
					if (DirectAKFlights[curFlight.AK].coefP < curFlight.coefP) {
						DirectAKFlights[curFlight.AK].coefP = curFlight.coefP;
					}
					//лоукост не учитываем для подсчета макс коэф для прямых
					if (curFlight.AK != "VY" && curFlight.AK != "4U" && curFlight.AK != "JK") { //Vueling Airlines-Germanwings-Spanair
						if (curFlight.coefP > MaxDirectPriceCoef) {
							MaxDirectPriceCoef = curFlight.coefP;
						}
					}
				}
			}
			tempArray.push(curFlight);
		}
	
	this.allFlights = tempArray;
		//удаляем перелёты
		tempArray = [];
		for(var i=0,FL=this.allFlights.length;i<FL;i++) {
			var curFlight = this.allFlights[i];
			
			if (!allVariants) {
				//убираем дорогие с пересадками если есть минимум две АК с прямыми перелётами
				/*if (!Boolean(curFlight.direct) && AKDirectCount > 1 && curFlight.coefP < MaxDirectPriceCoef) {
					continue;
				}*/
				//mark1
				//удаляем дорогие пересадочные перелёты если есть дешевые той же АК
				if (!Boolean(curFlight.direct) && DirectAKFlights[curFlight.AK] && DirectAKFlights[curFlight.AK].coefP > curFlight.coefP) {
					continue;
				}
				
				//для нахождения макс сидений и их отрисовки
				if (this.minSeats < curFlight.SeatAvl) {
					this.minSeats = curFlight.SeatAvl;
				}
			}

			//создаем объект перелетов с индексами
			//curFlight.FlightIndex = i;
			this.oFlights[curFlight.FlightIndex] = curFlight;
			
			//кол-во АК, участвующих  в перелёте
				curFlight.TripsAK = [];
				curFlight.TripsAKFilter = [];
				curFlight.EveryDirectionAK = [];
			//конкретные АК в трипе
				curFlight.EveryTripAK = [];
				var AKCount = 0;
				var trpsCount =0;
				var AirlinesList = {};
				var AirlinesListFilter = {};
				AirlinesListFilter[curFlight.AK] =1;
				curFlight.TripsAKFilter.push(curFlight.AK);
				for(var j=0, TL = this.allDirectionsLength; j<TL;j++){
					var curTripArr = curFlight.TripIds[j];
					curFlight.EveryDirectionAK.push(this.obj.json.trps[curTripArr[0]].airCmp);
					curFlight.EveryTripAK[j] = [];
					
					for(var k=0, subTL = curTripArr.length;k<subTL;k++){
						trpsCount++;
						var curTrip = this.obj.json.trps[curTripArr[k]];
						//в раных трипах могут быть разные АК и oprtBy
						if(curTrip.airCmp != curFlight.AK && !curTrip.oprdBy) {
							AKCount++;
							//повторные АК не добавляем
							if (!AirlinesList[curTrip.airCmp]) {
								curFlight.TripsAK.push(curTrip.airCmp);
								AirlinesList[curTrip.airCmp] = 1;
							}
						}						
						if(curTrip.oprdBy && curTrip.oprdBy != curFlight.AK) {
							//считаем кол-во ак вообще на перелёте, не важно была такая oprdBy или нет 
							AKCount++;
							//повторные АК не добавляем
							if (!AirlinesList[curTrip.oprdBy]) {
								curFlight.TripsAK.push(curTrip.oprdBy);
								AirlinesList[curTrip.oprdBy] = 1;
							}
						}
						if(curTrip.oprdBy) {
							curFlight.EveryTripAK[j].push(curTrip.oprdBy);
						} else {
							curFlight.EveryTripAK[j].push(curTrip.airCmp);
						}
						//for filter
						if(!AirlinesListFilter[curTrip.airCmp]) {
							curFlight.TripsAKFilter.push(curTrip.airCmp);
							AirlinesListFilter[curTrip.airCmp] = 1;
						}
					}
				}
				//если меньше - чем трипов значит есть перелеты которые осуществляет сам продавец, т.е. первая АК - добавляем её
				if(AKCount < trpsCount) {
					curFlight.TripsAK.push(curFlight.AK);
				}
			//end
			this.initFilterIndexes(curFlight);
			tempArray.push(curFlight);
		}
	this.allFlights = tempArray;
	//free
		tempArray = null;
		DirectAKFlights=null;
		tempObj=null;
		AKDirectFlightsCount=null;
		AKDirectCount=null;
		MaxDirectPriceCoef=null;
};
DrawResults.prototype.initEmptyArrays = function(){
	var self = this;
	this.FDirections=[];
	for(var DirectionIndex=0;DirectionIndex<this.allDirectionsLength;DirectionIndex++){
		this.FDirections[DirectionIndex] = {
			DepPoints: {},
			DepTimes: {
				morningday: {list:[]},
				eveningnight: {list:[]},
				morning: {list:[]},
				day: {list:[]},
				evening: {list:[]},
				night: {list:[]}
			},
			ArrPoints: {},
			ArrTimes: {
				morningday: {list:[]},
				eveningnight: {list:[]},
				morning: {list:[]},
				day: {list:[]},
				evening: {list:[]},
				night: {list:[]}
			}
		};
	}
	this.allFlightArrayIndex = [];
	this.DirectFlightArrayIndex = [];
	this.oFlights = {};
	this.AKlist = {count:0, list: {}};
	this.DirectFlightsCount = 0;
	this.TransportFlightsCount = 0;
	this.minSeats = 1;
	this.SelectedDirectRoutes = false;
	this.ShowRefundable = this.ShowRefundable||false;
	//переписываем индексы изначальной выборки - например после удаления определенного тарифа
	for(var i=0,FL=this.DefaultAllFlights.length;i<FL;i++){
		this.DefaultAllFlights[i].FlightIndex = i;
	}
	this.allFlights = CloneArray(this.DefaultAllFlights);
};
DrawResults.prototype.ReloadSearchResult = function(){
	var self = this;
	var data = objAvia.parseKey(self.obj.getKey());
	data = objAvia.addDataToRequestsList(data);
	delete data.json;
	objAvia.changeRequest(data);
};
DrawResults.prototype.initFilterIndexes = function(Flight){
	var self = this;	
	if(Boolean(Flight.direct)){
		this.DirectFlightArrayIndex.push(Flight.FlightIndex);
	}
	//считаем кол-во АК + для статистики смотрим звезды мин-макс
		if(!this.AKlist.list[Flight.AK]) {
			this.AKlist.list[Flight.AK] = 1;
			this.AKlist.count++;
		}
		if(Boolean(Flight.direct)){
			this.DirectFlightsCount++;
		} else {
			this.TransportFlightsCount++;
		}
	this.allFlightArrayIndex.push(Flight.FlightIndex);
	
	for(var i=0,DL=this.FDirections.length;i<DL;i++) {
		var curFDir = this.FDirections[i];
		var FirstDirectionTrip = Flight.TripIds[i][0];
		var FDtrip = this.obj.json.trps[FirstDirectionTrip];
		var LastDirectionTrip = Flight.TripIds[i][Flight.TripIds[i].length - 1];
		var LDtrip = this.obj.json.trps[LastDirectionTrip];
		
		//departure
		if(!curFDir.DepPoints[FDtrip.from]) {
			curFDir.DepPoints[FDtrip.from] = {list:[]};
		}
		curFDir.DepPoints[FDtrip.from].list.push(Flight.FlightIndex);
		
		//arrival
		if(!curFDir.ArrPoints[LDtrip.to]) {
			curFDir.ArrPoints[LDtrip.to] = {list:[]};
		}
		curFDir.ArrPoints[LDtrip.to].list.push(Flight.FlightIndex);
		
		var DepartureHours = parseInt(FDtrip.stTm.substring(0,2),10);
		var ArrivalHours = parseInt(LDtrip.endTm.substring(0,2),10);
		if (5 <= DepartureHours && DepartureHours < 16) {
			curFDir.DepTimes['morningday'].list.push(Flight.FlightIndex);
		} else if (16 <= DepartureHours || DepartureHours < 5) {
			curFDir.DepTimes['eveningnight'].list.push(Flight.FlightIndex);
		}
		if (5 <= ArrivalHours && ArrivalHours < 16) {
			curFDir.ArrTimes['morningday'].list.push(Flight.FlightIndex);
		} else if (16 <= ArrivalHours || ArrivalHours < 5) {
			curFDir.ArrTimes['eveningnight'].list.push(Flight.FlightIndex);
		}

		if (5 <= DepartureHours && DepartureHours < 9) {
			curFDir.DepTimes['morning'].list.push(Flight.FlightIndex);
		} else if (9 <= DepartureHours && DepartureHours < 16) {
			curFDir.DepTimes['day'].list.push(Flight.FlightIndex);
		} else if (16 <= DepartureHours && DepartureHours < 21) {
			curFDir.DepTimes['evening'].list.push(Flight.FlightIndex);
		} else if (21 <= DepartureHours || DepartureHours < 5) {
			curFDir.DepTimes['night'].list.push(Flight.FlightIndex);
		}
		
		if (5 <= ArrivalHours && ArrivalHours < 9) {
			curFDir.ArrTimes['morning'].list.push(Flight.FlightIndex);
		} else if (9 <= ArrivalHours && ArrivalHours < 16) {
			curFDir.ArrTimes['day'].list.push(Flight.FlightIndex);
		} else if (16 <= ArrivalHours && ArrivalHours < 21) {
			curFDir.ArrTimes['evening'].list.push(Flight.FlightIndex);
		} else if (21 <= ArrivalHours || ArrivalHours < 5) {
			curFDir.ArrTimes['night'].list.push(Flight.FlightIndex);
		}
	}
};
DrawResults.prototype.initStructure = function(){
	var self = this;
	$(tw.layout_results).empty().css({"display":"block"}).removeClass('invisible');
	$.tmpl($("#tmpl_ResultStructure").trim()).prependTo( tw.layout_results );
	
	//выбор первого класса
		this.FlightClassBlock = $('.classSearch_wrapper')[0];
		var needFirst = false;
		if(this.obj.cs == "F") {
			needFirst = true;
		} else {
			var firstClassPointsArray = ['TH','US','AE','CA'];
			for(var i=0, DL = this.obj.directions.length; i<DL; i++) {
				var curDir = this.obj.directions[i];
				var codeFrom = ref.getCountryCode(curDir.from);
				var codeTo = ref.getCountryCode(curDir.to);
				if($.inArray(codeFrom,firstClassPointsArray) > -1 || $.inArray(codeTo,firstClassPointsArray) > -1) {
					needFirst = true;
					break;
				}
			}
		}
		if(!needFirst) {
			$('div[cs="F"]', this.FlightClassBlock).addClass('invisible');
			$('div[cs="B"]', this.FlightClassBlock).removeClass('d_middle').addClass('d_last').append('<div class="button_shadow_lr"></div>');
		}


	PlanePositioning();
	this.filter = $('#LuckyMe')[0];

	//this.initRefundSelection();
	this.initComparingPrices();
	this.initCurrencySelection();
	this.initFilterObject();
	this.initFilter();
	this.initOperatedAKList();
	//this.initSeats();
    
	this.ResultTable = $('.ResultTableWrapper')[0];
	this.FilterResult = $('.FilterResult')[0];
	this.FlightsBlock = $('ul',this.FilterResult)[0];
	this.AKFlightInformation = $('.FlightsByAKBlock')[0];
	this.QuickSandBlock = $('#QuickSandBlock')[0];
    
    
	this.initSlider();
	this.initFlightsDifficulties();
	//если есть и прямые и с пересадками
		/*if(this.allFlightArrayIndex.length != this.DirectFlightArrayIndex.length){
			tw.ticketParams.different = 1;	
		}*/

	//если 1 АК и только прямые или с пересадками, то выводим сразу развернутый билет и не показываем фильтр
	this.singleAK = false;
	if (this.AKlist.count>1 || (this.AKlist.count==1 && this.TransportFlightsCount !==0 && this.DirectFlightsCount !==0) ) {		
		$(this.filter).removeClass('invisible');
		this.initDrawPreferedFlights();
		this.FlightsToShowIndex = this.allFlightArrayIndex;
		this.FilterClicked = true;
		this.GetFlightsToShow();
		
		if(tw.source && !this.redraw) {
			if(this.AKlist.list[tw.source.ak]){
				this.FlightsToShow = this.allFlights;
				//сразу конфирм
				if (tw.source.fn) {
					var flightsDir = tw.source.fn.split("-");
					var FlightsNumbersArray = [];
					for (FlightsDirectionIndex = 0, FDlength = flightsDir.length; FlightsDirectionIndex < FDlength; FlightsDirectionIndex++) {
						FlightsNumbersArray[FlightsDirectionIndex] = [];
						var flightsNum = flightsDir[FlightsDirectionIndex].split(",");
						for( var FlightsIndex =0, FlightsLength = flightsNum.length;FlightsIndex<FlightsLength;FlightsIndex++){
							var curFlightNum = flightsNum[FlightsIndex];
							FlightsNumbersArray[FlightsDirectionIndex].push( curFlightNum );
						}
					}
					var ConfirmFlight;
					for (var FlightIndex = 0, FlightsLength = this.allFlights.length; FlightIndex < FlightsLength; FlightIndex++) {
						var curFlight = this.allFlights[FlightIndex];
						if( String(curFlight.FlightNumbers) == String(FlightsNumbersArray)) {
							ConfirmFlight = curFlight;
							break;
						}
					}
					if(ConfirmFlight){
						setTimeout(function(){
							FareConfirmation({FlightIndex: ConfirmFlight.FlightIndex, passengerCount: tw.source.pas});
						},500)
					}
				} else {
					this.MakeClickEvent();					
				}
			} else {
				tw.source.popup.airline();
				window.location.hash = window.location.hash.split('|')[0];
				delete tw.source;
			}
		}
	} else {
		this.singleAK = true;
		//error1-refact with tw data while fade->MakeClickEvent
		$(this.ResultTable).css({'visibility':'hidden'});
		this.FlightsToShow = this.allFlights;
		this.MakeClickEvent();
	}
    
    
    $('aside article.side h2').click(function(){
        $(this).next('.inn').toggle();
    });
    $('.FlightFilter input:radio').customRadio();
    
};
DrawResults.prototype.RedrawResults = function(redraw){
	$(document.body).trigger("redrawResults");
	this.redraw = (redraw!=null)?redraw:true;
	this.initEmptyArrays();
	this.initDefaultFlights();
	if(this.allFlights.length>0){
		this.initStructure();	
	}	
};
DrawResults.prototype.initSlider = function(){
	var self = this;
	this.FlightSliderBlock = $('.FlightSliderWrapper')[0];
	this.FlightSlider = $('#slide_filter')[0];
	$(this.FlightSlider).slider({
		value:100,
		min: 1,
		max: 100,
		step: 1,
        range: "min",
		slide: function( event, ui ) {
			self.currentSliderTime = ui.value;
			self.initSliderValues();
		},
		stop: function(event,ui){
			if(self.QuickSandProcess){
				//$(self.FlightSlider).slider({value:self.sliderTime});
			} else if(self.sliderTime != ui.value) {
				self.sliderTime = ui.value;
				self.WriteCoefs();
				self.SortFlightsBlock();
				self.initSliderValues(1);
				kmqRecord({name: 'use_slider_timemoney'});
			}
		}
	});
	this.sliderTime = $(this.FlightSlider).slider("value");
	this.currentSliderTime = this.sliderTime;
	$(this.FlightSlider).slider("enable");
	if(browser.mobile) {
		$(this.FlightSlider).slider({step:25});
		$('.steps',this.FlightSliderBlock).removeClass('invisible');
	} 	
	//двигаем в середину если только если на выдаче не все прямые
		if(this.allFlightArrayIndex.length != this.DirectFlightArrayIndex.length) {
			$(this.FlightSlider).slider( "option", "value", 50 );
			this.sliderTime = $(this.FlightSlider).slider("value");
		}
	//init sliderInfo
		this.showSliderValues = true;
		this.sliderHandle = $('.ui-slider-handle', this.FlightSliderBlock)[0];
		this.sliderArrayValues = [];
		var tempValues = false;
		var diffValues = false;
		for(var SliderIndex=1; SliderIndex<=100;SliderIndex++){
			var TimeonDirect = -1;
			for(var i=0,FL=this.allFlights.length;i<FL;i++){
				var curFlight = this.allFlights[i];
				if(Boolean(curFlight.direct)){
					if(TimeonDirect == -1) {
						TimeonDirect = curFlight.coefT;
					}
					curFlight.coefS = (curFlight.coefP*SliderIndex/100 + TimeonDirect*(100-SliderIndex)/100).toFixed(5);
				} else {
					curFlight.coefS = (curFlight.coefP*SliderIndex/100 + curFlight.coefT*(100-SliderIndex)/100).toFixed(5);
				}
			}
			var bestFlight = this.allFlights.sort(self.SortBySlider)[0];
			var flightData = {amount: bestFlight.AmountFare, timeto: bestFlight.JourneyTime[0], FlightIndex: bestFlight.FlightIndex};
			if(!tempValues) {
				tempValues = flightData;
			}
			if(tempValues.amount != flightData.amount || tempValues.timeto != flightData.timeto || (flightData.timefrom && tempValues.timefrom != flightData.timefrom)){
				diffValues = true;
			}

			if(tw.ticketParams.round) {
				flightData.timefrom = bestFlight.JourneyTime[1];
			}
		 	this.sliderArrayValues.push(flightData);
		}
		this.showSliderValues = diffValues?true:false;
		this.initSliderValues(1);
};
DrawResults.prototype.initSliderValues = function(refresTooltipValue){
	if(this.showSliderValues) {
		var curEl = this.sliderArrayValues[this.currentSliderTime-1];
		var timeto = DurationTimeStringPartFull(curEl.timeto);
		var price = l10n.searchResult.filters.priceFrom + ' ' + formatMoney(curEl.amount) + '&thinsp;'+l10n.currency[tw.currency].Symbol;
		if(tw.language == 'az') {
			price = formatMoney(curEl.amount) + l10n.searchResult.filters.priceFrom + "&thinsp;" + l10n.currency[tw.currency].Symbol;
		}
		if(curEl.timefrom) {
			var timefrom = DurationTimeStringPartFull(curEl.timefrom);
		}
		var text = l10n.searchResult.block.titles[4] + ' ' + l10n.searchResult.block.there.toLowerCase() + ' ' + timeto;
		if(timefrom) {
			text+= '| ' + l10n.searchResult.block.titles[4] + ' ' + l10n.searchResult.block.back.toLowerCase() + ' ' + timefrom;
		}
		text+= '| ' + price;
		if(refresTooltipValue){
			$(this.sliderHandle).attr('title', text);
			$(this.sliderHandle).tooltip();
		} else {
			text = text.replace(new RegExp("\\| ",'g'),"<br/>");
			$('#tooltip').html(text);
		}

	}
};
DrawResults.prototype.SortByPrice = function(a,b){
	return b.coefP-a.coefP;
};
DrawResults.prototype.SortByTime = function(a,b){
	return b.coefT-a.coefT;
};
DrawResults.prototype.SortByFareId = function(a,b){
	return a.FareId - b.FareId;
};
DrawResults.prototype.SortBySlider = function(a,b){
	//return b.coefS - a.coefS;
    if(a.coefS == b.coefS){
        if(a.stars == b.stars){
            return b.FlightIndex - a.FlightIndex;
        }
		return b.stars - a.stars;
    }
    return b.coefS - a.coefS;
};
DrawResults.prototype.SortByAmountFareAsc = function(a,b){
	return a.AmountFare - b.AmountFare;
};
DrawResults.prototype.SortByStars = function(a,b){
	return b.stars - a.stars;
};
DrawResults.prototype.initDrawPreferedFlights = function(){
	//this.preferedBlock = $('#preferedBlock')[0];
	this.firstP = $('#FirstPrefered')[0];
	this.secondP = $('#SecondPrefered')[0];
	this.firstQS = $('#QuickSandFirstPrefered')[0];
	this.secondQS = $('#QuickSandSecondPrefered')[0];
};
DrawResults.prototype.DrawPreferedFlights = function(){
	var self = this;

	var selectedFlight, mClass,dataId;
	var tempFirst = document.createElement('div');
	var tempSecond = document.createElement('div');
	//для подсчета перелетов по АК прямым и нет	//twice run check. AK
	this.ResortAKFlights();	
	
	//если есть прямые и с пересадками
	if(this.DirectFlightsCount>0 && this.TransportFlightsCount>0) {
		var LowPriceArray = this.FlightsToShow.sort(self.SortByPrice);
		mClass = "price";
		selectedFlight=LowPriceArray[0];
		for (var i = 0, FL=LowPriceArray.length; i < FL; i++) {
			var curFlight = LowPriceArray[i];
			if(curFlight.coefP == selectedFlight.coefP && curFlight.stars >= selectedFlight.stars) {
				selectedFlight = curFlight;
			} else if(curFlight.coefP != selectedFlight.coefP){
				break;
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempFirst).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);
		this.ShowFlight(tempFirst,selectedFlight,{
			count: self.VisibleAK[dataId].counter,
			markClass: mClass,
			direct:selectedFlight.direct
		});

		mClass = "price_direct";
		selectedFlight=LowPriceArray[0];
		for (var i = 0, FL=LowPriceArray.length; i < FL; i++) {
			var curFlight = LowPriceArray[i];
			if(!Boolean(selectedFlight.direct)) {
				selectedFlight = curFlight;
				continue;
			}
			if(Boolean(curFlight.direct)) {
				if(curFlight.coefP == selectedFlight.coefP && curFlight.stars >= selectedFlight.stars) {
					selectedFlight = curFlight;
				} else if(curFlight.coefP != selectedFlight.coefP){
					break;
				}
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempSecond).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);
		this.ShowFlight(tempSecond,selectedFlight,{
			count: self.VisibleAK[dataId].counter,
			markClass: mClass,
			direct:selectedFlight.direct
		});
	} else if(this.DirectFlightsCount>0 && this.TransportFlightsCount===0) { // если только прямые
		var LowPriceArray = this.FlightsToShow.sort(self.SortByPrice);
		mClass = "price";
		selectedFlight=LowPriceArray[0];
		for (var i = 0, FL=LowPriceArray.length; i < FL; i++) {
			var curFlight = LowPriceArray[i];
			if(curFlight.coefP == selectedFlight.coefP && curFlight.stars >= selectedFlight.stars) {
				selectedFlight = curFlight;
			} else if(curFlight.coefP != selectedFlight.coefP){
				break;
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempFirst).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);
		this.ShowFlight(tempFirst,selectedFlight,{
			count: self.VisibleAK[dataId].counter,			
			markClass: mClass,
			direct:selectedFlight.direct
		});

		var StarsArray = this.FlightsToShow.sort(self.SortByStars);
		mClass = "reliable";
		selectedFlight=StarsArray[0];
		/*for (var i = 0, FL=StarsArray.length; i < FL; i++) {
			var curFlight = StarsArray[i];
			if(curFlight.stars == selectedFlight.stars && curFlight.coefP >= selectedFlight.coefP) {
				selectedFlight = curFlight;
			} else if(curFlight.stars != selectedFlight.stars){
				break;
			}
		}*/
		var deltaStars = this.allDirectionsLength;
		for (var i = 0, FL = StarsArray.length; i < FL; i++) {
			var curFlight = StarsArray[i];			
			if( curFlight.coefP <= selectedFlight.coefP ) {continue};
			if( selectedFlight.stars - curFlight.stars <= deltaStars ){
				selectedFlight = curFlight;
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempSecond).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);		
		this.ShowFlight(tempSecond,selectedFlight,{
			count: self.VisibleAK[dataId].counter,			
			markClass: mClass,
			direct:selectedFlight.direct
		});
	} else { // если только с пересадками
		var LowPriceArray = this.FlightsToShow.sort(self.SortByPrice);
		mClass = "price";
		selectedFlight=LowPriceArray[0];
		var arr = [];
		for (var i = 0, FL=LowPriceArray.length; i < FL; i++) {
			var curFlight = LowPriceArray[i];
			if(curFlight.coefP == selectedFlight.coefP) {
				arr.push(curFlight);
			} else {
				break;
			}
		}
		arr.sort(self.SortByTime);
		selectedFlight=arr[0];
		for (var i = 0, FL = arr.length; i < FL; i++) {
			var curFlight = arr[i];
			if(curFlight.coefT == selectedFlight.coefT && curFlight.stars >= selectedFlight.stars){
				selectedFlight =curFlight;
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempFirst).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);
		this.ShowFlight(tempFirst,selectedFlight,{
			count: self.VisibleAK[dataId].counter,			
			markClass: mClass,
			direct:selectedFlight.direct
		});

		var LowTimeArray = this.FlightsToShow.sort(self.SortByTime);
		mClass = "time";
		selectedFlight=LowTimeArray[0];
		for (var i = 0, FL=LowTimeArray.length; i < FL; i++) {
			var curFlight = LowTimeArray[i];
			if(curFlight.coefT == selectedFlight.coefT && curFlight.coefP >= selectedFlight.coefP) {
				selectedFlight = curFlight;
			} else if(curFlight.coefT != selectedFlight.coefT){
				break;
			}
		}
		dataId = selectedFlight.AK+'_'+selectedFlight.direct+'_'+selectedFlight.combined;
		$(tempSecond).attr('data-id',dataId+'_'+selectedFlight.FlightIndex);		
		this.ShowFlight(tempSecond,selectedFlight,{
			count: self.VisibleAK[dataId].counter,			
			markClass: mClass,
			direct:selectedFlight.direct
		});
	}

	if(IEVersion<9) {
		$(this.firstP).empty();
		$(this.secondP).empty();
		$(this.firstP).html(tempFirst);
		$(this.secondP).html(tempSecond);
		this.initAKvariants(tempFirst);
		this.initAKvariants(tempSecond);
	} else {
		$(this.firstQS).append(tempFirst);
		$(this.firstP).quicksand( $(self.firstQS).find('div')[0], function(){
			$(tempFirst).remove();
			self.initAKvariants(self.firstP);
		});
		
		$(this.secondQS).append(tempSecond);
		$(this.secondP).quicksand( $(self.secondQS).find('div')[0], function(){
			$(tempSecond).remove();
			self.initAKvariants(self.secondP);
		});
	}
	//
	LowPriceArray=null;
	LowTimeArray=null;
	StarsArray=null;
	arr=null;
	selectedFlight=null;
	mClass = null;
};
DrawResults.prototype.DefaultParamsForTicket = function(){
	tw.ticketParams={};
	if(IEVersion<9){tw.ticketParams.logopath = "ie/";}
	//если есть и прямые и с пересадками
	//tw.ticketParams.different= 0;
	if(this.allDirectionsLength>2){tw.ticketParams.multi = true;}
	if(this.allDirectionsLength==2){
		if(this.obj.directions[0].from == this.obj.directions[1].to && this.obj.directions[1].from == this.obj.directions[0].to) {
			tw.ticketParams.round = true;
		} else {
			tw.ticketParams.multi = true;
		}
	}
	if(tw.ticketParams.round || this.allDirectionsLength==1){
		this.showAdviser = true;
	}
	singleFrom = [0,0,0,0];
	singleTo = [0,0,0,0];
	//считаем кол-во аэропортов в городе для выводе в шаблоне в виде вместо "из Домодедово в Пулково" - "Из домодедово"
	var pointFromCode = [];
	var pointToCode = [];
	for(var DirectionIndex=0;DirectionIndex<this.allDirectionsLength;DirectionIndex++){
		if(ref.Cities[this.obj.directions[DirectionIndex].from]){
			pointFromCode.push(this.obj.directions[DirectionIndex].from);
		} else {
			pointFromCode.push(ref.Airports[this.obj.directions[DirectionIndex].from].Parent);
		}
		if(ref.Cities[this.obj.directions[DirectionIndex].to]){
			pointToCode.push(this.obj.directions[DirectionIndex].to);
		} else {
			pointToCode.push(ref.Airports[this.obj.directions[DirectionIndex].to].Parent);
		}
	}
	for(var i in ref.Airports) {
		var curAirp = ref.Airports[i];
		if(curAirp.Railway!=1) {
			if(curAirp.Parent == pointFromCode[0]) {
				singleFrom[0]++;
			} 
			if(curAirp.Parent == pointToCode[0]) {
				singleTo[0]++;
			}
			
			if(this.obj.directions[1]){
				if(curAirp.Parent == pointFromCode[1]) {
					singleFrom[1]++;
				} 
				if(curAirp.Parent == pointToCode[1]) {
					singleTo[1]++;
				}
			}
			if(this.obj.directions[2]){
				if(curAirp.Parent == pointFromCode[2]) {
					singleFrom[2]++;
				} 
				if(curAirp.Parent == pointToCode[2]) {
					singleTo[2]++;
				}
			}
			if(this.obj.directions[3]){
				if(curAirp.Parent == pointFromCode[3]) {
					singleFrom[3]++;
				} 
				if(curAirp.Parent == pointToCode[3]) {
					singleTo[3]++;
				}
			}
		}
	}
	//если мульти то по умолчанию много аэропортов в пунтке в1-2 направления
	if(tw.ticketParams.multi){
		singleFrom = [2,2,2,2];
		singleTo = [2,2,2,2];
	}
	tw.ticketParams.singleFrom= singleFrom;
	tw.ticketParams.singleTo= singleTo;
};
DrawResults.prototype.ShowFlight = function(block,Flight, params){
	if (!params) {params = {};}
	//Доп поля для шаблонизатора
	if(!params.adriver){
		this.addTemplateInformation(Flight);		
	}
	$($.tmpl('tmpl_FlightBlock', Flight, params )).appendTo(block);
	/*if(params.markClass) {
		delete Flight.html_tmpl;
	}*/
	//
};
DrawResults.prototype.addTemplateInformation = function(Flight){
	if(!Flight.html_tmpl) {
		Flight.html_tmpl = {};
		Flight.html_tmpl.flightInfo = [];
		Flight.html_tmpl.Airline = ref.getAirlineName(Flight.AK);
		Flight.html_tmpl.AirlineNameClass= (String(Flight.html_tmpl.Airline).length>15)?'smallAKname':'';
		Flight.html_tmpl.From = [];
		Flight.html_tmpl.To = [];
		Flight.html_tmpl.AirportByCodeFrom = [];
		Flight.html_tmpl.AirportByCodeTo = [];
		Flight.html_tmpl.shortAirportByCodeFrom = [];
		Flight.html_tmpl.shortAirportByCodeTo = [];
		Flight.html_tmpl.longAirportByCodeFrom = [];
		Flight.html_tmpl.longAirportByCodeTo = [];
		Flight.html_tmpl.StartTime = [];
		Flight.html_tmpl.EndTime = [];
		Flight.html_tmpl.StopPoints = [];
		Flight.html_tmpl.ChangeBoardPoints = [];
		Flight.html_tmpl.Planes = [];
		Flight.html_tmpl.FlightNumber = [];
		
		Flight.html_tmpl.DurationStopTime = [];
		Flight.html_tmpl.DurationJourneyTime = [];
		Flight.html_tmpl.StartDate = [];
		Flight.html_tmpl.EndDate = [];
		Flight.html_tmpl.TransferTitle = [];
		Flight.html_tmpl.TransferNight = [];
		Flight.html_tmpl.TransferAirport = [];
		/*var directFlights = 0;
		var transportFlights = 0;*/
		for(var Dindex=0;Dindex<this.allDirectionsLength;Dindex++){
			var FirstDirectionTrip = Flight.TripIds[Dindex][0];
			var LastDirectionTrip = Flight.TripIds[Dindex][ Flight.TripIds[Dindex].length-1 ];
			var FDtrip = this.obj.json.trps[FirstDirectionTrip]; 
			var LDtrip = this.obj.json.trps[LastDirectionTrip];			
			
			Flight.html_tmpl.From.push(ref.getCityName(FDtrip.from).toUpperCase() );	
			Flight.html_tmpl.To.push(ref.getCityName(LDtrip.to).toUpperCase() );
			
			Flight.html_tmpl.AirportByCodeFrom.push( FDtrip.from );
			Flight.html_tmpl.AirportByCodeTo.push( LDtrip.to );

			var changedFrom = ChangeLastLetterFrom(ref.getAirportName(FDtrip.from));
			var changedTo = ref.getAirportName(LDtrip.to);
			Flight.html_tmpl.longAirportByCodeFrom.push( changedFrom );
			Flight.html_tmpl.longAirportByCodeTo.push( changedTo );
			changedFrom = formatPointStringFromTo(changedFrom, l10n.searchResult.block.inout[1]);
			changedTo = formatPointStringFromTo(changedTo, l10n.searchResult.block.inout[0]);
			Flight.html_tmpl.shortAirportByCodeFrom.push( changedFrom );
			Flight.html_tmpl.shortAirportByCodeTo.push( changedTo );
		
			Flight.html_tmpl.StartTime.push(FDtrip.stTm.substring(0,2)+':'+FDtrip.stTm.substring(2));
			Flight.html_tmpl.EndTime.push(LDtrip.endTm.substring(0,2)+':'+LDtrip.endTm.substring(2));
			if(Flight.StopTimes[Dindex].length>0){
				Flight.html_tmpl.DurationStopTime[Dindex] = 0;
				for (var i= 0, SL = Flight.StopTimes[Dindex].length; i < SL; i++) {
					Flight.html_tmpl.DurationStopTime[Dindex] += DurationAPIToMinutes(Flight.StopTimes[Dindex][i]);
				}
				Flight.html_tmpl.DurationStopTime[Dindex] = DurationTimeStringPartFull(DurationAPIFromMinutes(Flight.html_tmpl.DurationStopTime[Dindex]));	
			} else {
				//Flight.html_tmpl.DurationStopTime[Dindex] = "смена борта";				
				Flight.html_tmpl.DurationStopTime[Dindex] = "";
			}
			
			Flight.html_tmpl.DurationJourneyTime[Dindex] = DurationAPIToMinutes(Flight.JourneyTime[Dindex]);
			Flight.html_tmpl.StopPoints[Dindex] = [];
			Flight.html_tmpl.ChangeBoardPoints[Dindex] = [];	
			
			//transfers tooltip
				Flight.html_tmpl.TransferTitle[Dindex] = "";
				Flight.html_tmpl.TransferNight[Dindex] = 0;
				Flight.html_tmpl.TransferAirport[Dindex] = 0;
				var tempStopDate = FDtrip.stDt;
				if(FDtrip.dayChg) {
					var FDtripDate = new Date.parseAPI(tempStopDate);
					FDtripDate.setDate(FDtripDate.getDate() + FDtrip.dayChg);
					tempStopDate = FDtripDate.format('yyyymmdd');
				}
				var nightStops = 0;
				var dayStops = 0;
			for (var i= 0, FL = Flight.TripIds[Dindex].length; i < FL; i++) {
				//проверка есть ли инфа по звездам
					var curTrip =this.obj.json.trps[Flight.TripIds[Dindex][i]]; 				
					if(curTrip.flightInfo) {
						Flight.html_tmpl.flightInfo.push(Flight.TripIds[Dindex][i]);
					}
						
					if(i>0){
						var prevTrip = this.obj.json.trps[Flight.TripIds[Dindex][i-1]];
						Flight.html_tmpl.StopPoints[Dindex].push(curTrip.from);
						
						//transfers tooltip
						var duration = DurationTimeString(Flight.StopTimes[Dindex][i-1],0,0)
						if(Flight.html_tmpl.TransferTitle[Dindex] != '') {
							Flight.html_tmpl.TransferTitle[Dindex] += '| ';	 //добавили разделения в тултипе на новую строку
						}
						if(tempStopDate != curTrip.stDt){
							Flight.html_tmpl.TransferTitle[Dindex] += l10n.searchResult.baloon.transfers[0] + ref.getCity(curTrip.from).Name + ', ' + ref.getAirportName(curTrip.from) + ' ' + duration;
							if(prevTrip.to != curTrip.from) {
								Flight.html_tmpl.TransferTitle[Dindex] += ',| ' + l10n.searchResult.baloon.transfers[3] + ref.getAirportName(prevTrip.to) + '&rarr;' + ref.getAirportName(curTrip.from);
								Flight.html_tmpl.TransferAirport[Dindex] = 1;
							}
							Flight.html_tmpl.TransferNight[Dindex] = 1;
							var tempStopDate=curTrip.stDt;
							if(curTrip.dayChg) {
								var curTripDate = new Date.parseAPI(tempStopDate);
								curTripDate.setDate(curTripDate.getDate() + curTrip.dayChg);
								tempStopDate = curTripDate.format('yyyymmdd');
							}
							nightStops++;			
						} else {
							dayStops++;
							if(dayStops==1 && nightStops===0){
								if(prevTrip.to != curTrip.from && Flight.TripIds[Dindex].length>1) {
									Flight.html_tmpl.TransferTitle[Dindex] += l10n.searchResult.baloon.transfers[1] + ref.getCity(curTrip.from).Name + ' ' + duration + ',| ' + l10n.searchResult.baloon.transfers[3] + ref.getAirportName(prevTrip.to) + '&rarr;' + ref.getAirportName(curTrip.from);
									Flight.html_tmpl.TransferAirport[Dindex] = 1;
								} else {
									Flight.html_tmpl.TransferTitle[Dindex] += l10n.searchResult.baloon.transfers[2] + ref.getAirportName(curTrip.from) + ' ' + duration;
								}
							} else {
								Flight.html_tmpl.TransferTitle[Dindex] += l10n.searchResult.baloon.transfers[1] + ref.getCity(curTrip.from).Name + ', ' + ref.getAirportName(curTrip.from) + ' ' + duration;	
								if(prevTrip.to != curTrip.from) {
									Flight.html_tmpl.TransferTitle[Dindex] += ',| ' + l10n.searchResult.baloon.transfers[3] + ref.getAirportName(prevTrip.to) + '&rarr;' + ref.getAirportName(curTrip.from);
									Flight.html_tmpl.TransferAirport[Dindex] = 1;
								}
							}
						}
					}
					//остановки
					if(curTrip.stps) {
						for(var k=0, StopLength=curTrip.stps.length;k<StopLength; k++){
							//Flight.html_tmpl.StopPoints[Dindex].push(curTrip.stps[k]);
							Flight.html_tmpl.ChangeBoardPoints[Dindex].push(curTrip.stps[k]);
							
							if(Flight.html_tmpl.TransferTitle[Dindex] != '') {
								Flight.html_tmpl.TransferTitle[Dindex] += '| ';	 //добавили разделения в тултипе на новую строку
							}
							Flight.html_tmpl.TransferTitle[Dindex] += l10n.searchResult.baloon.transfers[4] + ref.getAirportName(curTrip.stps[k]);
						}					
					}
					
			}
			if(Flight.html_tmpl.DurationStopTime[Dindex] == "" && Flight.html_tmpl.ChangeBoardPoints[Dindex].length>0) {
				Flight.html_tmpl.DurationStopTime[Dindex] = l10n.searchResult.baloon.transfers[5];
			}
			
			Flight.html_tmpl.DurationJourneyTime[Dindex] = DurationTimeStringPartFull(DurationAPIFromMinutes(Flight.html_tmpl.DurationJourneyTime[Dindex]));
			//Flight.html_tmpl.DurationJourneyTime[Dindex] = DurationTimeStringFromMinutes(DurationAPIToMinutes(Flight.JourneyTime[Dindex]) - Flight.html_tmpl.DurationStopTime[Dindex]);
			Flight.html_tmpl.Planes.push(this.obj.json.planes[FDtrip.plane]);	
			Flight.html_tmpl.FlightNumber.push(FDtrip.airCmp +"-"+FDtrip.fltNm);
			/*if(Flight.html_tmpl.StopPoints[Dindex].length>0){
				transportFlights++;
			} else {
				directFlights++;				
			}*/
			Flight.html_tmpl.StartDate.push(this.obj.json.trps[Flight.TripIds[Dindex][0]].stDt);
			var tempEndDate=LDtrip.stDt;
			if(LDtrip.dayChg) {
				var curTripDate = new Date.parseAPI(tempEndDate);
				curTripDate.setDate(curTripDate.getDate() + LDtrip.dayChg);
				tempEndDate = curTripDate.format('yyyymmdd');
			}
			Flight.html_tmpl.EndDate.push(tempEndDate);
			//
			FirstDirectionTrip=null;
			LastDirectionTrip=null;
			FDtrip=null;
			LDtrip=null;
		}
		Flight.html_tmpl.MultiAKFlight = "";
		for(var AKindex=0, AKL=Flight.TripsAK.length;AKindex<AKL;AKindex++){
			if(Flight.html_tmpl.MultiAKFlight != "") {
				Flight.html_tmpl.MultiAKFlight+= ", ";
			}
			Flight.html_tmpl.MultiAKFlight+= ref.getAirlineName(Flight.TripsAK[AKindex]);
		}
		if(Flight.combined){
			Flight.html_tmpl.MultiAKFlight = ref.getAirlineName(Flight.AK) + l10n.searchResult.baloon.airline[2];
		} else if(Flight.TripsAK.length>1) {
			Flight.html_tmpl.MultiAKFlight = l10n.searchResult.baloon.airline[0] + Flight.html_tmpl.MultiAKFlight;	
		} else if(Flight.TripsAK != Flight.AK){
			Flight.html_tmpl.MultiAKFlight = l10n.searchResult.baloon.airline[1] + Flight.html_tmpl.MultiAKFlight;				
		} else {Flight.html_tmpl.MultiAKFlight = "";}
		
		//звездатость
			Flight.html_tmpl.stars = (Flight.stars/2).toFixed(1);
			Flight.html_tmpl.halfstar= 0;
			var stars = Flight.html_tmpl.stars;
			Flight.html_tmpl.stars = Math.floor(stars.split('.')[0]);
			if(stars.split('.')[1]>=3 && stars.split('.')[1]<7) {
				Flight.html_tmpl.halfstar= 1;
			}
			if(stars.split('.')[1]>7) {
				Flight.html_tmpl.stars+= 1;
			}
			Flight.html_tmpl.emptystars = (5-Flight.html_tmpl.stars - Flight.html_tmpl.halfstar)*14;
			Flight.html_tmpl.stars = Flight.html_tmpl.stars*14;

		//если >1 направления и есть и с пересадками и без, то там где без пересадок пишем "прямой" (есть разные перелёты) на всём маршруте
			/*Flight.html_tmpl.isDifferentFlights=0;
			if(transportFlights>0 && directFlights>0) {
				Flight.html_tmpl.isDifferentFlights=1;	
			}*/
	}
	Flight.html_tmpl.Price = formatMoney(Flight.AmountFare) + '&thinsp;'+l10n.currency[tw.currency].Symbol;
};
DrawResults.prototype.initFilterObject = function(){
	var self = this;
	this.FilterObject = [];
	for (var j=0;j<this.allDirectionsLength;j++) {
		direction = {Id: '',
			Direction: {From: {Name:'',Code:''},To: {Name:'',Code:''}},
			Departure: {time: [], pointCount:0, pointArray:[], pointPrice:[]},
			Arrival: {time: [], pointCount:0, pointArray:[], pointPrice:[]}
		};
		
		//для заголовка фильтра направления откуда-куда		
		if(ref.Cities[self.obj.directions[j].from]) {
			direction.Direction.From.Code = self.obj.directions[j].from;
			direction.Direction.From.Name = ref.getCityName(direction.Direction.From.Code);
		} else if(ref.Airports[self.obj.directions[j].from]) {
			direction.Direction.From.Code = ref.Airports[self.obj.directions[j].from].Parent;
			direction.Direction.From.Name = ref.getCityName(direction.Direction.From.Code);
		}
		if(ref.Cities[self.obj.directions[j].to]) {
			direction.Direction.To.Code = self.obj.directions[j].to;
			direction.Direction.To.Name = ref.getCityName(direction.Direction.To.Code);
		} else if(ref.Airports[self.obj.directions[j].to]) {
			direction.Direction.To.Code = ref.Airports[self.obj.directions[j].to].Parent;
			direction.Direction.To.Name = ref.getCityName(direction.Direction.To.Code);
		}
		//для шаблонизатора
		direction.Id = j;
		self.FilterObject.push(direction);
	}
	
	//getMinFlightPrices
	
	var minPrice = '1000000000';
	for(var i=0,DL=this.FDirections.length;i<DL;i++){
		curDir =  this.FDirections[i];
		for(var j in curDir) {
			curVariant = curDir[j];
			
			//смотрим нужно ли разделять время более детально - для шаблона
			var exact = false;
			if(j == "DepTimes" || j =="ArrTimes") {
				if(curVariant.morningday.list.length ===0 || curVariant.eveningnight.list.length ===0){
					exact=true;
				}
			}
			for(var k in curVariant) {
				//calculate price
				var curOption = curVariant[k];
				curOption.minPrice = minPrice;
				for(var m=0,FL=curOption.list.length;m<FL;m++){
					var curFlight =self.oFlights[curOption.list[m]]; 
					if( curFlight.AmountFare < curOption.minPrice) {
						curOption.minPrice = curFlight.AmountFare;
					}
				}
				
				//для шаблона
				var price = formatMoney(curOption.minPrice);
				switch(j){
					case 'DepPoints':
						self.FilterObject[i].Departure.pointArray.push(k);
						self.FilterObject[i].Departure.pointPrice.push(price);
						self.FilterObject[i].Departure.pointCount++;
						break;
					case 'ArrPoints':
						self.FilterObject[i].Arrival.pointArray.push(k);
						self.FilterObject[i].Arrival.pointPrice.push(price);
						self.FilterObject[i].Arrival.pointCount++;
						break;
					case 'DepTimes':
						if(curOption.list.length >0) {
							if(exact && k != 'morningday' && k !='eveningnight' ) {
								var objTime = self.FormTimePeriod(k);
								objTime.minPrice = price;
								self.FilterObject[i].Departure.time.push(objTime);
							} else if(k == 'morningday' || k =='eveningnight'){
								var objTime = self.FormTimePeriod(k);
								objTime.minPrice = price;
								self.FilterObject[i].Departure.time.push(objTime);
							}
						}
						break;
					case 'ArrTimes':
						if(curOption.list.length >0) {
							if(exact && k != 'morningday' && k !='eveningnight' ) {
								var objTime = self.FormTimePeriod(k);
								objTime.minPrice = price;
								self.FilterObject[i].Arrival.time.push(objTime);
							} else if(k == 'morningday' || k =='eveningnight'){
								var objTime = self.FormTimePeriod(k);
								objTime.minPrice = price;
								self.FilterObject[i].Arrival.time.push(objTime);
							}
						}
						break;
				}
			}
		}
	}
	
	/**
	 * сортировка для фильтра в шаблонизаторе
	 */
	var DayIndexSort = function(a,b){
		if( a.id > b.id ) return 1;
		if( a.id < b.id ) return -1;
		return 0;
	}
	//сортируем периоды времени для фильтра в шаблонизаторе
	for(var i in this.FilterObject) {
		var timeArr = [];
		for(var j in self.FilterObject[i].Departure.time) {
			var obj = self.FilterObject[i].Departure.time[j];
			timeArr.push(obj);
		}
		self.FilterObject[i].Departure.time = timeArr.sort(DayIndexSort);
		timeArr = [];
		for(var j in self.FilterObject[i].Arrival.time) {
			var obj = self.FilterObject[i].Arrival.time[j];
			timeArr.push(obj);
		}
		self.FilterObject[i].Arrival.time = timeArr.sort(DayIndexSort);
	}
	//free
	DayIndexSort = null;
};
DrawResults.prototype.FormTimePeriod = function(String){
	var objTime = {};
	objTime.sys = String;
	switch(String){
		case 'morning':
			objTime.name = l10n.searchResult.filters.time[0];
			objTime.id = '1';
			objTime.clock = '05:00-08:59';
			break;
		case 'day':
			objTime.name = l10n.searchResult.filters.time[1];
			objTime.id = '2';
			objTime.clock = '09:00-15:59';
			break;
		case 'evening':
			objTime.name = l10n.searchResult.filters.time[2];
			objTime.id = '3';
			objTime.clock = '16:00-20:59';
			break;
		case 'night':
			objTime.name = l10n.searchResult.filters.time[3];
			objTime.id = '4';
			objTime.clock = '21:00-04:59';
			break;
		case 'morningday':
			objTime.name = l10n.searchResult.filters.time[4];
			objTime.id = '5';
			objTime.clock = '05:00-15:59';
			break;
		case 'eveningnight':
			objTime.name = l10n.searchResult.filters.time[5];
			objTime.id = '6';
			objTime.clock = '16:00-04:59';
			break;
	}
	return objTime;
};
DrawResults.prototype.initRefundSelection = function(){
	var self = this;
	this.RefundSelection = $('#RefundSelection')[0];	
	if(this.RefundFlightCount>0) {
		$(this.RefundSelection).removeClass('invisible');
	} else {
		return;
	}	
	if(this.ShowRefundable) {
		$('.d_last',this.RefundSelection).addClass('selected');	
	} else {
		$('.d_first',this.RefundSelection).addClass('selected');	
	}
	$('.d_option', this.RefundSelection).delegate('div[class*="d_direction"]:not(.selected):not(.disabled)', 'click', function(){
		if(self.QuickSandProcess) {return;}
		$(this).addClass('selected').siblings().removeClass('selected');
		if( $(this).hasClass('d_first') ) {
			self.ShowRefundable = false;
		} else {
			self.ShowRefundable = true;
		}
		self.RedrawResults();
	});
};
DrawResults.prototype.initComparingPrices = function(){
	var self = this;
	if(tw.language != 'ru') {
		return;
	}
	this.ComparingPrices = $('.FlightPriceInformation .ComparePriceSelection')[0];
	if(tw.comparedPrice) {
		$('.d_last',this.ComparingPrices).addClass('active');
	} else {
		$('.d_first',this.ComparingPrices).addClass('active');
	}
	$('.d_option', this.ComparingPrices).delegate('button[class*="d_direction"]:not(.active):not(.disabled)', 'click', function(){
		if(self.QuickSandProcess) {return;}
		$(this).addClass('active').siblings().removeClass('active');
		if($(this).hasClass('d_first')){
			tw.comparedPrice = false;
		} else {
			tw.comparedPrice = true;
		}
		setCookie({
			name: "comparedPriceShow",
			value: tw.comparedPrice,
			days: 180
		});
		window.location.hash = window.location.hash.split('|')[0];
		self.RedrawResults(false);
	});	
};
DrawResults.prototype.initCurrencySelection = function(){  
	var self = this;
	this.CurrenciesBlock = $('#CurrenciesBlock')[0];

	$('.d_direction',this.CurrenciesBlock).each(function(){
		if( $(this).attr('data-cur') == tw.currency) {
			$(this).addClass('active');
		}
	});
	$('.d_option', this.CurrenciesBlock).delegate('button[class*="d_direction"]:not(.active):not(.disabled)', 'click', function(){
        if(self.QuickSandProcess) {return;}
		$(this).addClass('active').siblings().removeClass('active');
		tw.currency = $(this).attr('data-cur');
		setCookie({
			name: "currency",
			value: tw.currency,
			days: 180,
			xdm: true
		});
		makeBonusCurrencyToViewCur(tw.currency);
		window.location.hash = window.location.hash.split('|')[0];
		self.RedrawResults(false);
	});
	makeBonusCurrencyToViewCur(tw.currency);
};
DrawResults.prototype.initFilter = function(){
	var self= this;
	//$('#DirectionsFilter').empty();
	$.tmpl($("#tmpl_PreferedFlightFilter").trim(), self.FilterObject ).appendTo( $('#DirectionsFilter') ) ;
    
    $( ".slider.sliderType2" ).on('click', function(){
        $(this).slider("value", !$(this).slider("value"));
    }).slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 1,
        value: 0,
        change: function(event, ui){
            event.stopPropagation();
            if (ui.value == 1) {
                $(this).parent('.d_option').find('.d_direction.d_last').click();
            } else {
                $(this).parent('.d_option').find('.d_direction.d_first').click();
            }
        }
    });
    

	//бизнес - эконом
		if(this.obj.cs == "F") {
			$('button[cs="F"]',this.FlightClassBlock).addClass('active');	
		} else if(this.obj.cs == "B"){
			$('button[cs="B"]',this.FlightClassBlock).addClass('active');
		} else {
			$('button[cs="E"]',this.FlightClassBlock).addClass('active');
		}
		$('.d_option', this.FlightClassBlock).delegate('button[class*="d_direction"]:not(.active)', 'click', function(){
			$(this).addClass('selected').siblings().removeClass('active');
			var data = objAvia.parseKey(self.obj.getKey());
			data.cs = $(this).attr('cs');
			objAvia.changeRequest(objAvia.addDataToRequestsList(data));
		});

	// спаны вылет-прилёт 
	$('.d_option', this.filter).delegate('div[class*="d_direction"]:not(.active)', 'click', function() {
		$(this).addClass('active').siblings().removeClass('active');
		var doptions = $(this).parents('.direction_body').find('div.direction_option');
		$(doptions).hide();
		if( $(this).hasClass('d_first') ) {
			$(doptions[0]).fadeIn(300);
            $(this).parent('.d_option').find('.slider').slider("value", 0);
		} else {
			$(doptions[1]).fadeIn(300);
            $(this).parent('.d_option').find('.slider').slider("value", 1)
		}
	});
	
	// чекбоксы - radio
	FilterRadioButtons = $('input[type="radio"]', this.filter);
	$(FilterRadioButtons).change(function(){
		if(self.QuickSandProcess){
			return
		}
		var option_row = $(this).parents('.option_row')[0]; 
		if ($(option_row).hasClass('selected')) {
			return
		};
		var fType = $(this).parents('ul').data('filtertype');
		if(fType == 'time'){
			kmqRecord({name: 'use_filter_time'});
		}
		if(fType == 'airport'){
			kmqRecord({name: 'use_filter_airport'});
		}
		self.FilterFareSorting(this);
	});
};
DrawResults.prototype.initOperatedAKList = function(){
	var self = this;
	this.FlightsByAKListBlock = document.getElementById('FlightsByAKList');
	this.FlightsByAKList = $('.list',this.FlightsByAKListBlock)[0];
	
	$('input[type="radio"]', this.FlightsByAKList).live('change',function(){
		//если сыпучка в процессе или уже выбранный вариант - ретурн
			if(self.QuickSandProcess){return}
			var option_row = $(this).parents('.option_row')[0]; 
			if ($(option_row).hasClass('selected')) {return};
		
		$('input[name="' + this.name + '"]').each(function(){
			$(this).parents('div.option_row').removeClass('selected');
		});
		$(option_row).addClass('selected');
		self.AKListClicked = true;
		self.getOperatedAKFlightsToShow( this.value );
		kmqRecord({name: 'use_filter_ak'});
	});
};
DrawResults.prototype.refreshOperatedAK = function(){
	this.OperatedAKarray=null;
	this.defaultFlightsToShowIndex = this.FlightsToShowIndex;
	this.OperatedAK = {};
	for (var i in ref.Alliances) {
		this.OperatedAK[i] = {list:[], minStars: 10000, minFlight: {}, maxStars: -1, maxFlight: {}, group: true};
	}
};
DrawResults.prototype.updateOperatedAK = function(Flight){
	var self = this;
	//ходим по всем АК участвующим в перелете и проверяем (считаем) относятся ли они к одному альянсу или к нескольким
	var alliances = {count:0, outsideCount: 0};
	//все ак в трипсАК   только валидирующие в TripsAKFilter
	for(var i =0, AKL = Flight.TripsAKFilter.length;i<AKL;i++){
		var AKcode = Flight.TripsAKFilter[i];
		var outsideAlliance = true;
		for (var j in ref.Alliances) {
			var curAL =	ref.Alliances[j];
			if(curAL[AKcode] && !alliances[j]) {
				alliances[j]=1;
				alliances.count++;
				outsideAlliance = false;
			}
		}
		if(outsideAlliance) {
			alliances.outsideCount++;
		}
	}
	//если все АК в 1 альянсе и нет других АК вне его 
	if(alliances.count==1 && alliances.outsideCount ===0) {
		for (var i in ref.Alliances) {
			var curAL =	ref.Alliances[i];
			if(curAL[Flight.AK]) {
				self.OperatedAK[i].list.push(Flight.FlightIndex);
				// подсчет звездатости
				if(Flight.stars < self.OperatedAK[i].minStars) {
					self.OperatedAK[i].minStars = parseFloat(Flight.stars,10);
					self.OperatedAK[i].minFlight = Flight;
				}
				if(Flight.stars > self.OperatedAK[i].maxStars) {
					self.OperatedAK[i].maxStars = parseFloat(Flight.stars,10);
					self.OperatedAK[i].maxFlight = Flight;
				}	
				break;
			}				
		}
	}
	//если одна АК
	if(Flight.TripsAK.length==1) {
		var curAK = Flight.TripsAK[0];
		if(!this.OperatedAK[curAK]){
			this.OperatedAK[curAK] = {list:[], minStars: 10000, minFlight: {}, maxStars: -1, maxFlight: {}};
		}
		this.OperatedAK[curAK].list.push(Flight.FlightIndex);		
		// подсчет звездатости
		if(Flight.stars < this.OperatedAK[curAK].minStars) {
			this.OperatedAK[curAK].minStars = parseFloat(Flight.stars,10);
			this.OperatedAK[curAK].minFlight = Flight;
		}
		if(Flight.stars > this.OperatedAK[curAK].maxStars) {
			this.OperatedAK[curAK].maxStars = parseFloat(Flight.stars,10);
			this.OperatedAK[curAK].maxFlight = Flight;
		}	
	}
};
DrawResults.prototype.drawOperatedAK = function(){
	var self = this;
	$(this.FlightsByAKList).empty();
	this.OperatedAKlist = [];
	this.OperatedAlliances = [];
	for(var i in this.OperatedAK) {
		var curAK = this.OperatedAK[i];
		//если нет инфы по перелетам - пропускаем АК
		if(curAK.list.length>0 && curAK.maxStars>0) {
			curAK.AK = i;
			curAK.Name = ref.getAirlineName(i);
			curAK.stars = ((curAK.maxStars + curAK.minStars)/2).toFixed(1);
			if(curAK.group){
				self.OperatedAlliances.push(curAK);
			} else {
				self.OperatedAKlist.push(curAK);
			}
		}
	}
	if(this.OperatedAKlist.length>0 || this.OperatedAlliances.length>0) {
		this.OperatedAlliances.sort(self.SortByStars);
		this.OperatedAlliances =  this.makeOperatedAKstars(this.OperatedAlliances);
		this.OperatedAKlist.sort(self.SortByStars);
		this.OperatedAKlist =  this.makeOperatedAKstars(this.OperatedAKlist);
		$.tmpl('tmpl_FlightsByAK').appendTo(this.FlightsByAKList);
		$.tmpl('tmpl_FlightsByAKarray',{AKlist: this.OperatedAlliances}).appendTo( $('ul',this.FlightsByAKList) );
		$.tmpl('tmpl_FlightsByAKarray',{AKlist: this.OperatedAKlist}).appendTo( $('ul',this.FlightsByAKList) );
		$(this.FlightsByAKListBlock).removeClass('invisible');
	} else {
		$(this.FlightsByAKListBlock).addClass('invisible');
	}
};
DrawResults.prototype.makeOperatedAKstars = function(array){
	//принимаем макс значение звезд и пишем остальные относительно данного значения
	if(array.length ===0) {return;}
	var maxStarsValue = array[0].stars;
	for(var i=0, AL=array.length;i<AL;i++) {
		var curAK = array[i];
		//звездатость
		curAK.html_tmpl = {};
		curAK.html_tmpl.halfstar= 0;
		if (i === 0 || curAK.stars == maxStarsValue) {
			curAK.html_tmpl.emptystars = 0;
			curAK.html_tmpl.stars = 70;
		} else {
			curAK.html_tmpl.stars = (curAK.stars/2).toFixed(1);				
			var stars = curAK.html_tmpl.stars;
			curAK.html_tmpl.stars = Math.floor(stars.split('.')[0]);
			if(stars.split('.')[1]>=3 && stars.split('.')[1]<7) {
				curAK.html_tmpl.halfstar= 1;
			}
			if(stars.split('.')[1]>7) {
				curAK.html_tmpl.stars+= 1;
			}
			curAK.html_tmpl.emptystars = (5-curAK.html_tmpl.stars - curAK.html_tmpl.halfstar)*14;
			curAK.html_tmpl.stars = curAK.html_tmpl.stars*14;				
		}
		//для срабатывания условия в шаблоне звёзд, тут главное показать что есть инфа
			curAK.html_tmpl.flightInfo =["Fly me to The Moon"];
		//пишем все трипы мин-макс (могут быть и одинаковыми )
		curAK.TripIds = curAK.minFlight.TripIds.concat(curAK.maxFlight.TripIds);			
	}
	return array;
};
DrawResults.prototype.getOperatedAKFlightsToShow = function(value){
	if(this.OperatedAK[value]){
		this.OperatedAKarray = this.OperatedAK[value].list;
	} else {
		this.OperatedAKarray = this.defaultFlightsToShowIndex;
	}
	if(this.OperatedAKarray.length < 3) {
		$(this.FlightSliderBlock).addClass('invisible');
	} else {
		$(this.FlightSliderBlock).removeClass('invisible');
	}
	this.GetFlightsToShow();
};
DrawResults.prototype.initSeats = function(){
	var self = this;
	this.SeatBlock = document.getElementById('SeatsSelection');
	this.SeatBlockList = document.createElement('ul');
	$(this.SeatBlockList).attr('title','Отобразить тарифы с выбранным количеством мест');
	for(var i=0;i<this.minSeats;i++){
		var li = document.createElement('li');
		if(i===0) {
			li.className = "selected";
		}
		$(this.SeatBlockList).append(li);
	}
	
	$(this.SeatBlock).append(this.SeatBlockList);
	this.seats = $('li',this.SeatBlockList);
	this.selectedSeats = this.selectedSeats||1;
	$(this.seats).mouseover(function(){
		$(this).addClass('selected').prevAll().addClass('selected');
		$(this).nextAll().removeClass('selected');
		var curSeatHover = $(this).prevAll().length+1;
		var curSeatText = " мест";
		if(curSeatHover==1) {curSeatText=" место"}
		if(curSeatHover==2 || curSeatHover==3 || curSeatHover==4) {curSeatText=" места"}
		$('#tooltip').html('Отобразить варианты с наличием '+ curSeatHover +curSeatText);
	});
	$(this.SeatBlockList).mouseleave(function(){
		self.updateSeats();
	}).tooltip();
	
	$(this.seats).click(function(){
		if(self.QuickSandProcess || self.selectedSeats == $(this).prevAll().length+1) {
			return;
		}
		$(this).addClass('selected').prevAll().addClass('selected');
		self.selectedSeats = $(this).prevAll().length+1;
		$('#tooltip').remove();
		self.ShowRefundable = false;
		self.RedrawResults();
	});
	this.updateSeats();
};
DrawResults.prototype.updateSeats = function(){
	$(this.seats).removeClass('selected');
	$(this.seats).slice(0,this.selectedSeats).addClass('selected');
};
DrawResults.prototype.FilterFareSorting = function(el){
	
	if(el){
		var option_row = $(el).parents('div.option_row')[0];
		$('input[name="' + el.name + '"]').each(function(){
			$(this).parents('div.option_row').removeClass('selected');
		});
		$(option_row).addClass('selected');
		
		var group = $(el).attr('group');
		if (group) {
			if (group == "00") {
				$('li[name="01"] .option_row').removeClass('selected');
				$('input[value="any"][group="01"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "01") {
				$('li[name="00"] .option_row').removeClass('selected');
				$('input[value="any"][group="00"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "10") {
				$('li[name="11"] .option_row').removeClass('selected');
				$('input[value="any"][group="11"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "11") {
				$('li[name="10"] .option_row').removeClass('selected');
				$('input[value="any"][group="10"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "20") {
				$('li[name="21"] .option_row').removeClass('selected');
				$('input[value="any"][group="21"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "21") {
				$('li[name="20"] .option_row').removeClass('selected');
				$('input[value="any"][group="20"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "30") {
				$('li[name="31"] .option_row').removeClass('selected');
				$('input[value="any"][group="31"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}
			if (group == "31") {
				$('li[name="30"] .option_row').removeClass('selected');
				$('input[value="any"][group="30"]', this.filter).each(function(){
					$(this).attr('checked', 'checked');
					$(this).parents('div.option_row').addClass('selected');
				});
			}		
		}		
	}

	
	var newArrays = this.MakeNewArray();
	var resultArray= newArrays[0];
	if(newArrays.length>1) {
		for(var i=1,AL=newArrays.length;i<AL;i++){
			resultArray = getIntersect(resultArray,newArrays[i]);
		}
		//если кликнули на дизебнутый вариант - обнуляем все выбранные на "любой"
		if(resultArray.length===0 && el) {
			var inputs = $('input[value="any"]:not([name="'+el.name+'"])',this.filter);
			$(inputs).attr('checked', 'checked');
			$(inputs).each(function(){
				$(this).parents('ul').find('div[class*="option_row selected"]').removeClass('selected');
				$(this).parents('div.option_row').addClass('selected');				
			});
			var newArrays = this.MakeNewArray();
			var resultArray= newArrays[0];
		}
	}
	this.FilterClicked = true;
	this.GetFlightsToShow(resultArray);
	
};
DrawResults.prototype.MakeNewArray = function(){
	var inputs = $(this.filter).find('input:not([value="any"]):checked');
	var newArrays = [];
	for(var i=0,EL=inputs.length;i<EL;i++) {
		var curInput = inputs[i];
		var curGroup = $(curInput).attr('group');
		var dirNumber = parseInt(curGroup.substring(0,1),10);
		var dirType = parseInt(curGroup.substring(1),10);
		var FlightType = (dirType===0)?"Dep":"Arr";
		if(String(curInput.name).indexOf('from_') !=-1 || String(curInput.name).indexOf('to_') !=-1 ) {
			newArrays.push( this.FDirections[dirNumber][FlightType + "Points"][curInput.value].list );
		} else {			
			newArrays.push( this.FDirections[dirNumber][FlightType + "Times"][curInput.value].list );
		}
	}
	return newArrays;
};
DrawResults.prototype.initFlightsDifficulties = function(){
	var self =this;
	this.FlightsDifficulties = $('.FlightsDifficulties')[0];
	if(this.AKlist.count==1) {
		$('.AdditionalFilterOptions').addClass('invisible');
	}
	if(this.DirectFlightArrayIndex.length==this.allFlightArrayIndex.length){
		$(this.FlightsDifficulties).addClass('invisible');
		$(this.FlightSliderBlock).addClass('invisible');
		this.showFlightsDifficulties = false;
	} else {
		this.showFlightsDifficulties = true;	
	}
	$('.d_option', this.FlightsDifficulties).delegate('button[class*="d_direction"]:not(.active):not(.disabled)', 'click', function() {
		if(self.QuickSandProcess) {return;}
		$(this).addClass('active').siblings().removeClass('active');
		if( $(this).hasClass('d_last') ) {
			self.SelectedDirectRoutes = true;
			fadeOutBlock(self.FlightSliderBlock);
			self.FilterFareSorting();
		} else {
			self.SelectedDirectRoutes = false;
			fadeInBlock(self.FlightSliderBlock);
			self.FilterFareSorting();
		}
	});

};
DrawResults.prototype.GetFlightsToShow = function(arr){
	var self = this;
	if(this.SelectedDirectRoutes) {
		this.FlightsToShowIndex = this.DirectFlightArrayIndex;
	} else {
		 this.FlightsToShowIndex = this.allFlightArrayIndex;
	}
	if(arr && arr.length>0){
		this.FlightsToShowIndex = getIntersect(this.FlightsToShowIndex,arr);
	}
	
	//если клик про списку АК и альянсов
	if(this.AKListClicked) {		
		this.FlightsToShowIndex = getIntersect(this.FlightsToShowIndex,this.OperatedAKarray);
	}
	
	//если выбраны прямые и выбрано что-то в фильтре и в результате нет пересечений
	if(this.FlightsToShowIndex.length===0){
		this.SelectedDirectRoutes = false;
		this.FlightsToShowIndex = getIntersect(this.allFlightArrayIndex,arr);
	}

	this.DirectFlightsCount = 0;
	this.TransportFlightsCount = 0;
	this.FlightsToShow=[];
	//первичные коэф
	var TimeonDirect = -1;
	for(var i=0,FL=this.FlightsToShowIndex.length;i<FL;i++){
		var curFlight = this.oFlights[this.FlightsToShowIndex[i]];
		if(Boolean(curFlight.direct)){
			if(TimeonDirect == -1) {
				TimeonDirect = curFlight.coefT;
			}
			curFlight.coefS = (curFlight.coefP*this.sliderTime/100 + TimeonDirect*(100-this.sliderTime)/100).toFixed(5);
			this.DirectFlightsCount++;
		} else {
			curFlight.coefS = (curFlight.coefP*this.sliderTime/100 + curFlight.coefT*(100-this.sliderTime)/100).toFixed(5);
			this.TransportFlightsCount++;
		}
		this.FlightsToShow.push(curFlight);
	}

	if(this.DirectFlightsCount===0) {
		$('.d_last',this.FlightsDifficulties).addClass('disabled').removeClass('selected');
		$('.d_first',this.FlightsDifficulties).addClass('selected');
		//fadeInBlock(this.FlightSliderBlock);
		$(this.FlightsDifficulties).removeClass('invisible');
		this.showFlightsDifficulties = true;
	} else {
		$('.d_last',this.FlightsDifficulties).removeClass('disabled');
	}

	if(!this.AKListClicked) {
		this.refreshOperatedAK();
		for(var i =0, FL= this.FlightsToShow.length;i<FL;i++){
			var curFlight = this.FlightsToShow[i];
			this.updateOperatedAK(curFlight);
		}
		this.drawOperatedAK();
	}
	if(this.FilterClicked) {
		this.DrawPreferedFlights();	
	}	
	this.AKListClicked = false;
	this.FilterClicked = false;
	this.SortFlightsBlock();
    
    
    $('aside article.side h2').click(function(){
        $(this).next('.inn').toggle();
    });
    $('.FlightFilter input:radio').customRadio();
};
DrawResults.prototype.WriteCoefs = function(){
	var self = this;
	var TimeonDirect = -1;
	for(var i=0,FL=this.FlightsToShow.length;i<FL;i++){
		var curFlight = this.FlightsToShow[i];
		if(Boolean(curFlight.direct)){
			if(TimeonDirect == -1) {
				TimeonDirect = curFlight.coefT;
			}
			curFlight.coefS = (curFlight.coefP*this.sliderTime/100 + TimeonDirect*(100-this.sliderTime)/100).toFixed(5);
		} else {
			curFlight.coefS = (curFlight.coefP*this.sliderTime/100 + curFlight.coefT*(100-this.sliderTime)/100).toFixed(5);
		}
	}
};
DrawResults.prototype.ResortAKFlights = function(){
	var self = this;
	this.FlightsToShow.sort(self.SortBySlider);
	this.VisibleAK = {};
	this.FilteredFlightsToShow = [];	
	for(var i=0,FL=this.FlightsToShow.length;i<FL;i++){
		var curFlight = this.FlightsToShow[i];
		if(!this.VisibleAK[curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined]) {
			this.VisibleAK[curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined] = {counter:0, list:[]};
			//this.FilteredFlightsToShow.push(curFlight); //убрано для доп условия ниже
		}
		this.VisibleAK[curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined].counter++;
		this.VisibleAK[curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined].list.push(curFlight);
	}
	//выбираем перелёты с самым ранним вылетом туда и поздним вылетом обратно
	for(var i in this.VisibleAK){
		var curAKList = self.VisibleAK[i].list;
		if(curAKList.length>0) {
			var neededFlight = curAKList[0];
			var sliderCoef = neededFlight.coefS;
			var priceCoef = neededFlight.coefP;

			for(var j=1, TL = curAKList.length; j<TL; j++){
				var curFlight = curAKList[j];
				if(sliderCoef == curFlight.coefS) {
					var f_firstFlightTrips = neededFlight.TripIds;
					var f_startTrip = f_firstFlightTrips[0][0];
					var f_lastTrip = f_firstFlightTrips[f_firstFlightTrips.length-1][0];
					var f_startTimeTrip = self.obj.json.trps[f_startTrip].stTm;
					var f_lastTimeTrip = self.obj.json.trps[f_lastTrip].stTm;

					var firstFlightTrips = curFlight.TripIds;
					var startTrip = firstFlightTrips[0][0];
					var lastTrip = firstFlightTrips[firstFlightTrips.length-1][0];
					var startTimeTrip = self.obj.json.trps[startTrip].stTm;
					var lastTimeTrip = self.obj.json.trps[lastTrip].stTm;
					if( parseInt(startTimeTrip,10) < parseInt(f_startTimeTrip,10) ) {
						//если есть дешевле с тем же коэф слайдера
						if(priceCoef <= curFlight.coefP) {
							neededFlight = curFlight;							
						}
					} else if( parseInt(f_startTimeTrip,10) == parseInt(startTimeTrip,10) ){
						if(parseInt(lastTimeTrip,10) > parseInt(f_lastTimeTrip,10)) {
							//если есть дешевле с тем же коэф слайдера
							if(priceCoef <= curFlight.coefP) {
								neededFlight = curFlight;							
							}
						}
					} else {
						break;
					}
				} else {
					break;
				}
			}
			self.FilteredFlightsToShow.push(neededFlight);	
		} else {
			self.FilteredFlightsToShow.push(curAKList[0]);
		}
	}
};
DrawResults.prototype.SortFlightsBlock = function(){
	var self = this;
	this.ResortAKFlights();

	//adriver
		if(this.adriverLoaded){
			var adFlight = {adriver: true, direct: 0, AK:'adriver', combined: 0, FlightIndex: 111111};
			this.VisibleAK["adriver_0_0"] = {counter: 0};
			var secondPart = this.FilteredFlightsToShow.splice(1,this.FilteredFlightsToShow.length);
			this.FilteredFlightsToShow.push(adFlight);
			this.FilteredFlightsToShow = this.FilteredFlightsToShow.concat(secondPart);
		}

	if(IEVersion<9) {
		//this.FlightsBlock = $('ul',this.FilterResult)[0];
		$(this.FilterResult).empty();
		//шаблон
		var list = document.createElement('ul');
		for(i=0,FL=this.FilteredFlightsToShow.length;i<FL;i++) {
			var curFlight = this.FilteredFlightsToShow[i];
			var block = document.createElement('li');
			var dataId = curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined;
			self.ShowFlight(block,curFlight,{direct:curFlight.direct, count: this.VisibleAK[dataId].counter, mini: true, adriver: curFlight.adriver});			
			$(list).append(block);
		}
		$(this.FilterResult).append(list);
		$('.TicketOut').removeClass('TicketOut');
		this.initAKvariants(this.FilterResult);
		//
		list=null;
	} else {
		this.Quicksand();
	}
	this.checkAdriverTicket();
};
DrawResults.prototype.Quicksand = function(){
	var self = this;
	var temp_list = document.createElement('ul');
	//fade text
		$('.miniTickets_Fix .TicketIn').addClass('TicketOut');
	for(i=0,FL=this.FilteredFlightsToShow.length;i<FL;i++) {
		var curFlight = this.FilteredFlightsToShow[i];
		var block = document.createElement('li');
		var dataId = curFlight.AK+'_'+curFlight.direct+'_'+curFlight.combined;
		block.id = curFlight.FlightIndex;
		//fade text
			/*var hiddenTextClass='';
			if( $('#'+curFlight.FlightIndex).length===0) {
				hiddenTextClass = 'TicketOut';
			}*/
		$(block).attr('data-id',curFlight.FlightIndex);
		$(temp_list).append(block);
		this.ShowFlight(block,curFlight,{direct:curFlight.direct, count: this.VisibleAK[dataId].counter, mini: true, adriver: curFlight.adriver});
	}
	$(this.QuickSandBlock).append(temp_list);
	this.QuickSandProcess=true;
	$(this.FlightSlider).slider("disable");
	
	$(this.FlightsBlock).quicksand( $(temp_list).find('li'), function(){ 
		self.QuickSandProcess = false;
		//fade text
			$('.miniTickets_Fix .TicketOut').removeClass('TicketOut').addClass('TicketIn');
		//
		
		$(self.FlightSlider).slider("enable");
		$(temp_list).remove();
		self.initAKvariants(self.FlightsBlock);
	});
};
DrawResults.prototype.checkAdriverTicket = function(){
	var self = this;
	if(window.adriver && (tw.language == 'ru' || tw.checkAdriver) && this.TwoWays){
		if(!this.AdriverShowed){
			this.AdriverShowed = true;
			var tempAdriver = document.createElement('div');
			$(tempAdriver).addClass('invisible').attr('id', 'tempTicketRotation');
			$('body').append(tempAdriver);
			var adObj = {sid:184643, bt:52};
			if(tw.checkAdriver){
				adObj.bn = 3;
			} else {
				adObj.pz = 7;
			}
			new adriver('tempTicketRotation', adObj);

			var AdriverInterval = setInterval(function(){
				if($('#tempTicketRotation').find('img').length >0) {
					AdriverFromTemp();
				}
			}, 300);			
			function AdriverFromTemp(){
				clearInterval(AdriverInterval);
				self.adriverLoaded = true;
				self.SortFlightsBlock();
			}
		} else if(this.adriverLoaded){
			$('#ticket_rotation').html( $('#tempTicketRotation').html() );
		}
	}
};
DrawResults.prototype.initAKvariants = function(ListBlock){
	var self = this;
	/*$('.showAKvariants').live('click',function(){
		self.MakeClickEvent(this);
	});*/
	$('.showAKvariants',ListBlock).each(function(){
		$(this).off('click').on('click',function(){
			self.MakeClickEvent(this);
			kmqRecord({name: 'show_more_variants'});
		});
	});
};
DrawResults.prototype.MakeClickEvent = function(div){
	var self = this;
	clearExtraElements();	
	//т.к. фейд у нас 0.5 сек - убираем возможность повторного нажатия на элемент и в конце снова биндим клик
	if(div) {
		$(div).unbind('click');
		var opt = $(div).attr('opt').split(',');
		var direct = opt[0]; 
		var AKcode = opt[1];
		this.selectedAK = {
			AK: AKcode,
			direct: direct
		};
	} else {
		//т.к. АК у нас одна то можем непосредственно из выборки брать необходимые значения
		this.selectedAK = {
			AK: self.allFlights[0].AK,
			direct: self.allFlights[0].direct			
		};
	}
	//если по ссылке откуда-либо перешли сразу в АК
	if(tw.source){
		if(this.AKlist.list[tw.source.ak]){
			this.selectedAK = {
				AK: tw.source.ak,
				direct: (tw.source.dir && tw.source.dir != '')?tw.source.dir:1
			};
			this.ResortAKFlights();
			//add combined ak checks
			if(parseInt(this.selectedAK.direct,10)>0){
				if (!this.VisibleAK[tw.source.ak + "_1_0"] && !this.VisibleAK[tw.source.ak + "_1_1"]) {
					this.selectedAK.direct = 0;
					tw.source.dir = 0;
				}
				else {
					this.selectedAK.direct = 1;
					tw.source.dir = 1;
				}
			} else {
				if(!this.VisibleAK[ tw.source.ak +"_0_0"] && !this.VisibleAK[ tw.source.ak +"_0_1"]) {
					this.selectedAK.direct = 1;
					tw.source.dir = 1;
				} else {
					this.selectedAK.direct = 0;
					tw.source.dir = 0;
				}
			}
		} else { //если только 1 АК в результате и != переходу
			tw.source.popup.airline();
			delete tw.source;
			tw.source.dir = this.selectedAK.direct;
			tw.source.ak = this.selectedAK.AK;
		}
	} else {
		tw.source = {
			route: window.location.hash.split('|')[0],
			ak: self.selectedAK.AK,
			dir: self.selectedAK.direct
		};
	}
	this.selectedAK.tmpl={};
	this.selectedAK.Flights={};
	this.selectedAK.single = this.singleAK;
	//для случая когда есть разные перелёты но возвратный только 1 АК
		if(this.ShowRefundable) { 
			this.selectedAK.single = false;
		}

	window.location.hash = tw.source.route + '|'+ tw.source.ak + '|' + tw.source.dir;
	if(this.FDirections.length<3){
		this.PrepareSimpleAKFlights();
	} else {
		this.PrepareAKFlights();
	}
	this.ClickedAKBlock = div;
	this.DrawSelectedAK();
};
DrawResults.prototype.DrawSelectedAK = function(){
	var self = this;
	$(this.AKFlightInformation).empty();
	this.isAKVisible = true;
		//$('.FlightsDifficulties').addClass('invisible');
		fadeOutBlock(this.ResultTable, function(){
			$.scrollTo(0, 500);
			//$(self.AKFlightInformation).append('<div class="innerInfo"></div>');
			if(self.FDirections.length<3){
				$.tmpl('tmpl_newAirlineFlights', self.selectedAK, {directions: self.obj.directions}).prependTo( self.AKFlightInformation );
				//$('tr:odd',self.AKFlightInformation).addClass('odd');
				self.initSimpleAKEvents();
				if (self.selectedAK.showSort) {
					self.initSorting();
				}
			} else {
				$.tmpl('tmpl_AirlineFlights', self.selectedAK, {directions: self.obj.directions}).prependTo( self.AKFlightInformation );
				self.initAKEvents();
			}
			if(!self.ClickedAKBlock) {
				if(self.selectedSeats==1) {
					$('.ReturnToResult',self.AKFlightInformation).addClass('invisible');	
				}
			}
            
            ShadingIn('DrawSelectedAK');
			fadeInBlock(self.AKFlightInformation,function(){
				self.setSimilarPriceButtonWidth();
				if(self.ClickedAKBlock){
					$(self.ClickedAKBlock).unbind('click');
					$(self.ClickedAKBlock).click(function(){
						self.MakeClickEvent(this);
					});
					$('.ReturnToResult',self.AKFlightInformation).click(function(){
						self.DestroyAKFlights();
						self.isAKVisible = false;
						self.ClickedAKBlock = null;
						//$('.FlightsDifficulties').removeClass('invisible');
					});
				} else if(self.selectedSeats>1){
					$('.ReturnToResult',self.AKFlightInformation).click(function(){
						self.selectedSeats = 1;
						self.ClickedAKBlock = null;
						self.RedrawResults();
					});
				} else {
					$('.ReturnToResult',self.AKFlightInformation).click(function(){
						self.DestroyAKFlights();
						self.isAKVisible = false;
						self.ClickedAKBlock = null;
						//для случая когда есть разные перелёты но возвратный только 1 АК
							if(self.ShowRefundable){
								self.ShowRefundable = false;
								self.RedrawResults();
							}
					});
				}
                
			});	
		});
}
DrawResults.prototype.MakeOnTimeDirectionInfo = function(curFlight, DirNum){
	var flightLate = "";
	var trip = this.obj.json.trps[curFlight.html_tmpl.flightInfo[DirNum]];
	if(trip) {
		var flightInfo = trip.flightInfo;
		if( flightInfo.delay && flightInfo.late && flightInfo.cancelled ) {
			flightLate= Math.round(100-flightInfo.delay.value-flightInfo.late.value-flightInfo.cancelled.value) + l10n.searchResult.block.ontime;
		}
	}
	return flightLate;
};
DrawResults.prototype.PrepareSimpleAKFlights = function(){
	var self = this;	
	this.selectedAK.add = {
		startTime1: {},
		startTime1type: "mixed",
		startTime2: {},
		startTime2type: "mixed",
		rowsCount:[],
		AKFlights: {}
	};
	//выделяем лишь самые дешевые наборы
		for (var i = 0, FL = this.FlightsToShow.length; i < FL; i++) {
			var curFlight = this.FlightsToShow[i];
			if(curFlight.AK == this.selectedAK.AK && curFlight.direct == this.selectedAK.direct ) {			
				if(!this.selectedAK.add.AKFlights[curFlight.TripIds]) {
					this.selectedAK.add.AKFlights[curFlight.TripIds] = curFlight; 
				}
				if(curFlight.AmountFare < this.selectedAK.add.AKFlights[curFlight.TripIds].AmountFare) {
					this.selectedAK.add.AKFlights[curFlight.TripIds] = curFlight; 
				}
			}
		}
		var tempArr = [];
		for(var i in this.selectedAK.add.AKFlights) {
			tempArr.push(this.selectedAK.add.AKFlights[i]);
		}
		this.selectedAK.add.AKFlights = tempArr;
	//для заголовка
		var directCount1 = 0;
		var directCount2 = 0;
	
	var start1Count = 0;
	var start2Count = 0;
	for (var i = 0, FL = this.selectedAK.add.AKFlights.length; i < FL; i++) {
		var curFlight = this.selectedAK.add.AKFlights[i];
		this.addTemplateInformation(curFlight);
		var minSeatsTrips = MinSeatsAvl(curFlight.TripsSeatAvl);
		var curItem = {
			flight: curFlight,
			time: curFlight.html_tmpl.StartTime[0].replace(":",""),
			journeyTime: curFlight.JourneyTime[0],
			minPrice: curFlight.AmountFare,
			minSeats: minSeatsTrips,
			plus: "",
			oList: {},
			flightLate : self.MakeOnTimeDirectionInfo(curFlight,0)
		};

		if(!self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ]) {
			self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ] = {};
		}
		//группируем по трипам в 1 сегменте (с пересадкой перелеты могут быть разными)
			if(!self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ]) {
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ] = curItem;
				start1Count++;
				if(curFlight.TripIds[0].length==1) {
					directCount1++;
				}
			}
		//тк мы уже выбрали только самые дешевые, то тут можно не проверять на стоимость и смело пихать в массив
			if(!self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].oList[curFlight.TripIds]){
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].oList[curFlight.TripIds] = curFlight;	
			}
		
		//minPrice by first trips
			if(curFlight.AmountFare < self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].minPrice) {
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].flight = curFlight;
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].minPrice = curFlight.AmountFare;
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].flightLate = self.MakeOnTimeDirectionInfo(curFlight,0);
			}
		//minSeats by all trips
			/*if(minSeatsTrips != self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].minSeats){
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].plus = "+";
			}*/
			if(minSeatsTrips < self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].minSeats) {
				self.selectedAK.add.startTime1[ curFlight.html_tmpl.StartTime[0] ][ curFlight.TripIds[0] ].minSeats = minSeatsTrips;				
			}			
		
		if(self.TwoWays){
			var curSecondItem = {
				flight: curFlight,
				time: curFlight.html_tmpl.StartTime[1].replace(":",""),
				journeyTime: curFlight.JourneyTime[1],
				minPrice: curFlight.AmountFare,
				firstTrips: curFlight.TripIds[0],
				minSeats: minSeatsTrips, 
				plus: "",
				oList: {},
				flightLate : self.MakeOnTimeDirectionInfo(curFlight,1)
			};			
			if(!self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ]) {
				self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ] = {};
			}
			if(!self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ]) {
				self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ] = curSecondItem;
				start2Count++;
				if(curFlight.TripIds[1].length==1) {
					directCount2++;
				}
			}				
			if(!self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].oList[curFlight.TripIds]){
				self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].oList[curFlight.TripIds] = curFlight;	
			}
			//minPrice by second trips
				if(curFlight.AmountFare < self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].minPrice) {
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].flight = curFlight;
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].minPrice = curFlight.AmountFare;
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].firstTrips = curFlight.TripIds[0];
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].flightLate = self.MakeOnTimeDirectionInfo(curFlight,1);
				}
			//minSeats by second trips
				/*if(minSeatsTrips != self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].minSeats) {
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].plus = "+";
				}*/
				if(minSeatsTrips < self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].minSeats) {
					self.selectedAK.add.startTime2[ curFlight.html_tmpl.StartTime[1] ][ curFlight.TripIds[1] ].minSeats = minSeatsTrips;
				}

		}		
	}
	//для заголовка в таблице
		if(start1Count==directCount1) {
			this.selectedAK.add.startTime1type = "direct";	
		} else if(directCount1===0){
			this.selectedAK.add.startTime1type = "stops";
		}
		if(start2Count==directCount2) {
			this.selectedAK.add.startTime2type = "direct";
		} else if(directCount2===0){
			this.selectedAK.add.startTime2type = "stops";
		}
	//для шаблонизатора - кол-во строк	
		var rows = (start1Count>start2Count)?start1Count:start2Count;
		while(rows >0){
			self.selectedAK.add.rowsCount.push(1);
			rows--;
		}
	var tempStart1 = [];
	var tempStart2 = [];
	for (var i in self.selectedAK.add.startTime1) {
		var curItems = self.selectedAK.add.startTime1[i];
		for(var j in curItems){
			tempStart1.push(curItems[j]);	
		}		
	}
	for (var i in self.selectedAK.add.startTime2) {
		var curItems = self.selectedAK.add.startTime2[i];
		for(var j in curItems){
			tempStart2.push(curItems[j]);	
		}
	}
	this.selectedAK.showSort = false;
	this.selectedAK.add.startTime1 = tempStart1;
	this.selectedAK.add.startTime2 = tempStart2;
	if (tempStart1.length > 1 || tempStart2.length > 1) {
		this.selectedAK.showSort = true;
		var cookieAKsort = readCookie('AKsort');
		this.selectSortBlock = (cookieAKsort && cookieAKsort!=="")?cookieAKsort:"ByPrice";
		if(this.selectSortBlock =="ByPrice") {
			self.AKsortByPrice();
		} else if(this.selectSortBlock =="ByDeparture") {
			self.AKsortByDeparture();
		} else {
			self.AKsortByTimeFlight();
		}
	} else {
		self.AKsortByTimeFlight();		
	}

	for(var i=0, SL = this.selectedAK.add.startTime1.length; i<SL; i++) {
		var curItem = this.selectedAK.add.startTime1[i];
		addProperties(curItem);
	}	
	for(var i=0, SL = this.selectedAK.add.startTime2.length; i<SL; i++) {
		var curItem = this.selectedAK.add.startTime2[i];
		addProperties(curItem);
	}
	function addProperties(curItem){
		curItem.DiffPriceCount=0;
		var Prices = {};
		for(var j in curItem.oList) {
			var curFlight = curItem.oList[j];
			if(!Prices[curFlight.AmountFare]) {
				Prices[curFlight.AmountFare] = 1;
				curItem.DiffPriceCount++;
			}
		}		
		if(curItem.DiffPriceCount>1) {
			if(tw.language == 'az') {
				curItem.DiffPriceText = formatMoney(curItem.minPrice) + l10n.searchResult.filters.priceFrom + "&thinsp;" + l10n.currency[tw.currency].Symbol;
			} else {
				curItem.DiffPriceText = l10n.searchResult.filters.priceFrom + " " + formatMoney(curItem.minPrice) + "&thinsp;" + l10n.currency[tw.currency].Symbol;
			}
		} else {
			curItem.DiffPriceText = formatMoney(curItem.minPrice) + "&thinsp;" + l10n.currency[tw.currency].Symbol;
		}
	}
};
DrawResults.prototype.PrepareAKFlights = function(){
	var self = this;
	for (var i = 0, FL = this.FlightsToShow.length; i < FL; i++) {
		var curFlight = this.FlightsToShow[i];
		if(curFlight.AK == this.selectedAK.AK && curFlight.direct == this.selectedAK.direct ) {
			this.addTemplateInformation(curFlight);			
			if(!self.selectedAK.tmpl[curFlight.FareId]) {
				self.selectedAK.tmpl[curFlight.FareId] = {AmountFare: curFlight.AmountFare, allDirs: [], FareId: curFlight.FareId};
			}
			for(var DirIndex=0,DirLength=self.allDirectionsLength;DirIndex<DirLength;DirIndex++){
				if(!self.selectedAK.tmpl[curFlight.FareId]['dir'+DirIndex]) {self.selectedAK.tmpl[curFlight.FareId]['dir'+DirIndex] = {}}
				if(!self.selectedAK.tmpl[curFlight.FareId]['dir'+DirIndex][curFlight.TripIds[DirIndex]]) {
					//self.selectedAK.tmpl[curFlight.FareId]['dir'+DirIndex][curFlight.TripIds[DirIndex]] = curFlight;
					self.selectedAK.tmpl[curFlight.FareId]['dir'+DirIndex][curFlight.TripIds[DirIndex]] = {};
					if(!self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex]) {
						self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex] = {DirNum:DirIndex, list:[], column: {
							direct: false,
							stops: false,
							mixed: false
						}};
					}
					if(!curFlight.StartTime) {
						curFlight.StartTime = [];
						for(var Tindex =0, TL=curFlight.TripIds.length;Tindex<TL;Tindex++) {
							curFlight.StartTime.push( self.obj.json.trps[curFlight.TripIds[Tindex][0]].stTm );
						}
					}
					self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].list.push(curFlight);
					//смотрим с пересадкой или прямые или смешаные
						if(!self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.mixed) {
							if(curFlight.TripIds[DirIndex].length>1) {
								self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.stops = true;
							} else {
								self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.direct = true;
							}						
							if(self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.stops && self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.direct) {
								self.selectedAK.tmpl[curFlight.FareId].allDirs[DirIndex].column.mixed = true;
							}
						}
				}
			}
			self.selectedAK.Flights[curFlight.FareId + "_" + curFlight.TripIds] = curFlight;
		}
	}
	var sortIndex=0;
	var SortByStartTime = function(a,b){
		return a.StartTime[sortIndex] - b.StartTime[sortIndex];		
	};	
	var arr = [];
	for(var k in this.selectedAK.tmpl) {
		var curVariants = self.selectedAK.tmpl[k];
		for(var j=0,DL=curVariants.allDirs.length;j<DL;j++){
			sortIndex = j;
			curVariants.allDirs[j].list.sort(SortByStartTime);
		}
		arr.push(self.selectedAK.tmpl[k]); 
	}
	this.selectedAK.tmpl = arr;
	this.selectedAK.tmpl.sort(self.SortByAmountFareAsc);
	//
	arr=null;
	SortByStartTime=null;
	sortIndex=null;
};
DrawResults.prototype.initSimpleAKEvents = function(){
	var self = this;
	if(this.FDirections.length == 2) {
		$('input:radio',this.AKFlightInformation).change(function(){
			self.initSimpleAKTripSelectionEvents(this);
			self.setSimilarPriceButtonWidth();
		});
		//для выбора сразу варианта-строки с мин ценой
		var minPriceRoute = 10000000000;
		var minPriceRow = 0;
		/*for (var i = 0, FL = this.selectedAK.add.startTime1.length; i < FL; i++) {
			if(this.selectedAK.add.startTime1[i].minPrice < minPriceRoute ) {
				minPriceRoute = this.selectedAK.add.startTime1[i].minPrice;
				minPriceRow = i;
			}
		}*/
		/*if (tw.source && tw.source.fn) {
			var flightsDir = tw.source.fn.split("-");
			var FlightsNumbersArray = [];
			for (FlightsDirectionIndex = 0, FDlength = flightsDir.length; FlightsDirectionIndex < FDlength; FlightsDirectionIndex++) {
				FlightsNumbersArray[FlightsDirectionIndex] = [];
				var flightsNum = flightsDir[FlightsDirectionIndex].split(",");
				for( var FlightsIndex =0, FlightsLength = flightsNum.length;FlightsIndex<FlightsLength;FlightsIndex++){
					var curFlightNum = flightsNum[FlightsIndex];
					FlightsNumbersArray[FlightsDirectionIndex].push( curFlightNum );
				}
			}
			var ConfirmFlight;
			for (var FlightIndex = 0, FlightsLength = this.allFlights.length; FlightIndex < FlightsLength; FlightIndex++) {
				var curFlight = this.allFlights[FlightIndex];
				if( String(curFlight.FlightNumbers) == String(FlightsNumbersArray)) {
					ConfirmFlight = curFlight;
					break;
				}
			}
			this.initSimpleAKTripSelectionEvents( $('input:radio',self.AKFlightInformation)[minPriceRow] );
			if(ConfirmFlight){
				FareConfirmation({FlightIndex: ConfirmFlight.FlightIndex, passengerCount: tw.source.pas});
			}
		} else*/ 
		if(tw.source && tw.source.time && self.AKlist.list[tw.source.ak]){
			var list = $('tr[time]',self.AKFlightInformation);
			var row = $('tr[time="'+tw.source.time+'"]',self.AKFlightInformation);
			if(row.length>0){
				this.initSimpleAKTripSelectionEvents( $('input:radio',self.AKFlightInformation)[$(list).index(row)] );
			} else {
				tw.source.popup.time();
				delete tw.source;
				this.initSimpleAKTripSelectionEvents( $('input:radio',self.AKFlightInformation)[minPriceRow] );
			}
		} else {
			this.initSimpleAKTripSelectionEvents( $('input:radio',self.AKFlightInformation)[minPriceRow] );			
		}
	} else {
		for (var i = 0, FL = this.selectedAK.add.startTime1.length; i < FL; i++) {
			var curFlight = this.selectedAK.add.startTime1[i].flight;
			var selectedTrip = document.getElementById(String(curFlight.TripIds[0]));
			var selectedRow = $(selectedTrip).parents('tr')[0];
			var CellPriceButton = $('.cellButton',selectedRow);
			var PriceButton = $('.price_button',CellPriceButton);
			$(PriceButton).attr('flight',curFlight.FlightIndex);
			$('.amount',PriceButton).html(curFlight.html_tmpl.Price);
			$(PriceButton).unbind('click').click(function(){
				FareConfirmation({FlightIndex: $(this).attr('flight')});
			});
			self.simpleAKTripStars(curFlight,selectedRow);
			$('.PriceButtonWrapper',CellPriceButton).removeClass('hideButton');
		}
	}
};
DrawResults.prototype.initSorting = function(){
	var self = this;
	this.RedrawOptions = $('.RedrawOptions', this.AKFlightInformation)[0];
	$(this.RedrawOptions).removeClass('invisible');
	if(this.selectSortBlock =="ByPrice") {
		$('span[data-sort="byPrice"]',this.RedrawOptions).addClass('selected');	
	} else if(this.selectSortBlock =="ByDeparture") {
		$('span[data-sort="ByDeparture"]',this.RedrawOptions).addClass('selected');	
	} else {
		$('span[data-sort="byTravelTime"]',this.RedrawOptions).addClass('selected');
	}
	$(this.RedrawOptions).delegate('span:not(.selected):not(.disabled)', 'click', function(){
		if( $(this).attr('data-sort') == 'byPrice' ) {
			self.AKsortByPrice();
		} else if( $(this).attr('data-sort') == 'ByDeparture' ) {
			self.AKsortByDeparture();			
		} else {
			self.AKsortByTimeFlight();
		}
		self.DrawSelectedAK();
		setCookie({
			name: "AKsort",
			value: self.selectSortBlock,
			days: 180
		});
	});
	if(tw.source){
		delete tw.source;	
	}
};
DrawResults.prototype.AKsortByPrice = function(){
	var self = this;
	var ByPrice = function(a,b){
	    if(a.minPrice == b.minPrice){
			return a.time - b.time;
	    }
	    return a.minPrice - b.minPrice;
	};
	this.selectedAK.add.startTime1.sort(ByPrice);
	this.selectedAK.add.startTime2.sort(ByPrice);
	this.selectSortBlock = "ByPrice";
};
DrawResults.prototype.AKsortByTimeFlight = function(){
	var self = this;
	var ByTimeFlight = function(a,b){
	    if(a.journeyTime == b.journeyTime){
			return a.time - b.time;
	    }
	    return a.journeyTime - b.journeyTime;
	};
	this.selectedAK.add.startTime1.sort(ByTimeFlight);
	this.selectedAK.add.startTime2.sort(ByTimeFlight);
	this.selectSortBlock = "ByTimeFlight";
};
DrawResults.prototype.AKsortByDeparture = function(){
	var self = this;
	var ByDeparture = function(a,b){
		return a.time - b.time;		
	};
	this.selectedAK.add.startTime1.sort(ByDeparture);
	this.selectedAK.add.startTime2.sort(ByDeparture);
	this.selectSortBlock = "ByDeparture";
};
DrawResults.prototype.setSimilarPriceButtonWidth = function(){
	//устанавливаем одинаковую ширину кнопок по максимальному значению в выборке
	var priceButtons = $('.cellButton .price_wrapper');
	$(priceButtons).css({"width":"auto"});
	$('.alternate').css({"display": "none"});
	var maxWidth = 0;
	$(priceButtons).each(function(){
		var curWidth = $(this).width();
		if( curWidth > maxWidth ) {
			maxWidth = curWidth; 
		}
	});
	$(priceButtons).each(function(){
		$(this).css({"width":maxWidth});
		var priceWrapper = $(this).parents('.PriceButtonWrapper')[0];
		if( $(priceWrapper).hasClass('hideButton') ) {
			$(priceWrapper).find('.alternate').css({"display": "block"});
		}
	});
};
DrawResults.prototype.initSimpleAKTripSelectionEvents = function(input){
	var LeftList = $('.simpleVariants .variant_direction');
	$(LeftList).removeClass('selected');
	//$('.m_row_item',LeftList).removeClass('selected');
	//$(input).parents('.m_row_item').addClass('selected');
	$(input).parents('td.variant_direction').addClass('selected');
	$('.simpleVariants .PriceButtonWrapper').addClass('hideButton');
	var RightList = $('.variant'); 
	$(RightList).removeClass('selected');
	$('.opt6',RightList).html('');

	var FirstTripIds = input.id;
	for (var i = 0, FL = this.selectedAK.add.AKFlights.length; i < FL; i++) {
		var curFlight = this.selectedAK.add.AKFlights[i];
		if (curFlight.TripIds[0] == FirstTripIds) {
			var selectedTrip = document.getElementById(String(curFlight.TripIds[1]));
			$(selectedTrip).addClass('selected');
			var CellPriceButton = $(selectedTrip).parents('tr').find('.cellButton');
			var PriceButton = $('.price_button',CellPriceButton);
			$(PriceButton).attr('flight', curFlight.FlightIndex);
			$('.amount', PriceButton).html(curFlight.html_tmpl.Price);
			if(curFlight.SeatAvl == 1) {
				$('.opt6', selectedTrip).html('<span style="color:red">' + curFlight.SeatAvl + '+</span>');
			} else {
				$('.opt6', selectedTrip).html(curFlight.SeatAvl+"+");	
			}			
			$(PriceButton).unbind('click').click(function(){
				FareConfirmation({FlightIndex: $(this).attr('flight')});
			});
			$('.PriceButtonWrapper',CellPriceButton).removeClass('hideButton');
		}
	}
	var spline = $(input).parents('td').find('.Vspline');
	var leftTop =-1;
	for(var i =0, LC= LeftList.length; i<LC; i++) {
		if( $(LeftList[i]).hasClass('selected') ){
			leftTop = i;
			break;
		}
	}
	var rightTop =-1;
	var rightBottom =-1;
	var rightSelected =0;
	for(var i =0, LC= RightList.length; i<LC; i++) {
		if( $(RightList[i]).hasClass('selected') ){
			rightSelected++;
			if(rightTop== -1) {
				rightTop = i;	
			}			
			rightBottom = i;
		}
	}
	var top, bottom;
	//TODO rewrite
	if(leftTop === rightTop || leftTop < rightTop) {
		top = 22;
	} else {
		top = 23 -(leftTop - rightTop)*78;
	}
	if (leftTop === rightBottom || leftTop > rightBottom) {
		bottom = 25;
	} else {
		bottom = 25 -(rightBottom - leftTop)*78;
		if(rightSelected >4) {
			bottom-= Math.floor(rightSelected/4);
		}
	}
	$(spline).css({
		"top": top,
		"bottom": bottom
	});
};
DrawResults.prototype.initAKEvents = function(){
	var self = this;
	/*$('tbody[fr]',this.AKFlightInformation).each(function(){
		var FareId= $(this).attr('fr');
		self.AKTripStars(FareId);
	});*/
	
	$('.single',this.AKFlightInformation).each(function(){
		var row = this;
		var input = $('input',row)[0];
		if (input) {
			var Findex = $(input).attr('findex').split('_');
			var DirNum = $(row).attr('di'); 
			var Flight = self.oFlights[Findex];
			var seats = MinSeatsAvl(Flight.TripsSeatAvl[DirNum]);
			var CurTrips = input.id.split('_')[1];
			//для тайтла  рейсы-рейс считаем кол-во трипов по направлению
			var arr = [];
			var trps= CurTrips.split(',');
			for(var j=0,TL=trps.length;j<TL;j++) {
				if(trps[j]!==''){
					arr.push(trps[j]);	
				}				
			}
			var obj = {
				flightInfo: self.MakeFlightInfos(String(CurTrips)),
				SeatAvl: seats,
				FlightIndex: Flight.FlightIndex,
				TripIds: arr,
				DirNum: DirNum,
				html_tmpl:{flightInfo:[1]}
			};
			obj.html_tmpl.flightInfo = obj.flightInfo.noInfo?[]:[1]; 
			obj.html_tmpl.stars = (self.obj.json.trps[CurTrips.split(',')[0]].stars/2).toFixed(1);
			obj.html_tmpl.halfstar= 0;
			var stars = obj.html_tmpl.stars;
			obj.html_tmpl.stars = Math.floor(stars.split('.')[0]);
			if(stars.split('.')[1]>=3 && stars.split('.')[1]<7) {
				obj.html_tmpl.halfstar= 1;
			}
			if(stars.split('.')[1]>7) {
				obj.html_tmpl.stars+= 1;
			}
			obj.html_tmpl.emptystars = (5-obj.html_tmpl.stars - obj.html_tmpl.halfstar)*14;
			obj.html_tmpl.stars = obj.html_tmpl.stars*14;
			
			var TripsStars= $('.TripsStars',row)[0];
			$.tmpl('tmpl_TripsStars', obj).prependTo(TripsStars);
		}
	});
	
	$('input:radio',this.AKFlightInformation).change(function(){
		var tbody = $(this).parents('tbody');
		$('.m_row_item',tbody).removeClass('selected');
		$(this).parents('div.m_row_item').addClass('selected');
		var FareId = this.id.split('_')[0];
		//self.AKTripStars(FareId);
	});
	//MakeFlightInfos(String(curFlight.TripIds));	
};
DrawResults.prototype.simpleAKTripStars = function(curFlight,row){
	var TripsStars= $('.TripsStars',row)[0];
	$(TripsStars).empty();
	$.tmpl('tmpl_TripsStars', curFlight).prependTo(TripsStars);
	TripsStars=null;
};
/*DrawResults.prototype.AKTripStars = function(id){
	var FareId = id;
	var inputs = $(this.AKFlightInformation).find('.content input[id^="'+FareId+'_"]:checked');
	var selectedTrips = "";
	for(var i=0,IL=inputs.length;i<IL;i++){
		var curTrips = inputs[i].id.split('_')[1];
		if(i!==0) {selectedTrips+=",";}
		selectedTrips+=curTrips;
	}
	var resultSelectedFare = this.selectedAK.Flights[FareId+"_"+selectedTrips];
	var StarsContent = $('#fareCell_'+FareId)[0];
	var TripsStars= $('.TripsStars',StarsContent)[0];
	$(TripsStars).empty();
	$.tmpl('tmpl_TripsStars', resultSelectedFare).prependTo(TripsStars);
	//
	FareId=null;
	inputs=null;
	selectedTrips=null;
	StarsContent=null;
	TripsStars=null;
	resultSelectedFare=null;
};*/
DrawResults.prototype.DestroyAKFlights = function(){
	var self = this;
	//если подробные билеты выбраны
	clearExtraElements();
	if(this.selectedAK) {
		/*$(self.AKFlightInformation).fadeOut(500, function(){
			$('.innerInfo',self.AKFlightInformation).remove();
			self.selectedAK = null;
			//$(self.FlightSliderBlock).fadeIn(500);
			//$(self.FlightsDifficulties).fadeIn(500);
			//$(self.ResultTable).fadeIn(500);
				fadeInBlock(self.FlightSliderBlock);
				fadeInBlock(self.FlightsDifficulties);
				fadeInBlock(self.ResultTable);
		});*/
		if(tw.source){
			delete tw.source;	
		}
		window.location.hash = window.location.hash.split('|')[0];
		fadeOutBlock(self.AKFlightInformation, function(){
			$('.multivariants',self.AKFlightInformation).remove();
			self.selectedAK = null;
			if(!self.SelectedDirectRoutes){
				fadeInBlock(self.FlightSliderBlock);
			}			
			//fadeInBlock(self.FlightsDifficulties);
			if(self.showFlightsDifficulties){
				$(self.FlightsDifficulties).removeClass('invisible');
			}				
			fadeInBlock(self.ResultTable);
			PlanePositioning();
            
            ShadingOut('DrawSelectedAK');
		});
	}
};
DrawResults.prototype.MakeFlightInfos = function(TripIds, isAKinfo){
	var tripNumbers = TripIds.split(',');
	var FlightInfos=[];
	var ageAbs = true;
	for(var i=0,TL=tripNumbers.length;i<TL;i++){
		if(!!tripNumbers[i] && this.obj.json.trps[tripNumbers[i]].flightInfo) {
			FlightInfos.push(this.obj.json.trps[tripNumbers[i]].flightInfo);
			if(!this.obj.json.trps[tripNumbers[i]].ageAbs) {
				ageAbs=false;
			}
		}
	}
	var html_tmpl = {};
	html_tmpl.flightInfo = {
		count: {
			ages: 0,
			delay: 0,
			delay15:0,
			delay30:0,
			late: 0,
			cancelled: 0,
			seatPitch: 0,
			seatPitchE: 0,
			seatsmaxPE: 0,
			seatsminPE: 0,
			seatsmaxPB: 0,
			seatsminPB: 0
		}
	};
	if (FlightInfos.length > 0) {
		var tempAgeAbs;		
		for (var j = 0, FL = FlightInfos.length; j < FL; j++) {
			var curFlightInfo = FlightInfos[j];
			for (var i in curFlightInfo) {
				var curProperty = curFlightInfo[i];
				if (!html_tmpl.flightInfo[i]) {
					html_tmpl.flightInfo[i] = {
						stars: 0,
						value: 0
					};
				}
				html_tmpl.flightInfo.count[i]++;
				html_tmpl.flightInfo[i].stars += parseInt(curProperty.stars,10);
				html_tmpl.flightInfo[i].value += parseInt(curProperty.value,10);
				if(i=="ages"){
					if(!tempAgeAbs) {
						tempAgeAbs = html_tmpl.flightInfo[i].value;
					} else if(tempAgeAbs != html_tmpl.flightInfo[i].value){
						ageAbs = false;
					}
				}
			}
		}
		var oCount = html_tmpl.flightInfo.count;
		for (var j in html_tmpl.flightInfo) {
			curProperty = html_tmpl.flightInfo[j];
			if (j != "count") {
				var curStars = String(curProperty.stars / (oCount[j] * 2)).split('.');
				curProperty.value = curProperty.value / oCount[j];
				var stars = curStars[0];
				var halfstars = curStars[1] ? 1 : 0;
				curProperty.width = {};
				curProperty.width.stars = stars * 14;
				curProperty.width.halfstar = halfstars * 14;
				curProperty.width.emptystars = (5 - stars - halfstars) * 14;
				//
				curStars = null;
				stars = null;
				halfstars = null;
			}
		}
	} else {
		html_tmpl.flightInfo.noInfo =true;
	}
	html_tmpl.flightInfo.ageAbs = ageAbs;
	if(this.obj.cs != "B"){
		delete html_tmpl.flightInfo.seatsmaxPB;
		delete html_tmpl.flightInfo.seatsminPB;
	}
	return html_tmpl.flightInfo;
};

function TicketFlightStars(){
	$('.fid').live('mouseenter click',function(e){		
		var el = this;
		var fid = $(el).attr('fid');
		var id = el.id.split('_');
		var trips = $(el).attr('trips');

		if(e.type == "click") {			
			if(infoBaloonHidden){
				try{
					showBaloon();				
					infoBaloonHidden=false;	
				} catch(e){}
			}		
		} else {
			setTimeout( function(){
				if(infoBaloonHidden){
					var mouseTarget = mouseEvent.target; 
					 mouseTarget = ($(mouseTarget).hasClass('stars_block')|| !$(mouseTarget).parents('.stars_block')[0]) ? mouseTarget : $(mouseTarget).parents('.stars_block')[0];
					 if($(mouseTarget).attr('fid') == fid ){
					 	try{
							showBaloon();
						} catch(e){}					 	
					 }
				}
			},300);		
		}
		showBaloon = function(){
			var AKstat = false;
			var TripsStat = false;
			if(id[1]) {AKstat = true;}
			if(trips) {TripsStat = true;}
			if( document.getElementById("stars_"+String(fid)) || document.getElementById("stars_"+String(id)) ){
				return;
			}
			removeInfoBaloon();
			if( !$(el).hasClass('StarsInformation') && !AKstat){
				return;
			}
			var viewRating = 'flight';
			if(AKstat) {
				viewRating = 'airline';
				if(id[1].length>2){
					viewRating = 'alliance';
				}
				var FlightNumbers = id[2].split(',');
				var curAK = tw.oResult.OperatedAK[id[1]];
				if (!curAK.flightInfo) {
					curAK.flightInfo = [];
					for (var FlightIndx = 0, FlightsLength = FlightNumbers.length; FlightIndx < FlightsLength; FlightIndx++) {
						var curFlight = tw.oResult.oFlights[FlightNumbers[FlightIndx]];
						curAK.flightInfo[FlightIndx] = tw.oResult.MakeFlightInfos(String(curFlight.TripIds));
					}
					curAK.AKflightInfo = tw.oResult.MakeFlightInfos(String(curAK.TripIds), true);
				}
				var baloon = $.tmpl('tmpl_BaloonFlightStars', curAK)[0];
				$(baloon).attr('id',"stars_"+id).appendTo('body');
				var target = ($(e.target).hasClass('stars_block')|| !$(e.target).parents('.stars_block')[0]) ? e.target : $(e.target).parents('.stars_block')[0];
			} else if(TripsStat) {
				resultFlight={
					flightInfo: tw.oResult.MakeFlightInfos(String(trips)),
					TripIds: trips
				}
				var baloon = $.tmpl('tmpl_BaloonFlightStars', resultFlight)[0];
				$(baloon).attr('id',"stars_"+fid).appendTo('body');
				var target = $(e.target).hasClass('stars_block') ? e.target : $(e.target).parents('.stars_block')[0];
			} else {
				var resultFlight = tw.oResult.oFlights[fid];
				if(!resultFlight.flightInfo) {
					resultFlight.flightInfo = tw.oResult.MakeFlightInfos(String(resultFlight.TripIds));
				}	
				var baloon = $.tmpl('tmpl_BaloonFlightStars', resultFlight)[0];
				$(baloon).attr('id',"stars_"+fid).appendTo('body');
				var target = $(e.target).hasClass('stars_block') ? e.target : $(e.target).parents('.stars_block')[0];
			}
			//убираем звёзды в раскрытом и заголовок
				if( $(el).parents('.multivariants').length>0 ){
					$('div[class*="info_"]',baloon).addClass('invisible');
					$('div[class="ratingInfo"]',baloon).addClass('invisible');	
				}				
			var baloon_pos = $(target).offset();
			var top = baloon_pos.top - $(baloon).height() - 8;	
			if($(el).hasClass('revert') || AKstat){
				$(baloon).addClass('revert');
				$(baloon).css({
					left: baloon_pos.left - $(baloon).width() + 320,
					top: top
				});
			} else {
				$(baloon).css({
					left: baloon_pos.left,
					top: top
				});
			}
			if(top < $(window).scrollTop()+10) {
				$(baloon).addClass('bottom').css({top: baloon_pos.top + 44});
			}
			fadeInBlock(baloon);
			infoBaloonHidden = false;
			$(document.body).trigger({
				type: "showRating",
				view: viewRating
			});

			baloon = null;
			target = null;
			baloon_pos = null;
			FlightInfos=null;
		};
	});
	$('.fid').die('mouseleave');
	$('.fid').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	$('.airport').die('mouseleave');
	$('.airport').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	$('.stars_baloon').die('mouseleave');
	$('.stars_baloon').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	function HideBaloonInfo(){
		setTimeout(function(){
			var mouseTarget = mouseEvent.target,
					  airportId,
					  baloonId;
			if($(mouseTarget).hasClass('stars_baloon') || $(mouseTarget).parents('.stars_baloon')[0]){
				return;
			} else if($(mouseTarget).hasClass('stars_block') || $(mouseTarget).parents('.stars_block')[0]){
				var el = $(mouseTarget).hasClass('stars_block')?mouseTarget: $(mouseTarget).parents('.stars_block')[0];
				if( $('#stars_'+ $(el).attr('fid')).length>0 ){
					return;
				} else {removeInfoBaloon();}
			} else if($(mouseTarget).hasClass('airport')) {
				airportId = $(mouseTarget).attr('id');
				baloonId = airportId ? airportId.replace('airport_', 'airportInfo_') : null;
				if (baloonId && $('#' + baloonId).length > 0) {
					return;
				} else {removeInfoBaloon();}
			} else {
				removeInfoBaloon();
			}
		},300);	
	}
}

function getFareConfirmationParams(obj){
	var resultFlight;
	if (obj.AKflight) {
		var selectedTrips = "";
		var inputs = $('.FlightsByAKBlock .content input[id^="' + obj.FareId + '_"]:checked');
		for (var i = 0, IL = inputs.length; i < IL; i++) {
			var curTrips = inputs[i].id.split('_')[1];
			if (i !== 0) {
				selectedTrips += ",";
			}
			selectedTrips += curTrips;
		}
		resultFlight = tw.oResult.selectedAK.Flights[obj.FareId + '_' + selectedTrips];
		selectedTrips = null;
		input = null;
	} else if(obj.confirm){
		resultFlight = obj.confirm;
	} else {
		resultFlight = tw.oResult.oFlights[obj.FlightIndex];
	}
	var selectedFare = tw.oResult.oFares[resultFlight.FareId];
	var params = {
		gdsInfo: tw.oResult.obj.json.gdsInfs[selectedFare.gdsInf].hash,
		fareKey: selectedFare.frKey,
		routeKey: tw.oResult.obj.getKey(),
		trips: []
	};
	if(resultFlight.combined) {
		params.fareKeyRT = selectedFare.frKeyRT;
	}
	params.kmqSelection = obj.kmqSelection;
	//sirena
		if(selectedFare.extId) {
			params.extId = selectedFare.extId;
		}
	try{
		var portalReferrerCookieData = readCookie('referrer');
		if (portalReferrerCookieData) {
			var portalReferrerCookieDataParts = portalReferrerCookieData.split('|');
			params.source = portalReferrerCookieDataParts[0];
			params.linkId = portalReferrerCookieDataParts[1];
			params.srcmarker = portalReferrerCookieDataParts[2];
		}
	} catch(e){}
	var arrTr = String(resultFlight.TripIds).split(',');
	var arrCls = String(resultFlight.Classes).split(',');
	var arrSrvCls = String(resultFlight.ServiceClasses).split(',');
	var arrSeats = String(resultFlight.TripsSeatAvl).split(',');
	for (var i = 0, l = arrTr.length; i < l; i++) {
		if (arrTr[i] === '') {
			break;
		}
		var trip = tw.oResult.obj.json.trps[arrTr[i]];
			trip.reservClass = arrCls[i];
			trip.serviceClass = arrSrvCls[i];
			trip.stAvl = arrSeats[i];
			trip.planeStr = tw.oResult.obj.json.planes[trip.plane];
		params.trips.push(trip);
	}
	selectedFare.stAvl = resultFlight.SeatAvl;
	params.FlightIndex = resultFlight.FlightIndex;
	params.DateCreated = tw.oResult.obj.DateCreated;
	if(obj.passengerCount) {params.passengerCount = obj.passengerCount;}
	params.Segments = arrTr.length;
	params.Operating = resultFlight.EveryTripAK;
	params.Marketing = resultFlight.EveryDirectionAK;
	params.BookingClass = resultFlight.Classes;
	params.Stops = 0;
	for(var si=0, sl= resultFlight.StopTimes.length; si<sl; si++){
		params.Stops+= resultFlight.StopTimes[si].length;
	}
	return {
		params: params,
		fare: selectedFare
	};
}
function FareConfirmation(obj){
    
    var noClass = /noFareConfirmation/;
    if (noClass.test(event.target.className)) {
        return false;
    }
    
	$.scrollTo(0, 500);
	//kmq
		var mark = $(obj.element).data('markclass');
		obj.kmqSelection;
		if(mark) {
			switch(mark){
				case 'reliable':
					kmqRecord({name: 'select_reliable_fare'});
					obj.kmqSelection = 'reliable';
					break;
				case 'time':
					kmqRecord({name: 'select_fastest_fare'});
					obj.kmqSelection = 'fastest';
					break;
				case 'price':
					kmqRecord({name: 'select_cheapest_fare'});
					obj.kmqSelection = 'cheapest';
					break;
				case 'price_direct':
					kmqRecord({name: 'select_cheapest_direct_fare'});
					obj.kmqSelection = 'cheapest_direct';
					break;
			}
		} else if(tw.oResult && tw.oResult.isAKVisible){
			kmqRecord({name: 'select_more_fare'});
			obj.kmqSelection = 'airline_more';
		} else {
			kmqRecord({name: 'select_fare_other'});
			obj.kmqSelection = 'other';
		}
		delete obj.element;
	var data = getFareConfirmationParams(obj);
	if (!objPassengerSelect) {
		_gaq.push(['_trackPageview','/pricebuttonclick']);
		objPassengerSelect = new PassengerSelect(data);
	} else {
		objPassengerSelect.show(data);
	}
}

function ShowTrip(FlightIndex,DirNum){
	var resultFlight =  tw.oResult.oFlights[FlightIndex];
	var arrTrips = [];
	var arrTr = String(resultFlight.TripIds).split(',');
	var arrCls = String(resultFlight.Classes).split(',');
	var arrSrvCls = String(resultFlight.ServiceClasses).split(',');
	for (var i = 0, l = arrTr.length; i < l; i++) {
		if (arrTr[i] === '') {break;}
		var trip = tw.oResult.obj.json.trps[arrTr[i]];
			trip.srvCls = arrSrvCls[i];
			trip.cls = arrCls[i];
			trip.planeStr = tw.oResult.obj.json.planes[trip.plane];
			arrTrips.push(trip);
	}
	arrDirections = [];
	function Direction(){
		this.trips = [];
		this.duration = 0;
	}
	var direction = new Direction();
	//var curDate = new Date().valueOf();	
	for (var i = 0, length = arrTrips.length; i < length; i++) {
		var trip = arrTrips[i];
		trip.stDt_Date = Date.parseAPI(trip.stDt);
		trip.endDt_Date = new Date(trip.stDt_Date.getTime());
		if (trip.dayChg) {
			trip.endDt_Date.setDate(trip.endDt_Date.getDate() + trip.dayChg);
		}
		trip.stDt_Date.setAPITime(trip.stTm);
		trip.endDt_Date.setAPITime(trip.endTm);
		try {
			makeStarsBlock(trip);
		} catch (e) {}
		direction.trips.push(trip);
		direction.duration += DurationAPIToMinutes(trip.fltTm) * 60000;
		if (direction.trips.length > 1) {
			direction.duration += trip.stDt_Date - direction.trips[direction.trips.length - 2].endDt_Date;
		}
		if (!trip.conx) {
			arrDirections.push(direction);
			direction = new Direction();
		}
	}
	var data = {directions: arrDirections};
	if(DirNum!==null) {
		var singleDir = arrDirections[DirNum];
		//singleDir.trips[0].ticketCmp = arrDirections[0].trips[0].airCmp;
		data = {directions: [singleDir], concreteDir: DirNum};
	}
	if(!resultFlight.combined){
		data.AKform = arrTrips[0].airCmp;
	}
	tw.TripsForStars ={
		trps: arrTrips,
		arrDirections:  arrDirections
	};
	var div = document.createElement('div');
	if(resultFlight.combined && !DirNum && arrDirections[0].trips[0].airCmp != arrDirections[1].trips[0].airCmp){//и если разные АК туда и обратно
		for(var DirIndex=0, DL=arrDirections.length; DirIndex<DL; DirIndex++ ){
			var curDir = arrDirections[DirIndex];
			var showAKbelow = false;
			if(DirIndex==1) {
				showAKbelow = true;
			}
			var curData = {directions: [curDir], concreteDir: DirIndex};
			$.tmpl('tmpl_Ticket',curData, {bottomAKpanel: showAKbelow}).appendTo( div );
		}
	} else {
		$.tmpl('tmpl_Ticket',data).appendTo( div );
	}

	$('.direction:last', div).append(simpleCloseButton);

	fadeIn();
	addPopup({
		dom: div,
		className: "TripsInfo",
		close_button: true
	});
	$('#fadeBlock').one('click',function(){removePopup();});
}