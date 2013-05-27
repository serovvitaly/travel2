var objSocialAuth;
var isSocialRedirect = (window.location.pathname === "/auth/");
var isToTwitterRedirect = (window.location.pathname === "/auth/" && tw.params.provider == "toTwitter");
$(function(){
	objSocialAuth = new SocialAuth();
});
/*if(!isSocialRedirect){
	$(document).on("getPosition", function(){
		checkDate();
	});	
}
function checkDate(){
	if(tw && tw.ipinfo){
		var localD = new Date();
		var localZ = localD.format('o');
		var byServD =  new Date(Date.parseISO8601(tw.ipinfo.serverTime));
		if(localZ != tw.ipinfo.timezone || (localZ == tw.ipinfo.timezone && localD.getDate() != byServD.getDate()) ){
			addPopup({
				dom: l10n.popup.localDate + simpleCloseButton,
				domClass: 'content1',
				close_button: true
			});
		}
	}
}*/
function makeBonusCurrencyToViewCur(cur){
	if(tw.provider){ return;};
	try{RewriteBonus(cur);} catch(e){}
}
function RewriteBonus(currency){
	tw.bonus = tw.bonus||{};
	if(!currency){
		if(tw.language == 'de' || tw.language == 'es') {
			currency = 'EUR';
		} else if(tw.language == 'az'){
			currency = 'AZN';
		} else if(tw.language == 'ua'){
			currency = 'UAH';
		} else if(tw.language == 'en'){
			currency = 'USD';
		} else {
			currency = 'RUB';
		}
	}
	tw.bonus.currency = currency;

	var bonusFirst = '1&thinsp;500';
	var bonusSecond = 500;
	var regBonus = '1&thinsp;000';
	var leadBonus = 250;
	var bonusCurrency = l10n.currency[tw.bonus.currency].Genitive_Plural;
	switch (tw.bonus.currency) {
		case "EUR":
			bonusFirst = 38;
			bonusSecond = 13;
			regBonus = 25;
			leadBonus = 6;
			break;
		case "USD":
			bonusFirst = 50;
			bonusSecond = 20;
			regBonus = 30;
			leadBonus = 8;
			break;
		case "UAH":
			bonusFirst = 400;
			bonusSecond = 140;
			regBonus = 260;
			leadBonus = 95;
			break;
		case "AZN":
			bonusFirst = 38;
			bonusSecond = 13;
			regBonus = 25;
			leadBonus = 6;
			break;
	}
	tw.bonusinfo = {
		bonusCurrency: l10n.currency[tw.bonus.currency].Genitive_Plural,
		bonusFirst: bonusFirst,
		bonusSecond: bonusSecond,
		regBonus: regBonus,
		leadBonus: leadBonus
	}
}
function SocialAuth(json){
	var self = this;
	if (isToTwitterRedirect) {//Получаем twitter url и редиректим
		this.getTwitterLink();
		return;
	}
	this.json = json || {};
	this.PMCaller = (window.document.location.protocol == "http:") ? PMCaller : $;
	if (!isSocialRedirect) {
		this.loginLoader = $('.loginLoader')[0];
		$(this.loginLoader).removeClass('invisible');
		this.formVisible = false;
		this.initOptions();
		this.profileInfo = $('.profileInfo')[0];
		this.unknown = $('.unknownUser', this.profileInfo)[0];
		this.known = $('.knownUser', this.profileInfo)[0];
		this.myprofile = $('.myprofile', this.profileInfo)[0];
	}
	this.initVisitor();
}
SocialAuth.prototype.initVisitor = function(isFromSocialRedirect){  return;
	var self = this;
	tw.params.referrer =  (document.referrer && document.referrer !== "") ? document.referrer : "empty";
    //tw.params.franchise_id = window.location.hostname;
	tw.params.franchise_id = 'onetwotrip';
	var showForm = false;
	if(tw.params.lid && !readCookie("vid") && !readCookie("lid")){
		showForm = true;
	}
	if (window.location.pathname == '/p/') {
		tw.params.hb = true;
	}
	$.ajax({
		type: "get",
		cache: false,
        //url: (testLocalHost() ? ("https://" + getSecureHost()) : "") + "/_api/visitormanager/get/",
		url: "https://secure.onetwotrip.com/_api/visitormanager/get/",
		dataType: (testLocalHost() ? "jsonp" : "json"),
		data: tw.params,
		timeout: 10000,
		success: function(json){
			$(document).trigger({
					type: "visitormanager_get_success",
					json: json
			});
			if (isSocialRedirect) {
				var data = tw.params;
					data.protocol = window.location.protocol;
				$.ajax({
					type: "get",
					cache: false,
					url: "https://secure.onetwotrip.com/_api/visitormanager/backUrl/",
					data: data,
					timeout: 10000,
					complete: function(){
						if (window.opener) {
							try {
								window.opener.objSocialAuth.initVisitor(true);
							} 
							catch (e) {}
							window.close();
						} else {
							window.location.href = 'http:///' + (readCookie("franchise_id") || 'http://www.onetwotrip.com/js/www.onetwotrip.com');
						}
					}
				});
			} else {
				self.json = json;
				if(!self.json.providers){
					self.defaultVid = self.json.vid;
				}
				self.updateUserData();
				if (isFromSocialRedirect) {
					self.reloadOrRedraw();
				} else {
					self.redraw();
					if (window.location.pathname == "/p/" && !self.checkAuthorized()) {
						self.show(self.regauthForm);
						self.authEmail.input.focus();
						self.RedirectFirst();
					}
					if (showForm) {
						self.show(self.regauthForm);
						self.regEmail.input.focus();
					}
				}
			}
		},
		error: function(){
			$(self.loginLoader).addClass('invisible');
			RewriteBonus();
		},
		complete: function(){
			$(document).trigger({type: "visitormanager_complete"});
		}
	});
};
SocialAuth.prototype.updateUserData = function(){
	tw.bonus = this.json.bonus||{};
	tw.visitor = this.json;
	if (this.json.providers && this.json.providers.length > 0) {
		tw.provider = this.json.providers[0].provider;
	}
	RewriteBonus(tw.bonus.currency);
};
SocialAuth.prototype.RedirectFirst = function(){
	var self = this;
	if(window.document.location.pathname == "/p/" && !self.checkAuthorized()){
		if(this.formVisible){
			setTimeout(function(){
				self.RedirectFirst();
			},3000);
		} else {
			window.document.location.href = "../index.htm"/*tpa=http://www.onetwotrip.com/*/;
		}
	}
};
SocialAuth.prototype.checkAuthorized = function(){
	return this.json && (this.json.name || this.json.email) ? true : false;
};
SocialAuth.prototype.initOptions = function(){
	var self = this;
	this.regauthForm = $.tmpl($('#tmpl_SocialRegAuth'))[0];
	this.regauthForm.id = 'SocialRegAuth';
	this.authForm = $('#SocialAuth',this.regauthForm)[0];
	this.authForm.id = "SocialAuth";
	this.regForm = $('#SocialReg',this.regauthForm)[0];
	this.regForm.id = "SocialReg";
	this.remindForm = $.tmpl($('#tmpl_RemindAuth'))[0];
	this.remindForm.id = "RemindAuth";
	this.authEmail = new Field({
		appendTo: $('.pf_email', this.authForm),
		name: "auth_email",
		value: "",
		autocomplete: 'on',
		type: "email"
	});
	this.authPas = new Field({
		appendTo: $('.pf_pas', this.authForm),
		name: "auth_pas",
		value: "",
		maxlength: 30,
		autocomplete: 'on',
		inputType: "password"
	});
	this.rememberMe = this.authForm.rememberMe;
	this.authForm.fields = [this.authEmail,this.authPas];
	
	this.regEmail = new Field({
		appendTo: $('.pf_email', this.regForm),
		name: "reg_email",
		validate: true,
		value: "",
		type: "email"
	});
	this.regPas = new Field({
		appendTo: $('.pf_pas', this.regForm),
		name: "reg_pas",
		value: "",
		maxlength: 30,
		hintType: "regPas",
		inputType: "password"
	});
	this.repeatPas = new Field({
		appendTo: $('.pf_repeatPas', this.regForm),
		name: "confirmreg_pas",
		value: "",
		maxlength: 30,
		hintType: "regPas",
		inputType: "password"
	});
	this.regForm.fields = [this.regEmail,this.regPas,this.repeatPas];
	this.regauthForm.fields = this.authForm.fields.concat(this.regForm.fields);
	
	this.remindEmail = new Field({
		appendTo: $('.remind_email', this.remindForm),
		name: "remind_email",
		value: "",
		type: "email"
	});
	$('.getNewPas', this.authForm).click(function(){
		self.hide(self.regauthForm);
		$('.hint').remove();
		self.show(self.remindForm);
	});
	this.regErrorBlock = $('.Error',this.regForm);
	this.authErrorBlock = $('.Error',this.authForm);
	this.remindErrorBlock = $('.Error',this.remindForm);
	$(this.regForm).submit(function(event){
		event.preventDefault();
		$(self.regErrorBlock).addClass('invisible');
		self.getRegData();
		if (self.checkRegForm()) {
			self.makeRegistration();
		}
	});
	$(this.authForm).submit(function(event){
		event.preventDefault();
		$(self.authErrorBlock).addClass('invisible');
		self.getAuthData();
		if (self.checkAuthForm()) {
			self.makeAuthorization();
		}
	});
	$(this.remindForm).submit(function(event){
		event.preventDefault();
		$(self.remindErrorBlock).addClass('invisible');
		self.getRemindData();
		if (self.checkRemindForm()) {
			self.makeReminder();
		}
	});
	$('body').append('<div id="tmp_SocialLinks" class="invisible"></div>');
	this.tmpl_sLinks = $('#tmp_SocialLinks')[0];
	$(this.tmpl_sLinks).append($.tmpl($('#tmpl_LoginSocials')));
	
	$('.register', this.profileInfo).click(function(){
		self.show(self.regauthForm);
		self.regEmail.input.focus();
	});
	$('.enter', this.profileInfo).click(function(){
		self.show(self.regauthForm);
		self.authEmail.input.focus(); 
	});
	$('.exit', this.profileInfo).click(function(){
		self.PMCaller.ajax({
			iframeId: "pm",
			type: "post",
			dataType: "json",
			url: "https://secure.onetwotrip.com/_api/visitormanager/exit/",
			success: function(json){
				if (json) {
					window.document.location.href = "../index.htm"/*tpa=http://www.onetwotrip.com/*/;
				}
			},
			complete: function(){
				_kmq.push(['clearIdentity']);
			}
		});
	});
	$('.SocialForm .social_list a').live("click", function(e){
		e.preventDefault();
		var socialAuthWin = window.open($(this).attr('href'), 'sharer_' + new Date().valueOf(), 'toolbar=no,width=980,height=500,modal=yes');
		if (socialAuthWin && window.location.hostname.indexOf('http://www.onetwotrip.com/js/onetwotrip.com') == -1) {
			function checkWindow(){
				if (socialAuthWin.closed) {
					self.initVisitor(true);
				} else {
					setTimeout(function(){
						checkWindow();
					}, 1000);
				}
			}
			checkWindow();
		}
	});
};
SocialAuth.prototype.reloadOrRedraw = function(){
	if (window.document.location.pathname == "/lead/") {
		window.document.location.href = 'http://www.onetwotrip.com/p/';
	} else if (window.document.location.pathname == "/" || window.document.location.pathname == "/p/") {
		this.redraw();
	} else {
		try{
			$(document.body).trigger("removeUnloadReservation");
		} catch(e){}
		window.document.location.reload();
	}
	kmqRecord({name: 'Authorize'});
};
SocialAuth.prototype.redraw = function(){
	var self = this;
	if (this.checkAuthorized()) {
		this.myprofile.href = window.document.location.protocol == "http:" ? "https://" + getSecureHost() : "/";
		this.myprofile.href += "p/";
		if (this.json.name) {
			$(this.myprofile).attr('title',this.json.name).html(this.json.name);
		} else {
			$(this.myprofile).attr('title',this.json.email).html(this.json.email);
		}
		$(this.unknown).addClass('invisible');
		$(this.known).removeClass('invisible');
		$(document.body).trigger("authTrue");	
	} else {
		$(this.unknown).removeClass('invisible');
		$(this.known).addClass('invisible');
	}
	var userVid = self.defaultVid||self.json.vid;
	this.userName = self.json.email||self.json.name;
	_kmq.push(['alias', userVid, this.userName]);

	$(this.loginLoader).addClass('invisible');
	$(this.profileInfo).removeClass('invisible');
	if(this.formVisible) {
		try{this.hide(this.remindForm);} catch(e){}
		try{this.hide(this.regauthForm);} catch(e){}		
	}
};
SocialAuth.prototype.rewriteSocialLinks = function(){
	var self = this;
	//var redirect_uri = encodeURIComponent(window.location.protocol + '//' + window.location.host + "/auth/?provider=");
	var redirect_uri = encodeURIComponent((window.location.protocol == 'http:' ? 'http://www.onetwotrip.com/auth/?provider=' : 'https://secure.onetwotrip.com/auth/?provider='));
	if (!this.links_done) {
		$('.social_list a.fb').attr('href', 'https://www.facebook.com/dialog/oauth?client_id=116448151756930&scope=email&redirect_uri=' + redirect_uri + 'facebook');
		$('.social_list a.vk').attr('href', 'http://api.vkontakte.ru/oauth/authorize?client_id=2452034&scope=;&response_type=code&redirect_uri=' + redirect_uri + 'vkontakte');
		$('.social_list a.mr').attr('href', 'https://connect.mail.ru/oauth/authorize?client_id=640456&response_type=code&redirect_uri=' + redirect_uri + 'mailru');
		$('.social_list a.ok').attr('href', 'http://www.odnoklassniki.ru/oauth/authorize?client_id=5213440&response_type=code&redirect_uri=' + redirect_uri + 'odnoklassniki');
	}
	if (tw.language == 'az') {
		$('.social_list a[class!="fb"]').parent().remove();
	}
	this.links_done = true;
};
SocialAuth.prototype.getTwitterLink = function(form){
	var self = this;
	$.ajax({
		type: "post",
		dataType: "json",
		url: "https://secure.onetwotrip.com/_api/visitormanager/getProviderURL/",
		timeout: 10000,
		success: function(json){
			if (json.twitter && json.twitter !== '') {
				window.location.href = json.twitter;
			} else {
				window.close();
				$('.social_list a.tw').addClass("invisible");
			}
		}
	});
};
SocialAuth.prototype.show = function(form){
	var self = this;
	clearExtraElements();
	if(form.id != 'RemindAuth'){
		this.rewriteSocialLinks();
	}
	if ($('#' + form.id).length === 0) {
		$(".close_button", form).click(function(){
			self.hide(form);
		});
		$('body').append(form);
	}
	if(form.fields){
		for(var i = 0, length= form.fields.length; i< length; i++){
			if(form.fields[i].options.inputType == 'password'){
				form.fields[i].input.value = '';
			}
			form.fields[i].removeWarn();
			form.fields[i].removeError();
		}		
	}
	if($('.sLinks_inside',form).length && $('.sLinks_inside',form).children().length === 0) {
		$('.sLinks_inside',form).html( $(this.tmpl_sLinks).html() );
	}
	var elFade = fadeIn();
	$(elFade).one("click", function(){
		self.hide(form);
	});
	$("html,body").animate({
		scrollTop: 0
	});
	$(form).removeClass("invisible");
	this.formVisible = true;
};
SocialAuth.prototype.hide = function(form){
	$('.hint').remove();
	fadeOut();
	$(form).addClass("invisible");
	this.isReg = false;
	this.formVisible = false;
};
SocialAuth.prototype.startRequest = function(){
	$(this.profileInfo).addClass('invisible');
	$(this.loginLoader).removeClass('invisible');
};
SocialAuth.prototype.stopRequest = function(){
	$(this.loginLoader).addClass('invisible');
	$(this.profileInfo).removeClass('invisible');
};
SocialAuth.prototype.getRegData = function(){
	this.request = {};
	this.regEmail.update();
	this.regPas.update();
	this.repeatPas.update();
	this.request.email = this.regEmail.value;
	this.request.pwd = this.regPas.value;
	this.request.confirmPwd = this.repeatPas.value;
};
SocialAuth.prototype.checkRegForm = function(){
	var self = this;
	var errors = 0;
	var errorField = null;
	
	if (!this.request.email || this.regEmail.error) {
		errors++;
		this.regEmail.addError();
		if (!errorField) {
			errorField = this.regEmail;
		}
	}
	if (!this.request.pwd || this.regPas.error) {
		errors++;
		this.regPas.addError();
		if (!errorField) {
			errorField = this.regPas;
		}
	}
	if (this.request.pwd && this.request.pwd.length < 6) {
		errors++;
		this.regPas.addError("lowRegPas");
		if (!errorField) {
			errorField = this.regPas;
		}
	}
	if (!this.request.confirmPwd || this.repeatPas.error) {
		errors++;
		this.repeatPas.addError();
		if (!errorField) {
			errorField = this.repeatPas;
		}
	}
	if (this.request.pwd && this.request.confirmPwd && this.request.pwd != this.request.confirmPwd) {
		errors++;
		this.repeatPas.addError("passwordMatch");
		if (!errorField) {
			errorField = this.repeatPas;
		}
	}
	if (errors) {
		$("html,body").animate({
			scrollTop: $(errorField.elField).offset().top - 80
		}, "fast");
		errorField.input.focus();
		return false;
	} else {
		$('.hint').remove();
		if(this.regForm.fields){
			for(var i = 0, length= this.regForm.fields.length; i< length; i++){
				$(this.regForm.fields[i].input).blur();
			}		
		}
		return true;
	}
};
SocialAuth.prototype.makeRegistration = function(){
	var self = this;
	$('input', this.regForm).each(function(){
		$(this).attr('disabled', true);
		this.disabled = true;
	});
	this.isReg = true;
	this.PMCaller.ajax({
		iframeId: "pm",
		type: "post",
		dataType: "json",
		data: self.request,
		url: "https://secure.onetwotrip.com/_api/visitormanager/register/",
		timeout: 10000,
		beforeSend: function(){
			self.startRequest();
			self.hide(self.regauthForm);
		},
		success: function(json){
			self.json = json;
			if (json.error) {
				self.parseError(json);
			} else {
				var obj = {email:self.request.email};
				var div = document.createElement('div');
				$.tmpl($("#tmpl_RegConfirm").trim(), obj).appendTo(div);
				addPopup({
					dom: div,
					className: "commonPopup regConfirm",
					close_button: true
				});
				kmqRecord({name: 'Registration'});
			}
		},
		error: function(xhr){
			self.connectionError(xhr,self.regauthForm);
		},
		complete: function(){
			$('input', self.regForm).each(function(){
				$(this).removeAttr('disabled');
				this.disabled = false;
			});
			self.stopRequest();
		}
	});
};
SocialAuth.prototype.getAuthData = function(){
	this.request = {};
	this.authEmail.update();
	this.authPas.update();
	this.request.email = this.authEmail.value;
	this.request.pwd = this.authPas.value;
	this.request.rememberMe = this.rememberMe.checked;
};
SocialAuth.prototype.checkAuthForm = function(){
	var self = this;
	var errors = 0;
	var errorField = null;
	
	if (!this.request.email || this.authEmail.error) {
		errors++;
		this.authEmail.addError();
		if (!errorField) {
			errorField = this.authEmail;
		}
	}
	if (!this.request.pwd || this.authPas.error) {
		errors++;
		this.authPas.addError();
		if (!errorField) {
			errorField = this.authPas;
		}
	}
	
	if (errors) {
		$("html,body").animate({
			scrollTop: $(errorField.elField).offset().top - 80
		}, "fast");
		errorField.input.focus();
		return false;
	} else {
		$('.hint').remove();
		if(this.authForm.fields){
			for(var i = 0, length= this.authForm.fields.length; i< length; i++){
				$(this.authForm.fields[i].input).blur();
			}		
		}
		return true;
	}
};
SocialAuth.prototype.makeAuthorization = function(){
	var self = this;
	$('input', this.authForm).each(function(){
		$(this).attr('disabled', true);
		this.disabled = true;
	});
	this.PMCaller.ajax({
		iframeId: "pm",
		type: "post",
		dataType: "json",
		data: self.request,
		url: "https://secure.onetwotrip.com/_api/visitormanager/auth/",
		timeout: 20000,
		beforeSend: function(){
			self.startRequest();
			self.hide(self.regauthForm);
		},
		success: function(json){
			self.json = json;
			if (json.error) {
				self.parseError(json);
			} else {
				self.updateUserData();
				$(document).trigger("successAuth");
				self.reloadOrRedraw();
			}
		},
		error: function(xhr){
			self.connectionError(xhr,self.regauthForm);
		},
		complete: function(){
			$('input', self.authForm).each(function(){
				$(this).removeAttr('disabled');
				this.disabled = false;
			});
			self.stopRequest();
		}
	});
};
SocialAuth.prototype.getRemindData = function(){
	this.request = {};
	this.remindEmail.update();
	this.request.email = this.remindEmail.value;
};
SocialAuth.prototype.checkRemindForm = function(){
	var self = this;
	var errors = 0;
	var errorField = null;
	
	if (!this.request.email || this.remindEmail.error) {
		errors++;
		this.remindEmail.addError();
		if (!errorField) {
			errorField = this.remindEmail;
		}
	}
	
	if (errors) {
		$("html,body").animate({
			scrollTop: $(errorField.elField).offset().top - 80
		}, "fast");
		errorField.input.focus();
		return false;
	} else {
		$('.hint').remove();
		return true;
	}
};
SocialAuth.prototype.makeReminder = function(){
	var self = this;
	$('input', this.remindForm).each(function(){
		$(this).attr('disabled', true);
		this.disabled = true;
	});
	this.PMCaller.ajax({
		iframeId: "pm",
		type: "post",
		dataType: "json",
		data: self.request,
		url: "https://secure.onetwotrip.com/_api/visitormanager/generatePassword/",
		timeout: 10000,
		beforeSend: function(){
			self.startRequest();
			self.hide(self.remindForm);
		},
		success: function(json){
			self.json = json;
			$('input', self.remindForm).each(function(){
				$(this).removeAttr('disabled');
				this.disabled = false;
			});
			if (json.error) {
				self.parseError(json);
			} else {
				var div = document.createElement('div');
				$.tmpl($("#tmpl_PasChangedEmailSend").trim(), {
					email: self.remindEmail.value
				}).appendTo(div);
				addPopup({
					dom: div,
					className: "sendPasPopup",
					close_button: true
				});
			}
		},
		error: function(xhr){
			self.connectionError(xhr,self.remindForm);
		},
		complete: function(){
			self.stopRequest();
		}
	});
};
SocialAuth.prototype.connectionError = function(xhr,form){
	if (this.formVisible) {
		try{this.hide(this.remindForm);} catch(e){}
		try{this.hide(this.regauthForm);} catch(e){}		
	}
	checkAjaxError(xhr);
};
SocialAuth.prototype.parseError = function(json){
	var self = this;
	var err = json.error;
	switch (err) {
		case "EMAIL_NOT_VALID":
			if (self.isReg) {
				self.regEmail.addError();
				self.regEmail.input.focus();
			} else {
				self.authEmail.addError();
				self.authEmail.input.focus();
			}
			break;
		case "PWD_NOT_CONFIRMED":
			self.show(self.regauthForm);
			self.repeatPas.addError("passwordMatch");
			self.repeatPas.input.focus();
			break;
		case "PWD_TOO_SHORT":
			self.show(self.regauthForm);
			self.regPas.addError("lowRegPas");
			self.regPas.input.focus();
			break;
		case "USER_ALREADY_EXIST":
			addPopup({
				error: true,
				reason: l10n.popup.warning,
				comment: l10n.auth.popup.mailExist[0] + self.regEmail.value + l10n.auth.popup.mailExist[1],
				button: l10n.auth.popup.change,
				actionButton: "removePopup();objSocialAuth.show(objSocialAuth.regauthForm);objSocialAuth.regEmail.input.focus();"
			});
			break;
		case "PWD_EMPTY_OR_TOO_SMALL":
			self.show(self.regauthForm);
			self.authPas.addError("lowRegPas");
			self.authPas.input.focus();
			break;
		case "WRONG_PWD_OR_EMAIL":
			self.show(self.regauthForm);
			$(self.authErrorBlock).removeClass('invisible');
			break;
		case "NOT_REGISTERED":
			self.show(self.remindForm);
			$(self.remindErrorBlock).removeClass('invisible');
			break;
		case "LIMIT_REACHED":
			addPopup({
				error: true,
				reason: l10n.auth.popup.authError,
				comment: l10n.auth.popup.limit,
				close_button: true,
				button: "Закрыть",
				actionButton: "removePopup();"
			});
			break;
		case "TOO_MANY_TRIES":
			addPopup({
				error: true,
				reason: l10n.auth.popup.authError,
				comment: l10n.auth.popup.tries,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
		default:
			/*INTERNAL_ERROR etc*/
			addPopup({
				error: true,
				reason: l10n.auth.popup.authError,
				comment: l10n.popup.systemComment,
				close_button: true,
				button: l10n.popup.close,
				actionButton: "removePopup();"
			});
			break;
	}
};