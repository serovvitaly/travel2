function Map(visible){
	this.visible = visible || false;
	this.elLayoutMap = document.getElementById("layout_map");
	$(this.elLayoutMap).removeClass('invisible');
	this.panelHeight = $('#layout_panels').height();
	if (!this.visible) {
		var windowHeight = document.body.clientHeight;
		var panelHeight = $('#layout_panels').height();
		$(this.elLayoutMap).css({
			height: windowHeight,
			marginTop: panelHeight - windowHeight
		});
	} else {
		$('body').css({"overflow-y": "hidden"});
	}
	this.initMap();
	if (this.visible && objSearchForm && objSearchForm.data) this.setData(objSearchForm.data);
}
Map.prototype.initMap = function(){
	var self = this;
	this.elMap = document.createElement("div");
	this.elMap.className = "map";
	this.elMap.id = "map";
	this.elLayoutMap.appendChild(this.elMap);
	var center = new google.maps.LatLng(0, 0);
	var isCentred = false;
	if (tw.position) {
		isCentred = true;
		center = new google.maps.LatLng(tw.position.lat, tw.position.lng);
	}
	var mapOptions = {
//		backgroundColor: "transparent",
		center: center,
		disableDoubleClickZoom: true,
		mapTypeControl: false,
		mapTypeId: "ZOOM3",
		maxZoom: 8,
		minZoom: 3,
		panControl: false,
		scrollwheel: false,
		streetViewControl: false,
		zoom: 3,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.RIGHT_TOP
		}
	};
	this.map = new google.maps.Map(this.elMap, mapOptions);
	this.map.obj = this;
	if (!isCentred && this.visible) {
		this.setCurrentPosition();
	}
	
	function getNormalizedCoord(coord, zoom){
		if(zoom != 3){
			return false;
		}
		var y = coord.y;
		var x = coord.x;
		// tile range in one direction range is dependent on zoom level
		// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
		var tileRange = 1 << zoom;
		// don't repeat across y-axis (vertically)
		if (y < 0 || y >= tileRange) {
			return null;
		}
		// repeat across x-axis
		if (x < 0 || x >= tileRange) {
			x = (x % tileRange + tileRange) % tileRange;
		}
		return {
			x: x,
			y: y
		};
	}
	
	var zoom3Options = {
		getTileUrl: function(coord, zoom){
			var normalizedCoord = getNormalizedCoord(coord, zoom);
			if (!normalizedCoord) {
				return null;
			} 
			return "/images/map/tiles2/" + normalizedCoord.x + "_" + normalizedCoord.y + ".jpg";
		},
		tileSize: new google.maps.Size(256, 256),
		maxZoom: 3,
		minZoom: 3,
		name: "zoom3"
	};
	var zoom3Type = new google.maps.ImageMapType(zoom3Options);
	
	var styles = [{
		featureType: "landscape.natural",
		elementType: "all",
		stylers: [{
			visibility: "off"
		}]
	}, {
		featureType: "http://www.onetwotrip.com/js/poi.park",
		elementType: "all",
		stylers: [{
			visibility: "off"
		}]
	}, {
		featureType: "road.highway",
		elementType: "all",
		stylers: [{
			hue: "#ff9900"
		}]
	}, {
		featureType: "administrative.province",
		elementType: "all",
		stylers: [{
			visibility: "off"
		}]
	}];
	var styledMapOptions = {
		name: "styledMap",
		manZoom: 4
	};
	var styledMap = new google.maps.StyledMapType(styles, styledMapOptions);
	this.map.mapTypes.set("STYLED_MAP", styledMap);

	this.terrainMap = (tw.franchise.de || (tw.language != 'ru' && tw.language != 'ua' && tw.language != 'az'));
	if(this.terrainMap) {
		this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
	} else {
		this.map.mapTypes.set("ZOOM3", zoom3Type);		
	}
	/*var nightOptions = {
		getTileUrl: function(coord, zoom){
			var normalizedCoord = getNormalizedCoord(coord, zoom);
			if (!normalizedCoord) {
				return null;
			} 
			return "/images/map/night/3_" + normalizedCoord.x + "_" + normalizedCoord.y + ".png";
		},
		tileSize: new google.maps.Size(256, 256),
		maxZoom: 3,
		minZoom: 3,
		name: "NightStyle",
		isPng: true
	};
	var nightMapType = new google.maps.ImageMapType(nightOptions);
	this.map.overlayMapTypes.insertAt(0, nightMapType);*/
	
	if (this.visible) {
		this.setClouds();
	}
	this.faq = new FAQ();
	this.faq.setMap(this.map);

	this.lastZoom = this.map.getZoom();
	google.maps.event.addListener(this.map, 'zoom_changed', function(){
		if(this.getZoom() == 3 && this.getZoom() != self.lastZoom){
			if(this.terrainMap) {
				this.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			} else {
				this.setMapTypeId("ZOOM3");
			}
			self.setClouds();
			self.faq.setMap(self.map);
			self.lastZoom = this.getZoom();
		} else if(this.getZoom() > 3) {
			this.setMapTypeId("STYLED_MAP");
			self.removeClouds();
			self.faq.setMap(null);
			self.lastZoom = this.getZoom();
		}
	});
	
	this.directionsService = new google.maps.DirectionsService();
	this.directionsDisplay = new google.maps.DirectionsRenderer({
		preserveViewport: true,
		suppressMarkers: true,
		suppressInfoWindows: true
	});
	
	this.arrMarkers = [];
	this.arrPolylines = [];
	this.currentInfoOverlay = null;
};
Map.prototype.setCurrentPosition = function(){
	var self = this;
	if (tw.position) {
		onGetPosition();
	} else {
		$(document).on("getPosition", function(){
			onGetPosition();
		});
	}
	function onGetPosition(){
		if (self.visible && (!objSearchForm || objSearchForm && !objSearchForm.data.directions[0].from)) {
			self.map.panTo(new google.maps.LatLng(tw.position.lat, tw.position.lng));
		}
	}
};
Map.prototype.show = function(){
	var self = this;
	if (!this.visible) {
		this.visible = true;
		var windowHeight = document.documentElement.clientHeight;
		var panelHeight = $('#layout_panels').height();
		$('body').css({"overflow-y": "hidden"});
		$(this.elLayoutMap).css({
			height: windowHeight - 43,
			marginTop: panelHeight + 43 - windowHeight
		}).animate({
			marginTop: 0
		}, 1000, function(){
			$(this).css({
				height: "auto"
			});
			$(document.body).trigger("mapShow");
			self.setClouds();
		});
	}
};
Map.prototype.hide = function(){
	var self = this;
	if (this.visible) {
		this.visible = false;
		var windowHeight = document.documentElement.clientHeight;
		var panelHeight = $('#layout_panels').height();
		$('body').css({"overflow-y": "auto"});
		$(this.elLayoutMap).css({
			height: windowHeight - 43,
			marginTop: 0
		}).animate({
			marginTop: panelHeight + 43 - windowHeight
		}, 1000, function(){
			$(document.body).trigger("mapHide");
			self.removeClouds();
			//self.clearMap();
		});
	}
};
Map.prototype.removeClouds = function(){
	if (this.clouds) {
		for (var i = 0, length = this.clouds.length; i < length; i++) {
			this.clouds[i].setMap(null);
		}
	}
};
Map.prototype.setClouds = function(){
	var self = this;
	if (browser.mobile) {
		this.removeClouds = function(){};
		this.setClouds = function(){};
		return;
	}
	if (this.clouds) {
		for (var i = 0, length = this.clouds.length; i < length; i++) {
			this.clouds[i].setMap(this.map);
		}
	} else {
		this.clouds = [];
		var cloud = new CloudOverlay({
			cloudLatLng: new google.maps.LatLng(58, 56)
		});
		for (var j = 0; j < 1; j++) {
			if(j > 0){
				cloud = new CloudOverlay();
			}
			cloud.setMap(this.map);
			this.clouds.push(cloud);
		}
	}
};
Map.prototype.setData = function(data){
	var self = this;
	this.map.setZoom(3);
	this.data = data;
	this.dataDirs = this.data.directions;
	this.dataDirsCount = this.data.directions.length;
	
	this.clearMap();
	this.cityN = 0;
	for(var i = 0, length = this.data.directions.length; i < length; i++){
		this.setDataDir(i);
		if(this.data.flightType == "round") {
			break;
		}
	}
};
Map.prototype.setDataDir = function(n){
	var self = this;
	var dataDir = this.dataDirs[n];
	if (this.dataDirs[n - 1]) {
		if (this.dataDirs[n - 1].to != dataDir.from) {
			this.cityN++;
		}
	}
	if (dataDir.from) {
		var refFrom = ref.getPoint(dataDir.from);
		var marker_from = new google.maps.Marker({
			icon: new google.maps.MarkerImage('../images/map/pins_new.png'/*tpa=http://www.onetwotrip.com/images/map/pins_new.png*/, new google.maps.Size(38, 53), new google.maps.Point(38*this.cityN, 0)),
			position: new google.maps.LatLng(refFrom.lat, refFrom.lng),
			map: this.map,
			zIndex: 8 - this.cityN
		});
		this.arrMarkers.push(marker_from);
		
		var elContent = document.createElement("div");
			elContent.innerHTML = ref.getPointName(dataDir.from);
		marker_from.infoOverlay = new InfoOverlay({
			latlng: marker_from.getPosition(),
			pinAnchor: {
				x: 0,
				y: 60
			},
			content: elContent
		});
		
		google.maps.event.addListener(marker_from, 'mouseover', function(){
			this.infoOverlay.setMap(self.map);
		});
		google.maps.event.addListener(marker_from, 'mouseout', function(){
			this.infoOverlay.setMap(null);
		});
	}
	if(dataDir.from != dataDir.to){
		this.cityN++;
	}
	if (dataDir.to) {
		var refTo = ref.getPoint(dataDir.to);
		var marker_to = new google.maps.Marker({
			icon: new google.maps.MarkerImage('../images/map/pins_new.png'/*tpa=http://www.onetwotrip.com/images/map/pins_new.png*/, new google.maps.Size(38, 53), new google.maps.Point(38*this.cityN, 0)),
			position: new google.maps.LatLng(refTo.lat, refTo.lng),
			map: this.map,
			zIndex: 8 - this.cityN
		});
		this.arrMarkers.push(marker_to);
		
		var elContent = document.createElement("div");
			elContent.innerHTML = ref.getPointName(dataDir.to);
		marker_to.infoOverlay = new InfoOverlay({
			latlng: marker_to.getPosition(),
			pinAnchor: {
				x: 0,
				y: 60
			},
			content: elContent
		});
		
		google.maps.event.addListener(marker_to, 'mouseover', function(){
			this.infoOverlay.setMap(self.map);
		});
		google.maps.event.addListener(marker_to, 'mouseout', function(){
			this.infoOverlay.setMap(null);
		});
	}
	
	if (dataDir.from && dataDir.to) {
		polyline_flightBounds = new google.maps.Polyline({
			path: [marker_from.getPosition(), marker_to.getPosition()],
			geodesic: true,
			map: this.map,
			visible: false
		});
		polyline_flight = new FlightOverlay({
			from: marker_from.getPosition(),
			to: marker_to.getPosition()
		});
		polyline_flight.setMap(this.map);
		this.arrPolylines.push(polyline_flight);
		
		this.map.panTo(polyline_flightBounds.getBounds().getCenter());
	} else if (dataDir.from) {
		this.map.panTo(marker_from.getPosition());
	} else if (dataDir.to) {
		this.map.panTo(marker_to.getPosition());
	}
};
Map.prototype.setGeocode = function(field, parentObj, dirNumber){
	var self = this;
	ClearPolylineFlights();
	this.clearGeocode();
	this.show();
	this.geocode = field.geocodeValue;
	
	if (parentObj.data.directions[dirNumber].from || parentObj.data.directions[dirNumber].to) {
		if (parentObj.data.directions[dirNumber].from) {
			this.geocode.from = parentObj.data.directions[dirNumber].from;
		} else {
			this.geocode.to = parentObj.data.directions[dirNumber].to;
		}
	}
	
	if ($.inArray("country", this.geocode.types) === -1) {
		this.geocode.marker = new google.maps.Marker({
			icon: new google.maps.MarkerImage('../images/map/pin_red.png'/*tpa=http://www.onetwotrip.com/images/map/pin_red.png*/, new google.maps.Size(15, 15), new google.maps.Point(0, 0), new google.maps.Point(6, 6)),
			position: this.geocode.geometry.location,
			map: this.map
		});
		
		var elContent = document.createElement("div");
			elContent.innerHTML = '<div class="caption">' + this.geocode.AddressStr + ', <span>' + this.geocode.country + '</span></div>';
		this.geocode.marker.infoOverlay = new InfoOverlay({
			latlng: this.geocode.geometry.location,
			pinAnchor: {
				x: 0,
				y: 20
			},
			content: elContent
		});
		
		google.maps.event.addListener(this.geocode.marker, 'mouseover', function(){
			this.infoOverlay.setMap(self.map);
		});
		google.maps.event.addListener(this.geocode.marker, 'mouseout', function(){
			this.infoOverlay.setMap(null);
		});
	}
	this.map.panTo(this.geocode.geometry.location);
	this.map.setZoom(7);
	this.setNearCities(field, parentObj, dirNumber);
	if (parentObj.data.directions[dirNumber].from || parentObj.data.directions[dirNumber].to) {
		this.getFlightDurations(field, parentObj, dirNumber);
	} else {
		this.geocode.selectedMarker = this.geocode.nearCityMarkers[0];
		this.onClickGeocodeNearCity(this.geocode.selectedMarker);
	}
};
Map.prototype.setNearCities = function(field, parentObj, dirNumber){
	var self = this;
	
	var pinN = dirNumber;
	if(field.options.name.indexOf("to") > -1) pinN++;
	this.geocode.icon = new google.maps.MarkerImage('../images/map/pin_blue.png'/*tpa=http://www.onetwotrip.com/images/map/pin_blue.png*/, new google.maps.Size(15, 15), new google.maps.Point(0, 0), new google.maps.Point(6, 6));
	this.geocode.selectedIcon = new google.maps.MarkerImage('../images/map/pins_new.png'/*tpa=http://www.onetwotrip.com/images/map/pins_new.png*/, new google.maps.Size(38, 53), new google.maps.Point(38*pinN, 0));
	this.geocode.nearCityMarkers = [];
	this.geocode.selectedMarker = null;
	
	for(var i = 0, length = this.geocode.NearCities.length; i < length; i++){
		var code = this.geocode.NearCities[i];
		var refCity = ref.Cities[code];
		var marker = new google.maps.Marker({
			icon: this.geocode.icon,
			title: ref.getPointVsCountryString(code),
			position: new google.maps.LatLng(refCity.lat, refCity.lng),
			map: this.map
		});
			marker.code = code;
			marker.distance = google.maps.geometry.spherical.computeDistanceBetween(this.geocode.geometry.location, marker.getPosition());
			if (this.geocode.from) {
				marker.route = this.geocode.from + code;
			} else if (this.geocode.to) {
				marker.route = code + this.geocode.to;
			}
		this.geocode.nearCityMarkers.push(marker);
		var pointVsCountryString = ref.getPointVsCountryString(code);
		var elContent = document.createElement("div");
			elContent.innerHTML = '<div class="caption">' + pointVsCountryString.split(',')[0] + '<span>' + pointVsCountryString.substr(pointVsCountryString.indexOf(',')) + '</span></div>';
			elContent.innerHTML += '<div class="small silver flight invisible">' +l10n.map.direct+ ' ≈ </div>';
			elContent.innerHTML += '<div class="small silver drive invisible">' +l10n.map.more+ ' ≈ </div>';
			elContent.innerHTML += '<div class="buttonFlight">' +l10n.map.choose+ '<div class="bg"><div class="l"></div><div class="r"></div></div></div>';
		marker.infoOverlay = new InfoOverlay({
			latlng: marker.getPosition(),
			pinAnchor: {x: 0, y: 60},
			content: elContent
		});
		marker.infoOverlay.marker = marker;
		google.maps.event.addListener(marker, 'click', function(){
			self.onClickGeocodeNearCity(this);
		});
		
		var buttonFlight = $(".buttonFlight", elContent)[0];
		$(buttonFlight).one("click", { code: code }, function(event){
			event.stopPropagation();
			field.suggest.setByCode(event.data.code);
		});
	}
	this.geocode.nearCityMarkers.sort(function(a, b){
		if (a.distance > b.distance) return 1;
		if (a.distance < b.distance) return -1;
		return 0;
	});
};
Map.prototype.onClickGeocodeNearCity = function(marker){
	var self = this;
	if (this.geocode.selectedMarker) this.geocode.selectedMarker.setIcon(this.geocode.icon);
	this.geocode.selectedMarker = marker;
	marker.setIcon(this.geocode.selectedIcon);
	this.clearInfoOverlay();
	marker.infoOverlay.setMap(this.map);
	this.currentInfoOverlay = marker.infoOverlay;
	this.map.panTo(marker.getPosition());
	var elFlight = $("div.flight", marker.infoOverlay.div)[0];
	if (marker.flightDuration !== undefined && $(elFlight).hasClass("invisible")) {
		if (marker.flightDuration > 0) {
			var refCity = null;
			if (this.geocode.from) {
				if (ref.getPoint(this.geocode.from).lat) {
					refCity = ref.getPoint(this.geocode.from);
				}
			} else if (this.geocode.to) {
				if (ref.getPoint(this.geocode.to).lat) {
					refCity = ref.getPoint(this.geocode.to);
				}
			}
			if(refCity){
				var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(refCity.lat, refCity.lng), marker.getPosition());
				elFlight.innerHTML += Math.round(distance / 1000) + ' ' + l10n.map.km +" / ";
			}
			elFlight.innerHTML += DurationTimeStringFromMinutes(marker.flightDuration);
		} else {
			elFlight.innerHTML = l10n.map.withStops;
		}
		$(elFlight).removeClass("invisible");
	}
	if ($.inArray("country", this.geocode.types) === -1) {
		if (marker.driveRoute) {
			this.directionsDisplay.setDirections(marker.driveRoute);
			this.directionsDisplay.setMap(this.map);
		} else if (marker.driveRoute !== null) {
			calcRoute(marker);
		}
	}
	
	function calcRoute(marker){
		var request = {
			origin: self.geocode.geometry.location,
			destination: marker.getPosition(),
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};
		marker.driveRoute = null;
		self.directionsService.route(request, function(response, status){
			marker.driveRoute = response;
			if (status == google.maps.DirectionsStatus.OK) {
				var elInfoWindowContent = marker.infoOverlay.div;
				var elDrive = $(".drive", elInfoWindowContent)[0];
					elDrive.innerHTML += response.routes[0].legs[0].distance.text + " / " + DurationTimeStringFromMinutes(Math.round(response.routes[0].legs[0].duration.value / 60));
					$(elDrive).removeClass("invisible");
				if (elInfoWindowContent.offsetHeight > 0) {
					self.onClickGeocodeNearCity(marker);
				}
			}
		});
	}
};
Map.prototype.getFlightDurations = function(field, parentObj, dirNumber){
	var self = this;
	var routes = "";
	for (var i = 0, length = this.geocode.nearCityMarkers.length; i < length; i++) {
		if (i > 0) {
			routes += ",";
		}
		routes += this.geocode.nearCityMarkers[i].route;
	}
	$.ajax({
		dataType: "json",
		url: "https://secure.onetwotrip.com/_api/schedule/getFlightDurations/",
		data: {
			routes: routes
		},
		success: function(json){
			if (self.geocode) {
				var showInfoWindow = false;
				for(var j = 0, ncLength = self.geocode.nearCityMarkers.length; j < ncLength; j++){
					var ncMarker = self.geocode.nearCityMarkers[j];
					if(json[ncMarker.route] !== undefined){
						ncMarker.flightDuration = json[ncMarker.route];
						if (!showInfoWindow && ncMarker.flightDuration > 0) {
							self.onClickGeocodeNearCity(ncMarker);
							showInfoWindow = true;
						}
					}
				}
				if (!showInfoWindow) {
					self.onClickGeocodeNearCity(self.geocode.nearCityMarkers[0]);
				}
			}
		}
	});
};

Map.prototype.clearMap = function(){
	this.directionsDisplay.setMap(null);
	this.clearInfoOverlay();
	this.clearGeocode();
	for(var m = 0, length_m = this.arrMarkers.length; m < length_m; m++){
		this.arrMarkers[m].setMap(null);
	}
	for(var p = 0, length_p = this.arrPolylines.length; p < length_p; p++){
		this.arrPolylines[p].setMap(null);
	}
	this.arrMarkers = [];
	this.arrPolylines = [];
};
Map.prototype.clearInfoOverlay = function(){
	if(this.currentInfoOverlay) {
		this.currentInfoOverlay.setMap(null);
	}
};
Map.prototype.clearGeocode = function(){
	if(this.geocode){
		if(this.geocode.marker){
			this.geocode.marker.setMap(null);
		}
		for (var i = 0, length = this.geocode.nearCityMarkers.length; i < length; i++) {
			var nearCityMarker = this.geocode.nearCityMarkers[i];
			nearCityMarker.setMap(null);
		}
		delete this.geocode;
	}
};

function FAQ(map){
	var self = this;
	this.div = document.createElement('div');
	$(this.div).addClass('faqOverlay invisible').html(l10n.map.faq);
	if(tw.franchise.de || (tw.language != 'ru' && tw.language != 'ua' && tw.language != 'az')) {
		$(this.div).css({'color': 'black'});
		$('.link',this.div).css({'color': 'black'});
	}
	if(tw.language == 'ru') {
		$.tmpl($("#tmpl_CallButton").trim()).appendTo( this.div );
	}
	if (tw.position) {
		onGetPosition();
	} else {
		$(document).on("getPosition", function(){
			onGetPosition();
		});
	}
	function onGetPosition(){
		if (tw.position.countryCode == "RU") {
			$(".phone", self.div).html('<span>+</span><span>7</span> 495 646 83 62');
		} else if(tw.position.countryCode == "UA") {
			$(".phone", self.div).html('<span>+</span><span>38</span> 044 393 43 55');
		}
		if(tw.franchise.de || tw.franchise.az || (tw.position.countryCode != 'UA' && tw.position.countryCode != 'RU')) {
			$(self.div).remove();
		} else {
			$(self.div).removeClass('invisible');
		}
	}
}
FAQ.prototype = new google.maps.OverlayView();
FAQ.prototype.onAdd = function(){
	var self = this;
	this.pane = this.getPanes().floatPane;
	var projection = this.getProjection();
	this.startCoords = projection.fromLatLngToDivPixel(new google.maps.LatLng(55, -50));
	$(this.div).css({
		'left': self.startCoords.x,
		'top': self.startCoords.y
	});
	this.pane.appendChild(this.div);
	$('.link', this.div).click(function(e){
		$("input").blur();
		try {
			showFAQ();
		} 
		catch (exp) {
		}
	});
	$('.online_call').click(function(){
		var newwindow = window.open('http://zingaya.com/widget/6e1655b5a3cc6179bf39245898984ab1'+'?referrer='+escape(window.location.href), 'zingaya', 'width=236,height=220,resizable=no,toolbar=no,menubar=no,location=no,status=no');
		setTimeout(function(){
			newwindow.focus();
		},500)
	});
	if (tw.params.q) {
		showFAQ(tw.params.q);
	}
};
FAQ.prototype.draw = function(){};
FAQ.prototype.onRemove = function() {
	this.pane.removeChild(this.div);
};

function CloudOverlay(options){
	this.options = options || {};
	this.div = document.createElement('div');
	this.div.className = 'cloud' + getRandomInt(1, 4);
}
CloudOverlay.prototype = new google.maps.OverlayView();
CloudOverlay.prototype.onAdd = function(){
	this.map = this.getMap();
	this.pane = this.getPanes().floatShadow;
	this.putOnMap(this.options.cloudLatLng);
	this.pane.appendChild(this.div);
	this.show();
};
CloudOverlay.prototype.putOnMap = function(cloudLatLng){
	var mapBoounds = this.map.getBounds();
	var ne = mapBoounds.getNorthEast();
	var sw = mapBoounds.getSouthWest();
	var projection = this.getProjection();
	var startLatLon = cloudLatLng || new google.maps.LatLng(getRandomArbitary(-60, 65), getRandomArbitary(-180, 180));
	this.startCoords = projection.fromLatLngToDivPixel(startLatLon);
	this.startCoords.y = Math.floor(this.startCoords.y);
	this.startCoords.x = Math.floor(this.startCoords.x);
	this.endCoordX = this.startCoords.x - getRandomInt(20, 50);
	this.div.style.top = this.startCoords.y + "px";
	this.div.style.left = this.startCoords.x + "px";
};
CloudOverlay.prototype.show = function(){
	var self = this;
	if (IEVersion < 9) {
		this.div.style.display = "block";
		this.intervalID = setInterval(function(){
			self.move();
		}, 1000);
	} else {
		$(this.div).fadeIn("slow", function(){
			self.intervalID = setInterval(function(){
				self.move();
			}, 1000);
		});
	}
};
CloudOverlay.prototype.hide = function(){
	var self = this;
	clearInterval(this.intervalID);
	if (IEVersion < 9) {
		this.div.style.display = "none";
		this.putOnMap();
		this.show();
	} else {
		$(this.div).fadeOut("slow", function(){
			if (self.map) {
				self.putOnMap();
				self.show();
			}
		});
	}
};
CloudOverlay.prototype.draw = function(){};
CloudOverlay.prototype.move = function(){
	var self = this;
	if (this.startCoords.x < this.endCoordX) {
		this.hide();
	} else {
		this.startCoords.x--;
		this.div.style.left = this.startCoords.x + "px";
	}
};
CloudOverlay.prototype.onRemove = function() {
	clearInterval(this.intervalID);
	this.pane.removeChild(this.div);
};

function FlightOverlay(options) {
	this.options = options;
	this.div = document.createElement('div');
	this.div.className = 'polyline';
}
FlightOverlay.prototype = new google.maps.OverlayView();
FlightOverlay.prototype.onAdd = function() {
	this.map = this.getMap();
	this.pane = this.getPanes().overlayLayer;
	this.pane.appendChild(this.div);
};
FlightOverlay.prototype.draw = function(){
	$(this.div).empty();
	var projection = this.getProjection();
	var positionFrom = projection.fromLatLngToDivPixel(this.options.from);
	var positionTo = projection.fromLatLngToDivPixel(this.options.to);
	_xPos = (positionFrom.x < positionTo.x ? positionFrom.x : positionTo.x);
	_yPos = (positionFrom.y < positionTo.y ? positionFrom.y : positionTo.y);
	_height = Math.abs(positionFrom.y - positionTo.y);
	_width = Math.abs(positionFrom.x - positionTo.x);
	_padding = 25;
	y1 = _padding;
	y2 = _height + _padding;
	_zoom = this.map.getZoom();
	x_besier = _width / 2;
	y_besier = _height / 2 - 20 * _zoom;
	if ((positionFrom.x > positionTo.x && positionFrom.y < positionTo.y) || (positionFrom.x < positionTo.x && positionFrom.y > positionTo.y)) {
		y1 = _height + _padding;
		y2 = _padding;
	}
	if (positionFrom.x > positionTo.x) {
		//x_besier = _width/2+20*_zoom
	}
	if (positionFrom.y > positionTo.y) {
		//y_besier = _height- _height/_zoom;
	}
	if (x_besier < 0) x_besier = 0;
	if (y_besier < 0) y_besier = 0;
	$(this.div).css({
		'width': _width + _padding * 2,
		'height': _height + _padding * 2,
		'left': _xPos - _padding,
		'top': _yPos - _padding
	});
	drawQuadCurve($(this.div), {
		x: _padding,
		y: y1
	}, {
		x: x_besier,
		y: y_besier
	}, {
		x: _width + _padding,
		y: y2
	}, "#272968", true, 5, 1000);
};
FlightOverlay.prototype.onRemove = function() {
	this.pane.removeChild(this.div);
};

function InfoOverlay(options){
	this.options = options;
	this.latlng = this.options.latlng;
	this.pinAnchor = this.options.pinAnchor || {x: 0, y: 0};
	this.div = document.createElement('div');
	
	this.div.className = "infoOverlay";
	this.div.innerHTML = '<div class="abs"><div class="tl"></div><div class="t"></div><div class="tr"></div><div class="r"></div><div class="br"></div><div class="b"></div><div class="bl"></div><div class="l"></div><div class="c"></div><div class="leg"></div></div>';
	
	this.div.appendChild(this.options.content);
}
InfoOverlay.prototype = new google.maps.OverlayView();
InfoOverlay.prototype.onAdd = function(){
	this.map = this.getMap();
	this.pane = this.getPanes().floatPane;
	this.pane.appendChild(this.div);
};
InfoOverlay.prototype.draw = function(){
	var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng);
	$(this.div).css({
		"top": pixPosition.y - this.div.offsetHeight - this.pinAnchor.y +20,
		"left": pixPosition.x - this.div.offsetWidth / 2
	});
};
InfoOverlay.prototype.remove = function(){
	try {
		this.pane.removeChild(this.div);
	}
	catch (e) {}
};

function getQuadraticValue(t, start, cp, end){
	t = Math.max(Math.min(t, 1), 0);
	var tp = 1 - t;
	var t2 = t * t;
	var tp2 = tp * tp;
	var x = (tp2 * start.x) + (2 * tp * t * cp.x) + (t2 * end.x);
	var y = (tp2 * start.y) + (2 * tp * t * cp.y) + (t2 * end.y);
	return {
		x: x,
		y: y
	};
}
function drawQuadCurve(el, start, cp, end, color, dashed, dashLength, segments){
	var canvas = document.createElement("canvas");
	var jqCanvas = $(canvas);
	var jqCanvasWidth = el.width();
	var jqCanvasHeight = el.height();
	jqCanvas.css({
		"position": "absolute",
		"width": jqCanvasWidth,
		"height": jqCanvasHeight,
		"left": 0,
		"top": 0
	}).attr({
		"width": jqCanvasWidth,
		"height": jqCanvasHeight
	}).appendTo(el);
	if (typeof(G_vmlCanvasManager) != 'undefined') {
		G_vmlCanvasManager.initElement(canvas);
	}
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		if (dashed) {
			// рисуем линию порциями
			var step = 1 / segments;
			var dist = 0; // примерная дистанция от старта
			var dashNum;
			var last = start;
			var p;
			for (var t = step; t <= 1; t += step) {
				// считаем следующую точку кривой
				p = getQuadraticValue(t, start, cp, end);
				// следим за общей дистанцией от старта
				dist += Math.sqrt(Math.pow((p.x - last.x), 2) + Math.pow((p.y - last.y), 2));
				dashNum = Math.floor((dist / dashLength) % 2);
				// когда рисовать кусочеки линии, когда пропускать
				if (dashNum === 0) {
					// соединяем прямую линеечку с кривой
					ctx.lineTo(p.x, p.y);
				} else {
					ctx.moveTo(p.x, p.y);
				}
				last = p;
			}
		} else {
			// если пунктир не нужен, рисуем стандартным способом
			ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
}