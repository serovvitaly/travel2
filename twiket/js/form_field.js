var reTestMacOS = new RegExp("Mac OS X","ig");
var _isMac = reTestMacOS.test(navigator.userAgent.toLowerCase());
var reLatin = new RegExp("^[a-z\.\\-\\s]+$", "i");
var reEmail = new RegExp("^[a-z0-9\\._%+\\-]+@[a-z0-9\\.\\-]+\\.[a-z]{2,4}$", "i");

var today = new Date();
var nowUTCYear = today.getUTCFullYear();
var nowUTCMonth = today.getUTCMonth();
var nowUTCDate = today.getUTCDate();

var arTranslit = {};
var arUpper = { "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Е": "E", "Ё": "YE", "Ж": "ZH", "З": "Z", "И": "I", "Й": "Y", "К": "K", "Л": "L", "М": "M", "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U", "Ф": "F", "Х": "Kh", "Ц": "TS", "Ч": "CH", "Ш": "SH", "Щ": "SHCH", "Ь": "", "Ы": "Y", "Ъ": "", "Э": "E", "Ю": "YU", "Я": "YA" };
for (l in arUpper) { arTranslit[l] = arUpper[l]; arTranslit[l.toLowerCase()] = arUpper[l].toLowerCase(); }
var enToRu = { 'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', '{': 'х', ']': 'ъ', '}': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', ':': 'ж', "'": 'э', '"': 'э', '`': 'ё', '~': 'ё', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '<': 'б', '.': 'ю', '>': 'ю' };
var ruToEn = {}; for (var i in enToRu) { ruToEn[enToRu[i]] = i; }
function getRuByEn(str) { if(enToRu[str]) return enToRu[str]; else return str; }
function getEnByRu(str) { if(ruToEn[str]) return ruToEn[str]; else return str; }
String.prototype.changeEnToRu = function() {
	var newStr = "";
	for(var i = 0, length = this.length; i < length; i++){
		newStr += getRuByEn(this.charAt(i));
	}
	return newStr;
};
String.prototype.changeRuToEn = function() {
	var newStr = "";
	for(var i = 0, length = this.length; i < length; i++){
		newStr += getEnByRu(this.charAt(i));
	}
	return newStr;
};

function checkNames(passengers, callback, errorCallback){
	var setNames = function(){
		var names = '';
		for (var i = 0, length = passengers.length; i < length; i++) {
			var passenger = passengers[i];
			if (i > 0) names += ';';
			names += passenger.lastName + ';' + passenger.firstName;
		}
		return names;
	};
	
	var dataType = 'jsonp';
	var url = 'https://secure.onetwotrip.com/_api/name_validator/validate/';
	var makeRequest = function(){
		$.ajax({
			dataType: dataType,
			url: url,
			beforeSend: function(xhr){
				tw.ajaxCheckNames = xhr;
			},
			data: {
				'names': setNames()
			},
			success: function(json){
				if (json && json.result && $.isArray(json.result)) {
					checkResult(json.result);
				} else {
					callback();
				}
			},
			complete: function(){
				delete tw.ajaxCheckNames;
			}
		});
	};
	
	var checkResult = function(result){
		var warnPassengers = [];
		for (var i = 0, length = passengers.length; i < length; i++) {
			if (result[i * 2] === true && result[i * 2 + 1] === false) {
				warnPassengers.push(passengers[i]);
			}
		}
		if (warnPassengers.length > 0) {
			showPopup(warnPassengers);
		} else {
			callback();
		}
	};
	
	var showPopup = function(warnPassengers){
		var content = $.tmpl($("#tmpl_WarnNamesPopup").trim(), {
			passengers: warnPassengers
		})[0];
		$('button.continue', content).click(function(){
			removePopup();
			callback();
		});
		$('button.improve', content).click(function(){
			removePopup();
			//errorCallback(warnPassengers);
		});
		addPopup({
			className: "commonPopup",
			dom: content
		});
		$('button.improve', content).focus();
	};
	
	makeRequest();
}

var tmpl_Field;
$(function(){
	tmpl_Field = $("#tmpl_Field").trim();
	if ($('#tmpl_hint').length > 0) {
		$.template('tmpl_hint', $("#tmpl_hint").trim());
	}
});

function Field(options) {
	var self = this;
	this.options = options || {};
	this.value = this.options.value || null;
	this.focus = false;
	
	/* До создания шаблона */
	if (this.options.type == "name") {
		this.options.reTyping = new RegExp("^[A-Z\\-\\s]+$");
		this.options.textCase = "upper";
		this.options.maxlength = this.options.maxlength || 80;
	}
	if (this.options.type == "email") {
		this.options.reTyping = new RegExp("^[\\w\\-\.@]+$", "i");
		this.options.maxlength = this.options.maxlength || 50;
	}
	if (this.options.type == "passport") {
		this.options.reTyping = new RegExp("^[\\dA-Z\\s]+$");
		this.options.textCase = "upper";
		this.options.maxlength = this.options.maxlength || 20;
	}
	if (this.options.type == "numberAndLatin") {
		this.options.reTyping = new RegExp("^[\\dA-Z]+$");
		this.options.textCase = "upper";
		this.options.maxlength = this.options.maxlength || 50;
	}
	if (this.options.type == "number" || this.options.type == "phone" || this.options.type == "cardNumber") {
		this.options.reTyping = new RegExp("^[\\d]+$");
		this.options.maxlength = this.options.maxlength || 30;
		if (this.options.type == "phone") this.options.maxlength = 20;
	}
	if (this.options.type == "birthDate") {
		if(this.value && isValidDate(this.value)){
			this.options.value = this.value.format("d mmm yyyy");
			if(tw.language != 'de') {
				this.options.value = this.options.value.toLowerCase();
			}
		}
		this.options.maxlength = this.options.maxlength || 50;
	}
	if (this.options.type == "expDate") {
		if(this.value && isValidDate(this.value)){
			this.options.value = this.value.format('http://www.onetwotrip.com/js/dd.mm.yyyy');
		}
		this.options.maxlength = this.options.maxlength || 50;
	}
	
	if(this.options.type == "phone" || this.options.type == "name" || this.options.type == "birthDate" || this.options.type == "expDate" || this.options.type == "passport" || this.options.hintType) {
		this.needHint = true;
	}
	
	/* Создание шаблона */
	this.setField();
		
	/* После создания шаблона */
	$(this.input).focus(function(event){
		event.preventDefault();
		if (!self.focus) {
			self.focus = true;
			$(self.elFocus).fadeIn();
			self.drawHint();
			self.removeWarn();
			self.removeError();
			if (self.options.type == "birthDate" || self.options.type == "expDate") {
				if (self.options.type == "birthDate" && self.value) {
					this.value = self.value.format('http://www.onetwotrip.com/js/dd.mm.yyyy');
				}
				$(this).mask('http://www.onetwotrip.com/js/99.99.9999');
			}
			$(this).on('blur', onBlur);
		}
	});
	function onBlur(event) {
		if (self.focus) {
			$(this).off('blur', onBlur);
			self.focus = false;
			$(self.elFocus).fadeOut();
			self.removeHint();
			if (self.options.type == "birthDate" || self.options.type == "expDate") {
				$(this).unmask();
			}
		}
		self.update();
		if (self.error) {
			self.drawHintError();
		}
	}
	if (this.options.reTyping) {
		$(this.input).bind("keydown", function(event) {
			self.getCode(event);
		});
		$(this.input).bind("keypress", function(event) {
			self.testTyping(event);
		});
	}
	$(this.input).bind("input keyup paste", function(event){
		/*if (event.type == "input" || event.type == "keyup" && IEVersion) handler();
		if (event.type == "paste" && IEVersion < 9) setTimeout(handler, 0);
		function handler(){
			self.setPlaceholder();
			self.drawHint();
		}*/
	});
	
	if(this.options.appendTo) $(this.elField).appendTo(this.options.appendTo);
}
Field.prototype.setField = function(){
	var self = this;
	this.options.autocomplete = this.options.autocomplete || "off";
	this.options.inputType = this.options.inputType || "text";
	
	this.elField = $.tmpl(tmpl_Field, this.options)[0];
	
	this.input = $('input[type="' + this.options.inputType + '"]:not(.placeholder)', this.elField)[0];
	this.input.field = this;
	this.elFocus = $(".focus", this.elField);
	if (this.options.checkbox) {
		this.checkbox = $('input[type="checkbox"]', this.elField)[0];
		$(this.checkbox).click(function(){
			if (this.checked) {
				self.setEnabled();
			} else {
				self.setDisabled();
			}
		});
	}
	if (this.options.disabled) this.setDisabled();
};
Field.prototype.update = function(){
	this.error = false;
	if (this.options.reTyping) {
		this.filterString();
		this.value = this.input.value;
	} else if (this.options.type == "birthDate" || this.options.type == "expDate") {
		
	} else {
		this.value = this.input.value;
	}
	this.checkFieldByType();
	if (this.error && !this.input.disabled) {
		this.addError();
	} else {
		this.removeError();
	}
};
Field.prototype.setEnabled = function(){
	this.input.disabled = false;
	if (this.options.checkbox) {
		this.checkbox.checked = true;
	}
	$(this.elField).removeClass("disabled");
	this.update();
};
Field.prototype.setDisabled = function(){
	this.input.disabled = true;
	if (this.options.checkbox) {
		this.checkbox.checked = false;
	}
	this.removeHint();
	this.removeError();
	$(this.elField).addClass("disabled");
};
Field.prototype.addError = function(type) {
	this.removeWarn();
	this.error = true;
	if (type) {
		this.errorType = type;
	}
	this.input.blur();
	$(this.elField).addClass('error');
};
Field.prototype.removeError = function() {
	this.error = false;
	this.errorType = null;
	$(this.elField).removeClass('error');
};
Field.prototype.addWarn = function(type){
	this.warn = true;
	if (type) {
		this.warnType = type;
	}
	$(this.elField).addClass('warn');
};
Field.prototype.removeWarn = function(){
	this.warn = false;
	this.warnType = null;
	$(this.elField).removeClass('warn');
};
Field.prototype.drawHint = function(type){
	var self = this;
	this.removeHint();
	if ($(this.input).is(':visible') && (this.needHint || this.error || this.warn)) {
	//if ($(this.input).is(':visible') && (this.needHint && this.input.value === "" || this.error || this.warn)) {
		var data = {
			type: this.options.type,
			className: "",
			error: false,
			errorType: null
		};
		if(this.error){
			data.className = "error";
			data.error = true;
			if(this.errorType){
				data.errorType = this.errorType;
			} else if(!this.value){
				data.errorType = "required";
			}
		} else if(this.warn) {
			data.className = "warn";
			data.warn = true;
			if(this.warnType){
				data.warnType = this.warnType;
			}
		}
		data.hintType = this.options.hintType||""; 
		
		this.elHint = $.tmpl('tmpl_hint', data)[0];
		
		if (this.error) {
			setTimeout(function(){
				$(self.elHint).fadeOut(1000, function(){
					if (self.focus) {
						self.drawHint();
					} else {
						self.removeHint();
					}
				});
			}, 3000);
		} else if(this.warn){
			setTimeout(function(){
				$(self.elHint).fadeOut(1000, function(){
					if (self.focus) {
						self.drawHint();
					} else {
						self.removeHint();
					}
				});
			}, 6000);
		}
		document.body.appendChild(this.elHint);
		var pos = $(this.input).offset();
		$(this.elHint).css({
			left: pos.left + self.input.offsetWidth / 2 - self.elHint.offsetWidth / 2,
			top: pos.top + self.input.offsetHeight + 5
		});
	}
};
Field.prototype.drawHintError = function() {
	this.drawHint();
};
Field.prototype.removeHint = function(){
	$(this.elHint).remove();
	this.elHint = null;
};
Field.prototype.checkFieldByType = function(){
	var self = this;
	switch (this.options.type) {
		case "email":
			this.checkEmail();
			break;
		case "phone":
			this.checkPhone();
			break;
		case "birthDate":
			this.checkBirthDate();
			break;
		case "expDate":
			this.checkExpDate();
			break;
		case "passport":
			this.value = this.input.value.replace(/\s*/g, '');
			break;
	}
};
Field.prototype.checkEmail = function(){
	var self = this;
	if (this.input.value !== "") {
		this.input.value = this.input.value.replace(/\s*/g,'');
		var isEmail = reEmail.test(this.input.value);
		if (!isEmail) {
			this.addError();
		} else if (this.options.validate) {
			this.value = this.input.value;
			var tempValue = this.input.value;
			if (self.iframeId != "social") {
				var dataType = 'json';
				var url = 'https://secure.onetwotrip.com/_api/emailvalidator/validate/';
				if (window.location.protocol == 'http:') {
					dataType = 'jsonp';
					url = 'https://' + getSecureHost() + url;
				}
				$.ajax({
					dataType: dataType,
					url: url,
					data: {
						"email": self.input.value
					},
					success: function(json){
						if (json.isValid !== true && tempValue == self.input.value) {
							self.addWarn();
							self.drawHint();
						}
					}
				});
			}
		}
	} else {
		this.value = "";
	}
};
Field.prototype.checkPhone = function(){
	var self = this;
	if (this.input.value.length >= 7) {
		this.value = this.input.value;
		var tempValue = this.input.value;
		var dataType = 'json';
		var url = 'https://secure.onetwotrip.com/_api/phonevalidator/validate/';
		if (window.location.protocol == 'http:') {
			dataType = 'jsonp';
			url = 'https://' + getSecureHost() + url;
		}
		$.ajax({
			dataType: dataType,
			url: url,
			data: {
				"phone": self.input.value
			},
			success: function(json){
				if (json.result !== true && tempValue == self.input.value) {
					self.addWarn();
					self.drawHint();
				}
			}
		});
	} else {
		this.value = "";
	}
};
Field.prototype.parseDateString = function(str){
	var arrDate = str.split('.');
	return {
		date: arrDate[0],
		month: arrDate[1],
		year: arrDate[2]
	};
};
Field.prototype.getDayCountInMonth = function(month, year){
	var leapParam1 = year % 4 == 0 ? 1 : 0;
	var leapParam2 = (year % 100 == 0 && year % 400 != 0) ? 1 : 0;
	var param1 = month > 7 ? 1 : 0;
	var param2 = (month - param1) % 2 != 0 ? 1 : 0;
	var param3 = month == 2 ? 1 : 0;
	var param4 = !(leapParam1 && !leapParam2) ? 1 : 0;
	var totalDays = 30 + param2 - param3 - param3 * param4;
	return totalDays;
};
Field.prototype.checkBirthDate = function() {
	var self = this;
	if (this.input.value !== "") {
		if (this.value && (this.value.format("d mmm yyyy").toLowerCase() === this.input.value || this.value.format("d mmm yyyy") === this.input.value)) {
			var oDate = this.parseDateString(this.value.format('http://www.onetwotrip.com/js/dd.mm.yyyy'));
		} else {
			var oDate = this.parseDateString(this.input.value);
		}
		if (oDate.month > 12) {
			this.addError("Wrong");
		} else if (this.getDayCountInMonth(oDate.month, oDate.year) < oDate.date) {
			this.addError("Wrong");
		} else {
			this.value = new Date(oDate.year, oDate.month - 1, oDate.date);
			if (this.value) {
				if (this.options.min && !(this.options.min <= this.value)) {
					this.addError("Age");
				} else if (this.options.max && !(this.value < this.options.max)) {
					this.addError("Age");
				}
			}
		}
	} else {
		this.value = null;
	}
	if (this.error) this.value = null;
	if (this.value && !self.focus) {
		if(tw.language != 'de') {
			self.input.value = self.value.format('d mmm yyyy').toLowerCase();
		} else {
			self.input.value = self.value.format("d mmm yyyy");
		}
	}
};
Field.prototype.checkExpDate = function() {
	if (this.input.value !== "") {
		var oDate = this.parseDateString(this.input.value);
		if (oDate.month > 12) {
			this.addError("Wrong");
		} else if (this.getDayCountInMonth(oDate.month, oDate.year) < oDate.date) {
			this.addError("Wrong");
		} else {
			this.value = new Date(oDate.year, oDate.month - 1, oDate.date);
			if (this.value) {
				if (this.options.min && !(this.options.min <= this.value)) {
					this.addError("Expired");
				}
			}
		}
	} else {
		this.value = null;
	}
	if (this.error) this.value = null;
};
Field.prototype.testTyping = function(event) {
	var self = this;
	var charCode = event.charCode ? event.charCode : event.keyCode;
	var charCodeStr = String.fromCharCode(charCode);
	if (this.keyCode == 86 && (event.ctrlKey || browser.mac && event.metaKey)) {
		setTimeout(function(){
			self.filterString();
		});
	}
	if (event.ctrlKey || event.altKey || event.metaKey || (0 < this.keyCode && this.keyCode < 47 && this.keyCode != 32)) {
		return;
	} else if (this.options.maxlength > 0 && this.input.value.length >= this.options.maxlength) {
		return false;
	} else if (this.options.reTyping.test(charCodeStr)) {
		return;
	} else {
		var charCodeStrInCase = this.toTextCase(charCodeStr);
		var ruToEn = this.toTextCase(charCodeStr.toLowerCase().changeRuToEn());
		if (this.options.reTyping.test(charCodeStrInCase)) {
			this.pasteString(charCodeStrInCase);
		} else if (this.options.reTyping.test(ruToEn)) {
			this.pasteString(ruToEn);
		}
		if (this.options.type == "email") {
			if (event.shiftKey && (this.keyCode == 50 || this.keyCode == 222)) this.pasteString("@");
			if (!event.shiftKey && this.keyCode == 190 || browser.mac && charCodeStr == "ю") this.pasteString(".");
		}
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
	}
};
Field.prototype.filterString = function(){
	var str = this.toTextCase(this.input.value);
		str = $.trim(str);
	var newStr = "";
	for (var i = 0, textLength = str.length; i < textLength; i++) {
		var iChar = str.charAt(i);
		if (this.options.type == "email") {
			newStr += iChar;
		} else if (this.options.reTyping.test(iChar)) {
			newStr += iChar;
		} else if (this.options.type == "name" && arTranslit[iChar]) {
			if (this.options.reTyping.test(arTranslit[iChar])) {
				newStr += arTranslit[iChar];
			}
		}
	}
	this.input.value = newStr;
	if (this.options.maxlength > 0 && this.input.value.length >= this.options.maxlength) {
		this.input.value = this.input.value.substr(0, this.options.maxlength);
	}
};
Field.prototype.toTextCase = function(str){
	if (this.options.textCase && this.options.textCase == "upper") {
		return str.toUpperCase();
	} else if (this.options.textCase && this.options.textCase == "lower") {
		return str.toLowerCase();
	} else {
		return str;
	}
};
Field.prototype.pasteString = function(strNew) {
	this.getSelection();
	var strStart = this.input.value.substring(0, this.selectionStart);
	var strEnd = this.input.value.substr(this.selectionEnd, this.input.value.length);
	this.input.value = strStart + strNew + strEnd;
	
	if (this.input.setSelectionRange) {
		this.input.setSelectionRange(this.selectionStart + 1, this.selectionStart + 1);
	} else {
		var SelectionRange = this.input.createTextRange();
		SelectionRange.move("character", this.selectionStart + 1);
		SelectionRange.select();
	}
};
Field.prototype.getCode = function(event) {
	this.keyCode = event.keyCode;
};
Field.prototype.getSelection = function() {
	this.selectionStart = this.getSelectionStart() || 0;
	this.selectionEnd = this.getSelectionEnd();
};
Field.prototype.getSelectionStart = function() {
	if (!this.input.createTextRange) {
		return this.input.selectionStart;
	} else {
		var SelectionRange = document.selection.createRange().duplicate();
		SelectionRange.moveEnd('character', this.input.value.length);
		return this.input.value.lastIndexOf(SelectionRange.text);
	}
};
Field.prototype.getSelectionEnd = function() {
	if (!this.input.createTextRange) {
		return this.input.selectionEnd;
	} else {
		var SelectionRange = document.selection.createRange().duplicate();
		SelectionRange.moveStart('character', -this.input.value.length);
		return SelectionRange.text.length;
	}
};
Field.prototype.setPlaceholder = function(){
	if(this.placeholder) {
		if(!this.input.value && !this.focus){
			this.placeholder.value = this.placeholder.defaultValue;
		} else if (this.focus) {
			this.placeholder.value = "";
		}
	}
};