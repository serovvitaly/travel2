$(function(){
	$.template( 'tmpl_TripStars', $("#tmpl_TripStars").trim());
	$.template( 'tmpl_BaloonFlightStars', $("#tmpl_BaloonFlightStars").trim());
	makeTripStars();
});

function makeTripStars(){
	$('.TripStars').live('mouseenter click',function(e){
		var el = this;
		var tripinfo = $(el).attr('tripinfo').split(',');
		var dir = tripinfo[0];
		var tripIndex = 0;
		if(!tw.TripsForStars){
			tw.TripsForStars = {
				arrDirections:objOrder.arrDirections,
				trps:objOrder.json.trps
			};
		}
		for(var i =0, TL= tw.TripsForStars.arrDirections.length; i < dir; i++){
			tripIndex+= tw.TripsForStars.arrDirections[i].trips.length;
		}
		tripIndex+= parseInt(tripinfo[1],10);
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
					 if($(mouseTarget).attr('tripinfo') == tripinfo ){
					 	try{
							showBaloon();
						} catch(e){}					 	
					 }
				}
			},300);		
		}
		showBaloon = function(){
			if( document.getElementById("stars_"+String(tripinfo)) ){
				return;
			}
			removeInfoBaloon();
			resultFlight={
				flightInfo: MakeFlightInfos(String(tripIndex)),
				TripIds: tripIndex
			}
			var baloon = $.tmpl('tmpl_BaloonFlightStars', resultFlight)[0];
			$(baloon).attr('id',"stars_"+tripinfo).appendTo('body');
			var target = $(e.target).hasClass('stars_block') ? e.target : $(e.target).parents('.stars_block')[0];
			var baloon_pos = $(target).offset();
			//var parentInfo = $(target).parents('.TripsInfo')[0];
			var top = baloon_pos.top - $(baloon).height() - 8;
			$(baloon).css({
				left: baloon_pos.left,
				top: top,
				position: 'absolute'
			});
			if(top < 0) {
				$(baloon).addClass('bottom').css({top: baloon_pos.top + 44});
			}
			fadeInBlock(baloon);
			infoBaloonHidden = false;
			$(document.body).trigger({
				type: "showRating",
				view: "flight"
			});
			//
			baloon = null;
			target = null;
			baloon_pos = null;
			FlightInfos=null;
		};
	});
	$('.TripStars').die('mouseleave');
	$('.TripStars').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	$('.stars_baloon').die('mouseleave');
	$('.stars_baloon').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	function HideBaloonInfo(){
		setTimeout(function(){
			var mouseTarget = mouseEvent.target;
			if($(mouseTarget).hasClass('stars_baloon') || $(mouseTarget).parents('.stars_baloon')[0]){
				return;
			} else if($(mouseTarget).hasClass('stars_block') || $(mouseTarget).parents('.stars_block')[0]){
				var el = $(mouseTarget).hasClass('stars_block')?mouseTarget: $(mouseTarget).parents('.stars_block')[0];
				if( $('#stars_'+ $(el).attr('tripinfo')).length>0 ){
					return;
				} else {removeInfoBaloon();}
			} else {
				removeInfoBaloon();
			}
		},300);		
	}
}
MakeFlightInfos = function(TripIds){
	var tripNumbers = TripIds.split(',');
	var FlightInfos=[];
	var ageAbs = true;
	for(var i=0,TL=tripNumbers.length;i<TL;i++){
		if(!!tripNumbers[i] && tw.TripsForStars.trps[tripNumbers[i]].flightInfo) {
			FlightInfos.push(tw.TripsForStars.trps[tripNumbers[i]].flightInfo);
			if(!tw.TripsForStars.trps[tripNumbers[i]].ageAbs) {
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
	return html_tmpl.flightInfo;
}

function makeStarsBlock(trip){
//звездатость
	if(!( (trip.flightInfo && trip.flightInfo.stars>=0) || trip.stars )){
		return;
	}
	var defStars = trip.stars? parseInt(trip.stars,10) : parseInt(trip.flightInfo.stars,10);
	if(!trip.html_tmpl) {
		trip.html_tmpl = {};
	}
	trip.html_tmpl.stars = (defStars/2).toFixed(1);
	trip.html_tmpl.halfstar= 0;
	var stars = trip.html_tmpl.stars;
	trip.html_tmpl.stars = Math.floor(stars.split('.')[0]);
	if(stars.split('.')[1]>=3 && stars.split('.')[1]<7) {
		trip.html_tmpl.halfstar= 1;
	}
	if(stars.split('.')[1]>7) {
		trip.html_tmpl.stars+= 1;
	}
	trip.html_tmpl.emptystars = (5-trip.html_tmpl.stars - trip.html_tmpl.halfstar)*14;
	trip.html_tmpl.stars = trip.html_tmpl.stars*14;
}