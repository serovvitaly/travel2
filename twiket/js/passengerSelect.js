var tmpl_PassengerSelect, tmpl_GenderSelect;
var tmpl_topPanel2Button = '<div class="button ${className}"><div class="l"></div><div class="r"></div><div class="c"></div>${title}</div>';
var objPassengerSelect = null;
var fareRulesList = {};
$(function(){
	tmpl_PassengerSelect = $("#tmpl_PassengerSelect").trim();
	tmpl_GenderSelect = $("#tmpl_GenderSelect").trim();
	tmpl_FlightInformation = $("#tmpl_ConfirmationFlightInformation").trim();
	$(document.body).bind("changeRequest redrawResults", function(){
		objPassengerSelect=null;
	});
});

function PassengerSelect(data){
	var self = this;
	this.data = data;
	this.params = this.data.params;
	this.params.customerLanguage = tw.language;
	this.fare = this.data.fare;
	this.cantUseBonuses = this.fare.noBonus||false;
	this.passengers = [];
	this.counter = 0;
	this.ageTypes = ["ADT","CNN","INF"];
	this.elPageTitlePanel = document.getElementById('pageTitlePanel');
	this.elForm = $.tmpl(tmpl_PassengerSelect, this.params)[0];

	this.elADTblock = $("div.ADT", this.elForm)[0];
	this.elCNNblock = $("div.CNN", this.elForm)[0];
	this.elINFblock = $("div.INF", this.elForm)[0];
	this.elToPay = $(".toPay", this.elForm)[0];
	this.elStAvl = $(".stAvl", this.elForm)[0];
	this.elWarnDate = $(".warn .date", this.elForm)[0];
	this.elTimeWarn = $(".timeWarn", this.elForm)[0];
	this.elRenew = $(".renew", this.elTimeWarn)[0];
	this.elFlightInfo = $(".ConfirmInfoFlight", this.elForm)[0];
	
	this.$minus = $(".minus", this.elForm);
	this.$count = $(".count", this.elForm);
	this.$plus = $(".plus", this.elForm);
	this.$priceInf = $(".priceInf", this.elForm);
	this.$table = $("td.fields>table", this.elForm);

	this.$minus.each(function(i){
		$(this).click({
			n: i
		}, function(event){
			self.removePassenger(event.data.n);
			self.setCookiedPassengers();
			$('.hint').remove();
		});
	});
	this.$plus.each(function(i){
		$(this).click({
			n: i
		}, function(event){
			if (!$(this).hasClass("disabled")) {
				self.addPassenger(event.data.n);
			}
		});
	});
	$(this.elRenew).click(function(){
		tw.oResult.ReloadSearchResult();
	});

	this.initPromo();

	$(".close_button", this.elForm).click(function(){
		self.hideBack();
	});
	
	this.activeCheckAvail = false;
	$(this.elForm).submit(function(event){
		event.preventDefault();  
		if(tw.ajaxCheckNames || self.activeCheckAvail) {
			return;
		}  
		self.getData();
		if (self.checkData()) {
			checkNames(self.passengersForChechNames, function(){
				self.activeCheckAvail = true;
				self.getConfirmation();
			}, function(warnPassengers){
				/*var rows = $("td.fields>table tbody tr", this.elForm);
				for (var i = 0, length = warnPassengers.length; i < length; i++) {
					var id = warnPassengers[i].id;
					rows[id].fields.firstName.addWarn();
					rows[id].fields.lastName.addWarn();
				}*/
			});
		} 
	});

	this.analyzeFlight();
	//this.initComparingPrices();
	this.initBonusPocket();

	this.initShowChildrenLink();

	if(this.data.params.passengerCount) {
		var ageType = this.data.params.passengerCount.split(',');
		for (var PI = 0, PL = ageType[0]; PI < PL; PI++) {
			this.addPassenger(0);
		}
		for (var PI = 0, PL = ageType[1]; PI < PL; PI++) {
			this.addPassenger(1);
		}
		for (var PI = 0, PL = ageType[2]; PI < PL; PI++) {
			this.addPassenger(2);
		}
	} else {
		if(objSocialAuth && objSocialAuth.checkAuthorized()) {
			deleteCookie({
				name: "passengerConfirm"
			});
		}
		this.CookiedPassengers = readCookie('passengerConfirm');
		if (this.CookiedPassengers && this.CookiedPassengers != '') {
			var passengersData = this.CookiedPassengers.split(';');
			var PasCount =0;
			for (var CookiedIndex = 0, CookiedLength = passengersData.length; CookiedIndex < CookiedLength; CookiedIndex++) {
				if(passengersData[CookiedIndex]!='' && PasCount < 9){
					var passengersInfo = passengersData[CookiedIndex].split(',');
					if(passengersInfo[0] == "ADT") {
						this.addPassenger(0);
						var row = $('tr',this.$table[0]);
					} else if(passengersInfo[0] == "CNN"){
						this.addPassenger(1);
						var row = $('tr',this.$table[1]);
					} else {
						this.addPassenger(2);
						var row = $('tr',this.$table[2]);
					}
					var rowCount = row.length;
					var row = row[rowCount-1];
					if(passengersInfo[1]!='' && passengersInfo[2] != '' && passengersInfo[3] != ''){
						row.fields.gender.setValue(passengersInfo[1]);	
						row.fields.lastName.input.value = passengersInfo[2];
						row.fields.lastName.update();
						row.fields.firstName.input.value = passengersInfo[3];
						row.fields.firstName.update();
					}	
					PasCount++;
				}
			}
		} else {
			this.addPassenger(0);
		}
	}
	$(this.elForm).appendTo( tw.layout_results );
	this.needUserInfo = true;
	this.progressUserInfo = false;
	this.show();
	$(document).on("successAuth", function(){
		self.initBonusPocket();
		self.setAmount();
	});
}
PassengerSelect.prototype.initShowChildrenLink = function(){
	var self = this;
	this.showChildrenLink = $('#addCildrenLink', this.elForm)[0];
	this.childrenBlock = $('#childrenBlock', this.elForm)[0];
	$(this.showChildrenLink).click(function(){
		$(this).addClass('invisible');
		$(self.childrenBlock).slideDown();
	});
};
PassengerSelect.prototype.initPromo = function(){
	var self = this;
	var promo = $('.promo', this.elForm)[0];
	if (window.location.hostname.indexOf("http://www.onetwotrip.com/js/onetwotrip.com") == -1 && window.location.hostname.indexOf("http://www.onetwotrip.com/js/onetwotrip.ua") == -1 && window.location.hostname.indexOf("ott.local") == -1) {
		$(promo).remove();
		return;
	}
	if(this.cantUseBonuses && tw.provider) {
		$(promo).html(l10n.searchResult.passengers.cantUseBonuses);		
		return;
	} else if(tw.oResult.obj.json.metaSearch) {
		$(promo).html(l10n.searchResult.passengers.metaSearch);
		return;
	}

	var promoFiled = new Field({
		appendTo: promo,
		name: 'promo',
		type: 'numberAndLatin',
		maxlength: 20
	});
	$(promoFiled.elField).addClass('invisible');
	$('label input', promo).click(function(){
		if (this.checked){
			$(promoFiled.elField).removeClass('invisible');
		} else {
			$(promoFiled.elField).addClass('invisible');
		}
	});
};
PassengerSelect.prototype.refreshPromo = function(){
	var promo = $('.promo', this.elForm)[0];
	if(promo){
		if(this.cantUseBonuses && tw.provider) {
			$(promo).html(l10n.searchResult.passengers.cantUseBonuses);
		} else if(tw.oResult.obj.json.metaSearch) {
			$(promo).html(l10n.searchResult.passengers.metaSearch);
		}
	}
};
PassengerSelect.prototype.getUserInfo = function(){
	var self = this;
	var params = this.params;
	var count = 1;
	MakeRequest();
	function MakeRequest(){
		PMCaller.ajax({
			iframeId: "pm",
			type: "post",
			dataType: "json",
			url: 'https://secure.onetwotrip.com/_api/buyermanager/getUserInfo/',
			beforeSend: function(){
				self.progressUserInfo = true;
			},
			success: function(json){
				if (!json.error) {
					self.userInfo = json;
					if (self.userInfo.passengers.length > 0) {
						self.setSuggest();
					}
				} else {
					$(document).one("successAuth", function(){
						self.getUserInfo();
					});
				}
				self.needUserInfo = false;
			},
			error: function(){
				self.needUserInfo = true;
				if(count>0){
					MakeRequest();
					count--;
				}
			},
			complete: function(){
				self.progressUserInfo = false;
			}
		});
	}
};
PassengerSelect.prototype.setSuggest = function(){
	var self = this;
	if (this.userInfo.passengers.length > 0) {
		for (var i = 0, length = this.userInfo.passengers.length; i < length; i++) {
			this.userInfo.passengers[i].number = i;	
		}
		this.setAgeTypes();
		this.elSuggest = document.createElement("div");
		this.elSuggest.id = "passSuggest";
		this.elSuggest.className = "suggest";
		this.link_onKeyDown = function(event){
			this.tempValue = this.value;
			self.onKeyDown(event);
		};
		$('.body input[type="text"]', this.elForm).live("focus", function(){
			self.makeSuggest(this);
		});
		$('.body input[type="text"]', this.elForm).live("keyup", function(){
			self.makeSuggest(this);
		});
		$('.body input[type="text"]', this.elForm).live("blur", function(){
			self.hideSuggest();
		});
		$('.body input[type="radio"]', this.elForm).live("change", function(){
			this.row.passenger = null;
		});
	}
};
PassengerSelect.prototype.setAgeTypes = function(){
	var min = null;
	var max = null;
	var arrDirections = [];
	var direction = {
		trips: []
	};
	for (var i = 0, length = this.params.trips.length; i < length; i++) {
		var trip = this.params.trips[i];
		direction.trips.push(trip);
		if (!trip.conx) {
			arrDirections.push(direction);
			direction = direction = {
				trips: []
			};
		}
	}
	var lastDirFirstTripDate = Date.parseAPI(arrDirections[arrDirections.length - 1].trips[0].stDt);
	var date12ago = new Date(lastDirFirstTripDate);
		date12ago.setFullYear(date12ago.getFullYear() - 12);
	var date2ago = new Date(lastDirFirstTripDate);
		date2ago.setFullYear(date2ago.getFullYear() - 2);
	for (var j = 0, pLength = this.userInfo.passengers.length; j < pLength; j++) {
		var passenger = this.userInfo.passengers[j];
			passenger.birthDate_Date = Date.parseAPI(passenger.birthDate);
		if (passenger.birthDate_Date <= date12ago) {
			passenger.ageType = "ADT";
		} else if(date12ago < passenger.birthDate_Date && passenger.birthDate_Date <= date2ago){
			passenger.ageType = "CNN";
		} else if(date2ago < passenger.birthDate_Date) {
			passenger.ageType = "INF";
		}
	}
};
PassengerSelect.prototype.onKeyDown = function(event){
	switch (event.keyCode) {
		/*case 27: // <Esc>
			this.hideSuggest();
			break;*/
		case 38: // <Up>
			event.preventDefault();
			this.setPrevRowHover();
			break;
		case 40: // <Down>
			event.preventDefault();
			this.setNextRowHover();
			break;
		case 13: // <Enter>
			event.preventDefault();
			this.setCurrentResult();
			this.hideSuggest();
			break;
	}
};
PassengerSelect.prototype.makeSuggest = function(input){
	this.suggestRow = input.row;
	var temp = JSON.stringify(this.filteredPassengers);
	if (input.tempValue != input.value){
		this.suggestRow.passenger = null;
	}
	if (!this.suggestRow.passenger && input.value !== "" && this.filterPassengers(input).length > 0 && this.filteredPassengers.length < 6) {
		input.field.removeHint();
		if(temp != JSON.stringify(this.filteredPassengers)){
			this.drawSuggest();
		}
		this.showSuggest(input);
	} else {
		this.hideSuggest();
		input.field.drawHint();
	}
};
PassengerSelect.prototype.filterPassengers = function(input){
	var ageType = this.ageTypes[input.ageNumber];
	this.filteredPassengers = [];
	var selectedPassengers = [];
	$("td.fields>table tbody tr", this.elForm).each(function(i){
		if (this.passenger) selectedPassengers.push(this.passenger);
	});
	for (var i = this.userInfo.passengers.length - 1; i >= 0; i--) {
		var passenger = this.userInfo.passengers[i];
		var selectedPassenger = false;
		for (var j = 0, jl = selectedPassengers.length; j < jl; j++){
			if (JSON.stringify(selectedPassengers[j]) == JSON.stringify(passenger)){
				selectedPassenger = true;
				break;
			}
		}
		if (selectedPassenger) continue;
		if (ageType == "ADT" && passenger.ageType != "ADT") continue;
		else if (ageType == "CNN" && passenger.ageType == "ADT") continue;
		else if (ageType == "INF" && passenger.ageType != "INF") continue;
		if (this.suggestRow.fields.gender.value && this.suggestRow.fields.gender.value != passenger.gender) continue;
		if (this.suggestRow.fields.lastName.input.value && passenger.lastName.indexOf(this.suggestRow.fields.lastName.input.value) != 0) continue;
		if (this.suggestRow.fields.firstName.input.value && passenger.firstName.indexOf(this.suggestRow.fields.firstName.input.value) != 0) continue;
		this.filteredPassengers.unshift(passenger);
	}
	return this.filteredPassengers;
};
PassengerSelect.prototype.drawSuggest = function(){
	var self = this;
	$(this.elSuggest).empty();
	var ul = document.createElement("ul");
	for (var i = 0, length = this.filteredPassengers.length; i < length; i++) {
		var iPass = this.filteredPassengers[i];
		var li = this.drawSuggestItem(iPass);
		ul.appendChild(li);
	}
	this.elSuggest.appendChild(ul);
	this.setRowHover(ul.firstChild);
	$(ul).mousedown(function(){
		self.setCurrentResult();
	});
	$(ul).mouseout(function(){
		self.setRowHover(self.selectedRow);
	});
};
PassengerSelect.prototype.drawSuggestItem = function(pass){
	var self = this;
	var li = document.createElement("li");
		li.passenger = pass;
		li.innerHTML = '<table><tr><td><span class="gender ' + pass.ageType + ' ' + pass.gender + '"></span></td><td>' + pass.lastName + '<div>' + pass.birthDate_Date.format("d mmmm yyyy") + '</div></td><td>' + pass.firstName + '<div>' + pass.passNumber + '</div></td></tr></table>';
		li.onmouseover = function(){
			self.setRowHover(this);
		};
		li.onmouseout = function(){
			self.dropRowHover(this);
		};
	return li;
};
PassengerSelect.prototype.setOffset = function(){
	var offset = $(this.suggestRow).offset();
	this.elSuggest.style.top = offset.top + this.suggestRow.offsetHeight + "px";
	this.elSuggest.style.left = offset.left + "px";
	this.elSuggest.style.width = this.suggestRow.offsetWidth - 2 + "px";
};
PassengerSelect.prototype.showSuggest = function(input){
	var self = this;
	this.setOffset();
	if (!document.getElementById(this.elSuggest.id)) {
		this.setRowHover($("li:first-child", this.elSuggest)[0]);
		document.body.appendChild(this.elSuggest);
	}
	this.elSuggest.input = input;
	$(input).unbind("keydown", self.link_onKeyDown);
	$(input).bind("keydown", self.link_onKeyDown);
};
PassengerSelect.prototype.hideSuggest = function(){
	var self = this;
	if (this.elSuggest.input) {
		$(this.elSuggest.input).unbind("keydown", self.link_onKeyDown);
		this.elSuggest.input = null;
	}
	$(this.elSuggest).detach();
};
PassengerSelect.prototype.setPrevRowHover = function() {
	if (this.selectedRow) {
		var PrewRow = this.selectedRow.previousSibling;
		if (PrewRow) {
			this.setRowHover(PrewRow);
		}
	}
};
PassengerSelect.prototype.setNextRowHover = function() {
	if (this.selectedRow) {
		var NextRow = this.selectedRow.nextSibling;
		if (NextRow) {
			this.setRowHover(NextRow);
		}
	} else {
		this.setRowHover($("li", this.elSuggest)[0]);
	}
};
PassengerSelect.prototype.setRowHover = function(elRow) {
	if (this.selectedRow) {
		this.dropRowHover(this.selectedRow);
	}
	$(elRow).addClass("hover");
	this.selectedRow = elRow;
};
PassengerSelect.prototype.dropRowHover = function(elRow){
	$(elRow).removeClass("hover");
};
PassengerSelect.prototype.setCurrentResult = function(){
	var passenger = this.selectedRow.passenger;
	this.suggestRow.fields.gender.setValue(passenger.gender);
	this.suggestRow.fields.lastName.input.value = passenger.lastName;
	this.suggestRow.fields.lastName.input.tempValue = this.suggestRow.fields.lastName.input.value;
	this.suggestRow.fields.lastName.update();
	this.suggestRow.fields.firstName.input.value = passenger.firstName;
	this.suggestRow.fields.firstName.input.tempValue = this.suggestRow.fields.firstName.input.value;
	this.suggestRow.fields.firstName.update();
	this.suggestRow.passenger = passenger;
};
PassengerSelect.prototype.setWarnDate = function(){
	this.elWarnDate.innerHTML = Date.parseAPI(this.params.trips[this.params.trips.length - 1].stDt).format("d mmmm yyyy");
};
PassengerSelect.prototype.setStAvl = function(){
	this.elStAvl.innerHTML = this.fare.stAvl;
};
PassengerSelect.prototype.getChildrenPrices = function(){
	var self = this;
	var params = this.params;
    
    params.source    = twiket.setup.source;
    params.srcmarker = twiket.setup.marker;
    
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			iframeId: "pm",
			type: "post",
			dataType: "jsonp",
			url: 'https://secure.onetwotrip.com/_api/confirmation/searchfare/',
			data: {
				"params": JSON.stringify(params)
			},
			timeout: 40000,
			beforeSend: function(xhr){
				self.searchxhr = xhr;
			},
			success: function(json){
				if(json.avail && JSON.stringify(params) == JSON.stringify(self.params)){
					self.fare.childPrices = json;
					self.setPrices();
					self.setAmount();
				}
			},
			complete: function(xhr){
				$(self.$priceInf[1]).removeClass("smallLoader");
				$(self.$priceInf[2]).removeClass("smallLoader");
			}
		});
	}
};
PassengerSelect.prototype.setPrices = function(){
	var remakePrice = function(price){
		if(tw.currency != 'RUB'){
			return price.toFixed(2);
		} else {
			return Math.ceil(price);
		}
	}
	var text = l10n.searchResult.passengers.perticket;
	var price = remakePrice( convertCurrency(this.fare.amt, this.fare.cur) );
	this.$priceInf[0].innerHTML = text + formatMoney(price) + " " + l10n.currency[tw.currency].Symbol;
	if (this.fare.childPrices) {
		if(this.fare.childPrices.cnnPriceInfo){
			var cnnPriceInfo = this.fare.childPrices.cnnPriceInfo;
			var cnnPrice = remakePrice( convertCurrency(cnnPriceInfo.amount, cnnPriceInfo.currency) );
			this.$priceInf[1].innerHTML = text + formatMoney(cnnPrice) + " " + l10n.currency[tw.currency].Symbol;
		}
		if(this.fare.childPrices.infPriceInfo){
			var infPriceInfo = this.fare.childPrices.infPriceInfo;
			var infPrice = remakePrice( convertCurrency(infPriceInfo.amount, infPriceInfo.currency) );
			this.$priceInf[2].innerHTML = text + formatMoney(infPrice) + " " + l10n.currency[tw.currency].Symbol;
		}
	}
};
PassengerSelect.prototype.setAmount = function(){
	var adtCount = this.$table[0].tBodies[0].rows.length;
	var cnnCount = this.$table[1].tBodies[0].rows.length;
	var infCount = this.$table[2].tBodies[0].rows.length;
	var amount = 0;
	var amount = adtCount * convertCurrency(this.fare.amt, this.fare.cur);
	if (this.fare.childPrices) {
		if(this.fare.childPrices.cnnPriceInfo){
			var cnnPriceInfo = this.fare.childPrices.cnnPriceInfo;
			amount += cnnCount * convertCurrency(cnnPriceInfo.amount, cnnPriceInfo.currency);
		}
		if (this.fare.childPrices.infPriceInfo) {
			var infPriceInfo = this.fare.childPrices.infPriceInfo;
			amount += infCount * convertCurrency(infPriceInfo.amount, infPriceInfo.currency);
		}
	}
	this.refreshBonusPocket(amount);

	if(this.showComparingPrices){
		if(this.showCompared) {
			amount = amount - amount*0.025;
		}
		$(this.elPayCompare).html('цена ' + formatMoney(Math.ceil(amount)) + " " + l10n.currency[tw.currency].Symbol);
	} else {
		if(tw.currency != 'RUB'){
			amount = amount.toFixed(2);
		} else {
			amount = Math.ceil(amount);
		}
		$(this.elToPay).html(l10n.searchResult.passengers.priceToPay + formatMoney(amount) + " " + l10n.currency[tw.currency].Symbol);
	}
};
PassengerSelect.prototype.setTimeSpent = function(){
	$(this.elTimeWarn).addClass('invisible');
	var curTime = new Date();
	var dif = (curTime - this.params.DateCreated) / 60000;
	if (dif > 15) {
		$(this.elTimeWarn).removeClass('invisible');
	}
};
/*PassengerSelect.prototype.initComparingPrices = function(){
	var self = this;
	if(tw.language != 'ru') {
		return;
	}
	this.showComparingPrices = true;
	this.elPayCompare = $(".toPayCompare", this.elForm)[0];
	this.ComparingPrices = $('.ComparePriceSelection', this.elForm)[0];
	this.showCompared = tw.params.compare||false;
	if(this.showCompared) {
		$('.d_last',this.ComparingPrices).addClass('selected');
	} else {
		$('.d_first',this.ComparingPrices).addClass('selected');
	}
	$('.d_option', this.ComparingPrices).delegate('div[class*="d_direction"]:not(.selected):not(.disabled)', 'click', function(){
		$(this).addClass('selected').siblings().removeClass('selected');
		if($(this).hasClass('d_first')){
			self.showCompared= false;
		} else {
			self.showCompared = true;
		}
		self.setAmount();
	});
};*/
PassengerSelect.prototype.initBonusPocket = function(){
	var self = this;
	this.bonusPocket = $('.bonusPocket', this.elForm)[0];

	var elBonuses = $(".bonuses", this.bonusPocket)[0];
	var elBonusesIn = $(".bonusesIn", this.bonusPocket)[0];
	$(elBonuses).empty();
	$(elBonusesIn).empty();
	if(this.cantUseBonuses && tw.provider){
		elBonusesIn.innerHTML = l10n.makeorder.bonus.cantUseBonuses;
	} else {
		elBonusesIn.innerHTML = l10n.makeorder.bonus.text[0];	
	}
	$(elBonusesIn).append(' <span class="bonusAmount"></span>');

	var bonusDescription = l10n.makeorder.bonus.about;
	if (tw.provider) {
		if(tw.oResult.obj.json.metaSearch && tw.oResult.obj.json.metaSearch == 'aviasales'){
			$(elBonusesIn).addClass('invisible');
		}
		var bonusAmount = Math.ceil(tw.bonus.total);
		var bonusText = formatMoney(bonusAmount);
		elBonuses.innerHTML = l10n.makeorder.bonus.balance + bonusText + ' ≈ ';
		if (tw.bonus.currency != 'RUB') {
			bonusText = formatMoney(tw.bonus.total.toFixed(2));
		}
		elBonuses.innerHTML += bonusText + ' ' + l10n.currency[tw.bonus.currency].Abbr;
		//elBonuses.innerHTML += '<br/>' + bonusDescription;
		if(!tw.oResult.obj.json.metaSearch){
			$('<div class="useBonuses">'+l10n.searchResult.passengers.useBonuses+'</div>').insertAfter(elBonuses);			
		}
	} else if(tw.oResult.obj.json.metaSearch){
		WelcomeBonusText(elBonuses);
		elBonuses.innerHTML += l10n.makeorder.bonus.auth + ' ' + bonusDescription;
		$("http://www.onetwotrip.com/js/span.link", elBonuses).click(function(){
			objSocialAuth.show(objSocialAuth.regauthForm);
		});
	} else {
		WelcomeBonusText(elBonuses);
		elBonuses.innerHTML +=  bonusDescription;
		/*elBonuses.innerHTML = l10n.makeorder.bonus.auth + ' ' + bonusDescription;
		$("span.link[id!='bonusDescription']", elBonuses).click(function(){
			objSocialAuth.show(objSocialAuth.regauthForm);
		});*/
	}
	this.bonusAmount = $('.bonusAmount', this.bonusPocket)[0];
	this.refreshPromo();
};
PassengerSelect.prototype.refreshBonusPocket = function(price){
	var money = parseFloat(price*0.01, 10);
	var num = price;
	/*if(tw.currency != 'RUB') {
		num = convertCurrency(price, tw.currency, 'RUB');
		money = money.toFixed(2);
	}*/
	if(tw.bonus.currency != tw.currency) {
		num = convertCurrency(price, tw.currency, tw.bonus.currency);
		money = convertCurrency(money, tw.currency, tw.bonus.currency);
	}
	money = parseFloat(money,10);
	money = (tw.bonus.currency == 'RUB')?Math.ceil(money):money.toFixed(2);
	num = (tw.bonus.currency == 'RUB')?Math.ceil(num*0.01):(num*0.01).toFixed(2);
	num+='';
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
	num = parseFloat(num,10);
	num = (tw.bonus.currency == 'RUB')?formatMoney(num):formatMoney(num);
	$(this.bonusAmount).html(num +' ' + text + ' ≈ ' + formatMoney(money) +' ' + l10n.currency[tw.bonus.currency].Abbr);
};
PassengerSelect.prototype.setFlightInformation = function(){
	var self = this;
	$(this.elFlightInfo).html( $.tmpl(tmpl_FlightInformation, {Flight: this.Flight}) );
	if(fareRulesList[this.params.fareKey]) {
		this.fareRulesFull = fareRulesList[this.params.fareKey];
	} else {
		this.fareRulesFull = null;
	}
	$('.showFareRules', this.elForm).click(function(){
		showFareRules({
			url: "https://secure.onetwotrip.com/_api/confirmation/getfarerules/",
			data: {
				params: JSON.stringify({
					trips: self.params.trips,
					gdsInfo: self.params.gdsInfo,
					fareKey: self.params.fareKey
				})
			},
			obj: self.fare
		});
	});
};
PassengerSelect.prototype.setFlightInformationData = function(){
	var self = this;
	this.Flight = cloneObj(tw.oResult.DefaultAllFlights[self.params.FlightIndex]);
	if(!this.Flight.html_tmpl) {
		tw.oResult.addTemplateInformation(this.Flight);
	}
	this.Flight.flightLate = [];
	for(var i =0, l = this.Flight.TripIds.length; i< l; i++){
		this.Flight.flightLate.push( tw.oResult.MakeOnTimeDirectionInfo(this.Flight,i) );
	}
};
PassengerSelect.prototype.show = function(data){
	var self = this;
	if(this.needUserInfo && !this.progressUserInfo){
		//this.getUserInfo();
	}
	
	if ($(this.$table[1]).hasClass('invisible') && $(this.$table[2]).hasClass('invisible')) {
		$(this.showChildrenLink).removeClass('invisible');
		$(this.childrenBlock).css({
			display: 'none'
		});
	} else {
		$(this.showChildrenLink).addClass('invisible');
		$(this.childrenBlock).css({
			display: 'block'
		});
	}

	$.scrollTo(0, 500);
	if (data) {
		this.data = data;
		this.params = this.data.params;
		this.fare = this.data.fare;
		this.cantUseBonuses = this.fare.noBonus||false;
	}
	//kmqStats
		var routeKey = this.data.params.routeKey;
		var today = new Date();
		var startDate = Date.parseAPI(routeKey.substring(0,4));
		var DepthSearch = parseInt( Math.floor( (startDate.valueOf() - today.valueOf())/(86400000) ), 10);
		var StartMonth = startDate.getMonth()+1;
		var Duration = 0;
		if(routeKey.length == 14) {
			var endDate = Date.parseAPI(routeKey.substring(10,14));
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
			"Duration": Duration,
			"GDS": this.fare.gdsType,
			"type": this.params.kmqSelection,
			"Segments": this.params.Segments,
			"Stops": this.params.Stops,
			"Country Agent": this.fare.agCnt,
			"Plating Carrier": this.fare.pltCrr,
			"Operating Carrier": String(this.params.Operating),
			"Marketing Carrier": String(this.params.Marketing),
			"Booking Class": String(this.params.BookingClass)
		}
	kmqRecord({name: 'SELECT_FARE', obj: self.kmqFlight, prefix: 'SF'});
	try {yaCounter18086416.reachGoal('PriceButton');} catch (e) {}

	//for direction info
		this.setFlightInformationData();
	this.$priceInf[0].innerHTML = " ";
	this.$priceInf[1].innerHTML = " ";
	this.$priceInf[2].innerHTML = " ";
	if(!this.fare.childPrices){
		$(this.$priceInf[1]).addClass("smallLoader");
		$(this.$priceInf[2]).addClass("smallLoader");
		this.getChildrenPrices();
	}
	this.setWarnDate();
	this.setStAvl();
	this.setFlightInformation();
	this.setAmount();
	this.setPrices();
	this.setTimeSpent();

	var resultShowBlock = tw.oResult.ResultTable;
	if(tw.oResult.isAKVisible) {
		resultShowBlock = tw.oResult.AKFlightInformation;
	}
	//fadeOutBlock($('.FlightPriceInformation'));
	fadeOutBlock(resultShowBlock, function(){
		fadeInBlock(self.elForm);
	});
	/*objSearchForm.hide(function(){
		self.setPageTitle()
	}); */
	objRecentSearches.hide();
    
    ShadingIn('PassengerSelect');
};
PassengerSelect.prototype.setPageTitle = function(){
	//$('#pageTitle', this.elPageTitlePanel)[0].innerHTML = l10n.searchResult.passengers.pageTitle;
	this.setPageButtons();
	fadeInBlock(this.elPageTitlePanel);
	window.scrollTo(0, 0);
};
PassengerSelect.prototype.setPageButtons = function(){
	var self = this;
	$(".button", this.elPageTitlePanel).remove();
	$.tmpl(tmpl_topPanel2Button, {
		title: l10n.searchResult.passengers.backButton,
		className: "back"
	}).click(function(){
		self.hideBack();
	}).appendTo(this.elPageTitlePanel);
};
PassengerSelect.prototype.hideBack = function(){
	var self = this;
	$('.hint').remove();
	if(this.searchxhr) {
		this.searchxhr.abort();
		this.searchxhr = null;
	}
	var resultShowBlock = tw.oResult.ResultTable;
	if(tw.oResult.isAKVisible) {
		resultShowBlock = tw.oResult.AKFlightInformation;
	}
	fadeOutBlock(this.elForm, function(){
		fareRulesList[self.params.fareKey] = self.fareRulesFull;
		fadeInBlock(resultShowBlock);
		fadeInBlock($('.FlightPriceInformation'));
	});
	fadeOutBlock(this.elPageTitlePanel, function(){
		objSearchForm.show();
		objRecentSearches.show();
	});
    
    ShadingOut('PassengerSelect');
};
PassengerSelect.prototype.hide = function(){
	$('.hint').remove();
	fadeOutBlock(this.elForm);
};
PassengerSelect.prototype.addPassenger = function(n){
	this.addRow(n);
	this.setAmount();
	this.checkPassengersCount();
};
PassengerSelect.prototype.removePassenger = function(n){
	this.removeRow(n);
	this.setAmount();
	this.checkPassengersCount();
};
PassengerSelect.prototype.analyzeFlight = function(){
	this.foreignName = false;
	var countries = {RU:1,UA:1}
	for(var i = 0, length = this.params.trips.length; i < length; i++){
		var trip = this.params.trips[i];
		if(!countries[ ref.getCountryCode(trip.from) ] || !countries[ ref.getCountryCode(trip.to) ]){
			this.foreignName = true;
			break;
		}
	}
};
PassengerSelect.prototype.addRow = function(n){
	var self =this;
	var table = this.$table[n];
	var hintType = "name";
	if(this.ageTypes[n] == "ADT" && this.foreignName){
		hintType = "foreignName";
	}
	$(table).removeClass("invisible");
	var row = table.tBodies[0].insertRow(-1);
		row.fields = {};
		row.ageType = this.ageTypes[n];
	var td1 = row.insertCell(-1);
		row.fields.gender = new GenderSelect({
			appendTo: td1,
			id: this.counter,
			age: this.ageTypes[n],
			ageNumber: n,
			row: row,
			type: "gender",
			data: this.passengers[this.counter]
		});
	var td2 = row.insertCell(-1);
		row.fields.lastName = new Field({
			appendTo: td2,
			name: "lastName" + this.counter,
			value: this.passengers[this.counter] ? this.passengers[this.counter].lastName : "",
			type: "name",
			hintType: hintType
		});
		row.fields.lastName.input.ageNumber = n;
		row.fields.lastName.input.row = row;
	var td3 = row.insertCell(-1);
		row.fields.firstName = new Field({
			appendTo: td3,
			name: "firstName" + this.counter,
			value: this.passengers[this.counter] ? this.passengers[this.counter].firstName : "",
			type: "name",
			hintType: hintType
		});
		row.fields.firstName.input.ageNumber = n;
		row.fields.firstName.input.row = row;
	this.$count[n].innerHTML = table.tBodies[0].rows.length;
	this.counter++;
	
	$(row.fields.gender.$radio).change(function(){
		self.setCookiedPassengers();
	});
	$(row.fields.lastName.input).blur(function(){
		self.setCookiedPassengers();
	});
	$(row.fields.firstName.input).blur(function(){
		self.setCookiedPassengers();
	});
};
PassengerSelect.prototype.setCookiedPassengers = function(){
	var self = this;
	if(objSocialAuth && objSocialAuth.checkAuthorized()) {
		return;
	}
	this.CookiedPassengers = '';
	for (var i = 0, L = this.$table.length; i < L; i++) {
		var curTable = this.$table[i];
		if(!$(curTable).hasClass('invisible')){
			for (var j = 1, RJ = $('tr', curTable).length; j < RJ; j++) {
				var row = $('tr', curTable)[j];
				if(self.ageTypes[i] && row.fields.gender.value && row.fields.lastName.value && row.fields.firstName.value) {
					self.CookiedPassengers+= self.ageTypes[i] + ',' + row.fields.gender.value + ',' + row.fields.lastName.value + ',' + row.fields.firstName.value + ';';
				}
			}
		}
	}
	setCookie({
		name: "passengerConfirm",
		value: this.CookiedPassengers,
		days: 0.022
	});
};
PassengerSelect.prototype.removeRow = function(n){
	var table = this.$table[n];
		table.tBodies[0].deleteRow(-1);
	if(table.tBodies[0].rows.length === 0){
		$(table).addClass("invisible");
		if(n === 0){
			this.addPassenger(0);
		}
	}
	this.$count[n].innerHTML = table.tBodies[0].rows.length;
};
PassengerSelect.prototype.checkPassengersCount = function(){
	var seatsCount = this.$table[0].tBodies[0].rows.length + this.$table[1].tBodies[0].rows.length;
	if(seatsCount < 9){
		$(this.$plus[0]).removeClass("disabled");
		$(this.$plus[1]).removeClass("disabled");
	} else {
		$(this.$plus[0]).addClass("disabled");
		$(this.$plus[1]).addClass("disabled");
	}
	if(this.$table[2].tBodies[0].rows.length < this.$table[0].tBodies[0].rows.length){
		$(this.$plus[2]).removeClass("disabled");
	} else {
		$(this.$plus[2]).addClass("disabled");
		if (this.$table[2].tBodies[0].rows.length > this.$table[0].tBodies[0].rows.length) {
			this.removePassenger(2);
		}
	}
};
PassengerSelect.prototype.getData = function(){
	var self = this;
	this.passengers = [];
	this.passengersForChechNames = [];
	$("td.fields>table tbody tr", this.elForm).each(function(i){
		this.fields.firstName.update();
		this.fields.lastName.update();
		if (this.passenger) {
			self.passengers[i] = this.passenger;
			self.passengers[i].id = i;
			self.passengers[i].ageType = this.ageType;
		} else {
			self.passengers[i] = {
				id: i,
				firstName: this.fields.firstName.value,
				lastName: this.fields.lastName.value,
				gender: this.fields.gender.value,
				ageType: this.ageType
			};
			self.passengersForChechNames.push(self.passengers[i]);
		}
	});
	this.params.passengers = this.passengers;
	if (tw.params.test) {this.params.testGds = true;}
	if (tw.params.srcmarker) {this.params.srcmarker = tw.params.srcmarker;}
	if (this.elForm.promoFlag && this.elForm.promoFlag.checked) {
		this.elForm.promo.field.update();
		this.params.promo = this.elForm.promo.field.value;
	} else {
		delete this.params.promo;
	}
};
PassengerSelect.prototype.checkData = function(){
	var self = this;
	var errors = 0;
	var errorField = null;
	var $rows = $("tbody tr", this.$table);
	$rows.each(function(i){
		var curPdata = self.params.passengers[i];
		var curPfields = this.fields;
		if (!curPdata.gender) {
			errors++;
			curPfields.gender.addError();
			if (!errorField) {
				errorField = curPfields.gender;
			}
		}
		if (!curPdata.lastName || curPfields.lastName.error) {
			errors++;
			curPfields.lastName.addError();
			if (!errorField) {
				errorField = curPfields.lastName;
			}
		}
		if (!curPdata.firstName || curPfields.firstName.error) {
			errors++;
			curPfields.firstName.addError();
			if (!errorField) {
				errorField = curPfields.firstName;
			}
		}
	});
	if (this.elForm.promoFlag && this.elForm.promoFlag.checked && this.params.promo == '') {
		errors++;
		this.elForm.promo.field.addError();
		if (!errorField) {
			errorField = this.elForm.promo.field;
		}
	}
	
	if (errors) {
		$.scrollTo($(errorField.elField).offset().top - 80, 200);
		errorField.input.focus();
		kmqRecord({name: 'DE_PassengerFIO'});
		return false;
	} else {
		$('.hint').remove();
		return true;
	}
};
PassengerSelect.prototype.getConfirmation = function(){
	var self = this;
	kmqRecord({name: 'CLICK_BOOKING'});

	this.hide();
	var requestOptions = {
		repeats: 1,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(){
			$(document.body).trigger("removeMiddleSearchRotation");
			removeLoader();
			fadeInBlock(tw.layout_results, function(){
				self.show();
			});			
			if(tw.oResult.isAKVisible) {
				tw.oResult.selectedAK = null;
			}			
		}
	};
	var countTillTimeout = requestOptions.repeats;
	fadeOutBlock(tw.layout_results, function(){
		MakeRequest();
	});
	function MakeRequest(){
		//check adriver img
		rotationCounterTry = 0;
		function startAdd(){
			var loaderInterval = setInterval(function(){
				$('#'+bannerId).find('iframe').load(function(){
					changeLoader();
				});
				rotationCounterTry++;
				if(rotationCounterTry > 100){clearInterval(loaderInterval);}
			}, 100);
			function changeLoader(){
				clearInterval(loaderInterval);
				$('#loader').animate({
					"margin-top": -15
				});
			}
		}
        self.params.source    = twiket.setup.source;
        self.params.srcmarker = twiket.setup.marker;
        
		PMCaller.ajax({
			iframeId: "pm",
			type: "post",
			url: 'https://secure.onetwotrip.com/_api/confirmation/checkavail1/',
			dataType: "jsonp",
			data: {
				params: JSON.stringify(self.params)
			},
			timeout: 40000,
			beforeSend: function(){
				if ($('#loader').length === 0) {
					var elLayoutBody = document.getElementById("layout_body");
					if(window.adriver && (tw.language == 'ru' || tw.checkAdriver)) {
						appendLoader({
							appendTo: elLayoutBody,
							text: l10n.searchResult.passengers.checkavail
						});
						//adriver
							$(document.body).trigger("removeMiddleSearchRotation");
							$('#layout_body').append('<div class="middleSearchRotation"></div>');
							var newBanner = document.createElement('div');
							bannerId = 'rotation_partner_'+ new Date().valueOf();
							newBanner.id = bannerId;
							var sInfo, bpozition;
							switch(objSearchForm.data.cs) {
								case 'B':
									sInfo ='ECONOMY';
									bpozition = 4;
									break;
								case 'F':
									sInfo ='FIRST';
									bpozition = 4;
									break;
								default:
									sInfo ='ECONOMY';
									bpozition = 3;
									break;
							}
							$('.middleSearchRotation').append(newBanner);
							var adObj = {sid:184643, bt:52, keyword:sInfo};
							if(tw.checkAdriver){
								adObj.bn = 1;
							} else {
								adObj.pz = bpozition;
							}
							new adriver(bannerId, adObj);
							startAdd();
					} else {
						appendLoader({
							appendTo: elLayoutBody,
							text: l10n.searchResult.passengers.checkavail
						});
					}
				}
			},
			success: function(json){
				self.onCheckAvailSuccess(json);
			},
			complete: function(xhr){
				xhr.url = this.url;
				self.activeCheckAvail = false;
				checkAjaxError(xhr, requestOptions);
				if(countTillTimeout <1) {
					kmqRecord({name: 'BookingTimeOut', obj: self.kmqFlight, prefix: 'BTO'});
				}
				countTillTimeout--;
			}
		});
	}
};
PassengerSelect.prototype.onCheckAvailSuccess = function(json){
	var self = this;
	if(!json.avail && !json.id && !json.reservations) {
		fadeOutBlock(this.elPageTitlePanel, function(){
			objSearchForm.show();
			objRecentSearches.show();
		});
	}
	var firstPassenger = self.passengers[0].lastName+'/'+self.passengers[0].firstName;
	if (json.avail && json.id) {
		var gourl = "/m/?id=" + json.id + "&r=" + this.params.routeKey;

		var goToPay = function(){
			if(self.params.promo){
				kmqRecord({name:'activatedPromo', obj:{"PromoValue": self.params.promo} });
			}
			kmqRecord({name: 'RedirectMakeOrder'});
			_gaq.push(['_trackPageview','/gopay']);
			//if(!tw.franchise.local && !tw.franchise.com){_gaq.push(['_link', '../index.htm'/*tpa=http://www.onetwotrip.com/*/]);}
			try {yaCounter18086416.reachGoal('Pay');} catch (e) {};
			setCookie({
				name: "accept_language",
				value: tw.language,
				days: 360,
				xdm: true
			});
			setCookie({
				name: "currency",
				value: tw.currency,
				days: 180,
				xdm: true
			});
			setTimeout(function(){
				window.location.href = gourl;
			}, 1000);
		}
		//json.reservations = [{passengers: [{firstName: 'Ivan', lastName: 'Ivanov'}]}];
		if (json.reservations) {
			$(document.body).trigger("removeMiddleSearchRotation");
			removeLoader();
			kmqRecord({name: 'PART_BOOKING', url: document.location.href, text: 'Booking not for all passengers. frKey: ' + self.Flight.sourceFare.frKey});
			//смотрим на каких пассажиров не забронировали
			var reservedPas = [];
			var unreservedPas = [];
			for (var ReservInd = 0, ReservL = json.reservations.length; ReservInd < ReservL; ReservInd++) {
				var curReserv = json.reservations[ReservInd];
				for (var PasInd = 0, PasL = curReserv.passengers.length; PasInd < PasL; PasInd++) {
					var curPas = curReserv.passengers[PasInd];
					if (curReserv.reserved === true) {
						reservedPas.push(curPas.firstName + ' ' + curPas.lastName);
					} else {
						unreservedPas.push(curPas.firstName + ' ' + curPas.lastName);
					}
				}
			}
			var obj = {
				id: json.id,
				unreservedPas: unreservedPas,
				reservedPas: reservedPas
			};
			var div = document.createElement('div');
			$.tmpl($("#tmpl_cancelPrereservationPopup").trim(), obj).appendTo(div);
			var popup = addPopup({
				dom: div,
				className: "commonPopup"
			});
			$('#continueToBook',popup).on('click', function(){
				goToPay();
			});
			tw.oResult.RedrawResults();
		} else {
			goToPay();
		}
	} else if (json.avail === false && !json.error) {
		//если новая цена
		$(document.body).trigger("removeMiddleSearchRotation");
		removeLoader();
		if (json.prcInf) {
			kmqRecord({name: 'NEW_PRICE', url: document.location.href, text: 'New Price. frKey: ' + self.Flight.sourceFare.frKey, obj: self.kmqFlight, prefix: 'NP'});
			//новая цена=> создаем fare в oFares, выписываем туда нужные поля
			var curFare = {
				frKey: json.frKey,
				gdsInf: "",
				cur: json.prcInf.cur,
				amt: json.prcInf.amt,
				refund: true
			};
			if (json.infMsgs) {
				for (var infMsgsIndex = 0, infMsgsL = json.infMsgs.length; infMsgsIndex < infMsgsL; infMsgsIndex++) {
					if (json.infMsgs[infMsgsIndex].cd == "NO_REFUND") {
						curFare.refund = false;
					}
				}
			}
			//ставим индекс gdsInf
			for (var someInd = 0, someL = tw.oResult.obj.json.gdsInfs.length; someInd < someL; someInd++) {
				var curGdsInf = tw.oResult.obj.json.gdsInfs[someInd].hash;
				if (curGdsInf == json.gdsInf) {
					curFare.gdsInf = someInd;
				}
			}
			//если пустой значит пришел новый gdsInf
			if (curFare.gdsInf === "") {
				var newInfo = {
					fareRulesRequestId: "",
					hash: json.gdsInf
				};
				curFare.gdsInf = tw.oResult.obj.json.gdsInfs.length;
				tw.oResult.obj.json.gdsInfs.push(newInfo);
			}
			
			tw.oResult.oFares.max++;
			tw.oResult.oFares[tw.oResult.oFares.max] = curFare;
			
			var newFlight = this.Flight;
			newFlight.sourceFare = curFare;
			delete newFlight.html_tmpl;
			newFlight.FareId = tw.oResult.oFares.max;
			
			//добавляем новые трипы в исходный массив, в клонированом объекте перезаписываем индексы трипов в направлениях и другие поля
			var oldTrpsLength = tw.oResult.obj.json.trps.length;
			var newLength = 0;
			for (var DirInd = 0, DirL = newFlight.TripIds.length; DirInd < DirL; DirInd++) {
				for (var TrpsInd = 0, TrpsL = newFlight.TripIds[DirInd].length; TrpsInd < TrpsL; TrpsInd++) {
					responsedTrip = json.trps[newLength];
					tw.oResult.obj.json.trps.push(responsedTrip);
					
					newFlight.TripIds[DirInd][TrpsInd] = parseInt(oldTrpsLength + newLength, 10);
					//newTrpCounter++;
					newFlight.Classes[DirInd][TrpsInd] = responsedTrip.cls;
					newFlight.TripsSeatAvl[DirInd][TrpsInd] = responsedTrip.stAvl;
					newFlight.ServiceClasses[DirInd][TrpsInd] = responsedTrip.srvCls;
					newLength++;
				}
			}
			//добавлем в выборку перезаписанный перелёт
			tw.oResult.DefaultAllFlights.push(newFlight);
			//удаляем старый вариант
			tw.oResult.DefaultAllFlights.splice(self.params.FlightIndex, 1);
			
			var priceOne = Math.ceil(convertCurrency(this.fare.amt, this.fare.cur));
			var priceTwo = Math.ceil(convertCurrency(json.prcInf.amt, json.prcInf.cur));
			var obj = {
				oldPrice: formatMoney(priceOne) + "\u00A0" + CurrencyString(priceOne),
				newPrice: formatMoney(priceTwo) + "\u00A0" + CurrencyString(priceTwo)
			};
			var div = document.createElement('div');
			$.tmpl($("#tmpl_PriceChangedPopup").trim(), obj).appendTo(div);
			addPopup({
				dom: div,
				className: "commonPopup",
				close_button: true
			});
			$('#continueMaking').click(function(){
				var data = getFareConfirmationParams({
					confirm: newFlight
				});
				removePopup();
				self.show(data);
				self.getData();
				self.getConfirmation();
			});
			
		} else {
			//если бы только 1 то правильный попап в CheckResultsData когда нет результатов;
			if (tw.oResult.DefaultAllFlights.length > 1) {
				addPopup({
					error: true,
					className: "notConfirmed",
					reason: l10n.searchResult.passengers.popup.notConfirmed.reason,
					comment: l10n.searchResult.passengers.popup.notConfirmed.comment,
					close_button: true,
					button: l10n.searchResult.passengers.popup.notConfirmed.action,
					actionButton: "removePopup();"
				});
			}
			//удаляем старый вариант
			tw.oResult.DefaultAllFlights.splice(self.params.FlightIndex, 1);
		}
		kmqRecord({name: 'FareNotConfirmed', url: document.location.href, text: 'FIO: ' + firstPassenger, obj: self.kmqFlight, prefix: 'FNC'});
		CheckResultsData();
	} else {
		$(document.body).trigger("removeMiddleSearchRotation");
		removeLoader();
		fadeInBlock(tw.layout_results, function(){
			self.show();
		});
		switch (json.error) {
			case "NOT_ENOUGHT_TIME_TO_DEPARTURE":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.popup.card.notEnoughtTimeToDeparture[0],
					comment: l10n.popup.card.notEnoughtTimeToDeparture[1],
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				kmqRecord({name: 'NoTimeForDepartue', url: document.location.href, text: 'NOT_ENOUGHT_TIME_TO_DEPARTURE'});
				break;
			case "TOO_MUCH_RESERVATIONS":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.popup.manyReservations[0],
					comment: l10n.popup.manyReservations[1],
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				kmqRecord({name: 'ManyReservations', url: document.location.href, text: 'TOO_MUCH_RESERVATIONS'});
				break;
			case "PROMO_USER_BLOCKED":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.searchResult.passengers.popup.cantCreateReservation,
					comment: l10n.searchResult.passengers.popup.promoUserBlocked,
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				break;
			case "PROMO_WRONG_PASSANGER":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.searchResult.passengers.popup.cantCreateReservation,
					comment: l10n.searchResult.passengers.popup.promoWrongPassenger,
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				break;
			case "PROMO_CODE_NOT_VALID":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.searchResult.passengers.popup.cantCreateReservation,
					comment: l10n.searchResult.passengers.popup.promoCodeNotValid,
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				break;
			case "PROMO_BLOCKED":
				addPopup({
					error: true,
					close_button: true,
					reason: l10n.searchResult.passengers.popup.cantCreateReservation,
					comment: l10n.searchResult.passengers.popup.promoBlocked,
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				break;
			default:
				addPopup({
					error: true,
					reason: l10n.popup.warning,
					comment: l10n.searchResult.passengers.popup.notConfirmed.later,
					close_button: true,
					button: l10n.popup.close,
					actionButton: "removePopup();"
				});
				kmqRecord({name: 'FareNotConfirmed', url: document.location.href, text: 'FIO: ' + firstPassenger, obj: self.kmqFlight, prefix: 'FNC'});
			break;
		}
	}
};
function CheckResultsData(){
	$(document.body).trigger("removeMiddleSearchRotation");
	removeLoader();
	//перерисовываем
	tw.oResult.RedrawResults();
	//если пришел с момондо-like ресурса сразу на выбранную АК и затем пытался конфирмить
	if (tw.source) {
		delete tw.source;
		window.location.hash = window.location.hash.split('|')[0];
	}
	//при раскрытом варианте и если осталась АК в выборке после удаления - раскрываем снова
	if (tw.oResult.selectedAK) {
		var opt = tw.oResult.selectedAK.direct + ',' + tw.oResult.selectedAK.AK;
		if ($('.showAKvariants[opt="' + opt + '"]').length > 0) {
			try {
				tw.oResult.selectedAK = null;
				tw.oResult.MakeClickEvent($('.showAKvariants[opt="' + opt + '"]')[0]);
			}
			catch (e) {
			}
		}
	}
	if (tw.oResult.allFlights.length === 0) {
		addPopup({
			error: true,
			className: "notConfirmed",
			reason: l10n.searchResult.passengers.popup.notConfirmed.reason,
			comment: l10n.searchResult.passengers.popup.notConfirmed.noflights,
			close_button: true,
			button: l10n.popup.close,
			actionButton: "removePopup();"
		});
		objMap.show();
	}
}

function CancelPrereservation(id){
	removePopup();
	$.ajax({
		type: "post",
		dataType: "json",
		url: 'https://secure.onetwotrip.com/_api/confirmation/cancelconfirm/',
		data: {
			"id": id
		},
		timeout: 40000,
		success: function(){
		}
	});
}

function GenderSelect(options){
	this.options = options || {};
	var data = this.options.data || {
		id: this.options.id,
		age: this.options.age,
		gender: ""
	};
	this.value = data.gender;
	this.elField = $.tmpl(tmpl_GenderSelect, data)[0];
	this.$elFocus = $("div.focus", this.elField);
	this.createSelect();
	this.options.appendTo.appendChild(this.elField);
}
GenderSelect.prototype.setValue = function(gender){
	this.value = gender;
	if(this.value == "M"){
		this.$radioM[0].checked = true;
		$(this.$radioM[0].parentNode).addClass("checked");
	} else {
		this.$radioF[0].checked = true;
		$(this.$radioF[0].parentNode).addClass("checked");
	}
};
GenderSelect.prototype.createSelect = function(){
	var self = this;
	this.$radio = $("input", this.elField);
	this.$radio.each(function(){
		this.ageNumber = self.options.ageNumber;
		this.row = self.options.row;
	});
	this.input = this.$radio[0];
	this.$radioM = $("input[value='M']", this.elField);
	this.$radioF = $("input[value='F']", this.elField);
	this.focusM = false;
	this.focusF = false;
	this.$radioM.focus(function(event){
		self.focusM = true;
	});
	this.$radioF.focus(function(event){
		self.focusF = true;
	});
	this.$radioM.blur(function(event){
		self.focusM = false;
	});
	this.$radioF.blur(function(event){
		self.focusF = false;
	});
	$(this.elField).focusin(function(){
		self.$elFocus.fadeIn();
		self.drawHint();
		self.removeError();
	});
	$(this.elField).focusout(function(){
		setTimeout(function(){
			if (!self.focusM && !self.focusF) {
				self.$elFocus.fadeOut();
			}
		}, 10);
		
	});
	this.$radio.change(function(){
		self.value = this.value;
	});
	$("label", this.elField).mousedown(function(event){
		self.removeError();
	});
};
GenderSelect.prototype.addError = function(){
	this.error = true;
	$(this.elField).addClass('error');
};
GenderSelect.prototype.removeError = function() {
	this.error = false;
	$(this.elField).removeClass('error');
};
GenderSelect.prototype.drawHint = function(){
	var self = this;
	this.removeHint();
	if (this.error) {
		var data = {
			type: this.options.type,
			className: "error",
			error: true
		};
		this.elHint = $.tmpl('tmpl_hint', data)[0];
		
		setTimeout(function(){
			$(self.elHint).fadeOut(1000, function(){
				if(self.focus){
					self.drawHint();
				} else {
					self.removeHint();
				}
			});
		}, 3000);
		
		document.body.appendChild(this.elHint);
		var pos = $(this.elField).offset();
		$(this.elHint).css({
			left: pos.left + self.elField.offsetWidth / 2 - self.elHint.offsetWidth / 2,
			top: pos.top + self.elField.offsetHeight + 5
		});
	}
};
GenderSelect.prototype.removeHint = function(){
	$(this.elHint).remove();
	this.elHint = null;
};