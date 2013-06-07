var mouseEvent;
var infoBaloonHidden = true;
for(var i in l10n.currency) {l10n.currency[i].code = i;}
$(function(){
	//setLogo();
	//setBackground();
	if (document.getElementById('tmpl_Popup')) {
		$.template('tmpl_Popup', $("#tmpl_Popup").trim());
	}
	//new initLanguage();
	//new initTopMenu();
	initTagPrice();
	var referrerToUse = 'empty';
	if(document.referrer && document.referrer !== ""){
		referrerToUse = document.referrer;
	}
	if(!readCookie("src_ref")){
		setCookie({
			name: "src_ref",
			value: referrerToUse,
			days: 60
		});
	}
	if(!readCookie("session_ref") || readCookie("session_ref") === 'empty'){
		setCookie({
			name: "session_ref",
			value: referrerToUse
		});
	}
	$('body').mousemove(function(e){
		mouseEvent = e;
	});
	if (tw.language != 'ru' && tw.language != 'az' && tw.language != 'ua') {
		$('#topSocialIn').addClass('invisible');
	}
	$(document.body).on("showRating", function(event){
		kmqRecord({name: 'show_rating', obj: {type: event.view}});
	});
	if(tw.checkAdriver){
		initAdriverBlock({id:'rotationPanelTop',bn:2});
	} else {
		var AdriverPos = (window.location.pathname == '/')?5:6;
		if(Math.floor(Math.random()*10)<3) {AdriverPos = 6;}
		initAdriverBlock({id:'rotationPanelTop',pz:AdriverPos});
	}
	$(document.body).on("changeRequest", function(){
		var AdriverPos = (window.location.pathname == '/')?5:6;
		if(Math.floor(Math.random()*10)<3) {AdriverPos = 6;}
		initAdriverBlock({id:'rotationPanelTop',pz:AdriverPos});
	});
});
function initDefaultCurrency(){
	setCookie({
		name: "currency",
		value: tw.currency,
		days: 180,
		xdm: true
	});
}
getCurrentPosition();
function getCurrentPosition(){  return;
	tw.position = false;
	if (navigator.geolocation && 1 == 2) {
		navigator.geolocation.getCurrentPosition(function(position){
			tw.position = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			$(document).trigger("getPosition");
		}, function(){
			getByIp();
		});
	} else {
		getByIp();
	}
	
	var requestOptions = {
		repeats: 1,
		simpleRequest: true,
		RetryFunction: function(){
			getByIp();
		},
		ErrorFunction: function(){
		}
	};
	function getByIp(){
		$.ajax({
			cache: false,
			dataType: "json",
			url: "https://secure.onetwotrip.com/_api/ipinfo/get/",
            data: {
                source:    twiket.setup.source,
                srcmarker: twiket.setup.marker
            },
			success: function(json){
				tw.ipinfo = json;
				if (json.lat && json.lon) {
					tw.position = {
						lat: json.lat,
						lng: json.lon,
						countryCode: json.countryCode,
						iddCode: json.iddCode,
						region: json.region
					};
					$(document).trigger("getPosition");
					if(document.location.protocol == 'http:' && document.location.pathname == '/') {
						var kmqOpt = {};
						if(json.countryName && json.countryName.length>1) {kmqOpt.Country = json.countryName;}
						if(json.city && json.city.length>1) {kmqOpt.City = json.city;}
						if(json.ispName && json.ispName.length>1) {kmqOpt.Provider = json.ispName;}
						if(json.domainName && json.domainName.length>1) {kmqOpt.domainName = json.domainName;}
						if(json.ip && json.ip.length>1) {kmqOpt.ip = json.ip;}
						if(json.mobileBrand && json.mobileBrand.length>1) {kmqOpt.mobileBrand = json.mobileBrand;}
						_kmq.push(['set', kmqOpt]);												
					}
				}
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr, requestOptions);
			}
		});
	}
}
function getNearCity(){
	var cities = AirportFinder(tw.position.lat, tw.position.lng);
	if (cities) tw.position.nearCityWithAirport = cities[0];
}

function createIframe(src, id){
	var elIFrame = document.getElementById(id);
	if (!elIFrame) {
		elIFrame = document.createElement("iframe");
		elIFrame.className = "pm";
		elIFrame.id = id;
		elIFrame.src = src;
		document.body.appendChild(elIFrame);
	}	
	return elIFrame;
}
function PMCaller(){}
PMCaller.ajax = function(options){
	var obj = new PMCallerType(options.iframeId);
	obj.ajax(options);
};
function PMCallerType(id){
	var self = this;
	this.target = document.getElementById(id);
	this.callbackFunction = function(){
		self.listenerCallback.apply(self, arguments);
	};
	if (window.addEventListener) {
		window.addEventListener("message", this.callbackFunction, false);
	} else {
		window.attachEvent("onmessage", this.callbackFunction);
	}
}
PMCallerType.prototype.ajax = function(options){
	this.options = options;
	this.request = JSON.stringify(options);
	this.target.contentWindow.postMessage(this.request, this.target.src);
};
PMCallerType.prototype.listenerCallback = function(event){
	var eventData;
	try {
		eventData = JSON.parse(event.data);
	} 
	catch (ex) {}
	if(eventData && eventData.request == this.request){
		if(this.options[eventData.callbackName]){
			this.options[eventData.callbackName].apply({}, eventData.callbackArgs);
		}
		if(eventData.callbackName == "complete"){
			delete this.request;
			delete this.options;
			delete this.target;
			if (window.removeEventListener) {
				window.removeEventListener("message", this.callbackFunction, false);
			} else {
				window.detachEvent("onmessage", this.callbackFunction);
			}
			delete this.callbackFunction;
		}
	}
};

function appendLoader(options){
	options = options || {};
	removeLoader();
	appendTo = options.appendTo || document.body;
	var elLoader = $.tmpl('<div class="loader" id="loader"><div class="l_background"></div><div class="l_shadow"></div><div class="l_arrows"></div><div class="content">{{html text}}</div></div>', options)[0];
	var elArrows = $('.l_arrows', elLoader)[0];
	if(options.className) {
		$(elLoader).addClass(options.className);
	}
	var pos = 0;
	$(appendTo).append(elLoader);
	rotate();
	function rotate(){
		if (elArrows) {
			if (pos == -684) {
				pos = 0;
			} else {
				pos -= 76;
			}
			elArrows.style.backgroundPosition = pos + "px";
			setTimeout(arguments.callee, 100);
		}
	}
}
function removeLoader(){
	$("#loader").remove();
}

/**
 * При переключении radio, label получает/теряет классы: "checked" и "focus"
 */
$('input:radio').live('click', function(){
	if (this.form) {
		$(this.form[this.name]).each(function(){
			var radio = this;
			var labels = $.merge($(radio).parent("label"), $('label[for][for="' + radio.id + '"]'));
			if (radio.checked) $(labels).addClass("checked");
			else $(labels).removeClass("checked");
		});
	}
});
$('input:radio').live('focus', function(){ $.merge($(this).parent("label"), $('label[for][for="' + this.id + '"]')).addClass("focus"); });
$('input:radio').live('blur', function(){ $.merge($(this).parent("label"), $('label[for][for="' + this.id + '"]')).removeClass("focus"); });

function setLogo(){
	var hours = new Date().getHours();
	if(hours > 20 || hours < 7) {
		$('#logo img').attr('src','../images/logo_night.png'/*tpa=http://www.onetwotrip.com/images/logo_night.png*/);
	}
}
function setBackground(){
	var bg_cookie = readCookie("bg_color");
	if(bg_cookie){
		$('body').attr('class',bg_cookie);
	} else {
		$('body').addClass('gray');
	}	
}
function initBackgroundSelect(){
	var self=this;
	$('#layout_body').append('<div id="ChooseBG"><ul><li class="gray"><div class="bg_style"></div><div class="bg_zoom invisible"></div></li><li class="aluminium"><div class="bg_style"></div><div class="bg_zoom invisible"></div></li><li class="wood2"><div class="bg_style"></div><div class="bg_zoom invisible"></div></li></ul></div>');
	this.block = $('#ChooseBG')[0];
	var bg_cookie = readCookie("bg_color");
	if(bg_cookie){
		$('li[class*="'+bg_cookie+'"] div.bg_style',this.block).addClass('selected');
	} else {
		$('li[class*="gray"] div.bg_style',this.block).addClass('selected');
	}
	this.show = false;
	$(this.block).bind('mouseenter mouseover',function(){
		if(!self.show) {
			$(this).animate({right: 0},300, function(){self.show= true; $('.bg_style',self.block).addClass('pointer');});
		}
	});
	$(this.block).bind('mouseleave',function(){
		if (self.show) {
			$(this).animate({right: -26},300,function(){self.show= false; $('.bg_style',self.block).removeClass('pointer');});
		}
	});
	$(this.block).delegate('div','click', function(e) {
		if(self.show){
			$(this).parents('#ChooseBG').find('.selected').removeClass('selected');
			var li =$(this).parents('li')[0];
			$(this).addClass('selected');
			var BGclass = $(li).attr('class');
			$('.bg_zoom',li).removeClass('invisible')
			.animate({
				right: 50,
				top: -200,
				width: 150,
				height: 150
			},500).animate({
				right: 100,
				top: -400,
				width: 300,
				height: 300,
				opacity: 0
			},300, function(){
				$(this).addClass('invisible').css({
					opacity:1,
					width:32,
					height:32,
					top:0,
					right:0
				});
				$('body').attr('class',BGclass);
				setCookie({
					name: "bg_color",
					value: BGclass,
					days: 360
				});
			});
		}
	});
}

/*Fade*/
function fadeInBlock(el, callback){
	$(el).removeClass('invisible');
	if (IEVersion < 9) {
		$(el).css({
			"display":"block"
		});
		try {callback();} catch (e) {}		
	} else {
		$(el).fadeIn(300, function(){
			try {callback();} catch (e) {}
		});
	}	
}
function fadeOutBlock(el, callback){
	if (IEVersion < 9) {
		$(el).css({
			"display":"none"
		});
		try {callback();} catch (e) {}
	} else {
		$(el).fadeOut(300, function(){
			try {callback();} catch (e) {}
		});	
	}	
}
function fadeIn(options){
	options = options || {};
	var div = document.getElementById("fadeBlock");
	if (!div) {
		div = document.createElement('div');
		div.id = "fadeBlock";
		if (options.opacity) {
			$(div).css({
				"opacity": opacity,
				"filter": "alpha(opacity=" + opacity * 100 + ")"
			});
		}
		document.body.appendChild(div);
	}
	div.className = options.className || "";
	$(div).show();
	return div;
}
function fadeOut() {
	$('#fadeBlock').remove();
}
var simpleCloseButton = '<button type="button" onclick="removePopup();"><div class="button small green">'+l10n.popup.close+'<div class="bg"></div></div></button>';
function addPopup(options){
	options = options || {};
	appendTo = options.appendTo || document.body;
	$('.popup').remove();
	fadeIn();
	var elPopup = $.tmpl('tmpl_Popup', options)[0];
	if(options.dom){
		var divDom = document.createElement('div');
		if(options.domClass){
			$(divDom).addClass(options.domClass);
		}
		$(divDom).prependTo(elPopup).append(options.dom);
	}
	var height = $(elPopup).height();
	if(options.className) {
		$(elPopup).addClass(options.className);
	}	
	appendTo.appendChild(elPopup);
	if (height === 0) {
		setHeight();
	}
	setPosition();
	show();
	function setHeight(){
		elPopup.style.height = elPopup.offsetHeight + "px";
	}
	function setPosition(){
		if((elPopup.offsetHeight + 40) > document.documentElement.clientHeight){
			elPopup.style.position = "absolute";
			elPopup.style.bottom = "auto";
			elPopup.style.top = (document.documentElement.scrollTop + document.body.scrollTop + 20) + "px";
		} else {
			elPopup.style.position = "fixed";
		}
	}
	function show(){
		elPopup.style.visibility = "visible";
	}
	$(elPopup).resize(function(){
		setPosition();
	});
	$('.close_button',elPopup).click(function(){
		removePopup();
	});	
	return elPopup;
}
function removePopup(el){
	fadeOut();
	el = el||$('.popup');
	$(el).remove();
}
function showPopup(el){
	fadeIn();
	el = el||$('.popup');
	$(el).removeClass('invisible');
}
function hidePopup(){
	fadeOut();
	var el = el||$('.popup');
	$(el).addClass('invisible');
}

/* ToolTip by AK */
$.fn.tooltip = function(options) {
	var defaults = {
		showBody: "| ", // line breaker
		contentId: false,  // container identifier (overrides title content)
		rounded: true
	}, settings = $.extend(defaults, options);
	if(!settings.padding) {
		settings.padding = 10;
	}
	var WindowHeight = (window.innerHeight) ? window.innerHeight : document.body.clientHeight;
	var WindowWidth = (window.innerWidth) ? window.innerWidth : document.body.clientWidth;	
	$(window).resize(function() {
		ScreenSize();
	});
	function ScreenSize() {
		WindowHeight = (window.innerHeight) ? window.innerHeight : document.body.clientHeight;
		WindowWidth = (window.innerWidth) ? window.innerWidth : document.body.clientWidth;
		$('#win').html(' width: ' + WindowWidth + '   height: ' + WindowHeight);
	}	
	this.each(function() {
		var $this = $(this);
		var title;
		if (settings.contentId) {
			title = $("#"+settings.contentId).html();
		} else {
			title = this.title;
		}
		if (title === '') {
			return;
		}
		this.title = '';			
		if (settings.showBody) {
			var parts = title.split(settings.showBody);
			temp = '';
			for (i = 0, partsLength = parts.length; i < partsLength; i++) {
				temp += parts[i];
				if (i + 1 < partsLength) {
					temp += '<br/>';
				}
			}
			title = temp;
		}			
		$this.hover(function(e) {
			//mouse over
			$('#tooltip').remove();
			$('<div id="tooltip" />').appendTo('body').hide().addClass('TitleStyle').html(title).css({
				"top": e.pageY + 10,
				"left": e.pageX + 15
			}).fadeIn(150);
			
			if (settings.rounded) {
				$('#tooltip').css({
					"-webkit-border-radius": "10px",
					"-moz-border-radius": "10px",
					"border-radius": "10px"
				});
			}
		}, function() {
			// mouse out  
			$('#tooltip').remove();
		});
		
		$this.mousemove(function(e) {
			var $ttip = $('#tooltip');
			titleHeight = $ttip.height() + 2 * settings.padding;
			titleWidth = $ttip.width() + 2 * settings.padding;
			focusTop = e.pageY + 10;
			focusLeft = e.pageX + 15;
			if (WindowHeight - e.clientY - titleHeight < 10) {
				focusTop = e.pageY - titleHeight;
			}
			if (WindowWidth - e.clientX < titleWidth + 40) {
				focusLeft = e.pageX - titleWidth;
			}
			
			$('#tooltip').css({
				top: focusTop,
				left: focusLeft
			});
		});
		
	});
	return this;
};
function openWindow(options){
	if (!options.width) options.width = screen.availWidth - 100;
	if (!options.height) options.height = screen.availHeight - 100;
	params = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=' + options.width + ',height=' + options.height;
	win = window.open(options.url, options.name, params);
	win.focus();
}
function setSortCountriesArray(){
	ref.arrCountries = [];
	for (var c in ref.Countries) {
		ref.Countries[c].code = c;
		if (ref.Countries[c].citizenship) ref.arrCountries.push(ref.Countries[c]);
	}
	ref.arrCountries.sort(function(a, b){
		if (a.Name > b.Name) return 1;
		if (a.Name < b.Name) return -1;
		return 0;
	});
}
function createCountrySelect(){
	var elSelect = document.createElement("select");
	for (var i = 0, length = ref.arrCountries.length; i < length; i++) {
		var country = ref.arrCountries[i];
		var elOption = document.createElement("option");
			elOption.innerHTML = country.Name;
			elOption.value = country.code;
		elSelect.appendChild(elOption);
	}
	return elSelect;
}
function CountrySelect(options){
	var self = this;
	this.options = options || {};
	this.changed = false;
	this.elLink = document.createElement("span");
	this.elLink.className = "link dashed";
	$(this.elLink).appendTo(this.options.appendTo);
	this.elSelect = createCountrySelect();
	this.getValue();
	$(this.elSelect).bind("keydown keypress keyup change", function(event){
		if (event.type == "change") {
			self.setValue();
		}
	});
	$(this.elSelect).appendTo(this.options.appendTo);
	return this.elSelect;
}
CountrySelect.prototype.getValue = function(){
	var self = this;
	if (this.options.value) {
		this.elSelect.value = this.options.value;
		this.setValue();
	} else if (tw.position) {
		onGetPosition();
	} else {
		$(document).one("getPosition", function(){
			onGetPosition();
		});
		this.setValue();
		this.changed = false;
	}
	function onGetPosition(){
		if (tw.position.countryCode && !self.changed) {
			if (ref.Countries[tw.position.countryCode]) {
				self.elSelect.value = tw.position.countryCode;
			}
			self.setValue();
		}
	}
};
CountrySelect.prototype.setValue = function(){
	var self = this;
	this.changed = true;
	if(this.elSelect.selectedIndex<0) { //chrome + if not in country list (visalist)
		$(this.options.appendTo).parent().remove()
		return;
	}
	var str = this.elSelect.options[this.elSelect.selectedIndex].text;
	this.elLink.innerHTML = str;
	this.title = str;
	if(this.options.onChange){
		this.options.onChange(this);
	}
};
function convertCurrency(num, curFrom, curTo){
	if (!curTo) var curTo = tw.currency;
	return (curFrom == curTo) ? num : num * tw.currencyRates[curFrom + '' + curTo];
}
/**
*	Для языков отличных от русского вместо rub., будет: RUB (Russian rubles)
*/
function getCurrencyFullRUBAbbr(cur) {
	if (l10n.currency[cur].Full){
		return cur + ' (' + l10n.currency[cur].Full + ')';
	} else {
		return l10n.currency[cur].Abbr;
	}
}
function CurrencyString(num, cur){
	if (!cur) var cur = tw.currency;
	num += '';
	var text = "";
	if (num.length == 1) {
		num = "0" + num;
	}
	var last = parseInt(num.substr(num.length - 1, 1), 10);
	var prelast = parseInt(num.substr(num.length - 2, 1), 10);
	if (last == 1) {
		text = l10n.currency[cur].Nominative;
	} else if (0 < last && last < 5) {
		text = l10n.currency[cur].Genitive;
	} else {
		text = l10n.currency[cur].Genitive_Plural;
	}
	if (prelast == 1 && last == 1) {
		text = l10n.currency[cur].Genitive_Plural;
	}
	return text;
}

function initLanguage(){
	var self = this;
	var $block = $('#languageSelect');
	if (!$block[0]) return;
	$.tmpl($("#tmpl_LanguagesSelect").trim()).appendTo( $block );
	var $list = $('ul',$block);
	this.visible = false;

	if(window.location.hostname.indexOf("onetwotrip") >-1){
		var $spain = $('li[data-language="es"]',$list);
		$spain.remove();
	}
	$('.dm_selected', $block).on('click', function(){
		if(self.visible) {
			$list.fadeOut(function(){
				self.visible = false;
			});
		} else {
			$list.fadeIn(function(){
				self.visible = true;
			});
		}
	});
	$(document.body).on('click', function(e){
		if(!$(e.target).parent().is("#languageSelect") && self.visible){
			$list.fadeOut(function(){
				self.visible = false;
			});
		}
	});
	$('li', $list).on('click', function(){
		$list.hide();
		self.visible = false;
		setCookie({
			name: "accept_language",
			value: $(this).data('language'),
			days: 360,
			xdm: true
		});
		$(document.body).trigger("removeUnloadReservation");
		document.location.reload();
	});
}
function initTopMenu(){
	var self = this;
	var $block = $('#subMenu');
	if (!$block[0]) return;

	//hotels
		var lan = (tw.language=="ua")?"uk":tw.language;
		var cur = (tw.currency=="UAH"||tw.currency=="AZN")?"EUR":tw.currency;
		var addParams =  "&lang=" + lan + "&selected_currency=" + cur;	
		var bookingHref = "http://www.booking.com/?aid=358564&label=Onetwotrip-Navtab" + addParams;
		$('#m_booking_link').attr('href', bookingHref).on('click', function(){
			kmqRecord({name: 'hotel_bookingCom', obj: {"initOnPage": 'Navtab'} });
		});
		$(document).on('visitormanager_complete', function(event) {
            return;
			if(tw.visitor.lead){
				bookingHref = 'http://www.booking.com/?aid=358564&label=Onetwotrip-Navtab-LID-'+tw.visitor.lead + addParams;
				$('#m_booking_link').attr('href', bookingHref);
			}
		});
	/*initAbout();
	$('#about').click(function(){
		popup_about = addPopup({
			className: "About",
			dom: $.tmpl($("#tmpl_About").trim()),
			domClass: 'text',
			close_button: true
		});
		$('#temp_about').css({'background': 'url(/l10n/' +tw.language+ '/images/about/2.png)'});
	});*/
	$.tmpl($("#tmpl_subMenu").trim()).appendTo( $block );
	var $list = $('ul',$block);
	this.visible = false;

	$('.dm_selected', $block).on('click', function(){
		if(self.visible) {
			$list.fadeOut(function(){
				self.visible = false;
			});
		} else {
			$list.fadeIn(function(){
				self.visible = true;
			});
		}
	});
	$(document.body).on('click', function(e){
		if(!$(e.target).parent().is("#subMenu") && self.visible){
			$list.fadeOut(function(){
				self.visible = false;
			});
		}
	});
	$('li', $list).on('click', function(){
		$list.hide();
		self.visible = false;
	});
	$('#open_faq', $list).on('click', function(){
		try{showFAQ();} catch(exp){}
	});
	$('#contacts', $list).on('click', function(){
		showContacts();
	});
}
function initAbout(){
	$('#carousel_container #right_scroll').live('click',function(){
		var item = $('#carousel_inner')[0];
		var cl = parseInt($(item).attr('class').split('_')[1],10)+1;
		item.className = "img_" + cl;
		if(cl != 6) {
			$('#carousel_container .left').removeClass('invisible');
			$('#carousel_container .right').removeClass('movetop');
		}
		if(cl ==7 ){
			$('#carousel_container .right').addClass('invisible');
		}
		if(cl<6) {
			$('#temp_about').css({'background': 'url(/l10n/' +tw.language+ '/images/about/'+parseInt(cl+1,10)+'.png)'});
		}
		if(cl==6) {
			$('#temp_about').css({'background': 'url(/l10n/' +tw.language+ '/images/about/7.jpg)'});
		}
	});	
	$('#carousel_container #left_scroll').live('click',function(){
		var item = $('#carousel_inner')[0];
		var cl = parseInt($(item).attr('class').split('_')[1],10)-1;
		item.className = "img_" + cl;
		if(cl == 1) {
			$('#carousel_container .left').addClass('invisible');
			$('#carousel_container .right').addClass('movetop');
		}
		if(cl !=7 ){
			$('#carousel_container .right').removeClass('invisible');
		}
	});
}
function reverse(Text){
	splitext = Text.split("");
	revertext = splitext.reverse();
	reversed = revertext.join("");
	return reversed;
}		
function showContacts(){
	removePopup();
	var contactPopup = addPopup({
		className: "Contacts",
		dom: $.tmpl($("#tmpl_Contacts").trim()),
		domClass: 'c_info',
		close_button: true
	});
	var mail = document.createElement("a");
	mail.href = "#";
	mail.title = l10n.topMenu.contacts.write;
	eHost='onetwotrip';
	var ePref = 'ma';
	ePref += 'il';
	ePref += 'to';
	var eHostE1=('copyright' + '@' + eHost);
	var eHostE2=('media' + '@' + eHost);
	var eHostE3=('info' + '@' + eHost);
	var eHostE4=('adv' + '@' + eHost);
	var eHostE5=('b2b' + '@' + eHost);

	var domain = '.com';
	if(tw.position.countryCode == "AZ"){
		domain = '.az';
	}
	var copyText = reverse(eHostE1+domain);
	var mediaText = reverse(eHostE2+domain);
	var infoText = reverse(eHostE3+domain);
	var advText = reverse(eHostE4+domain);
	var partnerText = reverse(eHostE5+domain);
	var copyMail = $(mail).clone();
	var mediaMail = $(mail).clone();
	var infoMail = $(mail).clone();
	var advMail = $(mail).clone();
	var partnerMail = $(mail).clone();
	$('#email1').html( $(copyMail).html(copyText).attr('data-host', eHostE1) );
	$('#email2').html( $(mediaMail).html(mediaText).attr('data-host', eHostE2) );
	$('#email3').html( $(infoMail).html(infoText).attr('data-host', eHostE3) );
	$('#email4').html( $(advMail).html(advText).attr('data-host', eHostE4) );
	$('#email5').html( $(partnerMail).html(partnerText).attr('data-host', eHostE5) );

	$('.Contacts .email a').on('mouseover', function(){
		var mTo = $(this).attr('data-host')+domain;
		$(this).attr("href",ePref+':'+mTo);
		if (browser.msie) {
			$(this).html(reverse(mTo));
			$(this).attr("style", "unicode-bidi:bidi-override; direction: rtl");
		}
	});
	$('.online_call', contactPopup).click(function(){
		var newwindow = window.open('http://zingaya.com/widget/6e1655b5a3cc6179bf39245898984ab1'+'?referrer='+escape(window.location.href), 'zingaya', 'width=236,height=220,resizable=no,toolbar=no,menubar=no,location=no,status=no');
		setTimeout(function(){
			newwindow.focus();
		},500)
	});
}

function initTagPrice() {
	var tagPrice = $('.tag_price');
	if( tagPrice.length>0 ){
		var big = $('.tag_big')[0];
		var small = $('.tag_small')[0];
		$('.tag_close .w', big).html(l10n.tagPrice.close);
		$('.header', big).html(l10n.tagPrice.header);
		$('.info', big).html(l10n.tagPrice.info);

		if(!readCookie("SFki")){
			$(big).removeClass('invisible');
		} else {
			$(small).removeClass('invisible');
		}
		$('a',small).click(function(){
			$(small).addClass('invisible');
			$(big).removeClass('invisible');
			deleteCookie({
				name: 'SFki'
			});
		});
		$('.tag_close',big).click(function(){
			$(big).addClass('invisible');
			$(small).removeClass('invisible');
			setCookie({
				name: "SFki",
				value: 1,
				days: 180
			});
		});
		$(document.body).bind("mapShow", function(){
			$(small).removeClass('invisible');
		});
		$(document.body).bind("changeRequest", function(){
			$(small).addClass('invisible');
			$(big).addClass('invisible');
		});
	}
}

function clearExtraElements(){
	try{
		$('.hint').remove();
		$('#tooltip').remove();
		removeInfoBaloon();
	} catch(e){}	
}
function testLocalHost(host){
    return true;
	var host = host || window.location.host;
	var re = /onetwotrip\.(az|ua|de|ch|at)$/i;
	return re.test(host);
}
function getFranchiseHost(host){
	var host = host || window.location.host;
	var re = /onetwotrip\.(az|ua|de|ch|at)$/i;
	if (re.test(host)) {
		return re.exec(host)[0];
	} else {
		return false;
	}
}
function getSecureHost(){
    return "www.onetwotrip.com/js/secure.onetwotrip.com";
	var host = window.location.host;
	if (host.indexOf("www.onetwotrip.") > -1) {
		return "http://www.onetwotrip.com/js/secure.onetwotrip.com";
	} else {
		return host;
	}
}

function kmqRecord(options){
	var options = options||{};
	options.obj = options.obj||{};
	if(options.prefix){
		for(var i in options.obj){
			options.obj[options.prefix+'_'+i] = options.obj[i];
			delete options.obj[i];
		}
	}
	if(options.text && options.url){
		var text = '';
		if(options.text) {
			text+= options.text;
		}
		if(options.url) {
			text+= '  ' + options.url;
		}
		options.obj.EventInfo = text;
	}
	options.obj['EventHour'] = new Date().getUTCHours()+3;
	_kmq.push(['record', options.name, options.obj]);
}
function kmqRouteType(route){
	var fType = "multiway";
	if(route.length == 10){
		fType = "oneway";
	} else if(route.length == 14) {
		fType = "round";
	}
	return fType;
}

/*1-2pages*/
function removeInfoBaloon(){
	try{
		var infoBlock = $('.stars_baloon');
		fadeOutBlock(infoBlock,function(){ $(infoBlock).remove() })
		infoBaloonHidden = true;
	} catch(e){}
}
function ShowAircraftYears(num){
	var t ='';
	if(num==1) {
		t= l10n.searchResult.baloon.aircraftyears[0];
	} else if(num>1 && num <5) {
		t= l10n.searchResult.baloon.aircraftyears[1];
	} else {
		t= l10n.searchResult.baloon.aircraftyears[2];
	}
	return num+' '+t+' '+l10n.searchResult.baloon.aircraft;
}
function MakeDateFlightInfo(DirDate){
	var curDate = DirDate;
	var formText = '{day} {month}';
	if(tw.language == 'az'){
		formText = '{month} {day}';
	}
	if (isValidDate(curDate)) {
		return formText.replaceByHash({day: curDate.getDate(),  month: l10n.calendar.months_D[curDate.getMonth()].toLowerCase()});
	} else {
		curDate = new Date.parseAPI(DirDate);
		if(isValidDate(curDate)){
			return formText.replaceByHash({day: curDate.getDate(),  month: l10n.calendar.months_D[curDate.getMonth()].toLowerCase()});
		} else {
			return "";
		}		
	}
}
function initAdriverBlock(options){
	if(options && options.id && document.getElementById(options.id) && (options.pz || options.bn) && window.adriver && (tw.language == 'ru' || tw.checkAdriver)) {
		var elAdriverBlock = document.getElementById(options.id);
		var prevBanner = elAdriverBlock.lastChild;
		if (prevBanner && prevBanner.offsetHeight == 0) return;
		var newBanner = document.createElement('div');
		bannerId = 'rotation_partner_'+ new Date().valueOf();
		newBanner.id = bannerId;
		var obj = { sid: 184643, bt: 52 };
		for (var i in options) {
			obj[i] = options[i];
		}
		if (prevBanner) {
			var prevHeight = prevBanner.offsetHeight;
			elAdriverBlock.style.height = prevHeight + 'px';
			$(prevBanner).css({
				'position': 'absolute',
				'margin': '0 auto',
				'top': '0',
				'left': '0',
				'right': '0'
			});
		}

		$('#'+obj.id).append(newBanner);
		new adriver(bannerId, obj);

		var removePrevBunner = function(){
			if ($('#' + bannerId).find('img').length > 0) {
				$(prevBanner).remove();
			} else {
				setTimeout(arguments.callee, 250);
			}
		}
		if (prevBanner) removePrevBunner();

		if(options.bn == 2 || options.pz == 5 || options.bn == 6){
			var AdriverBlockInterval = setInterval(function(){
				if($('#'+bannerId).find('img').length >0) {
					initFuncAfterLoad();
				}
			}, 100);
			function initFuncAfterLoad(){
				clearInterval(AdriverBlockInterval);
				//move calendar
				if (typeof objSearchForm != 'undefined' && objSearchForm.calendar && objSearchForm.calendar.elCalendar.offsetHeight > 0) {
					objSearchForm.calendar.setOffset();
				}
				var firstPoint = $('#from0')[0];
				if(firstPoint && $(firstPoint).is(':focus')){
					$(firstPoint).blur();
					setTimeout(function(){
						$(firstPoint).focus();
					},500);
				}
			}
		}
	}
}
function cacheAirportInfo(code, data) {
	var date = new Date(),
			  dateStamp = date.format('ddmmyyyy');
	tw.AirportInfoCache = tw.AirportInfoCache ? tw.AirportInfoCache : {};
	tw.AirportInfoCache[dateStamp] = tw.AirportInfoCache[dateStamp] ? tw.AirportInfoCache[dateStamp] : {};
	tw.AirportInfoCache[dateStamp][code] = tw.AirportInfoCache[dateStamp][code] ? tw.AirportInfoCache[dateStamp][code] : data;
}
function getAirportInfoFromCache(code) {
	var date = new Date(),
			  dateStamp = date.format('ddmmyyyy'),
			  data = null;
	if (tw.AirportInfoCache && tw.AirportInfoCache[dateStamp] && tw.AirportInfoCache[dateStamp][code]) {
		data = tw.AirportInfoCache[dateStamp][code];
	}
	return data;
}
function calculateAirportTime(data) {
	var now = new Date(),
			  date = null,
			  curDiff;
	if(data.localTime){
		date = new Date(data.localTime.valueOf() + now.valueOf() - data.dateAtMoment.valueOf());
	}
	else if (data.gmt) {
		date = new Date();
		curDiff = now.getTimezoneOffset();
		date.setMinutes(now.getMinutes() + curDiff + data.gmt);
	}
	return date;
}
function parseAirportContentTemplate(data) {
	var content,
			   templateId = 'tmpl_AirportTooltipContent';
	// Скомпилируем шаблон только если он не был скомпилирован до этого.
	if (!$.template[templateId]) {
		$.template(templateId, $('#' + templateId).trim());
	}
	if(!data.fullUrl){
		data.fullUrl = data.site ? data.site : '';
		data.shortUrl = data.site ? data.site.replace('http://', '').replace(/^www\./, '').replace(/\/$/, '') : '';
	}
	data.airportTime = calculateAirportTime(data);
	content = $('<div></div>').append($.tmpl(templateId, data));
	return content.html();
}
function adjustAirportBaloonPosition($airport, $baloon) {
	var airportOffset = $airport.offset(),
			  airportWidth = $airport.width(),
			  leftExtra = Math.round(airportWidth / 2) - 27,
			  top = airportOffset.top - $baloon.height() - 10;
	$baloon.css({
		left: airportOffset.left + leftExtra,
		top: top,
		position: 'absolute'
	});
	if (top < $(window).scrollTop() + 10) {
		$baloon.addClass('bottom').css({top: airportOffset.top + 42});
	}
}
function fetchAirportContent($airport, $baloon) {
	var code = $airport.data('code'),
			  // Поищем данные об аэропорте в кэше
			  data = getAirportInfoFromCache(code),
			  content;
	// Если данные уже получены, возвратим их
	if (data) {
		content = parseAirportContentTemplate(data);
	}
	// Если данных ещё нет, сделаем запрос
	else {
		$.ajax({
			dataType: "jsonp",
			data: {
				iata: code
			},
			url: "https://secure.onetwotrip.com/_api/flightstats/portinfo/",
			timeout: 40000,
			cache: false,
			success: function(json){
				var content,
						  data,
						  localTime;
				// Всё ок
				if(!json.error && !json.err) {
					localTime = new Date(Date.parseISO8601(json.localTime));
					data = {
						temperature: json.temperature,
                        site: json.site,
						city: ref.getCityName(json.city),
						lat: json.lat,
						lon: json.lon,
						phone: json.phone,
						gmt: json.gmt,
						localTime: isValidDate(localTime) ? localTime : null,
						dateAtMoment: new Date()
					};
					// Сохраним сайт, температуру, широту и долготу, и всё остальное
					cacheAirportInfo(code, data);

					content = parseAirportContentTemplate(data);
				}
				// Ошибка
				else {
					content = '<div>' + l10n.searchResult.baloon.unableToGetAirportInfo + '</div>';
				}
				// Заменим контент
				$baloon.find('.content').html(content);
				// Обновим смещение top, потому что высота тултипа могла измениться, когда появился контент.
				adjustAirportBaloonPosition($airport, $baloon);
			},
			complete: function() {
				$baloon.find('.smallLoader').remove();
			},
			error: function() {
				content = '<div>' + l10n.popup.problem + '</div>';
				$baloon.find('.content').html(content);
				adjustAirportBaloonPosition($airport, $baloon);
			}
		});
		// Пока выполняется запрос, возвратим крутилку
		content = '<span class="smallLoader"></span>';
	}
	return content;
}
function showAirportBaloon($airport) {
	var code = $airport.data('code'),
				content,
				$baloon,
				template = $("#tmpl_AirportTooltip");

	removeInfoBaloon();

	$.template('tmpl_AirportTooltip', template.trim());
	$baloon = $.tmpl('tmpl_AirportTooltip', {});
	$baloon.appendTo('body');

	// Получим данные аэропорта
	content = fetchAirportContent($airport, $baloon);
	$baloon.find('.content').html(content);

	// Определим позицию тултипа
	adjustAirportBaloonPosition($airport, $baloon);

	fadeInBlock($baloon[0]);
	infoBaloonHidden = false;
	kmqRecord({name: 'show_airport_info'});
}
function MakeAirportTooltips() {
	$('.airport').live('mouseenter click',function(e){
		var $airport = $(this),
				  code = $airport.data('code');

		if (e.type == "click") {
			if (infoBaloonHidden) {
				try {
					showAirportBaloon($airport);
					infoBaloonHidden = false;
				} catch(e) {}
			}
		} else {
			setTimeout(function() {
				if (infoBaloonHidden) {
					var $mouseTarget = $(mouseEvent.target);
					if (($mouseTarget.hasClass('airport') && $mouseTarget.data('code') == code)
							  || ($mouseTarget.closest('.airport').length && $mouseTarget.closest('.airport').data('code') == code)) {
						try {
							showAirportBaloon($airport);
						} catch(e) {}
					}
				}
			}, 300);
		}
	});
}

function WelcomeBonusText(el){
	var welcomeBonus = '1&thinsp;000';
	switch (tw.bonus.currency) {
		case "EUR":
			welcomeBonus = 25;
			break;
		case "USD":
			welcomeBonus = 30;
			break;
		case "UAH":
			welcomeBonus = 260;
			break;
		case "AZN":
			welcomeBonus = 25;
			break;
	}
	var text = '<span class="strong">' + welcomeBonus + ' ' + l10n.makeorder.bonus.welcome[1] + ' ≈ </span>';
	text += '<span class="strong">'+ welcomeBonus + ' ' + l10n.currency[tw.bonus.currency].Abbr + '</span>';
	text = '<span class="nowrap">' + text + '</span>';
	el.innerHTML += '<div>' + l10n.makeorder.bonus.welcome[0] + ' ' + text + '</div>';
}

function ShadingIn(id){
    id = 'shading-' + id;
    var div = document.getElementById(id);
    if (!div) {
        div = document.createElement('div');
        div.id = id;
        document.body.appendChild(div);
    }
    div.className = 'shading';
    $(div).show();
    return div;
}

function ShadingOut(id){
    id = 'shading-' + id;
    $('#' + id).remove();
}