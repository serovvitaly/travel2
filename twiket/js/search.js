window.tw = window.tw || {};
var tmpl_Direction, tmpl_Multiway;
var tmpl_FlightTypeButtons = '<div class="flightTypeButtons  btn-group calend" data-toggle="buttons-radio"><span class="btn oneway"><img src="/i/btnFlight1.png"></span><span class="btn round"><img src="/i/btnFlight2.png"></span><span class="btn multiway"><img src="/i/btnFlight3.png"></span></div>';
var tmpl_CalendarButton = '<div class="calendarButton btn btn-primary"><div class="lineSpreader" style="display: none;"> </div><div class="text">{{if date}}<div class="date">${date}</div><div class="month">${month}</div>{{else}}?{{/if}}</div></div>';
var tmpl_Hint = '<div class="hint ${$data.className}"><div class="abs"><div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="t"></div><div class="r"></div><div class="b"></div><div class="l"></div><div class="c"></div><div class="arrUp"></div></div></div>';
var objAvia, objSearchForm, objRecentSearches;
$(function(){
	if(tw.params.ticker){
		initTicker();
	}
	//initPressLinks();
	//initBackgroundSelect();

	tmpl_Direction = $("#tmpl_Direction").trim();
	tmpl_Multiway = $("#tmpl_Multiway").trim();
	objAvia = new Avia();
	objSearchForm = new SearchForm();
	objRecentSearches = new RecentSearches();
	//if (window.screen.width > 765 && !tw.testResult && !(/windows nt 5.1/.test(_ua) && IEVersion == 8)) $.getScript("http://maps.googleapis.com/maps/api/js?v=3.11&libraries=geometry&sensor=true&language=" + tw.language + "&callback=loadMapFiles");
});

function initPressLinks(){
	if(tw.language=='ru' || tw.language=='en'){
		$.tmpl($("#tmpl_PressLinks").trim()).insertAfter( $('#layout_map') );
		$('#layout_map').css({'bottom': 55});
		$(document.body).bind("mapShow", function(){
			$('#pressLinks').removeClass('invisible');
		});
		$(document.body).bind("changeRequest", function(){
			$('#pressLinks').addClass('invisible');
		});		
	}
}
function initTicker(){
	tickerFrame = document.createElement("iframe");
	tickerFrame.id = 'ticker';
	tickerFrame.src = '/ticker.html?L=' + tw.language;
	tickerFrame.frameBorder = 'no';
	$(tickerFrame).css({'width': 0, 'height': 0});
	if(!browser.opera) {
		$(tickerFrame).css({'border-radius': 10});
	}
	document.body.appendChild(tickerFrame);
	$(document.body).bind("mapShow", function(){
		if(tickerFrame.contentWindow.objTicker && !tickerFrame.contentWindow.objTicker.close) {
			$(tickerFrame).removeClass('invisible');
		}
	});
	$(document.body).bind("changeRequest", function(){
		$(tickerFrame).addClass('invisible');
	});
}
function loadMapFiles() { return;
	var mapUrls = [
		"http://www.onetwotrip.com/js/extendedApi.js"/*tpa=http://www.onetwotrip.com/js/extendedApi.js*/,
		"http://www.onetwotrip.com/js/map.js"/*tpa=http://www.onetwotrip.com/js/map.js*/
	];
	$('head').append($('<link rel="stylesheet"/>').attr('href', 'http://www.onetwotrip.com/css/map.css'/*tpa=http://www.onetwotrip.com/css/map.css*/));
	for (var i in mapUrls) {
		$.ajax({
			dataType: "script",
			url: mapUrls[i],
			success: function(){
				mapUrls.shift();
				if (!mapUrls.length) {
					if(objAvia.startSearch){
						objMap = new Map(false);
					} else {
						objMap = new Map(true);
					}
				}
			}
		});
	}
}

/*function initInfoPanel(){
	var elPanel = $('#infoPanel')[0];
	var isLeadHidden = readCookie('i_lead');
	var panelText = l10n.lead.title_html + l10n.lead.panel_html;
	var removed = false;
	if(tw.language != 'ru' || isLeadHidden){
		$(elPanel).remove();
	} else {
		HidePanel();		
	}
	if(!removed){
		$(elPanel).show();
	}
	function infoLead(){
		$('.advText', elPanel).html( panelText );
		$('.close_button', elPanel).click(function(){
			setCookie({
				name: 'i_lead',
				value: 1,
				days: 60
			});
			isLeadHidden = 1;
			HidePanel();
		});
	}
	function HidePanel(){
		removePanel();
		removed = true;
	}
	function removePanel(){
		var panelHeight = $('#layout_panels').height();
		$(elPanel).slideUp(function(){
			$(this).remove();
			if(window.objMap && !objMap.visible) {
				var elLayoutMap = document.getElementById("layout_map");
				$(elLayoutMap).css({
					height: panelHeight,
					marginTop: 0
				}).animate({
					marginTop: -38
				}, 1000);
			}
		});			
	}	
}*/

function AirportFinder(lat, lng) {
	var kilometersPerGrad = 112.2;
	var citiesWithAirports = [];
	var radiusStep = 50;
	var i  = 1;
	while (citiesWithAirports.length < 1) {
		var currentRadius = i == 1 ? 200 : i * radiusStep;
		var gradSearchDelta = currentRadius / kilometersPerGrad;
		var latFrom = lat - gradSearchDelta;
		var latTo = lat + gradSearchDelta;
		var lngFrom = lng - gradSearchDelta;
		var lngTo = lng + gradSearchDelta;
		citiesWithAirports = getCloserCities(latFrom, latTo, lngFrom, lngTo);
		i++;
	}
	if(citiesWithAirports.length > 0){
		return citiesWithAirports;
	} else {
		return false;
	}
}
function getCloserCities(latFrom, latTo, lngFrom, lngTo){
	return getCloserPoint("Cities", latFrom, latTo, lngFrom, lngTo);
}
function getCloserAirports(latFrom, latTo, lngFrom, lngTo){
	return getCloserPoint("Airports", latFrom, latTo, lngFrom, lngTo);
}
function getCloserPoint(PointType, latFrom, latTo, lngFrom, lngTo) {
	var closerPoints = [];
	var curRef = ref[PointType];
	for(var i in curRef){
		var curPoint = curRef[i];
		if(curPoint.lat >= latFrom && curPoint.lat <= latTo && curPoint.lng >= lngFrom && curPoint.lng <= lngTo) {
			closerPoints.push(i);
		}
	}
	return closerPoints;
}

function RequestData(options){
	options = options || {};
	this.directions = [];
	this.cs = options.cs || "E";
}
RequestData.prototype.getRoute = function(){
	route = "";
	for (var i = 0, length = this.directions.length; i < length; i++) {
		var curDir = this.directions[i];
		if (curDir.from && curDir.to && curDir.date) {
			if (i == 1 && this.getFlightType() == "round") {
				route += curDir.date.stringifyAPI();
			} else {
				route += curDir.date.stringifyAPI() + curDir.from + curDir.to;
			}
		}
	}
	return route;
};
RequestData.prototype.getFullRoute = function(){
	route = "";
	for (var i = 0, length = this.directions.length; i < length; i++) {
		var curDir = this.directions[i];
		if (curDir.from && curDir.to && curDir.date) {
			if (i == 1 && this.getFlightType() == "round") {
				route += curDir.date.format('yyyymmdd');
			} else {
				route += curDir.date.format('yyyymmdd') + curDir.from + curDir.to;
			}
		}
	}
	return route;
};
RequestData.prototype.getKey = function(){
	key = this.getRoute();
	if(this.cs != "E"){
		key += "&" + this.cs;
	}
	return key;
};
RequestData.prototype.getFullKey = function(){
	key = this.getFullRoute();
	if(this.cs != "E"){
		key += "&" + this.cs;
	}
	return key;
};
RequestData.prototype.getFlightType = function(){
	var dirsCount = 0;
	for (var i = 0, length = this.directions.length; i < length; i++) {
		var curDir = this.directions[i];
		if (curDir.from && curDir.to && curDir.date) {
			dirsCount++;
		}
	}
	var fType = "multiway";
	if(dirsCount == 1){
		fType = "oneway";
	} else if(dirsCount == 2 && this.directions[0].from == this.directions[1].to && this.directions[0].to == this.directions[1].from) {
		fType = "round";
	}
	return fType;
};
function Direction(options){
	options = options || {};
	this.from = options.from || null;
	this.to = options.to || null;
	this.date = options.date || null;
}

function RecentSearches() {
	var self = this;
	this.elLayoutPanels = document.getElementById("layout_panels");
	this.elLayoutRecentSearches = document.getElementById("layout_recentSearches");
	this.elUl = document.getElementById("recentSearches");
	this.draw();
	$(document.body).bind("changeRequest", function(){
		self.draw();
	});
	this.link_setFixed = function(){
		self.setFixed();
	};
	this.setTop();
}
RecentSearches.prototype.draw = function(){
	var self = this;
	this.elUl.innerHTML = "";
	for(var i = 0, n = 0, length = tw.requestsList.length; i < length && n < 5; i++){
		var data = tw.requestsList[i];
		if (data.getFlightType() != "multiway") {
			var elLi = document.createElement("li");
				elLi.className = data.cs;
			if (objAvia.currentRequestKey == data.getKey()) {
				$(elLi).addClass("active");
			} else {
				elLi.style.zIndex = length - i;
			}
			var elA = document.createElement("a");
				elA.href = "#" + data.getKey();
				var elRoute = document.createElement("span");
					elRoute.className = "route";
					if(length < 4) elRoute.innerHTML = ref.getPointName(data.directions[0].from);
					else elRoute.innerHTML = data.directions[0].from;
					if(data.getFlightType() == "oneway") elRoute.innerHTML += " → ";
					else elRoute.innerHTML += " ⇄ ";
					if(length < 4) elRoute.innerHTML += ref.getPointName(data.directions[0].to);
					else elRoute.innerHTML += data.directions[0].to;
				elA.appendChild(elRoute);
				elA.appendChild(document.createTextNode(","));
				var elDate = document.createElement("span");
					elDate.className = "date";
				if (data.getFlightType() == "oneway") {
					elDate.innerHTML = data.directions[0].date.format('d mmm');
				} else if (data.directions[0].date.getMonth() == data.directions[1].date.getMonth()) {
					elDate.innerHTML = data.directions[0].date.getDate() + "—" + data.directions[1].date.format('d mmm');
				} else {
					elDate.innerHTML = data.directions[0].date.format('d mmm') + "—" + data.directions[1].date.format('d mmm');
				}
				elA.appendChild(elDate);
				$(elA).click({
					objData: data
				}, function(event){
					if( $(this).parents('li').hasClass('selected') ) {
						return;
					}
					objAvia.changeRequest(event.data.objData);
				});
			elLi.appendChild(elA);
			var elClose = document.createElement("span");
				elClose.className = "close";
				$(elClose).click({
					objData: data
				}, function(event){
					objAvia.removeDataFromRequestsList(event.data.objData);
					self.draw();
				});
			elLi.appendChild(elClose);
			this.elUl.appendChild(elLi);
			n++;
		}
	}
	try {
		if(tw.requestsList.length>0){
			objSearchForm.dirRows[0].fromField.options.needHint = false;
			objSearchForm.dirRows[0].toField.options.needHint = false;
		} else {
			objSearchForm.dirRows[0].fromField.options.needHint = true;
			objSearchForm.dirRows[0].toField.options.needHint = true;
		}
	} catch(e) {}
};
RecentSearches.prototype.setTop = function(){
	var self = this;
	$(window).unbind("scroll", self.link_setFixed);
	$(window).bind("scroll", self.link_setFixed);
};
RecentSearches.prototype.setFixed = function(){
	var panelsHeight = this.elLayoutPanels.offsetHeight;
	if ($(window).scrollTop() >= panelsHeight) {
		$(this.elLayoutRecentSearches).css({
			position: "fixed",
			top: 0
		});
	} else {
		$(this.elLayoutRecentSearches).css({
			position: "absolute",
			top: "auto"
		});
	}
};
RecentSearches.prototype.show = function(callback){
	fadeInBlock(this.elLayoutRecentSearches, function(){
		callback;
	});
};
RecentSearches.prototype.hide = function(callback){
	fadeOutBlock(this.elLayoutRecentSearches, function(){
		callback;
	});
};

function SearchForm() {
	var self = this;
	if (objAvia.currentRequestKey) {
		this.data = objAvia.parseKey(objAvia.currentRequestKey);
		this.data.flightType = this.data.getFlightType();
		if(this.data.flightType == "multiway" && this.data.directions.length < 4){
			this.data.directions.push(new Direction());
		}
	} else {
		this.data = new RequestData();
		this.data.directions[0] = new Direction();
		this.data.directions[1] = new Direction();
		this.data.flightType = "round";
		if(objAvia.noDataDirection){
			this.data.directions[0].from = objAvia.noDataDirection.from;
			this.data.directions[0].to = objAvia.noDataDirection.to;
			this.data.directions[1].from = this.data.directions[0].to;
			this.data.directions[1].to = this.data.directions[0].from;
		}
	}
	
	this.elForm = document.getElementById("form_search");
	this.elSubmitButton = $("input[type='submit']",this.elForm)[0];
	$(this.elSubmitButton).click(function(event){
		event.stopPropagation();
	});
	$(this.elForm).submit(function(event){
		event.preventDefault();
	});
	this.link_submit = function(){
		self.onSubmit();
	};
	this.link_clickOutsideMultiway = function(event){
		self.hideMultiwayForm();
	};
	
	this.elFirstRowContainer = document.getElementById("topPanel2spreader");
	this.elDirTongue = document.getElementById("dirTongue");
	$(this.elDirTongue).click(function(event){
		event.stopPropagation();
	});
	this.elSearchButtonTongue = document.getElementById("searchButtonTongue");
	$('input', this.elSearchButtonTongue).val(l10n.index.search.find);
	this.setForm();
	if (objAvia.currentRequestKey && objAvia.startSearch) {
		this.onSubmit('startSearch');
	} else {
		this.update();
	}
	this.link_changeRequest = function(){
		self.changeRequest();
	};
	$(document.body).bind("changeRequest.regenForm", this.link_changeRequest);
}
SearchForm.prototype.changeRequest = function(){
	this.data = objAvia.parseKey(objAvia.currentRequestKey);
	this.data.flightType = this.data.getFlightType();
	this.setForm();
};
SearchForm.prototype.setForm = function(){
	$(this.elForm).unbind("submit", this.link_submit);
	//$(this.elSearchButtonTongue).hide();
	$("input").blur();
	$(this.elFirstRowContainer).empty();
	$(this.elDirTongue).empty().addClass("invisible");
	this.setDirectionRows();
	this.setFlightTypeButtons();
};
SearchForm.prototype.setDirectionRows = function(){
	this.dirRows = [];
	for (var i = 0, length = this.data.directions.length; i < length; i++) {
		if(!(this.data.flightType == "round" && i == 1)){
			this.dirRows[i] = this.setDirectionRow(i);
		}
		if(this.data.directions[i].date){
			this.setDate(i);
		}
	}
};
SearchForm.prototype.setDirectionRow = function(n){
	var self = this;
	var dataDirection = this.data.directions[n];
	var dirRow = {};
		dirRow.layout = $.tmpl(tmpl_Direction)[0];
	var elDirectionFrom = $(".directionFrom", dirRow.layout)[0];
	var elDirectionTo = $(".directionTo", dirRow.layout)[0];
	if (n === 0 && tw.requestsList.length === 0) {
		var needHint = true;
	} else {
		var needHint = false;
	}
	
	dirRow.fromField = new SuggestField({
		appendTo: elDirectionFrom,
		name: "from" + n,
		value: dataDirection.from,
		defaultValue: l10n.index.search.from,
		type: "search",
		needHint: needHint
	});
	dirRow.fromField.suggest = new Suggest(dirRow.fromField, this, n);
	
	dirRow.toField = new SuggestField({
		appendTo: elDirectionTo,
		name: "to" + n,
		value: dataDirection.to,
		defaultValue:  l10n.index.search.to,
		type: "search",
		needHint: needHint
	});
	dirRow.toField.suggest = new Suggest(dirRow.toField, this, n);
	if(n === 0){
		if (this.data.flightType == "multiway") {
			this.elMultiway = $.tmpl(tmpl_Multiway)[0];
			dirRow.layout.appendChild(this.elMultiway);
			$(dirRow.layout).click(function(event){
				event.stopPropagation();
			});
			$(this.elMultiway).click(function(event){
				self.showMultiwayForm();
			});
		}
		this.elFirstRowContainer.appendChild(dirRow.layout);
	} else {
		this.elDirTongue.appendChild(dirRow.layout);
		this.showMultiwayForm();
	}
	return dirRow;
};
SearchForm.prototype.showMultiwayForm = function(){
	var self = this;
	$(this.elMultiway).addClass("invisible");
	$(this.elDirTongue).removeClass("invisible").slideDown("fast");
	$(document).bind("click", self.link_clickOutsideMultiway);
};
SearchForm.prototype.hideMultiwayForm = function(){
	var self = this;
	this.setMultiwayLabel();
	$(document).unbind("click", self.link_clickOutsideMultiway);
	$(this.elDirTongue).slideUp("fast", function(){
		$(this).addClass("invisible");
	});
	$(this.elMultiway).removeClass("invisible");
};
SearchForm.prototype.setMultiwayLabel = function(){
	var elContent = $("div.content", this.elMultiway)[0];
	elContent.innerHTML = "";
	var letterCount = 0;
	for (var i = 0, length = this.data.directions.length; i < length; i++) {
		var dir = this.data.directions[i];
		if (dir.from || dir.to || dir.date) {
			if (dir.from) letterCount += ref.getPointName(dir.from).length; else letterCount += 1;
			if (dir.to) letterCount += ref.getPointName(dir.to).length; else letterCount += 1;
			if (dir.date) {
				if (dir.date.getDate() < 10) letterCount += 5; else letterCount += 6;
			} else letterCount += 1;
		}
	}
	for (var i = 0, length = this.data.directions.length; i < length; i++) {
		var dir = this.data.directions[i];
		if (dir.from || dir.to || dir.date) {
			if (elContent.innerHTML != "") {
				elContent.innerHTML += '<span class="date">,</span> ';
			}
			var elFlight = document.createElement("span");
				elFlight.className = "flight";
			if (dir.from) {
				if (letterCount < 50) {
					elFlight.innerHTML += ref.getPointName(dir.from);
				} else {
					elFlight.innerHTML += dir.from;
				}
			} else {
				elFlight.innerHTML += "…";
			}
				elFlight.innerHTML += ' → ';
			if (dir.to) {
				if (letterCount < 50) {
					elFlight.innerHTML += ref.getPointName(dir.to);
				} else {
					elFlight.innerHTML += dir.to;
				}
			} else {
				elFlight.innerHTML += "…";
			}
			elContent.appendChild(elFlight);
			if (dir.date) {
				elContent.innerHTML += ' <span class="date">' + dir.date.format('d mmm') + '</span>';
			} else {
				elContent.innerHTML += ' <span class="date">?</span>';
			}
		}
	}
};
SearchForm.prototype.setFlightTypeButtons = function(){
	var self = this;
	this.flightTypeButtons = $.tmpl(tmpl_FlightTypeButtons)[0];
	$("span", this.flightTypeButtons).click(function(event){
		event.stopPropagation();
		self.hideCalendar();
		if ($(this).hasClass("oneway")) {
			self.setFlightType("oneway");
		} else if ($(this).hasClass("round")) {
			self.setFlightType("round");
		} else {
			self.setFlightType("multiway");
		}
	});
	$("span", this.flightTypeButtons).mouseover(function(){ return;
		var button = this;
		this.hint = $.tmpl(tmpl_Hint, {
			className: "flightType"
		})[0];
		if ($(this).hasClass("oneway")) {
			this.hint.appendChild(document.createTextNode(l10n.index.search.oneway));
		} else if ($(this).hasClass("round")) {
			this.hint.appendChild(document.createTextNode(l10n.index.search.round));
		} else {
			this.hint.appendChild(document.createTextNode(l10n.index.search.custom));
		}
		document.body.appendChild(this.hint);
		var pos = $(button).offset();
		$(this.hint).css({
			left: pos.left + button.offsetWidth / 2 - this.hint.offsetWidth / 2,
			top: pos.top + button.offsetHeight + 14
		});
	});
	$("span", this.flightTypeButtons).bind("mouseout click", function(){
		$(".hint.flightType").remove();
		this.hint = null;
	});
	
	var betweenFromTo = $(".betweenFromTo", this.dirRows[0].layout)[0];
		betweenFromTo.appendChild(this.flightTypeButtons);
	$("span." + this.data.flightType, this.flightTypeButtons).addClass("active");
};
SearchForm.prototype.setFlightType = function(flightType){
	var selectedButton = $("span.active", this.flightTypeButtons);
	if (!$(selectedButton).hasClass(flightType)) {
		$("span.active", this.flightTypeButtons).removeClass("active");
		$("span." + flightType, this.flightTypeButtons).addClass("active");
		this.data.flightType = flightType;
		var length = this.data.directions.length;
		this.data.directions.splice(1, length - 1);
		if (this.data.flightType === "oneway") {
			$(this.elDirTongue).addClass("invisible");
		} else if (this.data.flightType === "round") {
			this.data.directions[1] = new Direction();
			$(this.elDirTongue).addClass("invisible");
		} else if (this.data.flightType === "multiway") {
			this.data.directions[1] = new Direction();
			$(this.elDirTongue).removeClass("invisible");
		}
		this.setForm();
		this.update();
	}
};
SearchForm.prototype.update = function(){
	this.updateFields();
	this.checkData();
	if (window.objMap && window.objMap.visible) {
		objMap.setData(this.data);
		if (this.data.flightType != "multiway") {	//polylines
			var showPoly = true;
			for(var i=0,DirLength=this.data.directions.length;i<DirLength;i++) {
				if(!this.data.directions[i].date) {
					showPoly = false;
				}
			}
			try {
				if(!this.tempStartPoint || this.tempStartPoint != from1.value){
					var tik = $('#ticker')[0];
					tik.contentWindow.objTicker.getData(true);
				}
			} 
			catch (e) {}
			
			if(!showPoly) { return;}
			var from1 = this.dirRows[0].fromField;
			var to1 = this.dirRows[0].toField;
			if (this.tempStartPoint != from1.value) {
				ClearPolylineFlights();
				if (ref.testPoint(from1.value)) {
					if (ref.testPoint(from1.value) && to1.value && to1.value != '') {
						initPolylineRoutes(from1.value + '' + to1.value);
					}
					try {
					//initPopularDirection(from1.value);
					} 
					catch (e) {
					}
				}
				this.tempStartPoint = from1.value;
			}
			if(this.tempEndPoint != to1.value) {
				ClearPolylineFlights();
				if (ref.testPoint(to1.value) && from1.value && from1.value != '') {
					initPolylineRoutes(from1.value+''+to1.value);
				}
				this.tempEndPoint = to1.value;
			}
			if(!from1.value || !to1.value) {
				ClearPolylineFlights();
				this.tempStartPoint = null;
				this.tempEndPoint = null;
			}
		} else {
			ClearPolylineFlights();
			this.tempStartPoint = null;
			this.tempEndPoint = null;
		}
	}
};
SearchForm.prototype.updateFields = function(){
	var focus = null;
	for(var i = 0, length = this.dirRows.length; i < length; i++){
		var dirRow = this.dirRows[i];
		var dataDir = this.data.directions[i];
		
		dataDir.from = dirRow.fromField.value;
		if(this.data.flightType == "round"){
			this.data.directions[1].to = dataDir.from;
		}
		dataDir.to = dirRow.toField.value;
		if(this.data.flightType == "round"){
			this.data.directions[1].from = dataDir.to;
		}
		
		if (dataDir.from && dataDir.to) {
			if (!dataDir.date) {
				this.showCalendar(i);
				break;
			} else if (this.data.flightType == "round" && !this.data.directions[1].date) {
				this.showCalendar(1);
				break;
			}
		} else if (!dataDir.from && !dataDir.to) {
			if (dataDir.date) {
				dataDir.date = null;
				this.setDate(i);
				if (this.data.flightType == "round") {
					this.data.directions[1].date = null;
					this.setDate(1);
					break;
				}
			}
		}
		
		if (!dataDir.from && !focus) {
			focus = this.dirRows[i].fromField.input;
			focus.focus();
		}
		if (!dataDir.to && !focus) {
			focus = this.dirRows[i].toField.input;
			focus.focus();
		}
		
		if (this.data.flightType == "multiway") {
			if (i == (length - 1)) {
				if (length < 4) {
					if (dataDir.from || dataDir.to) {
						this.data.directions.push(new Direction());
						this.setForm();
						this.update();
						break;
					}
				}
				if (length > 2) {
					if (!dataDir.from && !dataDir.to && !this.data.directions[i - 1].from && !this.data.directions[i - 1].to) {
						this.data.directions.pop();
						this.setForm();
						this.update();
						break;
					}
				}
			}
		}
	}
};
SearchForm.prototype.updateDates = function(){
	for (var i = 0, length = this.data.directions.length; i < length; i++) {
		var dataDir = this.data.directions[i];
		if(!dataDir.date){
			this.showCalendar(i);
			break;
		}
	}
};
SearchForm.prototype.showCalendar = function(n){
	$('input[type="text"]:focus').blur();
	this.hideCalendar();
	var options = {
		parent: this,
		directionNumber: n
	};
	this.calendar = new Calendar(options);
};
SearchForm.prototype.hideCalendar = function(){
	if (this.calendar) {
		if (this.calendar.elCalendar.offsetHeight > 0) {
			this.calendar.hide();
		}
		this.calendar = null;
	}
};
SearchForm.prototype.setDate = function(n){
	var self = this;
	if (n === 1 && this.data.flightType === "round") {
		var elButton = $(".directionTo .calendarButton", this.dirRows[0].layout)[0];
	} else {
		var elButton = $(".calendarButton", this.dirRows[n].layout)[0];
	}
	if (elButton) {
		$(elButton).remove();
	}
	if (this.data.directions[n].from || this.data.directions[n].to) {
		if (this.data.directions[n].date) {
			var data = {
				date: this.data.directions[n].date.getDate(),
				month: (l10n.calendar.months_S[this.data.directions[n].date.getMonth()]).toLowerCase()
			};
		}
		elButton = $.tmpl(tmpl_CalendarButton, data)[0];
		$(elButton).click(function(event){ 
			event.stopPropagation();
			self.showCalendar(n);
		});
		if (n === 1 && this.data.flightType === "round") {
			this.dirRows[0].toField.elField.appendChild(elButton);
		} else {
			this.dirRows[n].fromField.elField.appendChild(elButton);
		}
	}
};
SearchForm.prototype.checkData = function(){
	var dataFilled = false;
	this.wrongDates = false;
	this.wrongRoute = false;
	for (var i = 0, length = this.data.directions.length; i < length; i++) {
		var dataDir = this.data.directions[i];
		if (dataDir.date || dataDir.from || dataDir.to) {
			if (!dataDir.date || !dataDir.from || !dataDir.to) {
				dataFilled = false;
				break;
			} else {
				if(this.data.directions[i - 1]){
					if (dataDir.date < this.data.directions[i - 1].date) {
						this.wrongDates = true;
					}
				}
				if(dataDir.from == dataDir.to){
					this.wrongRoute = true;
				}
				dataFilled = true;
			}
		}
	}
	if(dataFilled){
		$(this.elForm).unbind("submit", this.link_submit);
		//$(this.elSearchButtonTongue).slideDown("fast");
		$(this.elForm).bind("submit", this.link_submit);
	} else {
		$(this.elForm).unbind("submit", this.link_submit);
		//$(this.elSearchButtonTongue).hide();
	}
};
SearchForm.prototype.onSubmit = function(isKey){
	if(this.wrongRoute){
		addPopup({
			error: true,
			reason: l10n.popup.warning,
			comment: l10n.index.search.popup.checkDirections,
			close_button: true,
			button: l10n.popup.close,
			actionButton: "removePopup();"
		});
		return;
	}
	if(this.wrongDates){
		addPopup({
			error: true,
			reason: l10n.popup.warning,
			comment: l10n.index.search.popup.checkDates,
			close_button: true,
			button: l10n.popup.close,
			actionButton: "removePopup();"
		});
		return;
	}
	$(this.elForm).unbind("submit", this.link_submit);
	//$(this.elSearchButtonTongue).slideUp("fast");
	if(this.data.getFlightType() == this.data.flightType){
		$(document.body).unbind("changeRequest.regenForm", this.link_changeRequest);
	}
	if (this.data.getFlightType() == "multiway") {
		this.hideMultiwayForm();
	}
	var data = objAvia.parseKey(this.data.getKey());
	if(!isKey){
		data.cs = "E";
	}
	objAvia.changeRequest(objAvia.addDataToRequestsList(data));
	if (this.data.getFlightType() == this.data.flightType) {
		$(document.body).bind("changeRequest.regenForm", this.link_changeRequest);
	}
};
SearchForm.prototype.show = function(callback){
	fadeInBlock(this.elForm, callback);
};
SearchForm.prototype.hide = function(callback){
	fadeOutBlock(this.elForm, callback);
};
function isResults(){
	var layoutResults = document.getElementById("layout_results");
	if(layoutResults.hasChildNodes()){
		return true;
	} else {
		return false;
	}
}
function hideResults(){
	var layoutResults = document.getElementById("layout_results");
	if(isResults()){
		$(layoutResults).animate({
			opacity: '0'
		}, 500, function(){
			$(this).empty();
			$(document.body).trigger("resultsHide");
		});
	}
}
function clearBody(callback){
	var elLayoutBody = document.getElementById("layout_body");
	if (window.objMap) objMap.hide();
	var comparePrice = function(){
		if(window.adriver && (tw.language == 'ru' || tw.checkAdriver)) {
			appendLoader({
				appendTo: elLayoutBody,
				text: l10n.loaders.moment
			});
			//adriver
				$(document.body).trigger("removeMiddleSearchRotation");
				$('#layout_body').append('<div class="middleSearchRotation"></div>');
				var newBanner = document.createElement('div');
				bannerId = 'rotation_partner_'+ new Date().valueOf();
				newBanner.id = bannerId;
				var bpozition;
				var data = objAvia.parseKey(objAvia.currentRequestKey);
				switch(data.cs) {
					case 'B':
						bpozition = 2;
						break;
					case 'F':
						bpozition = 2;
						break;
					default:
						bpozition = 1;
						break;
				}
				var from = data.directions[0].from;
				var to = data.directions[0].to
				var sInfo = 'CS=' + data.cs + ',O_CNT=' + ref.getCountryCode(from) + ',O_CITY=' + ref.getCityCode(from) + ',D_CNT=' + ref.getCountryCode(to) + ',D_CITY=' + ref.getCityCode(to);
				/*if(tw.language != 'ru'){
					sInfo+= ',LANG=' + tw.language.toUpperCase();
				}*/
				$('.middleSearchRotation').append(newBanner);
				var adObj = {sid:184643, bt:52, keyword:sInfo};
				if(tw.checkAdriver){
					adObj.bn = 1;
				} else {
					adObj.pz = bpozition;
				}
				new adriver(bannerId, adObj);
				//check adriver img
					rotationCounterTry = 0;
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
		} else {
			appendLoader({
				appendTo: elLayoutBody,
				text: l10n.loaders.moment
			});
		}
	}
	if (isResults()) {
		$(document.getElementById("layout_results")).animate({
			opacity: '0'
		}, 500, function(){
			$(this).empty();
			if (callback) {
				callback();
			} else {
				comparePrice();
			}
		});
	} else if (callback) {
		callback();
	} else {
		comparePrice();
	}
}

function Avia(){
	var self = this;
	this.today = (new Date()).cutTime();
	this.yesterday = new Date(this.today);
	this.yesterday.setDate(this.yesterday.getDate() - 1);
	this.min = new Date(this.yesterday);
	this.max = new Date();
	this.max.setDate(this.max.getDate() + 360);
	tw.requestsList = [];
	this.loadRoutes();
	this.getURLData();
}
Avia.prototype.saveRoutes = function(){
	var routes = [];
	for(var i = 0, n = 0, length = tw.requestsList.length; i < length && n < 5; i++){
		if (tw.requestsList[i].getFlightType() != "multiway") {
			routes[n] = tw.requestsList[i].getFullKey();
			n++;
		}
	}
	makeCookie("routes", JSON.stringify(routes), 90);
};
Avia.prototype.loadRoutes = function(){
	var routes = JSON.parse(readCookie("routes"));
	if (routes) {
		for (var i = 0, length = routes.length; i < length; i++) {
			var data = this.parseFullKey(routes[i]);
			if(data){
				tw.requestsList.push(data);
			}
		}
	}
};
Avia.prototype.getURLData = function(){
	var fullhash = decodeURI(document.location.hash).substr(1).split('|');
	if(fullhash.length > 1){
		tw.source = {
			route: fullhash[0],
			ak: fullhash[1],
			dir: fullhash[2]
		};
		for (var HashInd = 3, HashL = fullhash.length; HashInd < HashL; HashInd++) {
			var curHash = fullhash[HashInd];
			var hashStr = curHash.split("=");
			tw.source[hashStr[0]] = hashStr[1];
			if(HashInd==HashL-1 && hashStr.length==1 && !tw.source.marker) {
				tw.source.marker = hashStr[0];
			}
		}
		if(tw.source.amup) {
			setCookie({
				name: "amup",
				value: tw.source.amup
			});
		}
		if (tw.source.tag) {
			tw.isRedirector = true;
			var metaDays = 1;
			if(tw.source.tag == 'aviasales') {
				metaDays = 14;
			}
			setCookie({
				name: 'referrer',
				value: tw.source.tag + '|' + (tw.source.id || '') + '|' + (tw.source.marker || ''),
				days: metaDays
			});
			tw.comparedPrice = false;
			setCookie({
				name: "comparedPriceShow",
				value: false,
				days: 180
			});
		}
	} else {
		//searchers
		var _utmz  = readCookie('__utmz');
		if(_utmz && _utmz.indexOf('utmcsr=yandex') >-1 && _utmz.indexOf('utmccn=(organic)') >-1){
			setCookie({
				name: "referrer",
				value: "yandex_direct||organic",
				days: 180
			});		
		} else if(_utmz && _utmz.indexOf('utmcsr=google') >-1 && _utmz.indexOf('utmccn=(organic)') >-1){
			setCookie({
				name: "referrer",
				value: "google_adwords||organic",
				days: 180
			});		
		} else if(tw.params.adwords){
			setCookie({
				name: "referrer",
				value: "google_adwords||"+tw.params.adwords,
				days: 180
			});
		} else if(tw.params.gclid){
			setCookie({
				name: "referrer",
				value: "google_adwords||"+tw.params.gclid,
				days: 180
			});
		} else if(tw.params.utm_campaign && tw.params.utm_source && tw.params.utm_source == 'Direct'){
			setCookie({
				name: "referrer",
				value: "yandex_direct||tw.params.utm_campaign="+tw.params.utm_campaign,
				days: 180
			});
		}
	}
		
	hash = fullhash[0];	
	var params = tw.params;
	var data = this.parseKey(hash, 1);
	if (data) {
		if (data.directions[0] && data.directions[0].from && data.directions[0].to && !data.directions[0].date) {
			this.noDataDirection = data.directions[0];
		} else {
			this.noDataDirection = false;
			this.addDataToRequestsList(data);
			this.currentRequestKey = data.getKey();
			window.location.hash = this.currentRequestKey;
			if (params.s || fullhash.length > 1) {
				this.startSearch = true;
			}
		}
	} else {
		window.location.hash = '';
	}
};
Avia.prototype.parseKey = function(key, directionWithoutDate){
	if (key.length >= 10 || directionWithoutDate) {
		var arrKey = key.split("&");
		var route = arrKey[0];
		var data = new RequestData();
		var length = Math.ceil(route.length / 10);
		for (var i = 0; i < length; i++) {
			var dirStr = route.substr((i * 10), 10);
			if (dirStr.length == 10) {
				var date = Date.parseAPI(dirStr.substr(0, 4));
				var from = dirStr.substr(4, 3);
				var to = dirStr.substr(7);
			} else if (dirStr.length == 4) {
				var date = Date.parseAPI(dirStr.substr(0, 4));
				var from = data.directions[(i - 1)].to;
				var to = data.directions[(i - 1)].from;
			} else if(directionWithoutDate && dirStr.length == 6) {
				var date = null;
				var from = dirStr.substr(0, 3);
				var to = dirStr.substr(3, 6);
			} else {
				return null;
			}
			if (date && !(this.min.getTime() <= date.getTime() && date.getTime() <= this.max.getTime())) {
				return null;
			}
			if(i > 0 && date && date.getTime() < data.directions[i - 1].date.getTime()){
				return null;
			}
			if (ref.testPoint(from) && ref.testPoint(to) && (date || (directionWithoutDate && dirStr.length == 6)) ) {
				data.directions.push(new Direction({
					from: from,
					to: to,
					date: date
				}));
			} else {
				return null;
			}
		}
		if (arrKey[1]){
			data.cs = arrKey[1];
		}
		if (data.directions.length > 0){
			return data;
		} else {
			return null;
		}
	} else {
		return null;
	}
};
Avia.prototype.parseFullKey = function(key){
	if (key.length >= 14) {
		var arrKey = key.split("&");
		var route = arrKey[0];
		var data = new RequestData();
		var length = Math.ceil(route.length / 14);
		for (var i = 0; i < length; i++) {
			var dirStr = route.substr((i * 14), 14);
			if (dirStr.length == 14) {
				var date = Date.parseAPI(dirStr.substr(0, 8));
				var from = dirStr.substr(8, 3);
				var to = dirStr.substr(11);
			} else if (dirStr.length == 8) {
				var date = Date.parseAPI(dirStr);
				var from = data.directions[(i - 1)].to;
				var to = data.directions[(i - 1)].from;
			} else {
				return null;
			}
			if (date && !(this.min.getTime() <= date.getTime() && date.getTime() <= this.max.getTime())) {
				return null;
			}
			if(i > 0 && date && date.getTime() < data.directions[i - 1].date.getTime()){
				return null;
			}
			if (ref.testPoint(from) && ref.testPoint(to)) {
				data.directions.push(new Direction({
					from: from,
					to: to,
					date: date
				}));
			} else {
				return null;
			}
		}
		if (arrKey[1]){
			data.cs = arrKey[1];
		}
		return data;
	} else {
		return null;
	}
};
Avia.prototype.addDataToRequestsList = function(data){
	var key = data.getKey();
	for (var i = (tw.requestsList.length - 1); i >= 0; i--) {
		var item = tw.requestsList[i];
		if (item.getKey() == key) {
			data = item;
			tw.requestsList.splice(i, 1);
		}
	}
	tw.requestsList.unshift(data);
	if (data.getFlightType() != "multiway") {
		this.saveRoutes();
	}
	return data;
};
Avia.prototype.removeDataFromRequestsList = function(data){
	var key = data.getKey();
	for (var i = (tw.requestsList.length - 1); i >= 0; i--) {
		var item = tw.requestsList[i];
		if (item.getKey() == key) {
			tw.requestsList.splice(i, 1);
		}
	}
	this.saveRoutes();
};
Avia.prototype.changeRequest = function(data){
	this.currentRequestKey = data.getKey();
	window.location.hash = this.currentRequestKey;
	$(document.body).trigger("changeRequest");
	this.drawResults(data);
};
Avia.prototype.drawResults = function(data){
	var self = this;
	clearExtraElements();
	if (data.json) {
		clearBody(function(){
			DrawFares(data);
		});
	} else {
		clearBody();
		this.getFares(data);
	}
};
Avia.prototype.getStatisticQuery = function(data, direct){
    
    var date = new Date(data.date);
    
    var currentCurrency = 'RUB';

    var collection = {}, 
        dateTo = new Date(), 
        dateFrom = new Date();
    
    if (date.getTime() > dateFrom.getTime() + 5 * 3600000 * 24) {           
        dateFrom.setTime(date.getTime() - 5 * 3600000 * 24);
    }
    
    var dynamicsFootDate = dateFrom.format('dd mmmm yyyy') + 'г.';
    
    dateTo.setTime(dateFrom.getTime() + 14 * 3600000 * 24);
    
    $.ajax({
        url: twiket.setup.urls.statistics,
        dataType: "jsonp",
        data: {
            route:    data.from + data.to,
            dateFrom: dateFrom.format('ddmm'),
            dateTo:   dateTo.format('ddmm'),
            asArray:  true,
            //days:     12
        },
        success: function(json){
            
            if (json.dates) {
                
                var amount, rate, maxAmount = 0;
                $.each(json.dates, function(index, item){
                    var minAmount = 10000000000, key;
                    for (st=0; st < item.length; st++) {
                        
                        if (item[st].currency != currentCurrency) {
                            rate = json.rates[item[st].currency + currentCurrency] ? item[st].currency + currentCurrency : currentCurrency + item[st].currency;
                            amount = item[st].amount * json.rates[rate]; 
                        } else {
                            amount = item[st].amount;
                        }
                        
                        if (amount < minAmount) {
                            minAmount = amount;
                            key = item[st].key;
                        }
                        
                        if (amount > maxAmount) {
                            maxAmount = amount;
                        }
                    }
                                      
                    collection[index] = new Object({
                        amount: amount,
                        date: index,
                        key: key
                    });
                });
                
                dateFrom.setTime(dateTo.getTime() + 1 * 3600000 * 24);
                dateTo.setTime(dateFrom.getTime() + 9 * 3600000 * 24);
                
                dynamicsFootDate += ' - ' + dateTo.format('dd mmmm yyyy') + 'г.';
                
                $.ajax({
                    url: twiket.setup.urls.statistics,
                    dataType: "jsonp",
                    data: {
                        route:    data.from + data.to,
                        dateFrom: dateFrom.format('ddmm'),
                        dateTo:   dateTo.format('ddmm'),
                        asArray:  true,
                        //days:     12
                    },
                    success: function(json){
                        if (json.dates) {
                            
                            $.each(json.dates, function(index, item){
                                var minAmount = 10000000000, key;
                                for (st=0; st < item.length; st++) {
                                    
                                    if (item[st].currency != currentCurrency) {
                                        rate = json.rates[item[st].currency + currentCurrency] ? item[st].currency + currentCurrency : currentCurrency + item[st].currency;
                                        amount = item[st].amount * json.rates[rate]; 
                                    } else {
                                        amount = item[st].amount;
                                    }
                                    
                                    if (amount < minAmount) {
                                        minAmount = amount;
                                        key = item[st].key;
                                    }
                                    if (amount > maxAmount) {
                                        maxAmount = amount;
                                    }
                                }
                                
                                collection[index] = new Object({
                                    amount: amount,
                                    date: index,
                                    key: key
                                });
                            });
                            $('#dynDateGraph-' + direct).empty();
                            $('#dynDate-' + direct).empty();
                            $.each(collection, function(index, item){
                                var bar_height = Math.ceil(item.amount * 100 / maxAmount);
                                $('<li data-date="'+item.date+'" data-amount="'+Math.ceil(item.amount)+'"><a href="javascript:;" style="height:'+bar_height+'%"></a></li>').appendTo('#dynDateGraph-' + direct);
                                $('<li><a href="javascript:;">'+index.substring(0,2)+'</a></li>').appendTo($('#dynDate-' + direct));
                            });
                            
                            $('#dynDateGraph-' + direct + ' li').hover(function(){
                                $('.dynDateGraph').find('div.price').remove();
                                $('.dynDateGraph li.active').removeClass('active');
                                $(this).addClass('active').prepend('<div class="price">' + $(this).attr('data-amount') + ' руб.</div>');
                                
                            }).click(function(){
                                $(this).parents('#dynDateGraph-' + direct).find('li').removeClass('selected');
                                $(this).addClass('selected');
                                
                                var direct = (direct == 'back') ? 1 : 0;
                                
                                var tdate = new Date();
                                var qdate_attr = $(this).attr('data-date');
                                var qdate = new Date(tdate.getFullYear(), 1, qdate_attr.substr(0,2) * 1);
                                
                                console.log(tdate.getFullYear(), qdate_attr.substr(2,2) * 1, qdate_attr.substr(0,2) * 1);
                                
                                console.log( objSearchForm.data.directions[direct].date );
                                objSearchForm.data.directions[direct].date = qdate;
                                console.log( objSearchForm.data.directions[direct].date );
                            });
                            
                            $('.dynamicsFootDate p').html(dynamicsFootDate);
                            
                            $('.labelDynamics').removeClass('disabled');
                        }
                    }
                });
                //                
            }
        }
    });
};
Avia.prototype.getStatistic = function(data){
    var result;
    if (data.directions[0]) {
        result = this.getStatisticQuery(data.directions[0], 'there');
    }
    if (data.directions[1]) {
        result = this.getStatisticQuery(data.directions[1], 'back');
    }
    
};
Avia.prototype.searchStatistic = function(){
    objSearchForm.onSubmit('startSearch');
}
Avia.prototype.getFares = function(data){
	var self = this;
    
    this.getStatistic(data);
    
	var params = tw.params.twiket?tw.params:{};
		if(tw.params.srcmarker){
			params.srcmarker = tw.params.srcmarker;
		}
		params.ad = 1;
		params.cs = data.cs;
		params.route = data.getRoute();
	if (tw.isRedirector) {
		params.isRedirector = true;
		delete tw.isRedirector;
	}
	if (tw.source && params.route != tw.source.route.split('&')[0]) {
		delete tw.source;
	}
	try {
		var portalReferrerCookieData = readCookie('referrer');
		if (portalReferrerCookieData) {
			var portalReferrerCookieDataParts = portalReferrerCookieData.split('|');
			params.source = portalReferrerCookieDataParts[0];
			params.linkId = portalReferrerCookieDataParts[1];
		}
	} catch(e){}

	var requestOptions = {
		repeats: 2,
		backupRepeats: true,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(){
			removeLoader();
			if (window.objMap) objMap.show();
			objSearchForm.update();
		}
	};
	//kmqStats + ggl
		var today = new Date();
		var startDate = Date.parseAPI(params.route.substring(0,4));
		var DepthSearch = parseInt( Math.floor( (startDate.valueOf() - today.valueOf())/(86400000) ), 10);
		var StartMonth = startDate.getMonth()+1;
		var Duration = 0;
		if(params.route.length == 14) {
			var endDate = Date.parseAPI(params.route.substring(10,14));
			var Duration = parseInt( Math.floor( (endDate.valueOf() - startDate.valueOf() )/(86400000) ), 10);
		}
		var pointFrom = params.route.substring(4,7);
		var pointTo = params.route.substring(7,10);
		var countryFrom = ref.getCountryCode(pointFrom);
		var cityFrom = ref.getCityCode(pointFrom);
		var countryTo = ref.getCountryCode(pointTo);
		var cityTo = ref.getCityCode(pointTo);
		var FlightType = (countryFrom==countryTo)?'DOM':'INT';
		var TypeRoute = kmqRouteType(params.route);
		tw.searchFlight = {
			"DepthSearch": DepthSearch,
			"StartMonth": StartMonth,
			"cityFrom": cityFrom,
			"countryFrom": countryFrom,
			"cityTo": cityTo,
			"countryTo": countryTo,
			"TypeRoute": TypeRoute,
			"FlightType": FlightType,
			"Duration": Duration
		}
		kmqRecord({name:"SearchStart", obj:tw.searchFlight, prefix: 'SS'});
		try {yaCounter18086416.reachGoal('Search');} catch (e) {}
		//_gaq.push(['_trackPageview','/flightsearch']);
		var gglTypeRoad = 1;
		if(TypeRoute != 'oneway'){
			gglTypeRoad = 2;
		}
		_gaq.push(['_trackEvent', 'search', 'push', cityFrom+'-'+cityTo, gglTypeRoad]);
		
        params.source    = twiket.setup.source;
        params.srcmarker = twiket.setup.marker;
        
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			cache: false,
			dataType: "jsonp",
			url: "https://secure.onetwotrip.com/_api/searching/startSync/",
			data: params,
			timeout: 70000,
			beforeSend: function(){},
			success: function(json){
				kmqRecord({name: 'SearchFinish'});
				data.json = json;
				tw.currencyRates = json.rates;
				if (self.currentRequestKey == data.getKey()) {
					self.drawResults(data);
				}
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr,requestOptions);
			}
		});
	}
};

$(document).on('visitormanager_get_success', function(event) { return;
	if (tw.language == 'ru' && event.json.promo) {
		new PromoCodePopup({
			serverTime: event.json.serverTime,
			toTime: event.json.promo.toTime,
			code: event.json.promo.codeNum,
			amount: event.json.promo.amount,
			currency: event.json.promo.currency
		});
	}
});
function PromoCodePopup(options){
	this.options = options;
	this.init();
	this.show();
}
PromoCodePopup.prototype.init = function(){
	var self = this;
	this.elContent = $.tmpl($("#tmpl_PromoCodePopup").trim(), self.options)[0];
	this.emailField = new Field({
   		appendTo: $(".emailRow>td", this.elContent)[0],
   		name: "promoCodeEmail",
   		type: "email"
  	});
  	$(this.emailField.input).focus(function(){
  		$(self.elStatus).addClass('invisible');
  	});
  	$('.timeRow button', this.elContent).click(function(event){
  		event.preventDefault();
  		self.hide();
  	});
  	this.elForm = $('form', this.elContent)[0];
  	this.elStatus = $('.status', this.elContent)[0];
  	$(this.elForm).submit(function(event){
  		event.preventDefault();
  		if (self.checkData()) {
  			self.submitForm();
  		}
  	});
};
PromoCodePopup.prototype.setToDate = function(){
	var self = this;
	this.toDate = this.toDate || new Date(this.options.toTime);
	this.clientServerDelta = this.clientServerDelta || (new Date(this.options.serverTime) - new Date()) / 60000;
	var durationSeconds = ((this.toDate - new Date()) / 1000) - this.clientServerDelta;
	if (durationSeconds > 0) {
		function pad(val, length){
			val = String(val);
			while (val.length < length)
				val = "0" + val;
			return val;
		}
		var h = Math.floor(durationSeconds/3600);
		var m = pad(Math.floor((durationSeconds - h * 3600)/60), 2);
		var s = pad(parseInt(durationSeconds - h * 3600 - m * 60), 2);

		var elDiv = $('.counter', this.elContent)[0];
			elDiv.innerHTML = '<span>' + h + '<span>' + declOfNum(h, l10n.hours) + '</span></span>:<span>' + m + '<span>' + declOfNum(m, l10n.minutes) + '</span></span>:<span>' + s + '<span>' + declOfNum(s, l10n.second) + '</span></span>';
	} else {
		this.hide();
	}
	return durationSeconds;
};
PromoCodePopup.prototype.checkData = function(){
	this.emailField.input.blur();
	if (!this.emailField.value || this.emailField.error) {
		this.emailField.addError();
		this.emailField.input.focus();
		return false;
	}
	return true;
};
PromoCodePopup.prototype.submitForm = function(){  return;
	var self = this;
	if (!this.inProcess) {
		$.ajax({
			dataType: "jsonp",
			url: "https://secure.onetwotrip.com/_api/visitormanager/sendPromoEmail/",
			data: {
				"email":  this.elForm.promoCodeEmail.value
			},
			beforeSend: function(){
				self.setInProcess();
			},
			success: function(json){
				if (json.result == 'OK') {
					var status = 'Промокод отправлен';
					$(self.elStatus).removeClass('error');
				} else {
					var status = 'Ошибка отправки';
					if (json.error == 'WRONG_PARAMS') {
						status = 'Ошибка отправки. Проверьте email.';
					} else if (json.error == 'ALREADY_SEND') {
						status = 'На этот email промокод уже высылался';
					} else if (json.error == 'ERROR_SEND') {

					}
					$(self.elStatus).addClass('error');
				}
				self.elStatus.innerHTML = status;
				$(self.elStatus).removeClass('invisible');
			},
			complete: function(xhr){
				checkAjaxError(xhr);
				self.removeInProcess();
			}
		});
	}
};
PromoCodePopup.prototype.setInProcess = function(){
	$('button', this.elForm)[0].disabled = true;
	this.inProcess = true;
};
PromoCodePopup.prototype.removeInProcess = function(){
	$('button', this.elForm)[0].disabled = false;
	this.inProcess = false;
};
PromoCodePopup.prototype.addStat = function(){
	kmqRecord({name: "PromoCodePopup", obj: {"initOnPage": "before search", "PromoCurrency": this.options.currency, "PromoValue": this.options.amount} });
};
PromoCodePopup.prototype.show = function(){
	var self = this;
	if (this.setToDate() > 500) {
		this.dateChange = setInterval(function(){
			self.setToDate();
		}, 1000);
		this.elPopup = addPopup({
			close_button: true,
			dom: this.elContent,
			id: 'promoCodePopup'
		});
		this.emailField.input.focus();
		this.addStat();
	}
};
PromoCodePopup.prototype.hide = function(){
	clearInterval(this.dateChange);
	removePopup();
};
