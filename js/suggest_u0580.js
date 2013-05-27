function MyHash(){
	this.Hash = {};
	this.Arr = [];
}
MyHash.prototype.Add = function(key, obj) {
	this.Arr.push(key);
	this.Hash[key] = obj || 1;
};
MyHash.prototype.GetLength = function() {
	return this.Arr.length;
};

function Suggest(field, parentObj, dirNumber){
	var self = this;
	this.field = field;
	this.field.value = this.field.value || null;
	this.field.setPlaceholder = function(){
		self.setPlaceholder();
	};
	this.lastResult = this.field.value;
	this.field.geocodeValue = null;
	this.input = this.field.input;
	this.placeholder = this.field.placeholder;
	this.parentObj = parentObj;
	this.dirNumber = dirNumber;
	
	this.tempValue = this.input.value.toLowerCase();
	
	this.suggestType = null;
	
	this.inFocus = false;
	$(this.input).focus(function(){
		self.inFocus = true;
	});
	$(this.input).blur(function(){
		self.inFocus = false;
	});
	this.linkSetOffset = function(event){
		self.setOffset(event);
	};
	this.link_clickOutside = function(event){
		self.clickOutside(event);
	};
	this.link_onKeyDown = function(event){
		self.onKeyDown(event);
	};
	$(this.input).bind("input keyup paste", function(event){
		if (event.type == "input" && !IEVersion || event.type == "keyup" && IEVersion) handler();
		if (event.type == "paste" && IEVersion < 9) setTimeout(handler, 0);
		function handler(){
			if (self.input.value.toLowerCase() != self.tempValue) {
				self.currentResult = null;
				self.setCurrentResult();
				if (self.input.value.length >= 3) {
					var temp = self.input.value.toLowerCase();
					setTimeout(function(){
						if (temp == self.input.value.toLowerCase()) {
							self.makeSuggest();
						}
					}, 400);
				} else {
					self.hide();
					self.tempValue = self.input.value.toLowerCase();
				}
			}
		}
	});
	this.selectedRow = null;
	//this.makeSuggest();
}
Suggest.prototype.setByCode = function(code){
	this.currentResult = code;
	this.input.value = ref.getPointName(this.currentResult);
	this.tempValue = this.input.value.toLowerCase();
	this.setPlaceholder();
	this.field.value = this.currentResult;
	this.lastResult = this.currentResult;
	this.parentObj.update();
};
Suggest.prototype.makeSuggest = function() {
	var self = this;
	this.suggestType = null;
	this.tempValue = this.input.value.toLowerCase();
	var queryString = this.tempValue;
	if (queryString.length >= 3) {
		this.results = new MyHash();
		this.currentResult = null;
		this.getResult(queryString);
		if (this.results.GetLength() > 1) {
			if (this.inFocus === true) {
				this.draw();
			} else {
				this.currentResult = this.results.Arr[0];
				this.setCurrentResult();
			}
		} else if (this.results.GetLength() == 1) {
			var temp = this.input.value.toLowerCase();
			setTimeout(function(){
				if (temp == self.input.value.toLowerCase()) {
					self.currentResult = self.results.Arr[0];
					self.setCurrentResult();
					self.hide();
				}
			}, 400);
		} else {
			this.hide();
		}
	}
	//all cities on map
	$('.infoOverlay').remove();
};
Suggest.prototype.setPlaceholder = function(){
	var code;
	if (!this.input.value || this.input.value == "\n") {/* При отмене ввода в FF7.0.1 value == "\n" */
		this.placeholder.value = this.placeholder.defaultValue;
	} else if (this.currentResult) {
		if (this.currentResult.AddressStr && this.currentResult.refCode) {
			code = this.currentResult.refCode;
		} else if (!this.currentResult.AddressStr) {
			code = this.currentResult;
		}
		if (code && this.tempValue === ref.getPointName(code).substring(0, this.input.value.length).toLowerCase()) {
			this.placeholder.value = ref.getPointVsCountryString(code);
		} else if (!code && this.currentResult.AddressStr.indexOf(this.input.value) === 0) {
			this.placeholder.value = this.currentResult.AddressStr;
			if ($.inArray("country", this.currentResult.types) === -1) {
				if(this.currentResult.country){
					this.placeholder.value += ', ' + this.currentResult.country;
				} else if ($.inArray("natural_feature", this.currentResult.types) > -1) {
					if (this.currentResult.NearCities && this.currentResult.NearCities.length==1 && ref.testPoint(this.currentResult.NearCities[0])) {
						if(ref.Countries[ref.getPoint(this.currentResult.NearCities[0]).Parent]) {
							this.placeholder.value += ', ' + ref.Countries[ref.getPoint(this.currentResult.NearCities[0]).Parent].Name;	
						}
					}
				}
			}
		} else {
			this.placeholder.value = "";
		}
	} else {
		this.placeholder.value = "";
	}
};
Suggest.prototype.getResult = function(queryString){
	var self = this;
	get(queryString);
	get(queryString.changeEnToRu());
	get(queryString.changeRuToEn());
	function get(string){
		if (string.length >= 3) {
			if (string.length === 3) {
				self.GetCityByCode(string);
				self.GetAirportByCode(string);
			}
			self.GetCities(string);
			self.GetAirports(string);
		}
	}
	if(this.results.GetLength() < 1 && window.objMap){
		this.suggestType = "geocode";
		this.geocode(queryString);
	}
};
Suggest.prototype.GetCityByCode = function(queryString){
	var CityCode = queryString.toUpperCase();
	if (ref.Cities[CityCode] && !this.results.Hash[CityCode]) {
		this.results.Add(CityCode);
	}
};
Suggest.prototype.GetAirportByCode = function(queryString){
	var AirportCode = queryString.toUpperCase();
	if (ref.Airports[AirportCode] && !this.results.Hash[AirportCode]) {
		this.results.Add(AirportCode);
	}
};
Suggest.prototype.GetCities = function(queryString) {
	var queryStringLength = queryString.length;
	for (var l = 0; l < ref.LangLength; l++) {
		var lang = ref.Languages[l];
		for (var CityCode in ref.Cities) {
			if (!this.results.Hash[CityCode]) {
				var refCity = ref.Cities[CityCode];
				if (refCity[lang].substr(0, queryStringLength).toLowerCase() === queryString) {
					this.results.Add(CityCode);
				}
			}
		}	
	}
};
Suggest.prototype.GetAirports = function(queryString) {
	var queryStringLength = queryString.length;
	for (var l = 0; l < ref.LangLength; l++) {
		var lang = ref.Languages[l];
		for (var AirportCode in ref.Airports) {
			if (!this.results.Hash[AirportCode]) {
				var refAirport = ref.Airports[AirportCode];
				if (refAirport[lang].substr(0, queryStringLength).toLowerCase() === queryString) {
					this.results.Add(AirportCode);
				}
			}
		}
	}
};
Suggest.prototype.create = function(){
	this.elSuggest = document.getElementById("suggest");
	if (!this.elSuggest) {
		this.elSuggest = document.createElement("div");
		this.elSuggest.id = "suggest";
		this.elSuggest.className = "suggest invisible";
		$(this.elSuggest).click(function(event) {
			event.stopPropagation();
		});
		document.body.appendChild(this.elSuggest);
	} else {
		this.elSuggest.innerHTML = "";
	}
};
Suggest.prototype.draw = function() {
	var self = this;
	this.create();
	var elList = document.createElement("ul");
	
	var ResultsCount = this.results.GetLength() < 10 ? this.results.GetLength() : 10;
	for(var i = 0;  i < ResultsCount; i++){
		var Code = this.results.Arr[i];
		var elLi = document.createElement("li");
			elLi.Code = Code;
			elLi.appendChild(this.drawRefItem(Code));
			
			elLi.onmouseover = function() {
				self.setRowHover(this);
			};
			elLi.onclick = function() {
				self.setCurrentResult();
				self.hide();
			};
		elList.appendChild(elLi);
	}
	this.setRowHover(elList.firstChild);
	this.elSuggest.onmouseout = function() {
		self.setRowHover(self.selectedRow);
	};
	this.elSuggest.appendChild(elList);
	this.show();
};
Suggest.prototype.drawRefItem = function(code){
	var PointVsCountryString = ref.getPointVsCountryString(code);
	var elTable = document.createElement("table");
		var elRow = elTable.insertRow(-1);
		var elNameCell = elRow.insertCell(0);
			elNameCell.innerHTML = PointVsCountryString.split(',')[0] + '<span>' + PointVsCountryString.substr(PointVsCountryString.indexOf(',')) + '</span>';
		var elCodeCell = elRow.insertCell(1);
			elCodeCell.className = "code";
			elCodeCell.innerHTML = code;
	return elTable;
};
Suggest.prototype.drawGeocode = function(){
	var self = this;
	this.create();
	var elList = document.createElement("ul");
	
	var ResultsCount = this.geocodeResults.length < 500 ? this.geocodeResults.length : 5;
	for(var i = 0; i < ResultsCount; i++){
		var currentResult = this.geocodeResults[i];
		var elLi = document.createElement("li");
		if (currentResult.refCode) {
			elLi.Code = currentResult.refCode;
			elLi.appendChild(this.drawRefItem(currentResult.refCode));
		} else {
			elLi.Geocode = currentResult;
			elLi.innerHTML = currentResult.AddressStr;
			if ($.inArray("country", currentResult.types) === -1) {
				if(currentResult.countryCode && currentResult.countryCode == "US" && currentResult.state){
					elLi.innerHTML += ', ' + currentResult.state;
				}
				if(currentResult.country){
					elLi.innerHTML += ', <span>' + currentResult.country + '</span>';
				} else if ($.inArray("natural_feature", currentResult.types) > -1) {
					if (currentResult.NearCities && currentResult.NearCities.length==1 && ref.testPoint(currentResult.NearCities[0])) {
						if(ref.Countries[ref.getPoint(currentResult.NearCities[0]).Parent]) {
							elLi.innerHTML += ', <span>' + ref.Countries[ref.getPoint(currentResult.NearCities[0]).Parent].Name + '</span>';	
						}
					}
				}
			}
		}
			elLi.onmouseover = function() {
				self.setRowHover(this);
			};
			elLi.onclick = function() {
				self.setCurrentResult();
				self.hide();
			};
		elList.appendChild(elLi);
	}
	this.setRowHover(elList.firstChild);
	this.elSuggest.onmouseout = function() {
		self.setRowHover(self.selectedRow);
	};
	this.elSuggest.appendChild(elList);
	this.show();
};
Suggest.prototype.geocode = function(queryString){
	var self = this;
	var geocoder = new google.maps.Geocoder();
	var myTypes = ["country", "locality", "natural_feature", "administrative_area_level_1", "administrative_area_level_2", "administrative_area_level_3", "sublocality", "neighborhood"];
	geocoder.geocode({
		'address': queryString
	}, function(results, status){
		if (status == google.maps.GeocoderStatus.OK && queryString == self.tempValue) {
			self.geocodeResults = [];
			for (var i = 0, length_i = results.length; i < length_i; i++) {
				var currentResult = results[i];
					currentResult.NearCities = AirportFinder(currentResult.geometry.location.lat(), currentResult.geometry.location.lng());
				if (currentResult.NearCities) {
					for (var t = 0, length_t = myTypes.length; t < length_t; t++) {
						var type = myTypes[t];
						if ($.inArray(type, currentResult.types) > -1) {
							self.setGeocodeAddress(currentResult, type);
							self.geocodeResults.push(currentResult);
							break;
						}
					}
				}
			}
			for (var j = 0, length_j = self.geocodeResults.length; j < length_j; j++) {
				var currentResult = self.geocodeResults[j];
				if (currentResult.AddressStr_long) {
					var SetAddressStr_long = false;
					for (var k = (k+ j); k < length_j; k++) {
						var CompareItem = self.geocodeResults[k];
						if (CompareItem.AddressStr_long && currentResult.AddressStr == CompareItem.AddressStr) {
							CompareItem.AddressStr = CompareItem.AddressStr_long;
							SetAddressStr_long = true;
						}
					}
					if (SetAddressStr_long) {
						currentResult.AddressStr = currentResult.AddressStr_long;
					}
				}
			}
			if (self.geocodeResults.length > 0 && self.inFocus) {
				self.drawGeocode();
			} else if(self.geocodeResults.length > 0 && !self.inFocus) {
				self.currentResult = self.geocodeResults[0];
				self.setCurrentResult();
			}
		}
	});
};
Suggest.prototype.setGeocodeAddress = function(geocode, type){
	var AddressStr = "";
	var AddressStr_long = "";
	var country = "";
	var refCode = null;
	for (var i = 0, length = geocode.address_components.length; i < length; i++) {
		var address_component = geocode.address_components[i];
		switch (type) {
			case "country":
				if ($.inArray("country", address_component.types) > -1) {
					AddressStr += getCountryName(address_component);
				}
				break;
			case "locality":
				if ($.inArray("locality", address_component.types) > -1) {
					refCode = this.searchCityCodeByGeoName(geocode, address_component.long_name);
					AddressStr += address_component.long_name;
					AddressStr_long += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr_long += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					if(address_component.short_name == "US") {
						geocode.countryCode = address_component.short_name;
						//делаем сплит по пробелу для случая new ark - в результате New York 14513
						geocode.state = geocode.formatted_address.split(',')[1].trim().split(' ')[0];
					}
					geocode.country = getCountryName(address_component);
				}
				break;
			case "natural_feature":
				if ($.inArray("natural_feature", address_component.types) > -1) {
					AddressStr += address_component.long_name;
					AddressStr_long += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr_long += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "administrative_area_level_1":
				if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					refCode = this.searchCityCodeByGeoName(geocode, address_component.long_name);
					AddressStr += address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "administrative_area_level_2":
				if ($.inArray("administrative_area_level_2", address_component.types) > -1) {
					refCode = this.searchCityCodeByGeoName(geocode, address_component.long_name);
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "administrative_area_level_3":
				if ($.inArray("administrative_area_level_3", address_component.types) > -1) {
					refCode = this.searchCityCodeByGeoName(geocode, address_component.long_name);
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "sublocality":
				if ($.inArray("sublocality", address_component.types) > -1) {
					refCode = this.searchCityCodeByGeoName(geocode, address_component.long_name);
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "neighborhood":
				if ($.inArray("neighborhood", address_component.types) > -1) {
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "park":
				if ($.inArray("park", address_component.types) > -1) {
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
			case "point_of_interest":
				if ($.inArray("point_of_interest", address_component.types) > -1) {
					AddressStr += address_component.long_name;
				} else if ($.inArray("administrative_area_level_1", address_component.types) > -1) {
					AddressStr += ", " + address_component.long_name;
				} else if ($.inArray("country", address_component.types) > -1) {
					geocode.country = getCountryName(address_component);
				}
				break;
		}
	}
	function getCountryName(address_component){
		if(ref.Countries[address_component.short_name]){
			return ref.Countries[address_component.short_name].Name;
		} else {
			return address_component.long_name;
		}
	}
	if (refCode) {
		geocode.refCode = refCode;
	}
	geocode.AddressStr = AddressStr;
	if(AddressStr_long !== ""){
		geocode.AddressStr_long = AddressStr_long;
	}
};
Suggest.prototype.searchCityCodeByGeoName = function(geocode, geoName){
	for (var j = 0; j < geocode.NearCities.length; j++) {
		var cityName = ref.getCityName(geocode.NearCities[j]);
		if (geoName.indexOf(cityName) > -1) {
			return geocode.NearCities[j];
		}
	}
	return null;
};
Suggest.prototype.show = function() {
	var self = this;
	this.setOffset();
	$(window).bind('resize', self.linkSetOffset);
	
	$(document).unbind("click", self.link_clickOutside);
	$(this.input).unbind("keydown", self.link_onKeyDown);
	
	$(document).bind("click", self.link_clickOutside);
	$(this.input).bind("keydown", self.link_onKeyDown);
	
	$(this.elSuggest).removeClass("invisible");
	this.setOffset();
};
Suggest.prototype.setOffset = function(){
	var offset = $(this.input).offset();
	this.elSuggest.style.top = offset.top + this.input.offsetHeight + "px";
	this.elSuggest.style.left = offset.left + "px";
	this.elSuggest.style.minWidth = this.input.offsetWidth - 2 + "px";
};
Suggest.prototype.hide = function() {
	var self = this;
	$(window).unbind('resize', self.linkSetOffset);
	$(document).unbind("click", self.link_clickOutside);
	$(this.input).unbind("keydown", self.link_onKeyDown);
	this.currentResult = null;
	var elSuggest = document.getElementById("suggest");
	if (elSuggest) {
		document.body.removeChild(elSuggest);
	}
};
Suggest.prototype.clickOutside = function(event) {
	if (event.target != this.input) {
		this.setCurrentResult();
		this.hide();
	}
};
Suggest.prototype.onKeyDown = function(event) {
	switch (event.keyCode) {
		case 9: // <Tab>
			this.setCurrentResult();
			this.hide();
			break;
		case 27: // <Esc>
			this.hide();
			break;
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
			this.hide();
			break;
	}
};
Suggest.prototype.setPrevRowHover = function() {
	if (this.selectedRow) {
		var PrewRow = this.selectedRow.previousSibling;
		if (PrewRow) {
			this.setRowHover(PrewRow);
			this.selectedRow = PrewRow;
		}
	}
};
Suggest.prototype.setNextRowHover = function() {
	if (this.selectedRow) {
		var NextRow = this.selectedRow.nextSibling;
		if (NextRow) {
			this.setRowHover(NextRow);
			this.selectedRow = NextRow;
		}
	}
};
Suggest.prototype.setRowHover = function(elRow){
	if (this.selectedRow) {
		if (this.selectedRow == elRow) {
			return;
		}
		this.dropRowHover(this.selectedRow);
	}
	$(elRow).addClass("hover");
	this.selectedRow = elRow;
	if (elRow.Code) {
		this.currentResult = elRow.Code;
		if (this.tempValue === ref.getPointName(this.currentResult).substring(0, this.input.value.length).toLowerCase()) {
			this.input.value = ref.getPointName(this.currentResult).substring(0, this.input.value.length);
		}
	} else if (elRow.Geocode) {
		this.currentResult = elRow.Geocode;
	}
	this.setPlaceholder();
};
Suggest.prototype.dropRowHover = function(elRow){
	$(elRow).removeClass("hover");
};
Suggest.prototype.setCurrentResult = function() {
	var self = this;
	if (this.currentResult) {
		if (this.tempValue == this.input.value.toLowerCase()) {
			if(this.currentResult.AddressStr){
				if(this.currentResult.refCode){
					this.currentResult = this.currentResult.refCode;
					this.setCurrentResult();
					return;
				}
				this.input.value = this.currentResult.AddressStr;
				this.tempValue = this.input.value.toLowerCase();
				this.field.geocodeValue = this.currentResult;
				if(isResults()){
					$(document.body).one("resultsHide", function(){
						objMap.setGeocode(self.field, self.parentObj, self.dirNumber);
					});
					hideResults();
				} else {
					objMap.setGeocode(this.field, this.parentObj, this.dirNumber);
				}
				this.setPlaceholder();
			} else {
				this.input.value = ref.getPointName(this.currentResult);
				this.tempValue = this.input.value.toLowerCase();
				this.setPlaceholder();
				this.field.value = this.currentResult;
				this.parentObj.update();
			}
		}
		this.lastResult = this.currentResult;
	} else if(this.lastResult != this.currentResult) {
		this.field.value = this.currentResult;
		this.field.geocodeValue = this.currentResult;
		this.parentObj.update();
		this.lastResult = this.currentResult;
	} else {
		this.lastResult = null;
	}
};