tw.PopularFilter = null;
ajaxPointsPoly = [];
ajaxPointsInfo = [];
ajaxPointsStops = [];
tw.Polyline = {
	Flights: [],
	Points:[],
	PointsList: {}
};
$(function(){
	$(document.body).bind("mapHide", function(){
		abortAjax(ajaxPointsPoly.concat(ajaxPointsInfo,ajaxPointsStops));
		//ClearPolylineFlights();
		tw.PopularFilter = null;
	});
	//В случае всех городов, навешиваем клик
	/*$('.map-point').live('click',function(e){
		objSearchForm.dirRows[0].toField.suggest.input.value = this.id.split('_')[1];
		objSearchForm.dirRows[0].toField.suggest.makeSuggest();
	});*/
});

function initPopularDirection(code){
	if(!ref.Cities[code] && ref.Airports[code] && ref.Airports[code].Parent) {
		code = ref.Airports[code].Parent;
	}	
	$.ajax({
		type: "get",
		cache: false,
		dataType: "json",
		data: {code: code},
		url: "https://secure.onetwotrip.com/_api/popular/getInfo/",
		beforeSend: function(xhr){
			abortAjax(ajaxPointsInfo);
			clearAjax(ajaxPointsInfo);
			ajaxPointsInfo.push(xhr);
		},
		success: function(json){
			$('.FilterWrapper').remove();
			ClearPopularDirectionMarkers();
			setTimeout(function(){
				if(objMap) {
					tw.PopularFilter = new PopularDirection(json);	
				}				
			},2000);
		},
		complete: function(){
			clearAjax(ajaxPointsInfo)
		}	
	});
}
function ClearPopularDirectionMarkers(){
	if(tw.PopularFilter){
		for(var i in tw.PopularFilter.Markers){
			var curMarker =  tw.PopularFilter.Markers[i];
			curMarker.setMap(null);
		}
		if(tw.PopularFilter && tw.PopularFilter.BluePoints) {
			for(var j=0,ML=tw.PopularFilter.BluePoints.length;j<ML;j++){
				var curMarker =  tw.PopularFilter.BluePoints[j];
				curMarker.setMap(null);
			}
		}
	}
	tw.PopularFilter = null;
}
function PopularDirection(json){
	var self= this;
	this.json = json; 
	this.code = this.json.target;
	if(!this.code) {return;}
	this.map = objMap.map;
	this.BluePoints = [];
	if(!json.error) {
		this.month = new Date().getMonth();
		this.initDefaultSliderValues();
		this.time = this.json.timings;
		this.price = this.json.costs;
		this.climate = this.json.climate;
		
		this.Points = [];
		this.Markers = {};
		this.makePointsArray();
		this.initFilters();	
		this.makeNatureArrays();		
	}

	$('.f_directions',this.filter).delegate('.f_top_ico','click', function() {
		if(self.filtering) {
			return;
		}
		if( $(this).hasClass('selected')) {
			$(this).removeClass('selected');
			self.selectedNatue = null;
		} else {
			$(this).addClass('selected').siblings().removeClass('selected');
			self.selectedNatue = $(this).hasClass('sea_point')?'sea':'mountain';
		}
		self.FilterPopular();
	});
	/*if(this.code) {
		this.initDirectPoints();	
	}*/
}
PopularDirection.prototype.initDefaultSliderValues = function(){
	this.MinAirTemp = 100;
	this.MaxAirTemp = -100;
	//this.MinWaterTemp = 100;
	//this.MaxWaterTemp = -100;
	this.MinPrice = 1000000;
	this.MaxPrice = 0;	
	this.MinTime = 1000000;
	this.MaxTime = 0;	
};
PopularDirection.prototype.makePointsArray = function(){
	var self =this;
	for(var j in this.price) {
		var codePoint = j;
		var curPoint = self.price[j];
		if(!ref.Cities[codePoint] || !ref.Cities[codePoint].lat || !ref.Cities[codePoint].lat) {
			continue;
		}
		if(self.climate[codePoint] && self.time[codePoint] >0){
			var curDir = self.climate[codePoint]; 
			newP = {
				code: codePoint,
				Price: curPoint.split('|')[0],
				lat: ref.Cities[codePoint].lat,
				lng: ref.Cities[codePoint].lng,
				Name: ref.Cities[codePoint].Name,
				DayTemperature: curDir.MD?curDir.MD[self.month]:null,
				SeaTemperature: curDir.ST?curDir.ST[self.month]:null,
				Time: parseInt(self.time[codePoint]),
				Elev: parseInt(curDir.Info.Elev,10)			
			};
			if(self.MinAirTemp > parseInt(newP.DayTemperature,10)) {
				self.MinAirTemp = parseInt(newP.DayTemperature,10);
			}
			if(self.MaxAirTemp < parseInt(newP.DayTemperature,10)) {
				self.MaxAirTemp = parseInt(newP.DayTemperature,10);
			}
			if(newP.SeaTemperature) {
				if(self.MinWaterTemp > parseInt(newP.SeaTemperature,10)) {
					self.MinWaterTemp = parseInt(newP.SeaTemperature,10);
				}
				if(self.MaxWaterTemp < parseInt(newP.SeaTemperature,10)) {
					self.MaxWaterTemp = parseInt(newP.SeaTemperature,10);
				}
			}
			if(self.MinPrice > parseInt(newP.Price,10)) {
				self.MinPrice = parseInt(newP.Price,10);
			}
			if(self.MaxPrice < parseInt(newP.Price,10)) {
				self.MaxPrice = parseInt(newP.Price,10);
			}
			if(self.MinTime > parseInt(newP.Time,10)) {
				self.MinTime = parseInt(newP.Time,10);
			}
			if(self.MaxTime < parseInt(newP.Time,10)) {
				self.MaxTime = parseInt(newP.Time,10);
			}
			self.Points.push(newP);
		}
	}
	for(var i=0,PL=this.Points.length;i<PL;i++) {
		var curPoint = this.Points[i];
		cityLoc = new google.maps.LatLng(curPoint.lat, curPoint.lng);
		this.addMarker(cityLoc,curPoint.code);
		
		/*if (ref.testPoint(curPoint.code)) {
			var curCity = ref.getPoint(curPoint.code);
			cityLoc = new google.maps.LatLng(curCity.lat, curCity.lng);
			this.addMarker(cityLoc,curPoint.code);
		} else {
			cityLoc = new google.maps.LatLng(curPoint.lat, curPoint.lng);
			this.addMarker(cityLoc,curPoint.code);
		}*/
	}
};
PopularDirection.prototype.makeNatureArrays = function(){
	var self = this;
	this.selectedNatue = null;
	this.SeaPoints = []
	this.MountainPoints = [];
	this.NoSeaNoMountainPoints = [];
	for(var i =0, PL=this.Points.length;i<PL;i++){
		var curPoint = this.Points[i];
		//if(curPoint.Elev ===0) {
		if(curPoint.SeaTemperature) {
			this.SeaPoints.push(curPoint);
		} else if (curPoint.Elev >300) {
			this.MountainPoints.push(curPoint);
		} else {
			this.NoSeaNoMountainPoints.push(curPoint);
		}
	}
};
PopularDirection.prototype.initFilters = function(){
	var self = this;
	$.tmpl( $('#tmpl_FilterFlight').trim()).appendTo( $('#map') );
	
	/*this.PriceSlider = $('#filter_price')[0];
	$(this.PriceSlider).slider({
		value: self.MinPrice,
		min: self.MinPrice,
		max: self.MaxPrice,
		step: 10,
		slide: function( event, ui ) {
			//log(ui.value)
		},
		stop: function(event,ui){
			if(self.PriceSliderValue != ui.value) {
				self.PriceSliderValue = ui.value;
				self.FilterPopular();
			}
		}
	});
	this.PriceSliderValue = $(this.PriceSlider).slider("value");*/
	
	/*this.WaterSlider = $('#filter_water')[0];
	$(this.WaterSlider).slider({
		value: self.MaxWaterTemp,
		min: self.MinWaterTemp,
		max: self.MaxWaterTemp,
		step: 1,
		slide: function( event, ui ) {
			//log(ui.value)
		},
		stop: function(event,ui){
			if(self.WaterSliderValue != ui.value) {
				self.WaterSliderValue = ui.value;
				self.FilterPopular();
			}
		}
	});
	this.WaterSliderValue = $(this.WaterSlider).slider("value");*/
		
	this.AirSlider = $('#filter_air')[0];
	$(this.AirSlider).slider({
		value: self.MinAirTemp,
		min: -40,
		max: 50,
		step: 1,
		slide: function( event, ui ) {
			if(self.filtering) {
				return;
			}
			if(ui.value>0){
				$('.slider_value',self.AirSlider).html('+'+ui.value);	
			} else {
				$('.slider_value',self.AirSlider).html(ui.value);
			}
			//log(ui.value)
		},
		stop: function(event,ui){
			if(self.AirSliderValue != ui.value) {
				self.AirSliderValue = ui.value;
				self.FilterPopular();
			}
		}
	});
	this.AirSliderValue = $(this.AirSlider).slider("value");
	if(this.AirSliderValue>0){
		$('.slider_value',self.AirSlider).html('+'+self.AirSliderValue);	
	} else {
		$('.slider_value',self.AirSlider).html(self.AirSliderValue);
	}

	this.TimeSlider = $('#filter_time')[0];
	$(this.TimeSlider).slider({
		value: self.MaxTime,
		min: self.MinTime,
		max: self.MaxTime,
		step: 10,
		slide: function( event, ui ) {
			if(self.filtering) {
				return;
			}
			$('.slider_value',self.TimeSlider).html( DurationTimeStringPartFull(DurationAPIFromMinutes(ui.value)) );			
			//log(ui.value)
		},
		stop: function(event,ui){
			if(self.TimeSliderValue != ui.value) {
				self.TimeSliderValue = ui.value;
				self.FilterPopular();
			}
		}
	});
	this.TimeSliderValue = $(this.TimeSlider).slider("value");
	$('.slider_value',self.TimeSlider).html( DurationTimeStringPartFull(DurationAPIFromMinutes(this.TimeSliderValue)) );
};
PopularDirection.prototype.addMarker = function(location, code){
	var self = this;
	var image = new google.maps.MarkerImage('../images/map/pin_red.png'/*tpa=http://www.onetwotrip.com/images/map/pin_red.png*/,
      	new google.maps.Size(15, 15),
      	new google.maps.Point(0,0),
	    new google.maps.Point(6, 6));
	marker = new google.maps.Marker({
		position: location,
		icon: image,
		code: code,
		zIndex: 2,
		map: this.map
	});
	this.Markers[code] = {};
	this.Markers[code] = marker;
	var elContent = document.createElement("div");
		elContent.innerHTML = ref.getCityName(code);
	marker.infoOverlay = new InfoOverlay({
		latlng: marker.getPosition(),
		pinAnchor: {
			y: 25
		},
		content: elContent
	});
	google.maps.event.addListener(marker, 'mouseover', function(){
		this.infoOverlay.setMap(self.map);
	});
	google.maps.event.addListener(marker, 'mouseout', function(){
		this.infoOverlay.setMap(null);
	});
	google.maps.event.addListener(marker, 'click', function(){
		this.infoOverlay.setMap(null);
		objSearchForm.dirRows[0].toField.suggest.input.value = this.code;
		objSearchForm.dirRows[0].toField.suggest.makeSuggest();
	});
};
PopularDirection.prototype.FilterPopular = function(){
	var self = this;
	this.filtering = true;
	
	this.deleteArray = {};
	
	var SortedPoints =[];
	var ModifiedPoints = this.Points;
	if (this.selectedNatue == 'sea') {
		ModifiedPoints = this.SeaPoints;
		for(i=0,PL=this.MountainPoints.length;i<PL;i++){
			this.deleteArray[self.MountainPoints[i].code]={};
		}
		for(i=0,PL=this.NoSeaNoMountainPoints.length;i<PL;i++){
			this.deleteArray[self.NoSeaNoMountainPoints[i].code]={};
		}
	} else if (this.selectedNatue == 'mountain') {
		ModifiedPoints = this.MountainPoints;
		for(i=0,PL=this.SeaPoints.length;i<PL;i++){
			this.deleteArray[self.SeaPoints[i].code]={};
		}
		for(i=0,PL=this.NoSeaNoMountainPoints.length;i<PL;i++){
			this.deleteArray[self.NoSeaNoMountainPoints[i].code]={};
		}
	}
	for(var i=0,PL=ModifiedPoints.length;i<PL;i++){
		var curPoint = ModifiedPoints[i];
		if(curPoint.DayTemperature < this.AirSliderValue) {
			this.deleteArray[curPoint.code] = {};
			continue;
		}
		/*if(curPoint.SeaTemperature > this.WaterSliderValue) {
			this.deleteArray[curPoint.code] = {};
			continue;
		}*/
		/*if(curPoint.Price < this.PriceSliderValue) {
			this.deleteArray[curPoint.code] = {};
			continue;
		}*/
		if(curPoint.Time > this.TimeSliderValue) {
			this.deleteArray[curPoint.code] = {};
			continue;
		}
		SortedPoints.push(curPoint);
	}

	for(var i in this.deleteArray) {
		if(self.Markers[i]){
			self.Markers[i].setMap(null);
			delete self.Markers[i];
		}
	}
	for(var i=0,SP=SortedPoints.length;i<SP;i++){
		var curPoint = SortedPoints[i];
		if(!self.Markers[curPoint.code]) {
			cityLoc = new google.maps.LatLng(curPoint.lat, curPoint.lng);
			this.addMarker(cityLoc,curPoint.code);
		}
	}
	this.filtering = false;
};
PopularDirection.prototype.initDirectPoints = function(){
	var self =this;
	$.ajax({
		cache: false,
		type: "get",
		dataType: "json",
		data: {point: self.code},
		url: "https://secure.onetwotrip.com/_api/schedule/getByPoint/",
		beforeSend: function(xhr){
			abortAjax(ajaxPointsStops);
			clearAjax(ajaxPointsStops);
			ajaxPointsStops.push(xhr);
		},
		success: function(json) {
			if(json.cities) {
				CL= json.cities.length;
				if (CL > 0) {
					for(var i=0;i<CL;i++){
						var curCity = ref.Cities[json.cities[i].code];
						if(curCity && curCity.lat && curCity.lng){
								cityLoc = new google.maps.LatLng(curCity.lat, curCity.lng);
								self.addBlueMarker(cityLoc, curCity.Name);						
						}
					}
				}
			}
		},
		complete: function(){
			clearAjax(ajaxPointsStops)
		}	
	});	
};
PopularDirection.prototype.addBlueMarker = function(location, Name){
	var self = this;
	var image = new google.maps.MarkerImage('../images/map/pin_blue.png'/*tpa=http://www.onetwotrip.com/images/map/pin_blue.png*/,
      	new google.maps.Size(15, 15),
      	new google.maps.Point(0,0),
	    new google.maps.Point(6, 6));
	marker = new google.maps.Marker({
		position: location,
		icon: image,
		name: Name,
		zIndex: 1,
		map: this.map
	});
	
	var elContent = document.createElement("div");
		elContent.innerHTML = Name;
	marker.infoOverlay = new InfoOverlay({
		latlng: marker.getPosition(),
		pinAnchor: {
			y: 25
		},
		content: elContent
	});
	google.maps.event.addListener(marker, 'mouseover', function(){
		this.infoOverlay.setMap(self.map);
	});
	google.maps.event.addListener(marker, 'mouseout', function(){
		this.infoOverlay.setMap(null);
	});
	this.BluePoints.push(marker);	
};
/*
var allCitiesShown = false;
function initAllCities( options ) {
	var self = this;
	this.setValues( options );
	this.markerLayer = $('<div />').addClass('PointsOverlay');
	this.hoverLayer = $('<div />').addClass('HoversOverlay');
	this.Cities= tw.AllCitiesArray||[];
	if(!tw.AllCitiesArray){
		var oCities={};
		for(var i in ref.Airports) {
			var curPoint = ref.Airports[i];
			if (!curPoint.Railway) {
				var curCity = ref.Cities[curPoint.Parent];
				if(!oCities[curPoint.Parent]) {
					if(curCity && curCity.lat && curCity.lng) {
						curCity.cityLoc = new google.maps.LatLng(curCity.lat, curCity.lng);
						curCity.code = i;
						self.Cities.push(curCity);
					}
					oCities[curPoint.Parent] =1;
				}
			}
		}	
		oCities=null;
		tw.AllCitiesArray = this.Cities;		
	}	
}
initAllCities.prototype = new google.maps.OverlayView;
initAllCities.prototype.onAdd = function() {
	var PointsPane = $(this.getPanes().overlayImage); // Pane 3
	var HoversPane = $(this.getPanes().overlayMouseTarget); // Pane 5
	PointsPane.append( this.markerLayer );
	HoversPane.append( this.hoverLayer );
};
initAllCities.prototype.onRemove = function() {
	this.markerLayer.remove();
	this.hoverLayer.remove();
	allCitiesShown = false;
};
initAllCities.prototype.draw = function() {
	var self = this;
	var projection = this.getProjection();
	var zoom = this.getMap().getZoom();
	var fragment = document.createDocumentFragment();
	var HoverFragment = document.createDocumentFragment();	
	this.markerLayer.empty(); // Empty any previous rendered markers
	this.hoverLayer.empty();
		
	for(var i=0, CL= this.Cities.length;i<CL;i++) {
		var curCity = this.Cities[i];
		var pixPosition = projection.fromLatLngToDivPixel( curCity.cityLoc );
		var $point = $('<div '
							+'style="'
								+'width:4px; '
								+'height:4px; '
								+'left:'+pixPosition.x+'px; '
								+'top:'+pixPosition.y+'px; '
								+'position:absolute; '
						+'">'
							+'<img '
								+'src="../images/map/pin_blue_small.png"/*tpa=http://www.onetwotrip.com/images/map/pin_blue_small.png*/ '
								+'style="position: absolute; top: -2px; left: -2px" '
							+'/>'
						+'</div>');
		var $HoverPoint = $('<div '
							+'class="map-point" '
							+'id="p_'+curCity.code+'" '
							+'name="'+curCity.Name+'" '
							+'style="'
								+'width:4px; '
								+'height:4px; '
								+'left:'+pixPosition.x+'px; '
								+'top:'+pixPosition.y+'px; '
								+'position:absolute; '
								+'cursor:pointer; '
						+'"></div>');									
		$HoverPoint.mouseover(function(){
			var p = this;
			var elContent = document.createElement("div");
				elContent.innerHTML = $(p).attr('name');
			var div = document.createElement('div');
			div.className = "infoOverlay";
			div.innerHTML = '<div class="abs"><div class="tl"></div><div class="t"></div><div class="tr"></div><div class="r"></div><div class="br"></div><div class="b"></div><div class="bl"></div><div class="l"></div><div class="c"></div><div class="leg"></div></div>';
			div.appendChild(elContent);
			$('#map').append(div);
			$(div).css({
				"top": $(p).offset().top - $(div).height() -32,
				"left": $(p).offset().left - $(div).width()/2 -20
			});
		});
		$HoverPoint.mouseout(function(){
			$('.infoOverlay').remove();
		});
		fragment.appendChild( $point.get(0) );
		HoverFragment.appendChild( $HoverPoint.get(0) );
	}
		
	// Now append the entire fragment from memory onto the DOM
	this.markerLayer.append(fragment);
	this.hoverLayer.append(HoverFragment);
	allCitiesShown = true;
};*/

allCitiesShown = false;
function initAllCities(){
	if(!allCitiesShown) {
		this.map = objMap.map;
		this.init();
		allCitiesShown = true;
	}
}
initAllCities.prototype.init = function(){
	var self =this;
	this.image = new google.maps.MarkerImage('../images/map/pin_blue_small.png'/*tpa=http://www.onetwotrip.com/images/map/pin_blue_small.png*/,
      	new google.maps.Size(4, 4),
      	new google.maps.Point(0,0),
	    new google.maps.Point(2,0));
	var oCities={};
	var g =0;
	for(var i in ref.Airports) {
		var curPoint = ref.Airports[i];
		if (!curPoint.Railway) {
			var curCity = ref.Cities[curPoint.Parent];
			if(!oCities[curPoint.Parent]) {
				if(curCity && curCity.lat && curCity.lng) {
					cityLoc = new google.maps.LatLng(curCity.lat, curCity.lng);
					self.addSmallBlueMarker(cityLoc, curCity.Name);
					g++;
				}
				oCities[curPoint.Parent] =1;
			}
		}
	}
	this.text="";
	oCities=null;
};
initAllCities.prototype.addSmallBlueMarker = function(location, Name){
	var self = this;
	marker = new google.maps.Marker({
		position: location,
		icon: self.image,
		name: Name,
		zIndex: 0,
		map: this.map
	});

	//this.text+= '<Placemark><name>' + curCity.Name + '</name><description><![CDATA[Описание]]></description><Point><coordinates>' +location.lat +',' + location.lon + '</coordinates></Point></Placemark>';
	
	var elContent = document.createElement("div");
		elContent.innerHTML = Name;
	marker.infoOverlay = new InfoOverlay({
		latlng: marker.getPosition(),
		pinAnchor: {
			y: 17
		},
		content: elContent
	});
	google.maps.event.addListener(marker, 'mouseover', function(){
		this.infoOverlay.setMap(self.map);
	});
	google.maps.event.addListener(marker, 'mouseout', function(){
		this.infoOverlay.setMap(null);
	});
};

function initPolylineRoutes(route) {
	if(objMap && !objMap.visible) {
		return;
	}
	var self = this;
	this.route = route;
	this.fromCode = this.route.substr(0,3);
	this.toCode = this.route.substr(3,3);
	this.from = ref.Cities[this.fromCode];
	this.to = ref.Cities[this.toCode];
	this.map = objMap.map;
	ClearPolylineFlights();
	var requestOptions = {
		repeats: 1,
		RetryFunction: function(){
			MakeRequest();
		},
		ErrorFunction: function(){
		}
	};
	function MakeRequest(){
		$.ajax({
			type: "get",
			cache: false,
			data: {route: self.route},
			url: "https://secure.onetwotrip.com/_api/schedule/getStops/",
			dataType: "json",
			beforeSend: function(xhr){
				abortAjax(ajaxPointsPoly);
				clearAjax(ajaxPointsPoly);
				ajaxPointsPoly.push(xhr);
			},
			success: function(json){
				self.array = json;
				//если ответ пришёл после того как быстро удалили пункт
				if(objSearchForm.dirRows[0].fromField.suggest.input.value != "" && objSearchForm.dirRows[0].toField.suggest.input.value != ""){
					self.draw();	
				}			
			},
			complete: function(xhr){
				clearAjax(ajaxPointsPoly);
				xhr.url = this.url;
				checkAjaxError(xhr,requestOptions);
			}
		});		
	}	
	this.draw = function(){
		for(var i=0, AL =this.array.length;i<AL;i++){
			var curRoute = this.array[i];
			for(var j=0,RL=curRoute.length;j<RL;j++){
				var curPoint = curRoute[j];
				if(curPoint != this.fromCode) {
					try {
						var comment = "";
						if(j===0){
							if(curRoute[j+1] && curRoute[j+1]!=this.fromCode && ref.Cities[curRoute[j+1]]){
								comment = l10n.prefered.stops[3] + ref.Cities[curRoute[j+1]].Name;	
							} else {
								comment = l10n.prefered.stops[0];
							}	
							this.initMarker(curPoint,comment);
							this.drawPoly(this.from,ref.Cities[curPoint]);
						} else {
							comment = l10n.prefered.stops[1];
							if(j==2) {
								comment = l10n.prefered.stops[2];
							}
							if(curRoute[j+1] && curRoute[j+1]!=this.fromCode && ref.Cities[curRoute[j+1]]){
								comment = l10n.prefered.stops[3] + ref.Cities[curRoute[j+1]].Name;	
							}
							this.initMarker(curPoint,comment);
							this.drawPoly(ref.Cities[curRoute[j-1]],ref.Cities[curPoint]);
						}
						if (j == curRoute.length-1) {
							this.drawPoly(ref.Cities[curRoute[j]], this.to);
						}
						
					} catch (e) {}
				}
			}
		}	
	};
	this.drawPoly = function(from,to){
		if(!from.lat || !from.lng || !to.lat || !to.lng) {
			return
		}
		var PolyFlight = new google.maps.Polyline({
			path: [
				new google.maps.LatLng(from.lat,from.lng),
				new google.maps.LatLng(to.lat,to.lng)
			],
			strokeColor: "#FF7000",
			strokeOpacity: 0.4,
			strokeWeight: 1,
			geodesic: true
		});
		PolyFlight.setMap(this.map);
		tw.Polyline.Flights.push(PolyFlight);
	};
	
	this.initMarker = function(point,comment){
		if(!ref.Cities[point].lat || !ref.Cities[point].lng || tw.Polyline.PointsList[point]) {
			return
		}
		tw.Polyline.PointsList[point] = 1;
		var cityLoc = new google.maps.LatLng(ref.Cities[point].lat, ref.Cities[point].lng);
		var html = '<div>'+String(ref.Cities[point].Name)+', <span class="small silver">' +String(ref.Countries[ref.Cities[point].Parent].Name)+'</span></div>';
		if (comment) {
			html += '<div class="small silver">' + comment + '</div>';
		}
		self.addOrangeMarker(cityLoc, html);
	}
	this.addOrangeMarker = function(location, Name){
		var image = new google.maps.MarkerImage('../images/map/pin_orange.png'/*tpa=http://www.onetwotrip.com/images/map/pin_orange.png*/,
	      	new google.maps.Size(15, 15),
	      	new google.maps.Point(0,0),
		    new google.maps.Point(6, 6));
		marker = new google.maps.Marker({
			position: location,
			icon: image,
			name: Name,
			zIndex: 1,
			map: this.map
		});
		
		var elContent = document.createElement("div");
			elContent.innerHTML = Name;
		marker.infoOverlay = new InfoOverlay({
			latlng: marker.getPosition(),
			pinAnchor: {
				y: 20
			},
			content: elContent
		});
		google.maps.event.addListener(marker, 'mouseover', function(){
			this.infoOverlay.setMap(self.map);
		});
		google.maps.event.addListener(marker, 'mouseout', function(){
			this.infoOverlay.setMap(null);
		});
		tw.Polyline.Points.push(marker);
	};
}
function ClearPolylineFlights(){
	if(!tw.Polyline) {
		return;
	}
	for(var i=0, FL = tw.Polyline.Flights.length; i<FL;i++){
		tw.Polyline.Flights[i].setMap(null);
	}
	for(var i=0, PL = tw.Polyline.Points.length; i<PL;i++){
		tw.Polyline.Points[i].setMap(null);
	}
	tw.Polyline = {
		Flights: [],
		Points:[],
		PointsList: {}
	};	
};