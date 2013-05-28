$(function(){
	$.template('SuggestField', $("#tmpl_SuggestField").trim());
});
function SuggestField(options){
	var self = this;

	/* До создания шаблона */
	this.options = options || {};
	this.value = this.options.value || null;
	this.options.value = ref.getPointName(this.value);
	this.focus = false;
	this.link_setHintOffset = function(){
		self.setHintOffset();
	};
	
	/* Создание шаблона */
	this.setField();
	if (this.value) this.placeholder.value = ref.getPointVsCountryString(this.value);
	
	$(this.input).focus(function(){
		self.focus = true;
		self.setHint();
		this.select();
	});
	$(this.input).blur(function(){
		self.focus = false;
		self.setHint();
	});
	$(this.input).bind("input keyup paste", function(event){
		if (event.type == "input" || event.type == "keyup" && IEVersion) handler();
		if (event.type == "paste" && IEVersion < 9) setTimeout(handler, 0);
		function handler(){
			self.setPlaceholder();
			self.setHint();
		}
	});
	this.setGlow();
	
	if(this.options.appendTo) $(this.elField).appendTo(this.options.appendTo);
}
SuggestField.prototype.setField = function(){
	this.elField = $.tmpl('SuggestField', this.options)[0];
	this.input = $("input:not([disabled])", this.elField)[0];
	this.placeholder = $("input[readonly]", this.elField)[0];
};
SuggestField.prototype.setGlow = function(){
	var self = this;
	this.$elGlow = $(".glow", this.elField);
	$(this.input).focus(function(){
		if (IEVersion < 9) {
			self.$elGlow.css({
				display: "block"
			});
		} else {
			self.$elGlow.fadeIn();
		}
	});
	$(this.input).blur(function(){
		if (IEVersion < 9) {
			self.$elGlow.css({
				display: "none"
			});
		} else {
			self.$elGlow.fadeOut();
		}
	});
};
SuggestField.prototype.addError = function(){
	var self = this;
	setTimeout(function(){
		$(self.elField).addClass('error');
		if (IEVersion < 9) {
			self.$elGlow.css({
				display: "block"
			});
		} else {
			self.$elGlow.fadeIn(200, function(){
				self.$elGlow.fadeOut(100, function(){
					self.$elGlow.fadeIn(200);
				});
			});
		}
	}, 500);
};
SuggestField.prototype.removeError = function(){
	$(this.elField).removeClass('error');
};
SuggestField.prototype.setPlaceholder = function(){
	if (this.placeholder) {
		if (!this.input.value || this.input.value == "\n") {/* При отмене ввода в FF7.0.1 value == "\n" */
			this.placeholder.value = this.placeholder.defaultValue;
		} else {
			this.placeholder.value = "";
		}
	}
};
SuggestField.prototype.setHint = function(){
	if (this.options.needHint) {
		if (this.focus && !this.input.value) {
			this.drawHint();
		} else {
			this.removeHint();
		}
	}
};
SuggestField.prototype.drawHint = function(){
	var self = this;
	if (!this.hint) {
		this.hint = $.tmpl(tmpl_Hint)[0];
		var content = document.createElement("div");
			content.innerHTML += l10n.hint.forExample;
		var getCityWithAirport = function(){
			getNearCity();
			if (tw.position.nearCityWithAirport) {
				self.removeHint();
				self.setHint();
			}
		}
		if (this.input.id == "to0") {
			content.innerHTML += l10n.hint.suggestValues[0];
			if(objSearchForm.data.directions[0].from){
				/*popular*/
				//content.innerHTML += l10n.hint.suggestValues[2];
			}
		} else if (tw.position && tw.position.nearCityWithAirport) {
			content.innerHTML += '<span value="' + tw.position.nearCityWithAirport + '" class="dashed link code">' + ref.getCityName(tw.position.nearCityWithAirport) + '</span>';
		} else {
			content.innerHTML += l10n.hint.suggestValues[1];
			if (!tw.position) {
				$(document).one("getPosition", function(){
					getCityWithAirport();
					return;
				});
			} else if (tw.position && !tw.position.nearCityWithAirport) {
				//случай когда ответ раньше инициирования формы и событие не повесилось
				getCityWithAirport();
				return;
			}
		}
		$("span", content).bind("mousedown", function(event){
			event.preventDefault();
			self.input.blur();
			if ($(this).hasClass("code")) {
				self.suggest.setByCode($(this).attr("value"));
			} else if ($(this).hasClass("google")) {
				self.placeholder.value = "";
				self.input.value = $(this).attr("value");
				self.suggest.makeSuggest();
			} else {
				/*popular*/
				if (isResults()) {
					$(document.body).one("resultsHide", function(){
						objMap.clearMap();
						ClearPolylineFlights();
						objMap.show();
					});
					hideResults();
				} else {
					objMap.show();
				}
				initPopularDirection(objSearchForm.data.directions[0].from);
			}
		});
		this.hint.appendChild(content);
		document.body.appendChild(this.hint);
		this.setHintOffset();
		$(window).bind("resize", this.link_setHintOffset);
	}
};
SuggestField.prototype.setHintOffset = function(){
	var pos = $(this.elField).offset();
	$(this.hint).css({
		left: pos.left + this.elField.offsetWidth / 2 - this.hint.offsetWidth / 2,
		top: pos.top + this.elField.offsetHeight + 14
	});
};
SuggestField.prototype.removeHint = function(){
	$(window).unbind("resize", this.link_setHintOffset);
	$(this.hint).remove();
	this.hint = null;
};
SuggestField.prototype.setDisabled = function(){
	this.input.disabled = true;
	this.removeHint();
	this.removeError();
	$(this.elField).addClass("disabled");
};
SuggestField.prototype.setEnabled = function(){
	this.input.disabled = false;
	$(this.elField).removeClass("disabled");
};