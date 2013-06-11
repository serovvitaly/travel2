var tmpl_topPanel2Button = '<a href="${href}" class="button ${className}"><div class="l"></div><div class="r"></div><div class="c"></div>${title}</a>';
var tmpl_FieldStyle = '<div class="field2"><div class="fade"></div></div>';
var tmpl_Blank, tmpl_Ticket, tmpl_Form; /* IE<9 bug */
var disablePassExpire=true;
var objOrder;
$(function(){
	if(!tw.franchise.local && !tw.franchise.com) {
		//$('#logo').attr('href','http://onetwotrip.'+tw.franchise.a);
	}
	tmpl_Blank = $("#tmpl_Blank").trim();
	tmpl_Ticket = $("#tmpl_Ticket").trim();
	tmpl_Form = $("#tmpl_Form").trim();
	tmpl_Card = $("#tmpl_Card").trim();
	$(document.body).bind("removeUnloadReservation", function(){
		$(window).unbind('beforeunload unload');
	});
	setSortCountriesArray();
	objOrder = new Makeorder();

	//initAirportTooltips();
});

function CancelReservation(){
	kmqRecord({name: 'CR_PaymentPage', obj: {'CancelationReservationPage': 'payment'}});
	$.ajax({
		type: "post",
		async: false,
		dataType: "jsonp",
		url: 'https://secure.onetwotrip.com/_api/confirmation/cancelconfirm/?async=true',
		data: {
			"id": objOrder.json.reservations[0].confirmationId
		},
		success: function(){}
	});
}

function initAirportTooltips() {
	$('.airport').die('mouseleave');
	$('.airport').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	$('.stars_baloon').die('mouseleave');
	$('.stars_baloon').live('mouseleave',function(e){
		HideBaloonInfo();
	});
	function HideBaloonInfo() {
		setTimeout(function() {
			var mouseTarget = mouseEvent.target,
					  airportId,
					  baloonId;
			if ($(mouseTarget).hasClass('stars_baloon') || $(mouseTarget).parents('.stars_baloon')[0]) {
				return;
			} else if ($(mouseTarget).hasClass('airport') || $(mouseTarget).closest('.airport').length) {
				airportId = $(mouseTarget).attr('id');
				baloonId = airportId ? airportId.replace('airport_', 'airportInfo_') : null;
				if (baloonId && $('#' + baloonId).length > 0) {
					return;
				} else {
					removeInfoBaloon();
				}
			} else {
				removeInfoBaloon();
			}
		}, 300);
	}
	MakeAirportTooltips();
}

function Makeorder(){
	var self = this;
	this.topPanel2spreader = document.getElementById("topPanel2spreader");
	this.setPageTitle();
	this.params = getURLParams();
	this.PrevHref = "http://";
	this.PrevHref += (tw.franchise.local)?window.location.hostname:'onetwotrip.'+tw.franchise.a;
	this.PrevHref += "/?s#" + this.params.r;
	if (this.params.B) {
		this.PrevHref += "&B";
	}
	if (this.params.F) {
		this.PrevHref += "&F";
	}
	if (this.params.id) {
		if (this.params.r) {
			this.setPageButtons();
		}
		this.getInfo(this.params);
	} else {
		warn("Makeorder - 404");
	}
    
}
Makeorder.prototype.setPageTitle = function(){
	var elTitle = document.createElement("div");
		elTitle.id = "pageTitle";
		elTitle.innerHTML = l10n.makeorder.title[0];
	//this.topPanel2spreader.appendChild(elTitle);
};
Makeorder.prototype.setPageButtons = function(type){
	var self = this;
	$(".button", this.topPanel2spreader).remove();
	if (document.referrer.indexOf('/p/') > 0) type = 'fromProfile';
	switch (type) {
		case "createorder":
		case "fromProfile":
			break;
		default:
			$.tmpl(tmpl_topPanel2Button, {
				title: l10n.makeorder.title[1],
				className: "back",
				href: this.PrevHref
			}).appendTo(this.topPanel2spreader);
	}
	window.scrollTo(0, 0);
};
Makeorder.prototype.getInfo = function(params){
	var self = this;
	var request = {
		id: params.id,
        source: twiket.setup.source,
        srcmarker: twiket.setup.marker
	};
	if (this.params.B) {
		request.r += "&B";
	}
	var requestOptions = {
		repeats: 1,
		backupRepeats: true,
		RetryFunction: function(){
			MakeRequest();
		}
	};
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			dataType: "jsonp",
			url: "https://secure.onetwotrip.com/_api/confirmation/getcheckavailresult1/",
			data: request,
			timeout: 20000,
			success: function(json){
				if (json.trps) {
					if(!json.createdByAuthorizedUser) {//cancel
						if(!browser.chrome && !browser.safari) {
							$(window).bind('beforeunload',function(e){
								var obj = {reservations: json.reservations};
								var div = document.createElement('div');
								$.tmpl($("#tmpl_CancelReservation").trim(), obj).appendTo( div );
								addPopup({
									close_button: true,
									className: "commonPopup",
									dom: div,
									button: l10n.popup.close,
									actionButton: "removePopup();"
								});
								var message = l10n.makeorder.cancelReservation.unloadMessage,
								e = e || window.event;
								if (e) {
									e.returnValue = message;
								}
								return message;
							});
						} else {
							$(window).bind('beforeunload',function(e){
								var addText = l10n.order.warn + '\n' + l10n.makeorder.cancelReservation.comment + '\n\n';
								var allPasCount = json.reservations[0].passengers.length;
								var pasCount = 0;							
								for(var ResInd=0, ResL = json.reservations.length; ResInd < ResL; ResInd++){
									var curRes = json.reservations[ResInd];
									if(json.reservations[ResInd+1]) {
										allPasCount+= json.reservations[ResInd+1].passengers.length;										
									}
									for(var PasInd=0, PasL = curRes.passengers.length; PasInd < PasL; PasInd++) {
										pasCount++;
										var curPas = curRes.passengers[PasInd];
										addText+= curPas.lastName + ' ' + curPas.firstName;
										if(pasCount < allPasCount) { addText += '\n';}
									}
								}
								if(browser.chrome){
									fadeIn();
									setTimeout(function(){
										fadeOut();
									},0);								
								}
								var message = l10n.makeorder.cancelReservation.unloadMessage + '\n\n' + addText,
								e = e || window.event;
								if (e) {
									e.returnValue = message;
								}
								return message;
							});
						}
						$(window).bind('unload',function() {
							CancelReservation();
						});
					}
						
					for (var TripsIndex = 0, TripsLength = json.trps.length; TripsIndex < TripsLength; TripsIndex++) {
						var curTrip = json.trps[TripsIndex];
						if ((ref.getCity(curTrip.from).Parent != "RU" && ref.getCity(curTrip.from).Parent != "UA") || (ref.getCity(curTrip.to).Parent != "RU" && ref.getCity(curTrip.to).Parent != "UA")) {
							disablePassExpire = false;
						}
						//for stars
							try {
								makeStarsBlock(curTrip);
							} catch (e) {}
					}
					tw.currencyRates = json.currencies;
					self.json = json;
					self.now = new Date(Date.parse(self.json.date));
					if(!isValidDate(self.now)) {self.now = new Date();}
					self.removeEmptyReservations();
					self.getDirections();
					self.analyzeFlight();
					self.checkAlliances();
					self.calcTransactions();
					self.createRequest();
					self.setBlank();
					self.makeDataFlight();
					if (self.json.isAuth && self.json.cards[0]) {
						self.setCardsList();
					}
				} else {
					addPopup({
						error: true,
						reason: l10n.popup.card.prereservation[0],
						comment: l10n.popup.card.prereservation[1],
						button: l10n.popup.card.newSearch,
						actionButton: "window.location.href = '" + self.PrevHref + "'"
					});
				}
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr, requestOptions);
			}
		});
	}
};
Makeorder.prototype.removeEmptyReservations = function(){
	for (var i = this.json.reservations.length - 1; i > 0; i--) {
		var reservation = this.json.reservations[i];
		if (!reservation.reserved) {
			this.json.reservations.splice(i, 1);
		}
	}
};
Makeorder.prototype.getDirections = function(){
	this.arrDirections = [];
	function Direction(){
		this.trips = [];
		this.duration = 0;
	}
	this.multiAKflight = false;
		var multiAK = {};
		var AKcount = 0;
	var direction = new Direction();
	for (var i = 0, length = this.json.trps.length; i < length; i++) {
		var trip = this.json.trps[i];
			trip.stDt_Date = Date.parseAPI(trip.stDt);
			trip.endDt_Date = new Date(trip.stDt_Date.getTime());
		if (trip.dayChg) {
			trip.endDt_Date.setDate(trip.endDt_Date.getDate() + trip.dayChg);
		}
			trip.stDt_Date.setAPITime(trip.stTm);
			trip.endDt_Date.setAPITime(trip.endTm);
		if (trip.bg) {
			if (trip.bg.substr(trip.bg.length - 1) == "K") {
				trip.bgType = "K";
				trip.bg = trip.bg.substring(0, trip.bg.length - 1);
			} else {
				trip.bgType = "PC";
				trip.bg = trip.bg.substring(0, trip.bg.length - 2);
			}
		}
		direction.trips.push(trip);
		direction.duration += DurationAPIToMinutes(trip.fltTm) * 60000;
		if(direction.trips.length > 1){
			direction.duration += trip.stDt_Date - direction.trips[direction.trips.length - 2].endDt_Date;
		}
		if (!trip.conx) {
			this.arrDirections.push(direction);
			direction = new Direction();
		}
		if(!multiAK[trip.airCmp]) {
			multiAK[trip.airCmp] = 1;
			AKcount++;
		}
		if(trip.oprdBy && !multiAK[trip.oprdBy]) {
			multiAK[trip.oprdBy] = 1;
			AKcount++;
		}
	}
	if(AKcount>1) {
		this.multiAKflight = true;
	}
	//ggl
	this.gglRoute = '';
	for(var dirInd=0, DL=this.arrDirections.length; dirInd< DL; dirInd++){
		var curDirInFlight = this.arrDirections[dirInd];
		this.gglRoute+=curDirInFlight.trips[0].from+'/'+curDirInFlight.trips[curDirInFlight.trips.length-1].to;
		if(dirInd != DL-1) {this.gglRoute+= '/';}
	}
};
Makeorder.prototype.analyzeFlight = function(){
	this.domesticFlight = true;
	var startCountry = ref.getCountryCode(this.json.trps[0].from);
	for(var i = 0, length = this.json.trps.length; i < length; i++){
		var trip = this.json.trps[i];
		if(ref.getCountryCode(trip.from) != startCountry || ref.getCountryCode(trip.to) != startCountry){
			this.domesticFlight = false;
			break;
		}
	}
};
Makeorder.prototype.checkPriceDiff = function(){
	if(this.PricesCheck.showPriceDiff) {
		var maxSumPrice=0,SumByTypes=0;
		for(var i in this.PricesCheck.ppl){
			var c = 0;
			var curPasType = this.PricesCheck.ppl[i];
			if(curPasType.max){
				c = curPasType.count*curPasType.max;
				SumByTypes += curPasType.sum;
			}
			maxSumPrice += c;
		}
		var SumDiff = maxSumPrice-SumByTypes;
		var percent = Math.ceil(SumDiff/(SumByTypes/100));
		var economy = formatMoney(Math.ceil(SumDiff)) + "\u00A0" + CurrencyString(Math.ceil(SumDiff),this.PricesCheck.currency);
		var text = l10n.order.lowseats.replaceByHash({"economy": economy, "percent": percent });
		addPopup({
			error: true,
			attention: true,
			comment: text,
			close_button: true,
			button: l10n.order.actions[0],
			actionButton: "removePopup();"
		});
	}
};
Makeorder.prototype.checkAlliances = function(){
	this.ak = this.json.trps[0].airCmp;
	this.alliance = null;
	for (var i in ref.Alliances) {
		for (var j in ref.Alliances[i]) {
			if (this.ak == j) {
				this.alliance = i;
				return;
			}
		}
	}
};
Makeorder.prototype.calcTransactions = function(useBonus){
	var pmtVrntsHash = {};
	var pmtVrnts = this.json.pmtVrnts;
	if(useBonus){
		pmtVrnts = this.json.pmtVrntsBonus;
		this.json.pmtVrntsBonusHash = pmtVrntsHash;
	} else {
		this.json.pmtVrntsHash = pmtVrntsHash;
	}
	for (var p = 0, length_p = pmtVrnts.length; p < length_p; p++) {
		var pmtVrnt = pmtVrnts[p];
			pmtVrnt.amount = 0;
			pmtVrnt.totals = {};
		pmtVrntsHash[pmtVrnt.tag] = pmtVrnt;
		for (var r = 0, length_r = this.json.reservations.length; r < length_r; r++) {
			var reservation = this.json.reservations[r];
			var transactions = reservation.pmtVrnts_new[pmtVrnt.tag].transactions;
			if(useBonus){
				transactions = reservation.pmtVrntsBonus[pmtVrnt.tag].transactions;
			}
			for (var t = 0, length_t = transactions.length; t < length_t; t++) {
				var transaction = transactions[t];
				pmtVrnt.amount += convertCurrency(transaction.total, transaction.cur);
				if (!pmtVrnt.totals[transaction.paySystem]) {
					pmtVrnt.totals[transaction.paySystem] = {
						cur: transaction.cur,
						amt: transaction.total
					};
				} else {
					pmtVrnt.totals[transaction.paySystem].amt += transaction.total;
				}
			}
		}
		pmtVrnt.amount = pmtVrnt.amount.toFixed(2);
	}
	pmtVrnts.sort(function(a, b){
		if (a.amount > b.amount) return 1;
		if (a.amount < b.amount) return -1;
		return 0;
	});
	if (this.json.pmtVrntsBonus && !this.json.pmtVrntsBonusHash) {
		this.calcTransactions(true);
	}
};
Makeorder.prototype.createRequest = function(){
	this.request = this.params;
	this.request.creditCard = {cvv: ""};
	this.request.reservations = [];
	this.request.newProcess = true;
	if (this.json.src) this.request.source = this.json.src;
	if (this.json.linkId) this.request.linkId = this.json.linkId;
	if (this.json.srcmarker) this.request.srcmarker = this.json.srcmarker;
	this.request.confirmationId = this.json.id;
	this.request.email = this.json.email;
	this.request.phone = this.json.phone;
	this.request.customerLanguage = tw.language;
	for (var i = 0, length_i = this.json.reservations.length; i < length_i; i++) {
		var reservation = this.json.reservations[i];
		reservation.refund = true;

		this.request.reservations[i] = {
			id: reservation.id,
			passengers: []
		};

		if(reservation.infMsgs){
			for(var infMsgsIndex=0, infMsgsL = reservation.infMsgs.length; infMsgsIndex< infMsgsL; infMsgsIndex++) {
				if(reservation.infMsgs[infMsgsIndex].cd == "NO_REFUND") {
					reservation.refund = false;
				}
			}			
		}
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++) {
			var passenger = reservation.passengers[j];
			this.request.reservations[i].passengers[j] = {
				id: passenger.id,
				ageType: passenger.ageType,
				gender: passenger.gender,
				lastName: passenger.lastName,
				firstName: passenger.firstName,
				birthDate: passenger.birthDate ? passenger.birthDate : null,
				passNumber: passenger.passNumber ? passenger.passNumber : "",
				passCountry: passenger.passCountry ? passenger.passCountry : "",
				passExpDate: passenger.passExpDate ? passenger.passExpDate : null,
				needPassExpDate: passenger.needPassExpDate === true || passenger.needPassExpDate === false ? passenger.needPassExpDate : !this.domesticFlight,
				freqFlyerNumber: ""
			};
		}
	}
};
Makeorder.prototype.setBlank = function(){
	this.elBlank = $.tmpl(tmpl_Blank)[0];
	this.setTicket();
	this.setUSVisaInfo();
	this.setForm();
	removeLoader();
	document.getElementById("layout_body").appendChild(this.elBlank);
	this.checkPriceDiff();
};
Makeorder.prototype.makeDataFlight = function(){
	var self = this;
	var routeKey = this.params.r||this.json.routeKey;
	var today = this.now;
	var startDate = this.json.trps[0].stDt_Date;
	var DepthSearch = parseInt( Math.floor( (startDate.valueOf() - today.valueOf())/(86400000) ), 10);
	var StartMonth = startDate.getMonth()+1;
	var Duration = 0;
	if(routeKey.length == 14) {
		var endDate = this.json.trps[this.json.trps.length-1].endDt_Date;
		var Duration = parseInt( Math.floor( (endDate.valueOf() - startDate.valueOf() )/(86400000) ), 10);
	}
	var pointFrom = routeKey.substring(4,7);
	var pointTo = routeKey.substring(7,10);
	var countryFrom = ref.getCountryCode(pointFrom);
	var cityFrom = ref.getCityCode(pointFrom);
	var countryTo = ref.getCountryCode(pointTo);
	var cityTo = ref.getCityCode(pointTo);
	var FlightType = (countryFrom==countryTo)?'DOM':'INT';
	this.kmqFlight = {
		"DepthSearch": DepthSearch,
		"StartMonth": StartMonth,
		"cityFrom": cityFrom,
		"countryFrom": countryFrom,
		"cityTo": cityTo,
		"countryTo": countryTo,
		"TypeRoute": kmqRouteType(routeKey),
		"FlightType": FlightType,
		"Duration": Duration
	}
};
Makeorder.prototype.setTicket = function(){
	this.elTicket = $.tmpl(tmpl_Ticket, {
		directions: this.arrDirections
	})[0];
	if(this.json.combined && this.arrDirections[0].trips[0].airCmp != this.arrDirections[1].trips[0].airCmp) {
		var divTickets = document.createElement('div');
		for(var DirIndex=0, DL = this.arrDirections.length; DirIndex<DL; DirIndex++){
			var curDir = this.arrDirections[DirIndex];
			var showAKbelow = false;
			if(DirIndex==1) {
				showAKbelow = true;
			}
			var curData = {directions: [curDir], concreteDir: DirIndex};
			$.tmpl(tmpl_Ticket,curData, {bottomAKpanel: showAKbelow}).appendTo( divTickets );
		}
		this.elTicket = divTickets;
	}
	this.setVisaInfo();
	$(this.elTicket).appendTo(this.elBlank);
};
Makeorder.prototype.setVisaInfo = function(){
	var self = this;
	var $visaInfo = $(".visaInfo", this.elTicket);
	for(var i = 0, length = this.arrDirections.length; i < length; i++){
		(function(){
			var dir = this.arrDirections[i];
			var elVisaInfo = $visaInfo[i];
			var changes = "";
			var firstCountry = ref.getCity(dir.trips[0].from).Parent;
			// Индикатор. Показывает, что селект со страной инициализирован.
			var countrySelectInitialized = false;
			var popupClassName = 'visa_info_popup';
			for (var j = 0, tripsLength = dir.trips.length; j < tripsLength; j++) {
				var trip = dir.trips[j];
				if (ref.getCity(trip.from).Parent != firstCountry || ref.getCity(trip.to).Parent != firstCountry) {
					$(elVisaInfo).removeClass("invisible");
				}
				if(j < tripsLength - 1){
					changes += "&TR=" + dir.trips[j].to;
				}
			}
			var elemLink = $("a", elVisaInfo)[0];
				elemLink.hrefPart = "http://www.timaticweb.com/cgi-bin/tim_client.cgi?SpecData=1&VISA=1&AR=00&PASSTYPES=PASS&VT=00&EM=" + dir.trips[0].from + "&DE=" + dir.trips[dir.trips.length - 1].to + changes;
				elemLink.userPart = "&user=STAR&subuser=STARB2C";

			$(elemLink).click(function(event) {
				var $iframe, $container;
				event.preventDefault();
				addPopup({
					error: false,
					reason: l10n.ticket.visaInfo,
					dom: '<iframe src="' + elemLink.href + '" frameborder="0"></iframe>',
					domClass: 'visa_info_iframe_container',
					close_button: true,
					actionButton: "removePopup();",
					className: popupClassName
				});
				$iframe = $('iframe', '.' + popupClassName);
				$container = $('.visa_info_iframe_container', '.' + popupClassName);
				appendLoader({
					appendTo: $container,
					text: ''
				});
				$iframe.load(function() {
					removeLoader();
				});
			});

			var elSelect = new CountrySelect({
				appendTo: $(".select", elVisaInfo)[0],
				onChange: function(obj){
					elemLink.href = elemLink.hrefPart + "&NA=" + obj.elSelect.value + elemLink.userPart;
					// Откроем новое окно только если изменения в селекте происходят после инициализации.
					if (countrySelectInitialized) {
						$(elemLink).click();
					}
				}
			});
			countrySelectInitialized = true;
		}).call(this);
	}
};
Makeorder.prototype.setUSVisaInfo = function(arrTrips){
	var needVisInfo = false;
	if (ref.getCountryCode(this.json.trps[0].from) != "US") {
		for (var i = 0, length = this.json.trps.length; i < length; i++) {
			if (ref.getCountryCode(this.json.trps[i].to) == "US") {
				needVisInfo = true;
				break;
			}
		}
	}
	if (needVisInfo) {
		var elUSVisaInfo = document.createElement("div");
			elUSVisaInfo.className = 'USVisaInfo';
			elUSVisaInfo.innerHTML = l10n.makeorder.requiredVisaInfo;
		this.elBlank.appendChild(elUSVisaInfo);
	}
};
Makeorder.prototype.setForm = function(arrTrips){
	var self = this;
	this.json.metaSearch = this.json.metaSearch||false;
	this.cantUseBonuses = this.json.bonus.noBonus||false;
	this.elForm = $.tmpl(tmpl_Form, this.json)[0];
	this.elButton = $('input[type="submit"]' , this.elForm)[0];
	
	$(this.elForm).submit(function(event){
		event.preventDefault();
		self.link_submit();
	});
	this.link_submit = function(){
		self.onSubmit();
	};
	this.initEmailPhone();
	//this.initBonusMiles();
	this.initPassengers();
	this.setBonus();
	this.initServices();
	this.setIssueBefore();
	this.initCreditCard();
	this.setPaymentMethods();
	this.agreementsField = new AgreementsField(this.elForm);
	this.initAgreementsLinks();
	this.elBlank.appendChild(this.elForm);
};
Makeorder.prototype.initEmailPhone = function(){
	var self = this;
	if (this.request.phone) {
		var phone = this.request.phone;
	} else if (tw.position) {
		var phone = tw.position.iddCode;
	} else {
		$(document).on("getPosition", function(){
			if(!self.phoneField.input.value) {
				self.phoneField.input.value = tw.position.iddCode;
			}
		});
	}
	this.phoneField = new Field({
		appendTo: $(".phone", this.elForm)[0],
		name: "phone",
		maxlength: 20,
		value: phone,
		type: "phone"
	});
	this.emailField = new Field({
		appendTo: $(".email", this.elForm)[0],
		name: "email",
		validate: true,
		value: this.request.email,
		type: "email"
	});
	if(tw.provider) {
		$(this.emailField.input).on('blur', function(){
			kmqRecord({name: 'NA_EnteredEmail', obj: {"Email": this.value}});
		});		
	}
};
Makeorder.prototype.initBonusMiles = function(){
	this.elFreqFlyerAirline = $("span.bonusMiles", this.elForm)[0];
	if (this.alliance) {
		this.freqFlyerAirlineField = new AKSelect({
			appendTo: this.elFreqFlyerAirline,
			value: this.request.reservations[0].passengers[0].freqFlyerAirline || this.ak,
			name: "freqFlyerAirline",
			alliance: this.alliance,
			domesticFlight: this.domesticFlight
		});
	} else {
		this.elFreqFlyerAirline.innerHTML = ref.Airlines[this.ak];
	}
};
Makeorder.prototype.initPassengers = function(){
	this.passIndex = 0;
	this.passengersFields = [];
	this.elPassengersTable = $(".passengersTable", this.elForm)[0];

	for (var i = 0, length_i = this.request.reservations.length; i < length_i; i++) {
		var reservation = this.request.reservations[i];
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++) {
			var passenger = reservation.passengers[j];
			this.createPassengerForm(passenger);
		}
	}
};
Makeorder.prototype.createPassengerForm = function(data){
	var self = this;
	var objFields = {};
    
    var table = $('<table></table>');
    table.append('<colgroup><col class="gender"><col class="name"><col class="birthDate"><col class="passCountry"><col class="passNumber"><col class="passExpDate"></colgroup>');
    table.append('<thead></thead>');
    table.append('<tbody></tbody>');
    table = table.get()[0];
    $(this.elPassengersTable).append(table);
    
    var hrow1 = table.tHead.insertRow(-1);
    
    var hrow2 = table.tHead.insertRow(-1);
        hrow2.innerHTML = '<th></th><th>Дата рождения</th><th>Гражданство</th><th>Серия № документа</th><th>Действителен до</th>';
    
	var row = table.tBodies[0].insertRow(-1);
    row.insertCell(-1);
	
	var tdGender = hrow1.insertCell(-1);
		tdGender.className = "gender";
		tdGender.innerHTML = '<span class="gender ' + data.ageType + ' ' + data.gender + '"></span>';
	
	var tdName = hrow1.insertCell(-1);
        tdName.className = "name";
		tdName.colSpan   = 4;
		tdName.innerHTML = data.lastName + " / " + data.firstName;
	
	var tdBirthDate = row.insertCell(-1);
	var birthDate = Date.parseAPI(data.birthDate);
	var min = null;
	var max = null;
	var lastDir = this.arrDirections[(this.arrDirections.length - 1)];
	var lastDirFirstTripDate = lastDir.trips[0].stDt_Date;
	var lastDirLastTripDate = lastDir.trips[(lastDir.trips.length - 1)].stDt_Date;
	switch (data.ageType) {
		case "ADT":
			min = new Date();
			min.setFullYear(min.getFullYear() - 110);
			max = new Date(lastDirFirstTripDate);
			max.setFullYear(max.getFullYear() - 12);
			break;
		case "CNN":
			min = new Date(lastDirFirstTripDate);
			min.setFullYear(min.getFullYear() - 12);
			max = self.now;
			break;
		case "INF":
			min = new Date(lastDirFirstTripDate);
			min.setFullYear(min.getFullYear() - 2);
			max = self.now;
			break;
	}
	objFields.birthDate = new Field({
		appendTo: tdBirthDate,
		name: "birthDate" + this.passIndex,
		value: birthDate,
		type: "birthDate",
		min: min,
		max: max
	});
	
	var tdPassCountry = row.insertCell(-1);
		tdPassCountry.className = "passCountry";
	objFields.passCountry = new PassCountrySelect({
		objMakeorder: this,
		appendTo: tdPassCountry,
		name: "passCountry" + this.passIndex,
		number: this.passIndex,
		value: data.passCountry
	});
	
	var tdPassNumber = row.insertCell(-1);
	objFields.passNumber = new Field({
		appendTo: tdPassNumber,
		name: "passNumber" + this.passIndex,
		number: this.passIndex,
		value: data.passNumber,
		type: "passport"
	});
	if (!this.domesticFlight) {
		$(objFields.passNumber.input).bind("keyup change", function(){
			checkOnRuPassport(this);
		});
	}
	
	var tdPassExpDate = row.insertCell(-1);
        tdPassExpDate.className = "passExpDate";
	var passExpDate = Date.parseAPI(data.passExpDate);
	objFields.passExpDate = new Field({
		appendTo: tdPassExpDate,
		name: "passExpDate" + this.passIndex,
		value: passExpDate,
		type: "expDate",
		min: new Date(lastDirLastTripDate),
		checkbox: true,
		disabled: !data.needPassExpDate
	});
	objFields.passExpDate.checkExpDate();
	/*
	var tdBonusCard = row.insertCell(-1);
		tdBonusCard.className = "bonusCard";
	objFields.freqFlyerNumber = new Field({
		appendTo: tdBonusCard,
		name: "freqFlyerNumber" + this.passIndex,
		value: data.freqFlyerNumber,
		maxlength: 25,
		disabled: true,
		type: "bonusCard",
		checkbox: true,
		disabled: true
	});*/
	
	this.passengersFields.push(objFields);
	this.passIndex++;
};
Makeorder.prototype.setBonus = function(){
	var self = this;
	var elBonuses = $(".block_bonus .bonuses", this.elForm)[0];
	var bonusDescription = l10n.makeorder.bonus.about;
	if (this.json.isAuth) {
		var bonusAmount = (this.json.bonuses.cur == 'RUB')?Math.ceil(this.json.bonuses.total):this.json.bonuses.total;
		var bonusText = formatMoney(bonusAmount);
		elBonuses.innerHTML = l10n.makeorder.bonus.balance + bonusText + ' ≈ ';
		if (this.json.bonus.bonusCurrency != 'RUB') {
			bonusText = formatMoney(this.json.bonuses.total.toFixed(2));
		}			
		elBonuses.innerHTML += bonusText + ' ' + l10n.currency[this.json.bonus.bonusCurrency].Abbr;
		elBonuses.innerHTML += '<br/>' + bonusDescription;
	} else {
		elBonuses.innerHTML = l10n.makeorder.bonus.auth + ' ' + bonusDescription;
		$("span.link", elBonuses).click(function(){
			objSocialAuth.show(objSocialAuth.regauthForm);
		});		
	}
	if (this.json.isAuth && this.json.bonus.bonusToUse && !this.cantUseBonuses) {
		this.bonusCheckbox = $('.block_bonus input[type="checkbox"]', this.elForm)[0];
		$(this.bonusCheckbox).click(function(){
			self.useBonus = this.checked;
			self.setBonusesIn();
			self.setPaymentMethods();
			self.needPayment();
		});
	}
	this.setBonusesIn();
};
Makeorder.prototype.initServices = function(){
	this.initSubscriptions();
};
Makeorder.prototype.initSubscriptions = function(){
	var self = this;
	this.subscriptionBlock = $('#subscriptions', this.elForm)[0];
	//this.serviceTransaction = $('<div class="service_transaction"></div>')[0];
	this.service = {};
	if(tw.language != 'ru' || !this.json.additionalServices) {
		$(this.subscriptionBlock).remove();
		return;
	}

	$(this.subscriptionBlock).removeClass('invisible');
	if(this.json.additionalServices.insurance){
		for(var i=0, L = this.passengersFields.length; i<L; i++){
			var pField = this.passengersFields[i];
			$(pField.passCountry.elField).bind("keyup change", function(){
				//$('.service_transaction', self.elForm).empty();
				self.drawSubscriptions();
			});
		}		
	}
	this.drawSubscriptions();
};
Makeorder.prototype.drawSubscriptions = function(){
	var self = this;
	$(this.subscriptionBlock).empty();
	this.serviceCheckCitizenship(); 

	/*var iBlock = document.createElement('div');
	var serviceTable = document.createElement('table');
	$(iBlock).addClass('block_insurance').append(serviceTable);
	var row = serviceTable.insertRow(-1);

	if(this.json.additionalServices.insurance && this.service.passengers.length > 0) {
		$(iBlock).prepend('<div class="title">Страхование</div>');
		var bNoteText = '<b>Утрата багажа или задержка багажа более 48 часов<b/>';
		var bTitle = '<div class="note">'+bNoteText+'</div>';
		var bList = document.createElement('ul');
		var bCount = 0;
		for(var si=0, sl=this.json.additionalServices.insurance.types.length; si<sl; si++){
			var curOption = this.json.additionalServices.insurance.types[si];
			if(curOption.tp == 'CASUALITY') {continue;}
			curOption.id = curOption.tp+'_'+curOption.src+'_'+curOption.cost;
			var bItem = document.createElement('li');
			if(bCount===0) {
				var adItem = document.createElement('li');
				$(adItem).html('<input type="radio" value="" id="baggage_default" checked="checked" name="baggage"><label for="baggage_default">Я отказываюсь от страховки багажа</label>');				
				$('input',adItem).data({'price':0, 'cur':curOption.cur});
				$(bList).append(adItem);
			}
			var adItem = document.createElement('li');
			$(bItem).html('<input type="radio" value="'+bCount+'" id="'+curOption.id+'" name="baggage"><label for="'+curOption.id+'"><b>'+ formatMoney(curOption.cost)+ ' ' +l10n.currency[curOption.cur].Abbr + '</b> &ndash; ' + 'выплата до ' +formatMoney(curOption.payout)+ ' ' +l10n.currency[curOption.cur].Abbr+ '</label>');		
			$('input',bItem).data({'price':curOption.cost, 'cur':curOption.cur, 'tp':curOption.tp, 'payout':curOption.payout, 'src':curOption.src});
			$(bList).append(bItem);
			bCount++;
		}
		if(bCount>0) {
			var iCell = row.insertCell(-1);
			$(iCell).append(bTitle);
			$(iCell).append(bList);
			var passengersBlock = document.createElement('div');
			$(passengersBlock).append('<div class="note"><b>для пассажиров:</b></div>');
			for(var p=0, pcL=this.service.passengers.length; p<pcL; p++){
				var pText = '<input type="checkbox" value="" id="insurancePas_'+String(this.service.passengers[p].id)+'" checked="checked" name="insurance_pas"><label for="insurancePas_'+String(this.service.passengers[p].id)+'">'+this.service.passengers[p].name+'</label>';
				if(p!=pcL-1){
					pText+='<br/>'
				}
				$(passengersBlock).append(pText);
			}
			$(passengersBlock).addClass('insurancePassengers').appendTo(iCell);
			$('input[name*="baggage"]', iCell).on('change', function(){
				if(this.value != '') {
					if($('.insurancePassengers', iCell).css('display') == 'block'){return;}
					$('.insurancePassengers', iCell).slideDown();
				} else {
					$('.insurancePassengers', iCell).slideUp();
				}
			});
		}
		var pNoteText = '<b>Страхование от травм и несчастных случаев<b/>';
		var pTitle = '<div class="note">'+pNoteText+'</div>';
		var pList = document.createElement('ul');
		var pCount = 0;
		for(var si=0, sl=this.json.additionalServices.insurance.types.length; si<sl; si++){
			var curOption = this.json.additionalServices.insurance.types[si];
			if(curOption.tp == 'BAGGAGE') {continue;}
			curOption.id = curOption.tp+'_'+curOption.src+'_'+curOption.cost;
			var pItem = document.createElement('li');
			if(pCount===0) {
				var adItem = document.createElement('li');
				$(adItem).html('<input type="radio" value="" id="casual_default" checked="checked" name="casual"><label for="casual_default">Меня не интересует данное страхование</label>');				
				$('input',adItem).data({'price':0, 'cur':curOption.cur});
				$(pList).append(adItem);
			}
			var adItem = document.createElement('li');
			$(pItem).html('<input type="radio" value="'+pCount+'" id="'+curOption.id+'" name="casual"><label for="'+curOption.id+'"><b>'+ formatMoney(curOption.cost)+ ' ' +l10n.currency[curOption.cur].Abbr + '</b> за каждого пассажира &ndash; ' + 'выплата до ' +formatMoney(curOption.payout)+ ' ' +l10n.currency[curOption.cur].Abbr+ '</label>');		
			$('input',pItem).data({'price':curOption.cost, 'cur':curOption.cur, 'tp':curOption.tp, 'payout':curOption.payout, 'src':curOption.src});
			$(pList).append(pItem);
			pCount++;
		}
		if(pCount>0) {
			var pCell = row.insertCell(-1);
			$(pCell).append(pTitle);
			$(pCell).append(pList);
		}
		if(bCount>0 || pCount>0) {
			$(self.subscriptionBlock).append(iBlock);
		}
	}*/
	if(this.json.additionalServices.notification) {
		var nBlock = document.createElement('div');
		var nTitle = l10n.order.services.notification.description;
		var nList = document.createElement('ul');
		var nTable = document.createElement('table');
		var nRow  = nTable.insertRow(-1);
		var firstTd = nRow.insertCell(-1);
		$.tmpl($("#tmpl_notifyIco").trim()).appendTo( firstTd );

		for(var si=0, sl=this.json.additionalServices.notification.types.length; si<sl; si++){
			var curOption = this.json.additionalServices.notification.types[si];
			if(curOption.tp == 'airportsweatherchange'){continue;}
			curOption.id = curOption.tp+'_'+curOption.amt;
			var nItem = document.createElement('li');
			var adItem = document.createElement('li');
			$(nItem).html('<input type="radio" value="ByOTT" id="'+curOption.id+'" name="notify"><label for="'+curOption.id+'">' +l10n.order.services.notification.options[0]+ ' (<b>'+formatMoney(curOption.amt) + ' ' + l10n.currency[curOption.cur].Abbr+ '</b>)</label>');		
			$('input',nItem).data({'price':curOption.amt, 'cur':curOption.cur, 'tp':curOption.tp});
			$(nList).append(nItem);
		}
		var adItem = document.createElement('li');
		$(adItem).html('<input type="radio" value="ByClient" id="notify_default" name="notify"><label for="notify_default">'+l10n.order.services.notification.options[1]+'</label>');				
		$('input',adItem).data({'price':0, 'cur':curOption.cur});
		$(nList).append(adItem);

		$(nBlock).addClass('block_notify').append(nTitle);
		var secondTd = nRow.insertCell(-1);
		$(secondTd).append(nList);
		$(nBlock).append(nTable);
		
		$(self.subscriptionBlock).append(nBlock);

		this.service.needNotify = true;
		$('<div><span class="warn invisible">'+l10n.order.services.notification.req+'</span></div>').insertBefore(nTable);
		this.notifyField = new NotifyField(this.elForm);
	}
	if(this.json.additionalServices.notification || (this.json.additionalServices.insurance && this.service.passengers.length > 0)){
		$('input', this.subscriptionBlock).on('change', function(){
			self.recountServices();
		});
	}
	this.recountServices();
};
Makeorder.prototype.serviceCheckCitizenship = function(){
	var passengerCount = 0;
	this.service.passengers = [];
	for (var i = 0, length_i = this.json.reservations.length; i < length_i; i++) {
		var reservation = this.json.reservations[i];
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++) {
			var passenger = reservation.passengers[j];
			if(this.passengersFields[passengerCount].passCountry.value == 'RU') {
				var pas = {name:passenger.lastName + ' ' + passenger.firstName, id: i+'_'+j};
				this.service.passengers.push(pas);
			}
			passengerCount++;
		}
	}
};
Makeorder.prototype.recountServices = function(){
	var self = this;
	this.service.isbaggage = false;
	this.service.iscasual = false;
	this.service.isnotify = false;
	this.service.selectedPassengersFiels = $('input[name="insurance_pas"]:checked', this.subscriptionBlock);

	var insurancePriceAll = 0;
	this.service.elements = {};
	
	/*this.service.elements.baggage = $('.block_insurance input[name="baggage"]:checked', this.subscriptionBlock)[0];
		var baggagePrice = parseInt( $(this.service.elements.baggage).data('price'),10 );
		if(baggagePrice>0){
			this.service.isbaggage = true;
			if(this.service.selectedPassengersFiels.length < 2) {
				$(this.service.selectedPassengersFiels).attr('disabled', 'disabled');
			} else {
				$(this.service.selectedPassengersFiels).removeAttr('disabled');
			}
			insurancePriceAll+= parseInt(this.service.selectedPassengersFiels.length * baggagePrice,10);
		}
		this.service.elements.casual = $('.block_insurance input[name="casual"]:checked', this.subscriptionBlock)[0];
		if(this.service.elements.casual) {
			var casualPrice = parseInt( $(this.service.elements.casual).data('price'),10 );		
		}
		var insuranceCur = $(this.service.elements.baggage).data('cur')||$(this.service.elements.casual).data('cur');
		if(casualPrice>0){
			this.service.iscasual = true;
			insurancePriceAll+= parseInt( this.service.passengers.length * casualPrice, 10);
		}
	*/
	this.service.elements.notify = $('.block_notify input[name="notify"]:checked', this.subscriptionBlock)[0];
	if(this.service.elements.notify){this.service.needNotify = false;}
	var notifyPrice = parseInt( $(this.service.elements.notify).data('price'), 10 );
		//var notifyCur = $(this.service.elements.notify).data('cur');

	/*$(this.serviceTransaction).empty();
	if(insurancePriceAll>0 || notifyPrice>0){
		$(this.serviceTransaction).append('<div class="service_comment"><span class="warn">Дополнительные списания:</span></div>');		
	}
	if(insurancePriceAll>0){
		var iText = '<div><b>' + formatMoney(insurancePriceAll) + ' ' + getCurrencyFullRUBAbbr(insuranceCur) + '</b> в компанию &laquo;Ренессанс страхование&raquo; ' + l10n.payment.transactions.toOtt + '</div>';
		$(this.serviceTransaction).append(iText);
	}*/
	if(notifyPrice>0){
		this.service.isnotify = true;
	}
	this.service.additionalServices = this.service.isbaggage||this.service.iscasual||this.service.isnotify;
};
Makeorder.prototype.needPayment = function(){
	var firstPmtVrnt = this.json.pmtVrnts[0].tag;
	var pmtVrntsHash = this.json.pmtVrntsHash;
	if (this.useBonus) {
		firstPmtVrnt = this.json.pmtVrntsBonus[0].tag;
		for (var i = 0, length = this.json.pmtVrntsBonus.length; i < length; i++){
			if (this.json.pmtVrntsBonus[i].tp == 'card') {
				firstPmtVrnt = this.json.pmtVrntsBonus[i].tag;
				break;
			}
		}
		pmtVrntsHash = this.json.pmtVrntsBonusHash;
	}
	if (pmtVrntsHash[firstPmtVrnt].amount == 0) {
		this.pmtVrnt = firstPmtVrnt;
		this.applyPaymentMethod();
	}
	if (pmtVrntsHash[this.pmtVrnt].amount == 0) {
		$('.pmtVrnts', this.elForm).addClass('invisible');
		$('.layout_paymentNote', this.elForm).addClass('invisible');
		$('.card', this.elForm).addClass('invisible');
		return false;
	} else {
		$('.pmtVrnts', this.elForm).removeClass('invisible');
		if(this.pmtVrnt != '711ua' && this.pmtVrnt != 'rapida') {//если не нал то показываем формы карт
			$('.layout_paymentNote', this.elForm).removeClass('invisible');
			$('.card', this.elForm).removeClass('invisible');			
		}
		return true;
	}
};
Makeorder.prototype.setBonusesIn = function(){
	var elBonusesIn = $(".block_bonus .bonusesIn", this.elForm)[0];
	var bonus = this.json.bonus.bonus;
	var bonusInMoney = formatMoney(this.json.bonus.bonus);
	if (this.useBonus) {
		bonus = this.json.bonus.newBonus;
		bonusInMoney = formatMoney(this.json.bonus.newBonus);
	}
	bonus = (this.json.bonus.bonusCurrency == 'RUB')?Math.ceil(bonus):bonus;

	var num = bonus+"";
	var text = "";
	if(num.length==1) {
		num = "0"+num;
	}
	var last = parseInt( num.substr(num.length-1,1), 10);
	var prelast = parseInt( num.substr(num.length-2,1), 10);
	if (last == 1) {
		text = l10n.makeorder.bonus.text[1];
	} else if (0 < last && last < 5) {
		text = l10n.makeorder.bonus.text[2];
	} else {
		text = l10n.makeorder.bonus.text[3];
	}
	if (prelast == 1) {
		text = l10n.makeorder.bonus.text[3];
	}
	/*var bonusInMoney = formatMoney(Math.floor(bonus));
	if (this.json.bonus.bonusCurrency != tw.currency) {
		bonusInMoney = (bonus * tw.currencyRates[tw.currency+this.json.bonus.bonusCurrency]).toFixed(2);
	}*/
	if(this.cantUseBonuses && this.json.isAuth) {
		elBonusesIn.innerHTML = l10n.makeorder.bonus.cantUseBonuses;
		if(this.json.metaSearch && this.json.metaSearch == 'aviasales'){
			$(elBonusesIn).addClass('invisible');
		}
	} else {
		elBonusesIn.innerHTML = l10n.makeorder.bonus.text[0];
	}
	elBonusesIn.innerHTML += ' <span class="bonusAmount">' + bonus + ' ' + text + ' ≈ ' + bonusInMoney + ' ' + l10n.currency[this.json.bonus.bonusCurrency].Abbr + '</span>';

	if (!this.json.isAuth) {
	//	if(tw.currency == 'ru') {
			//elBonusesIn.innerHTML += '<br/>' + l10n.makeorder.bonus.welcome[0];
	//	} else {
			makeBonusCurrencyToViewCur(this.json.bonus.bonusCurrency);
			WelcomeBonusText(elBonusesIn);
	//	}
	}
};
Makeorder.prototype.setIssueBefore = function(){
	var self = this;
	this.issueDate = this.issueDate || new Date(Date.parse(this.json.lstTkDt));
	this.clientServerDelta = this.clientServerDelta || (new Date(Date.parse(this.json.date)) - new Date()) / 60000;
	var durationMinutes = ((this.issueDate - new Date()) / 60000) - this.clientServerDelta;
	var BlinkInterval;
	if (durationMinutes > 2) {
		var elDiv = $(".issueBefore", this.elForm)[0];
			elDiv.innerHTML = ', ';
		if (this.json.isAuth) {
			elDiv.innerHTML += l10n.makeorder.saveInProfile + ',<br/>';
		}
		if (this.json.reservations.length == 1 && this.json.reservations[0].passengers.length == 1 && this.json.trps.length == 1) {
			elDiv.innerHTML += l10n.makeorder.issue[1];
		} else {
			elDiv.innerHTML += l10n.makeorder.issue[2];
		}
		elDiv.innerHTML += l10n.makeorder.issue[3];
		elDiv.innerHTML += ' ' + this.issueDate.format("d mmmm") + ' ' + this.issueDate.format("HH:MM") + ' (GMT' + this.issueDate.format("o") + ')';
		
		var dd = Math.floor(durationMinutes/1440);
		var hh = Math.floor((durationMinutes-dd*1440)/60);
		var mm = parseInt(durationMinutes-dd*1440-hh*60);
		if(String(dd).length<2) {
			dd= '0'+dd;
		}
		if(String(hh).length<2) {
			hh= '0'+hh;
		}
		if(String(mm).length<2) {
			mm='0'+mm;
		}
		elDiv.innerHTML += ', <span class="date">' + l10n.makeorder.issue[4] + ' ' + dd + '<span class="blink">:</span>' + hh + '<span class="blink">:</span>' + mm + '</span>';
		elDiv.innerHTML += ' ' +l10n.makeorder.issueTime;
		BlinkInterval = setInterval(function(){
			$('.blink', elDiv).css({'visibility': 'hidden'});
			setTimeout(function(){
				$('.blink', elDiv).css({'visibility': 'visible'});
			}, 500)
		}, 1000);

		setTimeout(function(){
			clearInterval(BlinkInterval);
			self.setIssueBefore();
		}, 60000);
	} else {
		$(document.body).trigger("removeUnloadReservation");
		addPopup({
			error: true,
			reason: l10n.popup.card.prereservation[0],
			comment: l10n.popup.card.prereservation[1],
			button: l10n.popup.card.newSearch,
			actionButton: "window.location.href = '" + self.PrevHref + "'"
		});
	}
};
Makeorder.prototype.setPaymentMethods = function(){
	var self = this;
	
	var cashAvail = (tw.language == 'ru' || tw.language == 'ua') ? true : false;
	var pmtVrnts = this.json.pmtVrnts;
	var pmtVrntsHash = this.json.pmtVrntsHash;
	if (this.useBonus) {
		pmtVrnts = this.json.pmtVrntsBonus;
		pmtVrntsHash = this.json.pmtVrntsBonusHash;
	}
	
	var elPmtVrnts = $('.pmtVrnts', this.elForm)[0];
		elPmtVrnts.innerHTML = '';
	var ulCard = document.createElement('ul');
	var ulCash = document.createElement('ul');
	var liElixir, liAmex, liMaestro, liMaestroEur;
	for (var i = 0, length = pmtVrnts.length; i < length; i++) {
		var pmtVrnt = pmtVrnts[i];
		var oPmtVrnt = pmtVrntsHash[pmtVrnt.tag];
		var totals = oPmtVrnt.totals;
		if (pmtVrnt.tag == 'rapida') {
			if (tw.language == 'ru' || (tw.position && tw.position.countryCode == 'RU') || !tw.position) {
			} else { 
				continue;
			}
		}
		var li = document.createElement('li');
			li.innerHTML = '<input type="radio" name="pmtVrnt" id="pmtVrnt_' + pmtVrnt.tag + '" value="' + pmtVrnt.tag + '"/>';
			li.className = 'pmtVrnt_' + pmtVrnt.tag;
		var label = document.createElement('label');
			label.htmlFor = 'pmtVrnt_' + pmtVrnt.tag;
			label.innerHTML = '<b>' + formatMoney(Math.ceil(oPmtVrnt.amount)) + ' ' + l10n.currency[tw.currency].Symbol + '</b> — ';
		if (l10n.payment.variants[pmtVrnt.tag]) {
			label.innerHTML += l10n.payment.variants[pmtVrnt.tag];
		} else {
			label.innerHTML += pmtVrnt.tag;
		}
		li.appendChild(label);
		switch (pmtVrnt.tag) {
			case "gds":
				label.innerHTML += ' <b>' + ref.Airlines[this.json.pltCrr] + '</b>';
				break;
			case "payture":
			case "payture_r":
			case "payture_r_eur":
			case "payture_p":
			case "ua_cards":
				if (pmtVrntsHash.gds) {
					li.innerHTML += ', <span id="pmtVrntDescription" class="link dotted">' + l10n.payment.variants.difference + '</span>';
				}
				break;
		}
		if (pmtVrnt.tag == 'elixir') {
			liElixir = li;
			continue;
		}
		if (pmtVrnt.tag == 'ott_amex') {
			liAmex = li;
			continue;
		}
		if (pmtVrnt.tag == 'maestro') {
			liMaestro = li;
			continue;
		}
		if (pmtVrnt.tag == 'maestro_eur') {
			liMaestroEur = li;
		}
		if (pmtVrnt.tp == 'card') {
			ulCard.appendChild(li);
			continue;
		}
		if (pmtVrnt.tp == 'cash' && cashAvail) {
			ulCash.appendChild(li);
			continue;
		}
	}
	if (liElixir) {
		ulCard.appendChild(liElixir);
	}
	if (liAmex) {
		ulCard.appendChild(liAmex);
	}
	if (liMaestro) {
		ulCard.appendChild(liMaestro);
	}
	if (liMaestroEur) {
		ulCard.appendChild(liMaestroEur);
	}
	if (ulCard.childNodes.length > 0) {
		$(elPmtVrnts).append('<li class="pm_card"><span>' + l10n.payment.variants.card + '</span></li>').find('li.pm_card').append(ulCard);
	}
	var cashVariantsCount = 0;
	if (ulCash.childNodes.length > 0 && cashAvail) {
		cashVariantsCount = ulCash.childNodes.length;
		$(elPmtVrnts).append('<li class="pm_cash"><span>' + l10n.payment.variants.cash + '</span></li>').find('li.pm_cash').append(ulCash);
	}
	if (ulCard.childNodes.length + cashVariantsCount == 1) {
		$(elPmtVrnts).addClass('invisible');
	}
	$(this.elForm.pmtVrnt).change(function(){
		self.pmtVrnt = this.value;
		delete self.ggl;
		self.applyPaymentMethod();
	});
	if (this.pmtVrnt) {
		$('input#pmtVrnt_' + this.pmtVrnt).click();
	} else {
		this.pmtVrnt = $(this.elForm.pmtVrnt)[0].value;
		$(this.elForm.pmtVrnt)[0].checked = true;
		this.applyPaymentMethod();
	}
	$("#pmtVrntDescription", this.elForm).click(function(){
		var popup = addPopup({
			close_button: true,
			dom: l10n.payment.variants.description + simpleCloseButton,
			domClass: 'content1'
		});
	});
};
Makeorder.prototype.drawAgentComment = function(){
	this.AgentPult = $('.AgentPult', this.elForm)[0];
	$(this.AgentPult).removeClass('invisible').html( l10n.makeorder.agent.text );
	$('.tooltip',this.AgentPult).attr('title', l10n.makeorder.agent.title).tooltip();
	/*var cur = 'RUB';
	switch (this.pmtVrnt) {
		case 'gds':
			cur = this.json.pmtVrntsHash[this.pmtVrnt].totals['gds'].cur;
			$(this.AgentPult).append( l10n.makeorder.agent.currency[0].replaceBy({currency: l10n.currency[cur].Name}) );
			break;
		default:
			$(this.AgentPult).append( l10n.makeorder.agent.currency[1] );
			break;
	}*/
	$(this.AgentPult).append(l10n.payment.operatorOps);
};
Makeorder.prototype.applyPaymentMethod = function(){
	/*this.drawMoneyTo();*/
	this.drawPrices();
	this.drawAmount();
	this.drawTransactions();
	//this.drawAgentComment();
	this.drawAttention();
	this.drawAgreements();
	this.testCard();
};
Makeorder.prototype.drawMoneyTo = function(){
	if (this.pmtVrnt == 'gds') {
		$('.moneyToAk', this.elForm).removeClass('invisible');
	} else {
		$('.moneyToAk', this.elForm).addClass('invisible');
	}
};
Makeorder.prototype.drawPrices = function(){
	this.paymentTable = $("table.paymentTable", this.elForm)[0];
	while (this.paymentTable.tBodies[0].rows.length > 0) {
		this.paymentTable.tBodies[0].deleteRow(this.paymentTable.tBodies[0].rows.length - 1);
	}
	this.isMarkup = false;
	this.isDiscount = false;
	var oPassengers = {"ADT":[],"CNN":[], "INF":[]};
	for (var i = 0, length_i = this.json.reservations.length; i < length_i; i++) {
		var reservation = this.json.reservations[i];
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++){
			var passenger = reservation.passengers[j];
			var ageType = passenger.ageType;
			if(ageType == 'ADT'){
				oPassengers.ADT.push(reservation);
			} else if(ageType == 'CNN') {
				oPassengers.CNN.push(reservation);
			} else {
				oPassengers.INF.push(reservation);
			}
			//this.drawPriceRow(reservation, ageType);
		}
	}
	for(var pi in oPassengers){
		for(var ti=0, tl= oPassengers[pi].length; ti<tl; ti++){
			var reservation = oPassengers[pi][ti];
			this.drawPriceRow(reservation, pi);			
		}
	}
	
	if (this.isMarkup) {
		$('.markup', this.paymentTable).removeClass('invisible');
	} else {
		$('.markup', this.paymentTable).addClass('invisible');
	}
	if (this.isDiscount) {
		$('.discount', this.paymentTable).removeClass('invisible');
	} else {
		$('.discount', this.paymentTable).addClass('invisible');
	}
};
Makeorder.prototype.drawPriceRow = function(reservation, age){
	var self = this;
	var ageToLower = age.toLowerCase();
	var prcInf = reservation.prcInfNew;
	var paymentVariants = reservation.pmtVrnts_new;
	if(this.useBonus){
		prcInf = reservation.prcInfBonus;
		paymentVariants = reservation.pmtVrntsBonus;
	}
	var transactions = paymentVariants[this.pmtVrnt].transactions;
	
	var markup = convertCurrency(prcInf[ageToLower + "MarkupNew"], prcInf.cur);
	var discount = convertCurrency(prcInf[ageToLower + "Discount"], prcInf.cur);
	var commission = 0;
	var amount = 0;
	var gglAmount = 0;
	for (var i = 0, length = transactions.length; i < length; i++) {
		var transaction = transactions[i];
		commission += convertCurrency(transaction[ageToLower + 'C'], transaction.cur);
		amount += convertCurrency(transaction[ageToLower + 'A'], transaction.cur);
		gglAmount += transaction[ageToLower + 'C'] + transaction[ageToLower + 'A'];
	}
		amount += commission;
	if (commission < 0) {
		discount += commission;
	} else {
		markup += commission;
	}
	/*if (markup > 0 && discount < 0) {
		if (markup > Math.abs(discount)) {
			markup = markup + discount;
			discount = 0;
		} else {
			discount = discount + markup;
			markup = 0;
		}
	}*/
	if (markup > 0) {
		this.isMarkup = true;
	}
	if (discount < 0) {
		this.isDiscount = true;
	}

	var row = this.paymentTable.tBodies[0].insertRow(-1);

	//classes for each pas
		var ServiceClass = l10n.ticket.cls[0], objServiceClass = {}, ClassCount = 0, mixedCls = '', pasClassCls='';
		for(var i=0, TripsL = reservation.trps.length; i< TripsL; i++) {
			if(!objServiceClass[reservation.trps[i].srvCls]){
				objServiceClass[reservation.trps[i].srvCls] = 1;
				ClassCount++;
			}
		}
		if(ClassCount>1){
			mixedCls = ' help';
			pasClassCls= ' clsM';
			ServiceClass= l10n.ticket.cls[4];
		} else {
			if(objServiceClass.F) {
				ServiceClass= l10n.ticket.cls[3];
				pasClassCls= ' clsFB';
			} else if(objServiceClass.B){
				ServiceClass= l10n.ticket.cls[2];
				pasClassCls= ' clsFB';
			} else if(objServiceClass.W){
				ServiceClass= l10n.ticket.cls[1];
			}
		}
		var tdAge = row.insertCell(-1);
		tdAge.innerHTML = l10n.makeorder[age.toLowerCase()] + '<span class="clsDefault'+pasClassCls+mixedCls+'">/'+ServiceClass+'</span>';

		if(ClassCount>1){
			var CurPasArrayDirections = [];
			function AddDirection(){
				this.trips = [];
				this.srvCls = '';
			}
			var CurPasDirection = new AddDirection();
			for (var i = 0, length = reservation.trps.length; i < length; i++) {
				var trip = reservation.trps[i];
				CurPasDirection.trips.push(trip);
				if(CurPasDirection.trips.length>1){CurPasDirection.srvCls+= '/';}
				switch(trip.srvCls){
					case 'F':
						CurPasDirection.srvCls += l10n.ticket.cls[3];
						break;
					case 'B':
						CurPasDirection.srvCls += l10n.ticket.cls[2];
						break;
					case 'W':
						CurPasDirection.srvCls += l10n.ticket.cls[1];
						break;
					default:
						CurPasDirection.srvCls += l10n.ticket.cls[0];
						break;
				}
				if (!trip.conx) {
					CurPasArrayDirections.push(CurPasDirection);
					CurPasDirection = new AddDirection();
				}
			}
			var clsDetails = '';
			for(var i=0, DirLength = CurPasArrayDirections.length; i<DirLength; i++){
				var curD = CurPasArrayDirections[i];
				clsDetails+= ref.getCityName(curD.trips[0].from) + '→' + ref.getCityName(curD.trips[curD.trips.length-1].to) + ', ';
				clsDetails+= curD.srvCls.toLowerCase();
				if(i!=DirLength-1){
					clsDetails+='| ';
				}
			}
			$('.clsDefault',tdAge).attr('title', clsDetails).tooltip();
		}

	var oPrices = {
		"base": convertCurrency(prcInf[ageToLower + "B"], prcInf.cur).toFixed(2),
		"taxes": convertCurrency(prcInf[ageToLower + "T"], prcInf.cur).toFixed(2),
		"markup": markup.toFixed(2),
		"discount": Math.abs(discount).toFixed(2),
		"amount": amount.toFixed(2)
	}
	if(tw.currency == 'RUB') {
		oPrices.base = Math.ceil(oPrices.base);
		oPrices.taxes = Math.ceil(oPrices.taxes);
		oPrices.markup = Math.ceil(oPrices.markup);
		oPrices.discount = Math.ceil(oPrices.discount);
		oPrices.amount = Math.ceil(oPrices.amount);
	}


	var tdBase = row.insertCell(-1);
		tdBase.innerHTML = formatMoney(oPrices.base);
	
	var tdSign1 = row.insertCell(-1);
		tdSign1.className = "sign";
		tdSign1.innerHTML = "+";
	
	var tdTaxe = row.insertCell(-1);
		tdTaxe.innerHTML = formatMoney(oPrices.taxes);

	var tdSign2 = row.insertCell(-1);
		tdSign2.className = "sign markup";
		tdSign2.innerHTML = '+';
	var tdMarkup = row.insertCell(-1);
		tdMarkup.className = 'markup';
		tdMarkup.innerHTML = formatMoney(oPrices.markup);
	
	var tdSign3 = row.insertCell(-1);
		tdSign3.className = "sign discount";
		tdSign3.innerHTML = "−";
	var tdDiscount = row.insertCell(-1);
		tdDiscount.className = 'discount';
		tdDiscount.innerHTML = formatMoney(oPrices.discount);
	
	var tdSignEquals = row.insertCell(-1);
		tdSignEquals.className = "sign";
		tdSignEquals.innerHTML = "=";
		
	var tdAmount = row.insertCell(-1);
		tdAmount.innerHTML = formatMoney(oPrices.amount);

	//PriceDiffCheck
		if(!this.PricesCheck){
			this.PricesCheck= {ppl: {}, currency: tw.currency, showPriceDiff: false};
		}
		if(!this.PricesCheck.ppl[ageToLower]) {
			this.PricesCheck.ppl[ageToLower] = {min:0, max:0, count: 0, sum: 0};
		}
		this.PricesCheck.ppl[ageToLower].count++;
		if(reservation.higherClass){
			this.PricesCheck.ppl[ageToLower].max = amount;
			this.PricesCheck.showPriceDiff = true;
		} else {
			this.PricesCheck.ppl[ageToLower].min = amount;			
		}
		this.PricesCheck.ppl[ageToLower].sum += amount;

	//ggl
		if(!this.ggl) {
			this.ggl = {};
		}
		if(!this.ggl[ageToLower]){
			this.ggl[ageToLower] = {count:0, price: Math.ceil(gglAmount)};
		}
		this.ggl[ageToLower].count++;
		if(transaction.cur != 'RUB') {
			this.ggl[ageToLower].price = parseFloat(convertCurrency(gglAmount, transaction.cur, 'RUB').toFixed(2),10);
		}
	var tdFareRulles = row.insertCell(-1);
		tdFareRulles.className = "fareRules";
	
	var elRulesLink = document.createElement("span");
		elRulesLink.className = "link dashed";
		elRulesLink.innerHTML = l10n.makeorder.linkRules;
		$(elRulesLink).click(function(){
			showFareRules({
				url: "https://secure.onetwotrip.com/_api/confirmation/getfarerules/",
                dataType: "jsonp",
                type: "post",
				data: {
					params: JSON.stringify({
						trips: reservation.trps,
						gdsInfo: self.json.gdsInf,
						fareKey: reservation.frKey
					})
				},
				obj: reservation
			});
		});
		tdFareRulles.appendChild(elRulesLink);
		if(!reservation.refund){
			$(tdFareRulles).prepend(l10n.order.norefund + ' &ndash; ');
		}
};
Makeorder.prototype.drawAmount = function(){
	var pmtVrntsHash = this.json.pmtVrntsHash;
	if (this.useBonus) {
		pmtVrntsHash = this.json.pmtVrntsBonusHash;
	}
	var elAmount = $(".amount", this.elForm)[0];
	var amt;
	if(tw.currency == 'RUB'){
		amt = Math.ceil(pmtVrntsHash[this.pmtVrnt].amount);
	} else {
		amt = pmtVrntsHash[this.pmtVrnt].amount;
	}
	elAmount.innerHTML = l10n.makeorder.amountTotal + formatMoney(amt) + " " + l10n.currency[tw.currency].Symbol;
};
Makeorder.prototype.drawTransactions = function(){
	var hash = this.json.pmtVrntsHash[this.pmtVrnt];
	if (this.useBonus) {
		hash = this.json.pmtVrntsBonusHash[this.pmtVrnt];
	}
	var elTransactions = $('.transactions', this.elForm)[0];
		elTransactions.innerHTML = '';
	if (hash.amount == 0) return;
	var elAmount = $(".amount", this.elForm)[0];
	var totals = hash.totals;
	this.kmqPayment = 'PG';
	if(hash.tp == 'cash'){
		this.kmqPayment = 'Cash';
	}
	if (hash.tp == 'cash' && totals[this.pmtVrnt].cur != tw.currency) {
		elAmount.innerHTML += ',';
		elTransactions.innerHTML = '&nbsp;' + l10n.payment.transactions.willBe + ' ' + '<b>' + formatMoney(Math.ceil(totals[this.pmtVrnt].amt)) + ' ' + getCurrencyFullRUBAbbr(totals[this.pmtVrnt].cur) + '</b>';
	} else {
		switch (this.pmtVrnt) {
			case 'gds':
				this.kmqPayment = 'GDS';
				var IsPaytureTransaction = Boolean(totals.payture || totals.payture_r || totals.payture_r_eur || totals.payture_p || totals.ua_cards);
				elTransactions.innerHTML += l10n.payment.transactions.drawn + ' ';
				//if (IsPaytureTransaction || totals.gds.cur != tw.currency) {
					if (IsPaytureTransaction) {
						elTransactions.innerHTML += '<br/>';
					}
				//}
				var gdsAmt = formatMoney(totals.gds.amt.toFixed(2));
				if(totals.gds.cur == 'RUB'){gdsAmt = formatMoney(Math.ceil(totals.gds.amt));}
				elTransactions.innerHTML += l10n.payment.transactions.toAk.replaceByHash({airline: ref.Airlines[this.json.pltCrr]}) + ' &mdash; <b>' + gdsAmt + ' ' + getCurrencyFullRUBAbbr(totals.gds.cur) + '</b>';

				if(IsPaytureTransaction){
					this.kmqPayment = 'Combine';
					var paytureAmt, paytureCur;
					if (totals.payture) {
						paytureAmt = totals.payture.amt;
						paytureCur = totals.payture.cur;
					}
					if (totals.payture_r) {
						paytureAmt = totals.payture_r.amt;
						paytureCur = totals.payture_r.cur;
					}
					if (totals.payture_r_eur) {
						paytureAmt = totals.payture_r_eur.amt;
						paytureCur = totals.payture_r_eur.cur;
					}
					if (totals.payture_p) {
						paytureAmt = totals.payture_p.amt;
						paytureCur = totals.payture_p.cur;
					}
					if (totals.ua_cards) {
						paytureAmt = totals.ua_cards.amt;
						paytureCur = totals.ua_cards.cur;
					}
					elTransactions.innerHTML += '<br/>' + l10n.and + ' ' + l10n.payment.transactions.toOtt + ' &mdash; <b>' + formatMoney(Math.ceil(paytureAmt)) + ' ' + getCurrencyFullRUBAbbr(paytureCur) + '</b>';					
				}

				break;
			case 'elixir':
			case 'payture':
			case "payture_r":
			case "payture_r_eur":
			case "payture_p":
			case 'ua_cards':
			case 'maestro_eur':
				elTransactions.innerHTML = l10n.payment.transactions.drawn + ' ' + l10n.payment.transactions.toOtt;
				elTransactions.innerHTML += '  &mdash; <b>' + formatMoney(Math.ceil(totals[this.pmtVrnt].amt)) + ' ' + getCurrencyFullRUBAbbr(totals[this.pmtVrnt].cur) + '</b>';
				break;
		}
	}
	//$(elTransactions).append(this.serviceTransaction);
};
Makeorder.prototype.drawAttention = function(){
	var pmtVrntsHash = this.json.pmtVrntsHash;
	if (this.useBonus) {
		pmtVrntsHash = this.json.pmtVrntsBonusHash;
	}
	if (pmtVrntsHash[this.pmtVrnt].tp == 'card') {
		$('.layout_paymentNote', this.elForm).removeClass('invisible');
		
		var totals = pmtVrntsHash[this.pmtVrnt].totals;
		var attentionText = $('.attentionText', this.elForm)[0];
			attentionText.innerHTML = '';
		var tempCurHash = {};
		for (var j in totals) {
			var currency = totals[j].cur;
			if(currency != tw.currency && !tempCurHash[currency]) {
				/*attentionText.innerHTML += l10n.payment.currencyConvertation.replaceByHash({
					rate: currency + '/' + tw.currency
				});
				attentionText.innerHTML += ' 1 ' + currency + ' = ' + tw.currencyRates[currency + tw.currency] + ' ' + tw.currency + '.<br/>';*/
				var rateInfo, rate = parseFloat(tw.currencyRates[currency + tw.currency],10);
				if(rate < 1){
					rateInfo = l10n.payment.currencyConvertation.replaceByHash({
						rate: tw.currency + '/' + currency
					});
					rateInfo += ' 1 ' + tw.currency + ' = ' + parseFloat(parseFloat(1/rate,10).toFixed(4),10)+ ' ' + currency + '.<br/>';
				} else {
					rateInfo = l10n.payment.currencyConvertation.replaceByHash({
						rate: currency + '/' + tw.currency
					});
					rateInfo += ' 1 ' + currency + ' = ' + parseFloat(rate.toFixed(4),10) + ' ' + tw.currency + '.<br/>';
				}
				attentionText.innerHTML += rateInfo;
				tempCurHash[currency] = 1;
			}
		}
		attentionText.innerHTML += l10n.payment.html_currencies;
		var transactionsCount = 0;
		for (var i = 0, length_i = this.json.reservations.length; i < length_i; i++) {
			var reservation = this.json.reservations[i];
			var paymentVariants = reservation.pmtVrnts_new;
			if (this.useBonus) {
				paymentVariants = reservation.pmtVrntsBonus;
			}
			var transactions = paymentVariants[this.pmtVrnt].transactions;
			transactionsCount += transactions.length;
		}
		if (transactionsCount > 1) {
			attentionText.innerHTML += '<div>' + l10n.payment.transactionsNote + '</div>';
		}
	} else {
		$('.layout_paymentNote', this.elForm).addClass('invisible');
	}
};
Makeorder.prototype.drawAgreements = function(){
	var self = this;
	var elAgreements = $('.agreements', this.elForm)[0];
	$('.discount-markup', elAgreements).addClass('invisible');
	$('.discount', elAgreements).addClass('invisible');
	$('.markup', elAgreements).addClass('invisible');
	if (this.isMarkup && this.isDiscount) {
		$('.discount-markup', elAgreements).removeClass('invisible');
	} else if (this.isDiscount) {
		$('.discount', elAgreements).removeClass('invisible');
	} else if (this.isMarkup) {
		$('.markup', elAgreements).removeClass('invisible');
	}
};
Makeorder.prototype.testCard = function(){
	if (this.json.pmtVrntsHash[this.pmtVrnt].tp == 'card') {
		$('.card', this.elForm).removeClass('invisible');
		if (this.pmtVrnt == 'ott_amex') {
			this.showAmex();
		} else {
			this.hideAmex();
		}
		if (this.pmtVrnt.indexOf('maestro') != -1) {
			$('.card .masterCard', this.elForm).addClass('invisible');
			$('.card .visa', this.elForm).addClass('invisible');
			$('.card .maestro', this.elForm).removeClass('invisible');
		} else {
			$('.card .maestro', this.elForm).addClass('invisible');
			$('.card .masterCard', this.elForm).removeClass('invisible');
			$('.card .visa', this.elForm).removeClass('invisible');
		}
		this.elButton.value = l10n.makeorder.buy;
	} else {
		$('.card', this.elForm).addClass('invisible');
		$('.block_cardsList', this.elForm).addClass('invisible');
		this.elButton.value = l10n.makeorder.book;
	}
};
Makeorder.prototype.showAmex = function(){
	$('.visa', this.objCreditCard.elCard).addClass("invisible");
	$('.masterCard', this.objCreditCard.elCard).addClass("invisible");
	$('.amex', this.objCreditCard.elCard).removeClass("invisible");
	
	$('.cardNumber table', this.objCreditCard.elCard).addClass("invisible");
	$('.numberAmex', this.objCreditCard.elCard).removeClass("invisible");
	
	$('.cvv', this.objCreditCard.elCard).addClass("invisible");
	$('.cid', this.objCreditCard.elCard).removeClass("invisible");
	
	$(".save", this.objCreditCard.elCard).addClass("invisible");
	
	$('.block_cardsList', this.elForm).addClass('invisible');
	
	if (this.elForm.cardId) {
		this.showNewCard();
	}
};
Makeorder.prototype.hideAmex = function(){
	$('.visa', this.objCreditCard.elCard).removeClass("invisible");
	$('.masterCard', this.objCreditCard.elCard).removeClass("invisible");
	$('.amex', this.objCreditCard.elCard).addClass("invisible");
	
	$('.cardNumber table', this.objCreditCard.elCard).removeClass("invisible");
	$('.numberAmex', this.objCreditCard.elCard).addClass("invisible");
	
	$('.cvv', this.objCreditCard.elCard).removeClass("invisible");
	$('.cid', this.objCreditCard.elCard).addClass("invisible");
	
	$(".save", this.objCreditCard.elCard).removeClass("invisible");
	
	$('.block_cardsList', this.elForm).removeClass('invisible');
	
	if (this.elForm.cardId) {
		if ($(this.elForm.cardId).filter(':checked').val() == "newCard") {
			this.showNewCard();
		} else {
			this.showSavedCard($(this.elForm.cardId).filter(':checked').val());
		}
	}
};
Makeorder.prototype.initCreditCard = function(){
	var options = {
		data: this.request.creditCard,
		form: this.elForm,
		curDate: this.now
	};
	this.objCreditCard = new CreditCard(options);
	if (objSocialAuth.checkAuthorized()) {
		this.showNewCard();
	}
};
Makeorder.prototype.setCardsList = function(){
	var self = this;
	var block = $(".block_cardsList", this.elBlank)[0];
	var table = document.createElement("table");
	for (var i = 0, length = this.json.cards.length; i < length; i++) {
		var card = this.json.cards[i];
		var row = table.insertRow(-1);
		var tdRadio = row.insertCell(-1);
			tdRadio.innerHTML = '<input type="radio" name="cardId" id="' + card.cardId + '" value="' + card.cardId + '"/>';
		var tdLabel = row.insertCell(-1);
		var label = document.createElement("label");
			label.htmlFor = card.cardId;
		var elMask = document.createElement("span");
			elMask.innerHTML = card.cardMask;
			label.appendChild(elMask);
			if (card.cardName) {
				label.innerHTML += "(" + card.cardName + ")";
			}
			tdLabel.appendChild(label);
	}
	row = table.insertRow(-1);
	tdRadio = row.insertCell(-1);
	tdRadio.innerHTML = '<input type="radio" name="cardId" id="newCard" value="newCard"/>';
	tdLabel = row.insertCell(-1);
	label = document.createElement("label");
	label.htmlFor = "newCard";
	label.innerHTML = l10n.makeorder.anotherCard;
	tdLabel.appendChild(label);
	block.appendChild(table);
	if (this.json.pmtVrntsHash[this.pmtVrnt].tp == 'card' && this.pmtVrnt != 'ott_amex') {
		$(block).removeClass("invisible");
	}
	
	$(this.elForm.cardId).change(function(){
		if (this.value == "newCard") {
			self.showNewCard();
		} else {
			self.showSavedCard(this.id);
		}
	});
	if (this.pmtVrnt == 'ott_amex') {
		$(this.elForm.cardId).filter('[value="newCard"]').click();
	} else {
		$(this.elForm.cardId[0]).click();
	}
};
Makeorder.prototype.showSavedCard = function(id){
	for (var i = 0, length = this.json.cards.length; i < length; i++) {
		if (this.json.cards[i].cardId == id) {
			var card = this.json.cards[i];
		}
	}
	$(this.objCreditCard.elCard).addClass("invisible");
	$(this.elSavedCard).remove();
	this.elSavedCard = $.tmpl(tmpl_Card)[0];
	$(this.elSavedCard).addClass("filledCard");
	$(".cardNumber label", this.elSavedCard).remove();
	$(".cardNumber table td.number1", this.elSavedCard).append(card.cardMask.substring(0, 4));
	$(".cardNumber table td.number2", this.elSavedCard).append(card.cardMask.substring(4, 8));
	$(".cardNumber table td.number3", this.elSavedCard).append(card.cardMask.substring(8, 12));
	$(".cardNumber table td.number4", this.elSavedCard).append(card.cardMask.substring(12, 16));
	$(".expDate table", this.elSavedCard)[0].deleteRow(0);
	$(".expMonth", this.elSavedCard).append("xx");
	$(".expYear", this.elSavedCard)[0].innerHTML = "xx";
	$(".holderName", this.elSavedCard)[0].innerHTML = card.cardHolder;
	new Field({
		appendTo: $(".cvv", this.elSavedCard)[0],
		name: "cvv2",
		value: "",
		type: "number",
		maxlength: 3
	});
	$(this.elSavedCard).insertAfter($(".SSL", this.elBlank));
	$(this.elForm.cvv2).select();
};
Makeorder.prototype.showNewCard = function(){
	$(this.elSavedCard).remove();
	$(this.objCreditCard.elCard).removeClass("invisible");
	$(".save", this.objCreditCard.elCard).removeClass("invisible");
	$(".save input", this.objCreditCard.elCard)[0].disabled = false;
	$(this.objCreditCard.number1.input).select();
};
Makeorder.prototype.initAgreementsLinks = function(){
	var self = this;
	var $elTariffLink = $("#link_fareRules", this.elForm);
	$elTariffLink.click(function(){
		$("html,body").animate({
			scrollTop: $(".block_payment", self.elForm).offset().top - 20
		});
	});
	var $elBaggageLink = $("#link_baggage", this.elForm);
	if( $(".baggage", this.elBlank).length >0) {
		$elBaggageLink.click(function(){
			$("html,body").animate({
				scrollTop: $(".baggage", this.elBlank).offset().top - 20
			});
		});
	} else {
		$elBaggageLink.removeClass('link dotted');
	}
};
Makeorder.prototype.onSubmit = function(){
	var self = this;
	kmqRecord({name: 'Pay'});
	this.getData();
	if (this.checkData()) {
		var addParams = {"PayMethod": this.pmtVrnt};
		addParams.isAuthorized = tw.provider?objSocialAuth.userName:'NO';
		addParams.enteredEmail = this.request.email;
		addParams.enteredPhone = this.request.phone;
		_kmq.push(['set', addParams]);
		kmqRecord({name: 'GoToPay'});
		this.startcreateorder();
	}
};
Makeorder.prototype.getData = function(){
	var self = this;
	var hash = this.json.pmtVrntsHash[this.pmtVrnt];
	if (this.useBonus) {
		hash = this.json.pmtVrntsBonusHash[this.pmtVrnt];
	}
	this.phoneField.update();
	this.request.phone = this.phoneField.value;
	this.request.email = this.emailField.value;
	if (this.elForm.agreements.checked) {
		this.request.agreements = true;
	} else {
		this.request.agreements = false;
	}
	if (this.useBonus) {
		this.request.useFullBonus = true;
	}
	this.request.saveCard = false;
	if (hash.amount == 0) {
		this.request.creditCard.number = '4111111111111111';
		this.request.creditCard.expDate = '1120';
		this.request.creditCard.holderName = 'FULL BONUS';
		this.request.creditCard.cvv = '135';
	} else if(this.json.pmtVrntsHash[this.pmtVrnt].tp == 'card'){
		if (this.elForm.cardId && $(this.elForm.cardId).filter(":checked")[0].value != "newCard") {
			this.request.creditCard.id = $(this.elForm.cardId).filter(":checked")[0].value;
			this.request.creditCard.cvv = this.elForm.cvv2.value;
		} else {
			this.request.creditCard = this.objCreditCard.getData();
			if (this.pmtVrnt == 'ott_amex') {
				this.request.creditCard.number = this.elForm.numberAmex.value;
				this.request.creditCard.cvv = this.elForm.cid.value;
			} else {
				if ($(".save input", this.objCreditCard.elCard)[0].checked) {
					this.request.saveCard = $(".save input", this.objCreditCard.elCard)[0].value;
				}
			}
		}
	} else {
		delete this.request.creditCard;
	}
	if (this.pmtVrnt == 'rapida') {
		this.request.separatePayments = true;
	} else {
		delete this.request.separatePayments;
	}
	
	var passIndex = 0;
	for (var i = 0, length_i = this.request.reservations.length; i < length_i; i++) {
		var reservation = this.request.reservations[i];
			reservation.paymentVariant = this.pmtVrnt;
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++) {
			var passenger = reservation.passengers[j];
			var passengerFields = this.passengersFields[passIndex];
			
				passenger.birthDate_Date = passengerFields.birthDate.value;
			if (isValidDate(passenger.birthDate_Date)) {
				passenger.birthDate = passenger.birthDate_Date.format("yyyymmdd");
			} else {
				passenger.birthDate = null;
			}
				passenger.passCountry = passengerFields.passCountry.value;
				passenger.passNumber = passengerFields.passNumber.value;
			if (passengerFields.passExpDate.input.disabled) {
				passenger.needPassExpDate = false;
			} else {
				passenger.needPassExpDate = true;
			}
				passenger.passExpDate_Date = passengerFields.passExpDate.value;
			if (isValidDate(passenger.passExpDate_Date)) {
				passenger.passExpDate = passenger.passExpDate_Date.format("yyyymmdd");
			} else {
				passenger.passExpDate = null;
			}
			if (passengerFields.freqFlyerNumber.input.disabled) {
				delete passenger.freqFlyerNumber;
			} else {
				passenger.freqFlyerNumber = passengerFields.freqFlyerNumber.value;
			}
			if (this.alliance) {
				passenger.freqFlyerAirline = this.freqFlyerAirlineField.value;
			} else {
				passenger.freqFlyerAirline = this.ak;
			}
			
			passIndex++;
		}
	}

	delete this.request.additionalServices;
	if(this.service && this.service.additionalServices){
		var servicePayType = self.json.pmtVrntsHash[self.pmtVrnt].tp;
		var stype1,stype2;
		this.request.additionalServices = {};
		if(this.service.isbaggage || this.service.iscasual){
			for(var pi=0, pl=this.json.additionalServices.insurance.pmtVrnts.length; pi<pl; pi++){
				if(servicePayType == this.json.additionalServices.insurance.pmtVrnts[pi]){
					stype1 = this.json.additionalServices.insurance.pmtVrnts[pi].tag;
					break;
				}
			}
			this.request.additionalServices.insurance = {passengers: [], paymentVariant: stype1};
		}
		if(this.service.isbaggage){
			function DefaultBaggageFields(){
				this.type = $(self.service.elements.baggage).data('tp');
				this.source = $(self.service.elements.baggage).data('src');
				this.cost = $(self.service.elements.baggage).data('price');
				this.payout = $(self.service.elements.baggage).data('payout');
			}
			for(var Pi=0, PL = this.service.selectedPassengersFiels.length; Pi<PL; Pi++){
				var curElPas = this.service.selectedPassengersFiels[Pi];
				var idPas = curElPas.id.split('_');
				var selectedPas = this.json.reservations[idPas[1]].passengers[idPas[2]];
				var newPas = new DefaultBaggageFields();
				newPas.firstName = selectedPas.firstName;
				newPas.lastName = selectedPas.lastName;
				newPas.ageType = selectedPas.ageType;
				newPas.birthDate = selectedPas.birthDate;
				this.request.additionalServices.insurance.passengers.push(newPas);
			}
		}
		if(this.service.iscasual){
			function DefaultCasualFields(){
				this.type = $(self.service.elements.casual).data('tp');
				this.source = $(self.service.elements.casual).data('src');
				this.cost = $(self.service.elements.casual).data('price');
				this.payout = $(self.service.elements.casual).data('payout');
			}
			for(var Pi=0, PL = this.service.passengers.length; Pi<PL; Pi++){
				var curElPas = this.service.passengers[Pi];
				var idPas = curElPas.id.split('_');
				var selectedPas = this.json.reservations[idPas[0]].passengers[idPas[1]];
				var newPas = new DefaultCasualFields();
				newPas.firstName = selectedPas.firstName;
				newPas.lastName = selectedPas.lastName;
				newPas.ageType = selectedPas.ageType;
				newPas.birthDate = selectedPas.birthDate;
				this.request.additionalServices.insurance.passengers.push(newPas);
			}
		}
		if(this.service.isnotify){
			for(var pi=0, pl=this.json.additionalServices.notification.pmtVrnts.length; pi<pl; pi++){
				if(servicePayType == this.json.additionalServices.notification.pmtVrnts[pi].tp){
					stype2 = this.json.additionalServices.notification.pmtVrnts[pi].tag;
					break;
				}
			}			
			this.request.additionalServices.notification = {
				types:[{
					type: $(self.service.elements.notify).data('tp')
				}],
				paymentVariant: stype2
			};
		}
	}
};
Makeorder.prototype.checkData = function(){
	var self = this;
	var hash = this.json.pmtVrntsHash[this.pmtVrnt];
	if (this.useBonus) {
		hash = this.json.pmtVrntsBonusHash[this.pmtVrnt];
	}
	var errors = 0;
	var errorField = null;
	var needField = {
		"email_phone": false,
		"checkbox": false,
		"passenger": false
	}
	var passIndex = 0;
	var passengerError = 0;
	for (var i = 0, length_i = this.request.reservations.length; i < length_i; i++) {
		var reservation = this.request.reservations[i];
		for (var j = 0, length_j = reservation.passengers.length; j < length_j; j++) {
			var passenger = reservation.passengers[j];
			var passengerFields = this.passengersFields[passIndex];
			
			if (!passenger.birthDate || passengerFields.birthDate.error) {
				errors++;
				passengerFields.birthDate.addError();
				if (!errorField) {
					errorField = passengerFields.birthDate;
				}
				passengerError++;
			}
			if (!passenger.passNumber || passengerFields.passNumber.error) {
				errors++;
				passengerFields.passNumber.addError();
				if (!errorField) {
					errorField = passengerFields.passNumber;
				}
				passengerError++;
			}
			if (passenger.needPassExpDate && (!passenger.passExpDate || passengerFields.passExpDate.error)) {
				errors++;
				passengerFields.passExpDate.addError();
				if (!errorField) {
					errorField = passengerFields.passExpDate;
				}
				passengerError++;
			}
			if (!passengerFields.freqFlyerNumber.input.disabled && !passenger.freqFlyerNumber) {
				errors++;
				passengerFields.freqFlyerNumber.addError();
				if (!errorField) {
					errorField = passengerFields.freqFlyerNumber;
				}
				passengerError++;
			}
			passIndex++;
		}
	}
	if(passengerError){
		needField["passenger"] = true;
	}
	if (!this.request.phone || this.phoneField.error) {
		errors++;
		this.phoneField.addError();
		if (!errorField) {
			needField["email_phone"] = true;
			errorField = this.phoneField;
		}
	}
	if (!this.request.email || this.emailField.error) {
		errors++;
		this.emailField.addError();
		if (!errorField) {
			needField["email_phone"] = true;
			errorField = this.emailField;
		}
	}
	if (this.json.pmtVrntsHash[this.pmtVrnt].tp == 'card' && hash.amount != 0) {
		if (this.pmtVrnt == 'ott_amex') {
			
		} else if (this.request.creditCard.id) {
			if (!this.request.creditCard.cvv || this.elForm.cvv2.field.error || (this.request.creditCard.cvv && this.request.creditCard.cvv.length < 3)) {
				errors++;
				this.elForm.cvv2.field.addError();
				if (!errorField) {
					errorField = this.elForm.cvv2.field;
				}
			}
		} else {
			if (!this.objCreditCard.fields.number1.value || this.objCreditCard.fields.number1.error || (this.objCreditCard.fields.number1.value && this.objCreditCard.fields.number1.value.length < 4)) {
				errors++;
				this.objCreditCard.fields.number1.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.number1;
				}
			}
			if (!this.objCreditCard.fields.number2.value || this.objCreditCard.fields.number2.error || (this.objCreditCard.fields.number2.value && this.objCreditCard.fields.number2.value.length < 4)) {
				errors++;
				this.objCreditCard.fields.number2.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.number2;
				}
			}
			if (!this.objCreditCard.fields.number3.value || this.objCreditCard.fields.number3.error || (this.objCreditCard.fields.number3.value && this.objCreditCard.fields.number3.value.length < 4)) {
				errors++;
				this.objCreditCard.fields.number3.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.number3;
				}
			}
			if (!this.objCreditCard.fields.number4.value || this.objCreditCard.fields.number4.error || (this.objCreditCard.fields.number4.value && this.objCreditCard.fields.number4.value.length < 4)) {
				errors++;
				this.objCreditCard.fields.number4.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.number4;
				}
			}
			if (!this.objCreditCard.fields.number1.error && !this.objCreditCard.fields.number2.error && !this.objCreditCard.fields.number3.error && !this.objCreditCard.fields.number4.error && !this.objCreditCard.checkCardByLuhnAlgorithm()) {
				if(!this.objCreditCard.checkCardByLuhnAlgorithm()){
					kmqRecord({name: 'WrongCardPAN'});
				}
				errors++;
				this.objCreditCard.fields.number1.addError("Luhn");
				if (!errorField) {
					errorField = this.objCreditCard.fields.number1;
				}
			}
			if (!this.objCreditCard.fields.expMonth.value || this.objCreditCard.fields.expMonth.error) {
				errors++;
				this.objCreditCard.fields.expMonth.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.expMonth;
				}
			}
			if (!this.objCreditCard.fields.expYear.value || this.objCreditCard.fields.expYear.error) {
				errors++;
				this.objCreditCard.fields.expYear.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.expYear;
				}
			}
			if (!this.request.creditCard.holderName || this.objCreditCard.fields.holderName.error) {
				errors++;
				this.objCreditCard.fields.holderName.addError();
				if (!errorField) {
					errorField = this.objCreditCard.fields.holderName;
				}
			}
			if (!this.request.creditCard.cvv || this.objCreditCard.fields.cvv.error || (this.request.creditCard.cvv && this.request.creditCard.cvv.length < 3)) {
				errors++;
				this.objCreditCard.fields.cvv.addError('cvv');
				if (!errorField) {
					errorField = this.objCreditCard.fields.cvv;
				}
			}
		}
	}
	if (!this.request.agreements) {
		errors++;
		this.agreementsField.addError();
		if (!errorField) {
			needField["checkbox"] = true;
			errorField = this.agreementsField;
		}
	}
	if(this.service && this.service.needNotify){
		errors++;
		this.notifyField.addError();
		if (!errorField) {
			errorField = this.notifyField;
		}		
	}
	if (errors) {
		if(needField["email_phone"]) {
			kmqRecord({name: 'DE_EmailPhone'});
		}
		if(needField["checkbox"]) {
			kmqRecord({name: 'DE_Checkbox'});
		} 
		if(needField["passenger"]) {
			kmqRecord({name: 'DE_PassengerData'});
		}
		$("html,body").animate({
			scrollTop: $(errorField.elField).offset().top - 80
		}, "fast");
		errorField.input.focus();
		return false;
	} else {
		return true;
	}
};
Makeorder.prototype.startcreateorder = function(){
	var self = this;
	var requestOptions = {
		repeats: 1,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(xhr){
			removeLoader();
			self.setPageButtons();
			$(self.elBlank).fadeIn("fast");
			//order error event
			kmqRecord({name: 'Order_TimeOut', url: document.location.href, text: 'Order_TimeOut'});
		}
	};
	this.CheckCodeTry = this.CheckCodeTry||false;
    this.request.srcmarker = twiket.setup.marker;
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			type: "post",
			dataType: "jsonp",
			url: "https://secure.onetwotrip.com/_api/process/startcreateorder/",
			data: {
				"params":  JSON.stringify(self.request)
			},
			timeout: 120000,
			beforeSend: function(){
				appendLoader({
					appendTo: document.getElementById("layout_body"),
					text: l10n.loaders.moment
				});
				$(self.elBlank).fadeOut("fast", function(){
					self.setPageButtons("createorder");
				});
			},
			success: function(json){
				self.getprocessresult(json.processId);
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr,requestOptions);
			}
		});		
	}	
};
Makeorder.prototype.getprocessresult = function(processId){
	var self = this;
	var requestOptions = {
		repeats: 1,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(){
			removeLoader();
			self.setPageButtons();
			$(self.elBlank).fadeIn("fast");
			kmqRecord({name: 'Order_TimeOut', url: document.location.href, text: 'Order_TimeOut'});
		}
	};
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			cache: false,
			dataType: "json",
			url: "https://secure.onetwotrip.com/_api/process/getprocessresult/",
			data: {
				id: processId,
                source: twiket.setup.source
			},
			timeout: 120000,
			success: function(json){
				if (json.id && json.id !== '' && json.email) {
					$(document.body).trigger("removeUnloadReservation");
					if(self.json.metaSearch){
						deleteCookie({name: 'referrer'});
					}
					try {
						var curPV = self.json.pmtVrntsHash[self.pmtVrnt].totals[self.pmtVrnt];
						var kmqAmount = curPV.amt;
						if(curPV.cur != 'USD') {
							kmqAmount = (kmqAmount * tw.currencyRates[curPV.cur + 'USD']).toFixed(2);
						}
						kmqRecord({name: 'Billed', obj: {'Billing Amount': kmqAmount, 'Billing Description': (tw.provider)?'Authorized':'Not authorized'} });
					} catch (e) {}
					if(self.useBonus){
						kmqRecord({name: 'UsingBonus'});
					}
					if(self.json.promoCodeData){
						kmqRecord({name: 'OrderWithPromoCode', obj: {'PromoCurrency':self.json.promoCodeData.cur, 'PromoAmount':self.json.promoCodeData.amt, 'PromoValue':self.json.promoCodeData.codeNum} });
						_gaq.push(['_setCustomVar',1, 'PromoCode','Yes',2]);
					}
					if(self.CheckCodeTry) {
						kmqRecord({name: 'CheckCodeAccepted'});
					}
					var kmqParams = {
						PaymentMethod: self.kmqPayment
					};
					if(self.service && self.service.elements && self.service.elements.notify){
						kmqParams["NotificationChoose"] = self.service.elements.notify.value;
					}
					kmqRecord({name: 'ORDER_RESULT', obj: kmqParams});
					try {yaCounter18086416.reachGoal('Success');} catch (e) {}		 
					//ggl
						_gaq.push(['_trackPageview','/successfulResult']);
						//if(document.cookie.match(/utmcsr=Direct|gclid=.+/i)) {
							var gglAmount = 0;
							for(var GI in self.ggl){
								var curType = self.ggl[GI];
								gglAmount += curType.price*curType.count;
							}
							var gglType = tw.franchise.a + ' BankCard';
							if(self.pmtVrnt == 'rapida') { gglType = tw.franchise.a + ' Cash'; }
							_gaq.push(['_addTrans',json.id,gglType,gglAmount,'','','','','']);

							for(var GI in self.ggl){
								var curType = self.ggl[GI];
								gglAmount += curType.price*curType.count;
								_gaq.push(['_addItem',json.id,self.gglRoute,'ticket','Avia',curType.price,curType.count]);
							}
							_gaq.push(['_trackTrans']);
						//}
					var _newKey = 'number=' + json.id + '&email=' + json.email;
					var _stringKey = makeKey();
					var _encodedString = encryptGString( _newKey, _stringKey );
					writeKeys(_stringKey);
					setTimeout(function(){
						window.location.href = '/ticket/?mo&c=' + _encodedString;
					}, 2000);
				} else if(json.status === "InProcess"){
					setTimeout(function(){
						self.getprocessresult(processId);
					}, 2000);
				} else if(json.errors) {
					removeLoader();
					self.parseError(json);
				}
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr,requestOptions);
			}
		});		
	}
};
Makeorder.prototype.showCardAuthorization = function(json,isSavingCard){
	var self = this;
	var err = json.errors[0];
	var showWarning = isSavingCard?false:true;
	var elPopup = addPopup({
		type: "cardAuthorization",
		id: "cardAuthorization",
		close_button: true,
		showWarn: showWarning
	});
	if(!this.cardAuthorizationCount) {
		this.cardAuthorizationCount = 1;
	} else {
		this.cardAuthorizationCount++;
	}
	if(err == 'AUTHORIZATION_CARD_ERROR'){
		kmqRecord({name: 'CheckCodeRejected'});
		if(json.attemptsLeft){
			$(".error div", elPopup).html(l10n.cardAuth.errorCode + l10n.cardAuth.errorCodeTries + json.attemptsLeft);
		} else {
			$(".error div", elPopup).html(l10n.cardAuth.errorCode);
		}
		$(".error div", elPopup).removeClass("invisible");
	}
	var elForm = $("form", elPopup)[0];
	var code = new Field({
		appendTo: $(".code", elForm)[0],
		name: "appCode",
		maxlength: 4,
		type: "number"
	});
	$("input", elForm).focus();
	$('.close_button', elPopup).on('click', function(){
		kmqRecord({name: 'CheckCodeIgnore'});
		self.CheckCodeTry = false;
	});
	$('#tryAnotherCard', elPopup).on('click', function(){
		kmqRecord({name: 'CheckCodeNewCard'});
		self.CheckCodeTry = false;
		removePopup();
	});

	$(elForm).submit(function(event){
		event.preventDefault();
		if(trim(this.appCode.value) === "") {
			code.input.focus();
			return;
		}
		self.CheckCodeTry = true;
		kmqRecord({name:"CheckCodeTry", obj:{'CodeValue': this.appCode.value}});
		removePopup();
		self.request.appCode = this.appCode.value;
		self.startcreateorder();
	});
};
Makeorder.prototype.parseError = function(json){
	var self = this;
	var err = json.errors[0];
	var allPasText = l10n.popup.card.passengers[0];
	var pasText = l10n.popup.card.passengers[1];
	if (json.invalidPassengerIndex) {
		allPasText = '<p>' + l10n.popup.card.passengers[2] + parseInt(json.invalidPassengerIndex + 1, 10) + '</p>';
		pasText = '<p>' + l10n.popup.card.passengers[3] + parseInt(json.invalidPassengerIndex + 1, 10) + '</p>';
	}
	var cardProblem = l10n.popup.card.cardProblem;
	var kmqErrors = {
		card: {"AUTHORIZATION_CARD_ERROR":1, "INVALID_CARD_NUMBER":1, "EMPTY_CVV_CODE":1},
		payment: {"BLOCK_PAYMENT_ERROR":1, "CANT_BLOCK_MONEY":1, "IMPOSSIBLE_PAYMENT_VARIANT":1}
	};
	var cardStr = 'NIB=savedCard: PayThrow=' + this.pmtVrnt;
	if(this.request.creditCard && this.request.creditCard.number && (!this.request.creditCard.id || this.request.creditCard.id == '')) {
		cardStr = 'NIB='+this.request.creditCard.number.substring(0,6) + ': PayThrow=' + this.pmtVrnt;		
	}
	var errName = err;
	var errText = err;
	if(kmqErrors.card[err]) {
		errName = 'ERROR_CARD';
	} else if(kmqErrors.payment[err]) {
		errName = 'ERROR_PAYMENT';
		if(err == 'BLOCK_PAYMENT_ERROR'){
			errText+= ': ' + cardStr;
		}
	} else if(err == 'NEED_CARD_AUTHORIZATION'){
		errName = 'NEED_AUTH';
	} else if(err == 'CARD_REFUSE'){
		errText+= ': ' + cardStr;
	}
	if(err != 'NEED_CARD_AUTHORIZATION' && err != 'AUTHORIZATION_CARD_ERROR') {
		this.CheckCodeTry = false;
	}
	switch (err) {
		case "NO_TRIPS_SELECTED":
		case "NO_PASSENGERS":
		case "EMPTY_GDS_INFO":
		case "SYSTEM_ERROR":
		case "ORDER_CREATE_ERROR":
		case "EMPTY_PAYMENT_VARIANT":
		case "BAD_CARD_TYPE":
		case "NO_FARE_KEY":
			errName = 'ORDER_SYSTEM_ERROR';
			addPopup({
				error: true,
				reason: l10n.popup.systemError,
				comment: l10n.popup.systemComment,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "IMPOSSIBLE_PAYMENT_VARIANT":
			addPopup({
				error: true,
				reason: l10n.popup.card.paymentError,
				comment: (this.json.pmtVrnts.length > 1 ? l10n.popup.impossiblePaymentVariant1 : l10n.popup.impossiblePaymentVariant),
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "EMPTY_FIRST_NAME":
		case "EMPTY_LAST_NAME":
		case "EMPTY_BIRTH_DATE":
		case "EMPTY_GENDER":
		case "EMPTY_PASSPORT_NUMBER":
		case "EMPTY_PASSPORT_COUNTRY":
		case "EMPTY_PASSPORT_EXP_DATE":
			errName = 'ORDER_PASSENGER_ERROR';
			addPopup({
				error: true,
				reason: l10n.popup.card.errorData,
				comment: allPasText,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "INCORRECT_FIRST_NAME":
		case "INCORRECT_LAST_NAME":
		case "INVALID_EMAIL":
		case "INCORRECT_PASSPORT_NUMBER":
		case "INCORRECT_AGE_TYPE":
		case "INVALID_PHONE":
			errName = 'ORDER_DATA_ERROR';
			addPopup({
				error: true,
				reason: l10n.popup.card.errorData,
				comment: l10n.popup.card.field + "<br/>" + pasText,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "NO_ACCOMPANYING_ADT":
			addPopup({
				error: true,
				reason: l10n.popup.card.pasCount,
				comment: l10n.popup.card.warnKids,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "PASSENGER_TOO_OLD":
		case "TOO_MUCH_INFANTS":
			errName = 'ORDER_AGE_ERROR';
			addPopup({
				error: true,
				reason: l10n.popup.card.errorData,
				comment: l10n.popup.card.passengersField,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "CREATE_RESERVATION_ERROR":
			addPopup({
				error: true,
				reason: l10n.popup.card.errorConfirm,
				comment: l10n.popup.card.commentConfirm,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "NEED_CARD_AUTHORIZATION":
		case "AUTHORIZATION_CARD_ERROR":
			this.showCardAuthorization(json,self.request.saveCard);
			break;
		case "BAD_CARD":
			this.cardAuthorizationCount = null;
			addPopup({
				error: true,
				reason: l10n.popup.card.transactionError,
				comment: l10n.popup.card.anotherCard,
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "TOTAL_PRICE_CHANGED":
		case "BASE_TAXES_DOESNT_MATCH":
			errName = 'ERROR_BOOKING';
			addPopup({
				error: true,
				reason: l10n.popup.card.priceChanged,
				comment: l10n.popup.card.newSearchComment,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "INVALID_CARD_NUMBER":
			var text = cardProblem;
			if (this.pmtVrnt == 'gds' && this.json.pmtVrnts.length>1) {
				text += l10n.popup.card.cardProblemOptions[1];
			}
			addPopup({
				error: true,
				reason: l10n.popup.card.transactionError,
				comment: text,
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "DELAYED_CARD": 
		case "BLOCK_PAYMENT_ERROR":
		case "CARD_REFUSE":
			var text,title;
			if (this.pmtVrnt == 'gds' || this.pmtVrnt == 'payture') {
				title = l10n.popup.card.paymentError2;
				text = $.tmpl(l10n.popup.card.cardProblemOptions2, {otherVariantsAvailable: self.json.pmtVrnts.length > 1})[0];
				text = $(text).html();
			}
			else {
				title = l10n.popup.card.paymentError;
				text = l10n.popup.card.cardProblemOptions[0] + l10n.popup.card.cardProblem2;
			}
			addPopup({
				error: true,
				reason: title,
				comment: text,
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.card.checkPayment,
				actionButton: "removePopup();"
			});
			break;
		case "NOT_ENOUGHT_MONEY":
		case "NO_MONEY":
			errName = 'NO_MONEY';
			addPopup({
				error: true,
				reason: l10n.popup.card.paymentError,
				comment: l10n.popup.card.noMoneyRecharge,
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "CANT_BLOCK_MONEY":
			addPopup({
				error: true,
				reason: l10n.popup.card.transactionError,
				comment: cardProblem,
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "INVALID_FREQUENT_CARD":
			addPopup({
				error: true,
				reason: l10n.popup.card.bonusCard[0],
				comment: l10n.popup.card.bonusCard[1],
				className: "ErrorPopup",
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "EXPIRED":
			errName = 'EXPIRED_ORDER';
			$(document.body).trigger("removeUnloadReservation");
			addPopup({
				error: true,
				close_button: true,
				reason: l10n.popup.card.prereservation[0],
				comment: l10n.popup.card.prereservation[1],
				button: l10n.popup.card.newSearch,
				actionButton: "window.location.href = '" + self.PrevHref + "'"
			});
			break;
		case "EMPTY_CVV_CODE":
			addPopup({
				error: true,
				close_button: true,
				reason: l10n.popup.card.transactionError,
				comment: l10n.popup.card.cvvComment,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case "INVALID_SEGMENT_STATUS":
			errName = 'ORDER_INVALID_SEGMENT';
			var text = l10n.popup.card.segments[1];
			if(this.multiAKflight){
				text+= l10n.popup.card.segments[2];
			}
			text+= l10n.popup.card.segments[3];
			if (this.pmtVrnt == 'gds' || this.pmtVrnt == 'payture') {
				text += l10n.popup.card.segments[4];
			}
			text += l10n.popup.card.segments[5];
			addPopup({
				error: true,
				close_button: true,
				reason: l10n.popup.card.segments[0],
				comment: text,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case 'NOT_ENOUGHT_TIME_TO_DEPARTURE':
			addPopup({
				error: true,
				close_button: true,
				reason: l10n.popup.card.notEnoughtTimeToDeparture[0],
				comment: l10n.popup.card.notEnoughtTimeToDeparture[1],
				button: l10n.popup.card.newSearch,
				actionButton: "window.location.href = '" + self.PrevHref + "'"
			});
			break;
		case 'NEED_REPRICE':
			errName = 'ORDER_NEED_REPRICE';
			$(document.body).trigger("removeUnloadReservation");
			addPopup({
				error: true,
				reason: l10n.popup.warning,
				comment: l10n.popup.card.reprice[0],
				button: l10n.popup.card.reprice[1],
				actionButton: "window.location.reload()"
			});
			break;
		case 'CODE_NOT_VALID':
			$(document.body).trigger("removeUnloadReservation");
			addPopup({
				error: true,
				reason: l10n.popup.card.paymentError,
				comment: l10n.popup.bonusCodeNotValid,
				button: l10n.popup.card.reprice[1],
				actionButton: "window.location.reload()"
			});
			break;
		case 'SESSION_EXPIRED':
			var popup = addPopup({
				error: true,
				reason: l10n.popup.warning,
				comment: l10n.popup.needAuth
			});
			$("span.link", popup).click(function(){
				removePopup();
				objSocialAuth.show(objSocialAuth.regauthForm);
			});
			break;
		case 'CARD_NOT_ELIXIR':
			var popup = addPopup({
				error: true,
				reason: l10n.popup.warning,
				comment: l10n.popup.card.not_elixir,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		case 'NOT_MAESTRO_CARD':
			var popup = addPopup({
				error: true,
				reason: l10n.popup.warning,
				comment: l10n.popup.card.not_maestro,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		default:
			addPopup({
				error: true,
				reason: l10n.popup.systemError,
				comment: l10n.popup.systemComment,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
	}
	kmqRecord({name: errName, url: document.location.href, text: errText});
	this.setPageButtons();
	$(this.elBlank).fadeIn("fast");
};

function AKSelect(options){
	this.options = options || {};
	this.elField = this.options.appendTo;
	this.createSelect();
}
AKSelect.prototype.createSelect = function(){
	var self = this;
	this.elLink = document.createElement("span");
	this.elLink.className = "link dashed";
	this.elField.appendChild(this.elLink);
	this.elSelect = document.createElement("select");
	if (this.options.name) this.elSelect.name = this.options.name;
	for (var i in ref.Alliances[this.options.alliance]) {
		var elOption = document.createElement("option");
			elOption.innerHTML = ref.Airlines[i];
			elOption.value = i;
		this.elSelect.appendChild(elOption);
	}
	this.getValue();
	$(this.elSelect).bind("keydown keypress keyup change", function(){
		self.value = this.options[this.selectedIndex].value;
		self.setValue();
	});
	this.elField.appendChild(this.elSelect);
	$(this.elSelect).focus(function(){
		$(self.elField).addClass("focus");
	});
	$(this.elSelect).blur(function(){
		$(self.elField).removeClass("focus");
	});
};
AKSelect.prototype.getValue = function(){
	var self = this;
	this.value = this.elSelect.value;
	if(this.options.value){
		this.elSelect.value = this.options.value;
	}
	if(this.elSelect.selectedIndex<0){
		this.elSelect.selectedIndex = 0;
	}
	this.value = this.elSelect.options[this.elSelect.selectedIndex].value;
	this.setValue();
};
AKSelect.prototype.setValue = function(){
	var str = this.elSelect.options[this.elSelect.selectedIndex].text;
	this.elLink.innerHTML = str;
};
AKSelect.prototype.setEnabled = function(){
	this.elSelect.disabled = false;
	$(this.elLink).removeClass("disabled");
};
AKSelect.prototype.setDisabled = function(){
	this.elSelect.disabled = true;
	$(this.elLink).addClass("disabled");
};
function PassCountrySelect(options){
	this.options = options || {};
	this.changed = false;
	this.elField = $.tmpl(tmpl_FieldStyle)[0];
	this.$elFocus = $(".focus", this.elField);
	this.createSelect();
	this.options.appendTo.appendChild(this.elField);
}
PassCountrySelect.prototype.createSelect = function(){
	var self = this;
	this.elLink = document.createElement("span");
	this.elLink.className = "link dashed";
	this.elField.appendChild(this.elLink);
	this.elSelect = createCountrySelect();
	this.elSelect.field = this;
	this.elSelect.name = this.options.name;
	this.getValue();
	$(this.elSelect).bind("keydown keypress keyup change", function(event){
		self.value = this.options[this.selectedIndex].value;
		self.setValue();
		if (!self.options.domesticFlight && event.type == "change") {
			checkOnRuPassport(this);
		}
	});
	this.elField.appendChild(this.elSelect);
	$(this.elSelect).focus(function(){
		self.$elFocus.fadeIn();
	});
	$(this.elSelect).blur(function(){
		self.$elFocus.fadeOut();
	});
};
PassCountrySelect.prototype.getValue = function(){
	var self = this;
	this.value = this.elSelect.value;
	if (this.options.value) {
		this.value = this.options.value;
		this.elSelect.value = this.value;
		this.setValue();
	} else if (tw.position) {
		onGetPosition();
	} else {
		$(document).one("getPosition", function(){
			onGetPosition();
		});
		if(this.elSelect.selectedIndex<0) {
			this.elSelect.selectedIndex = 0;
		}
		this.value = this.elSelect.options[this.elSelect.selectedIndex].value;
		this.setValue();
		this.changed = false;
	}
	function onGetPosition(){
		if (tw.position.countryCode && !self.changed) {
			if (ref.Countries[tw.position.countryCode]) {
				self.value = tw.position.countryCode;
				self.elSelect.value = self.value;
			}
			self.setValue();
		}
	}
};
PassCountrySelect.prototype.setValue = function(){
	this.changed = true;
	if(this.elSelect.selectedIndex<0){//chrome if country not in pascountry list
		this.elSelect.selectedIndex = 0;
	}
	var str = this.elSelect.options[this.elSelect.selectedIndex].text;
	this.elLink.innerHTML = str;
	this.title = str;
};
function AgreementsField(elForm){
	var self = this;
	this.elForm = elForm;
	this.elField = $(".agreements", this.elForm)[0];
	this.elError = $(".warn", this.elField)[0];
	this.input = this.elForm.agreements;
	$(this.input).change(function(){
		self.removeError();
	});
}
AgreementsField.prototype.addError = function(){
	$(this.elError).removeClass("invisible");
};
AgreementsField.prototype.removeError = function(){
	$(this.elError).addClass("invisible");
};

function NotifyField(elForm){
	var self = this;
	this.elForm = elForm;
	this.elField = $(".block_notify", this.elForm)[0];
	this.elError = $(".warn", this.elField)[0];
	this.input = $('input',this.elField);
	$(this.input).change(function(){
		self.removeError();
	});
}
NotifyField.prototype.addError = function(){
	$(this.elError).removeClass("invisible");
};
NotifyField.prototype.removeError = function(){
	$(this.elError).addClass("invisible");
};
function checkOnRuPassport(elFormItem){
	var number = elFormItem.field.options.number;
	var passCountryField = $('select[name="passCountry' + number + '"]')[0].field;
	var passNumberField = $('input[name="passNumber' + number + '"]')[0].field;
	var passExpDateField = $('input[name="passExpDate' + number + '"]')[0].field;
	var regDigits = new RegExp(/[^0123456789]/);
	if(disablePassExpire && passCountryField.value == "RU" && passNumberField.input.value.length == 10 && !regDigits.test(passNumberField.input.value)){
		passExpDateField.setDisabled();
	} else {
		passExpDateField.setEnabled();
	}
}