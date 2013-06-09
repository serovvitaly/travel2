var tmpl_Card;
function CreditCard(options){
	var self = this;
	this.options = options || {};
	var defaultFields = {
		expDate: "",
		number: "",
		cvv: "",
		cuid: "",
		holderName: ""
	};
	this.options.data == this.options.data||{};
	this.data = $.extend(defaultFields, this.options.data);;
	this.form = this.options.form || document.body;
	this.elCard = this.options.card || $(".creditCard",this.form);
	// Показывать номер банка
	this.showCuid = this.options.showCuid || false;
	this.initFields();
	this.expMonth = this.fields.expMonth;
	this.expYear = this.fields.expYear;
	this.number1 = this.fields.number1;
	this.number2 = this.fields.number2;
	this.number3 = this.fields.number3;
	this.number4 = this.fields.number4;
	this.holderName = this.fields.holderName;
	this.cvv = this.fields.cvv;
	this.cuid = this.fields.cuid;

	$(this.number1.input).keyup(function(e){
		self.FillCNumber(this, e.keyCode);
		self.handleBINBank();
	});
	$(this.number2.input).keyup(function(e){
		self.FillCNumber(this, e.keyCode);
		self.handleBINBank();
	});
	$(this.number3.input).keyup(function(e){
		self.FillCNumber(this, e.keyCode);
	});
	$(this.number4.input).keyup(function(e){
		self.FillCNumber(this, e.keyCode);
	});
	
	$(this.expMonth.input).keyup(function(){
		self.EnterCreditExpMonth();
	});
	$(this.expMonth.input).focus(function(){
		self.expYear.removeError();
	});
	$(this.expMonth.input).blur(function(){
		setTimeout(function(){
			self.BlurCardExpMonth();
		}, 1);
	});
	$(this.expYear.input).keyup(function(){
		self.EnterCardExpYear();
	});
	$(this.expYear.input).focus(function(){
		self.expMonth.removeError();
	});
	$(this.expYear.input).blur(function(){
		setTimeout(function(){
			self.BlurCardExpYear();
		}, 1);
	});
}
CreditCard.prototype.initFields = function(){
	this.fields = {};
	this.fields.numberAmex = new Field({
		appendTo: $(".numberAmex", this.elCard)[0],
		name: "numberAmex",
		value: "",
		type: "cardNumber",
		maxlength: 15
	});
	this.fields.cid = new Field({
		appendTo: $(".cid", this.elCard)[0],
		name: "cid",
		value: "",
		type: "number",
		inputType: "password",
		maxlength: 4
	});
	this.fields.number1 = new Field({
		appendTo: $(".number1", this.elCard)[0],
		name: "number1",
		value: this.data.number ? this.data.number.substring(0, 4) : "",
		type: "cardNumber",
		maxlength: 4
	});
	this.fields.number2 = new Field({
		appendTo: $(".number2", this.elCard)[0],
		name: "number2",
		value: this.data.number ? this.data.number.substring(4, 8) : "",
		type: "cardNumber",
		maxlength: 4
	});
	this.fields.number3 = new Field({
		appendTo: $(".number3", this.elCard)[0],
		name: "number3",
		value: this.data.number ? this.data.number.substring(8, 12) : "",
		type: "cardNumber",
		maxlength: 4
	});
	this.fields.number4 = new Field({
		appendTo: $(".number4", this.elCard)[0],
		name: "number4",
		value: this.data.number ? this.data.number.substring(12, 16) : "",
		type: "cardNumber",
		maxlength: 4
	});
	this.fields.expMonth = new Field({
		appendTo: $(".expMonth", this.elCard)[0],
		name: "expMonth",
		value: this.data.expDate ? this.data.expDate.substring(0, 2) : "",
		type: "number",
		maxlength: 2
	});
	this.fields.expYear = new Field({
		appendTo: $(".expYear", this.elCard)[0],
		name: "expYear",
		value: this.data.expDate ? this.data.expDate.substring(2, 4) : "",
		type: "number",
		maxlength: 2
	});
	this.fields.holderName = new Field({
		appendTo: $(".holderName", this.elCard)[0],
		name: "holderName",
		value: this.data.holderName ? this.data.holderName : "",
		type: "name"
	});
	this.fields.cvv = new Field({
		appendTo: $(".cvv", this.elCard)[0],
		name: "cvv",
		value: this.data.cvv ? this.data.cvv : "",
		type: "number",
		inputType: "password",
		maxlength: 3
	});
	// Пример cuid'а: 27425750
	this.fields.cuid = new Field({
		appendTo: $(".cuid", this.elCard)[0],
		name: "cuid",
		value: this.data.cuid ? this.data.cuid : "",
		type: "number",
		maxlength: 8
	});
};
CreditCard.prototype.FillCNumber = function(input, keycode){
	var NextFieldNumber = String(input.name).replace("number", "");
		NextFieldNumber = parseInt(NextFieldNumber, 10) + 1;
	var NextField = null;
	if (NextFieldNumber == 2) {
		NextField = this.number2.input;
	} else if(NextFieldNumber == 3) {
		NextField = this.number3.input;
	} else if(NextFieldNumber == 4) {
		NextField = this.number4.input;
	} else {
		NextField = this.expMonth.input;
	}
	if (input.value.length == 4 && input.oldValue != input.value && keycode > 47) {
		NextField.focus();
	}
	input.oldValue = input.value;
};
CreditCard.prototype.EnterCreditExpMonth = function() {
	if (this.expMonth.input.value.length == 2 && this.expMonth.input.oldValue != this.expMonth.input.value) {
		this.expYear.input.focus();
	}
	this.expMonth.input.oldValue = this.expMonth.input.value;
};
CreditCard.prototype.BlurCardExpMonth = function() {
	if (this.expMonth.input.value.length == 1) {
		var numb = parseInt(this.expMonth.input.value,10);
		numb = (numb===0)?1:numb;
		this.expMonth.input.value = '0' + numb;
		this.expMonth.value = this.expMonth.input.value;
	}
	if (this.expMonth.input.value>12) {
		this.expMonth.input.value = 12;
		this.expMonth.value = this.expMonth.input.value;
	}	
	this.expMonth.input.oldValue = this.expMonth.value;
	this.CheckCreditCardExpiredDate();
};
CreditCard.prototype.EnterCardExpYear = function() {
	if ((this.expYear.input.value.length == 2) && this.expYear.input.oldValue != this.expYear.input.value) {
		this.holderName.input.focus();
	}
	this.expYear.input.oldValue = this.expYear.input.value;
};
CreditCard.prototype.BlurCardExpYear = function() {
	if (this.expYear.input.value.length == 1) {
		this.expYear.input.value = '0' + parseInt(this.expYear.input.value, 10);
		this.expYear.value = this.expYear.input.value;
	}
	this.expYear.input.oldValue = this.expYear.input.value;
	this.CheckCreditCardExpiredDate();
};
CreditCard.prototype.CheckCreditCardExpiredDate = function() {
	if (!this.expMonth.focus && !this.expYear.focus && this.expMonth.input.value !== '' && this.expYear.input.value !== '') {
		var newDate = this.options.curDate||new Date();
		var ThisYearShort = String(newDate.getFullYear()).substr(2);
		var ThisMonthShort = newDate.getMonth() + 1;

		if (ThisYearShort > this.expYear.input.value || (ThisMonthShort > this.expMonth.input.value && ThisYearShort == this.expYear.input.value) || this.expMonth.input.value == '00') {
			this.expMonth.addError("Expired");
			this.expYear.addError("Expired");
			return false;
		} else if (this.expMonth.input.value > 12) {
			this.expMonth.addError("Expired");
			this.expYear.addError("Expired");
			return false;
		} else {
			this.expMonth.removeError();
			this.expYear.removeError();
		}
	}
};
CreditCard.prototype.isBINBank = function() {
	if (this.showCuid) {
		var bin = parseInt(($(this.number1.input).val().toString() + $(this.number2.input).val().toString()).substr(0, 6), 10);
		// 518286 - BIN
		return bin == 518286;
	}
	else {
		return false;
	}
};
CreditCard.prototype.handleBINBank = function() {
	if (this.showCuid) {
		var fieldContainer = $(this.cuid.options.appendTo);
		if (this.isBINBank()) {
			fieldContainer.removeClass('invisible');
		}
		else {
			fieldContainer.addClass('invisible');
		}
	}
};
CreditCard.prototype.checkCardByLuhnAlgorithm = function(number){
	number = number || this.data.number;
	if (!number) {
		return false;
	}
	if (number == '4111111111111111') {
		return true;
	}
	var sum = 0;
	for (var i = 16; i >= 1; i--) {
		if (i % 2 === 0) {
			sum += parseInt(number[i - 1], 10);
		} else {
			var tmp = parseInt(number[i - 1], 10) * 2;
			if (tmp > 9) {
				tmp = 1 + tmp % 10;
			}
			sum += tmp;
		}
	}
	if (sum % 10 === 0) {
		return true;
	} else {
		return false;
	}
};
CreditCard.prototype.getData = function(){
	this.number1.update();
	this.number2.update();
	this.number3.update();
	this.number4.update();
	this.expMonth.update();
	this.expYear.update();
	this.holderName.update();
	this.cvv.update();
	this.cuid.update();
	this.data = {
		number: this.number1.value + this.number2.value + this.number3.value + this.number4.value,
		expDate: this.expMonth.value + this.expYear.value,
		holderName: this.holderName.value,
		cvv: this.cvv.value
	};
	if (this.showCuid) {
		this.data.cuid = this.isBINBank() ? this.cuid.value : null;
	}
	return this.data;
};
CreditCard.prototype.check = function(){
	var errors = 0;
	var errorField = null;
	this.getData();
	if (!this.number1.value || this.number1.error || (this.number1.value && this.number1.value.length < 4)) {
		errors++;
		this.number1.addError();
		if (!errorField) {
			errorField = this.number1;
		}
	}
	if (!this.number2.value || this.number2.error || (this.number2.value && this.number2.value.length < 4)) {
		errors++;
		this.number2.addError();
		if (!errorField) {
			errorField = this.number2;
		}
	}
	if (!this.number3.value || this.number3.error || (this.number3.value && this.number3.value.length < 4)) {
		errors++;
		this.number3.addError();
		if (!errorField) {
			errorField = this.number3;
		}
	}
	if (!this.number4.value || this.number4.error || (this.number4.value && this.number4.value.length < 4)) {
		errors++;
		this.number4.addError();
		if (!errorField) {
			errorField = this.number4;
		}
	}
	if (!this.checkCardByLuhnAlgorithm()) {
		errors++;
		this.number1.addError("Luhn");
		if (!errorField) {
			errorField = this.number1;
		}
	}
	if (!this.expMonth.value || this.expMonth.error) {
		errors++;
		this.expMonth.addError();
		if (!errorField) {
			errorField = this.expMonth;
		}
	}
	if (!this.expYear.value || this.expYear.error) {
		errors++;
		this.expYear.addError();
		if (!errorField) {
			errorField = this.expYear;
		}
	}
	if (!this.holderName.value || this.holderName.error) {
		errors++;
		this.holderName.addError();
		if (!errorField) {
			errorField = this.holderName;
		}
	}
	if (!this.cvv.value || this.cvv.error || (this.cvv.value && this.cvv.value.length < 3)) {
		errors++;
		this.cvv.addError('cvv');
		if (!errorField) {
			errorField = this.cvv;
		}
	}
	/*if(this.showCuid && this.cuid && this.cuid.value == '' && this.isBINBank()) {
		errors++;
		this.cuid.addError();
		if (!errorField) {
			errorField = this.cuid;
		}
	}*/
	if (errors) {
		$("html,body").animate({
			scrollTop: $(errorField.elField).offset().top - 80
		}, "fast");
		errorField.input.focus();
		return false;
	} else {
		return true;
	}
};