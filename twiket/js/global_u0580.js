try { top.location.toString(); } catch (er) { top.location = location; }
window.tw = window.tw || {};
tw.currency = readCookie("currency") || "RUB";
if(tw.language == "az" && (tw.currency == "RUB" ||  tw.currency == "UAH")) {
	tw.currency = 'AZN';
} else if (tw.language == "ua" && (tw.currency == "RUB" ||  tw.currency == "AZN")) {
	tw.currency = 'UAH';
} else if (tw.language == "ru" && (tw.currency == 'AZN' || tw.currency == 'UAH')) {
	tw.currency = 'RUB';
} else if ((tw.language == "de" || tw.language == "es") && tw.currency != "EUR"  && tw.currency != "USD") {
	tw.currency = 'EUR';
} else if (tw.language == "en" && tw.currency != "EUR"  && tw.currency != "USD") {
	tw.currency = 'USD';
}
tw.params = getURLParams();
tw.refData = {};
if(parseFloat($().jquery,10) <1.7){
	/*WebKit issues with event.layerX and event.layerY*/
	$.event.props = $.event.props.join('|').replace('layerX|layerY|', '').split('|');
}
function log(data){ if (window.console) {console.log(data);}}
function warn(data){ if (window.console) {console.warn(data);}}
function error(data){ if (window.console) {console.error(data);}}
function inherits(Child, Parent){
	var F = function(){};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.parent = Parent.prototype;
}
$.fn.trim = function(){
	var s = $(this).html();
	s = s.replace(/\n\t\s*/g,"").replace(/^\s*/, "").replace(/\s{2,}/g, " ").replace(/> </g, "><"); 
	return s;
};
function trim(text) { return (text || '').replace(/^\s+|\s+$/g, ''); }
var _ua = navigator.userAgent.toLowerCase();
var browser = {
  version: (_ua.match( /.+(?:me|ox|on|rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: /opera/i.test(_ua),
  msie: (/msie/i.test(_ua) && !/opera/i.test(_ua)),
  msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
  msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
  msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
  msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
  mozilla: /firefox/i.test(_ua),
  chrome: /chrome/i.test(_ua),
  safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
  iphone: /iphone/i.test(_ua),
  ipad: /ipad/i.test(_ua),
  mobile: /midp|blackberry|netfront|nokia|panasonic|portalmmm|sharp|sie-|sonyericsson|symbian|windows ce|benq|mda|mot-|opera mini|opera mobi|philips|pocket pc|sagem|samsung|sda|sgh-|vodafone|xda|palm|iphone|ipod|ipad|android/i.test(_ua),
  mac: /mac/i.test(_ua)
};
if (/msie (\d+\.\d+);/.test(_ua)) var IEVersion = new Number(RegExp.$1);
if (/gecko\//.test(_ua)) { var TempArr = _ua.match(/rv:(\d+)\.(\d+)(?:\.(\d+))?/);	if(TempArr){ var GeckoVersion = parseFloat(TempArr[1] + "." + TempArr.slice(2).join(''));} else {var GeckoVersion = 1.9}; TempArr = null;};
if (/applewebkit\/(\d+\.\d+?)/.test(_ua)) var WebKitVersion = new Number(RegExp.$1);
if (/opera[\/\s](\d+\.\d+)/.test(_ua)) var OperaVersion = opera.version();
//if (/chrome[\/\s](\d+\.\d+)/.test(_ua)) var ChromeVersion = new Number(RegExp.$1);
if (/firefox[\/\s](\d+\.\d+)/.test(_ua)) var FirefoxVersion = new Number(RegExp.$1);
if (IEVersion < 8 || !JSON || GeckoVersion < 1.91 || WebKitVersion < 528.18 || FirefoxVersion < 3.5) {
	location.href = 'http://www.onetwotrip.com/misfortune/';
}
tw.fr_cookie = readCookie("franchise_id")||window.location.hostname;
tw.franchise = {
	"de":(tw.fr_cookie == 'http://www.onetwotrip.com/js/www.onetwotrip.de'),
	"az":(tw.fr_cookie == 'http://www.onetwotrip.com/js/www.onetwotrip.az'),
	"ua":(tw.fr_cookie == 'http://www.onetwotrip.com/js/www.onetwotrip.ua'),
	"es":(tw.fr_cookie == 'http://www.onetwotrip.com/js/www.onetwotrip.es')
}
if(!tw.franchise.de && !tw.franchise.az && !tw.franchise.ua){tw.franchise.com = true;}
for(var i in tw.franchise){if(tw.franchise[i]){tw.franchise.a = i;break;}}
if(document.location.host.indexOf('local')>-1){tw.franchise.local = true;}
delete tw.fr_cookie;
if(document.location.host.indexOf('local')>-1 || document.location.host.indexOf('twiket')>-1) {tw.checkAdriver = true;}
function getRandomArbitary(min, max){
	return Math.random() * (max - min) + min;
}
function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getURLParams() {
	var arrParams = (decodeURI(document.location.search)).substr(1).split('&');
	var objParams = {};
	if(arrParams[0]!=""){
		for(var i = 0, length = arrParams.length; i < length; i++){
			var p1,p2;
			if(arrParams[i].indexOf('=') > -1 ) {
				p1 = arrParams[i].substring(0, arrParams[i].indexOf('=') );
				p2 = arrParams[i].substring(arrParams[i].indexOf('=')+1, arrParams[i].length );
			} else {
				p1 = arrParams[i].substring(0, arrParams[i].length );
				p2 = null;
			}
			objParams[p1] = p2 === null ? true : p2;
		}
	}
	return objParams;
}
function formatMoney(money){
	var arr = String(money).split('.');
	var integerPart = arr[0];
	var fractionPart = arr.length > 1 ? '.' + arr[1] : '';
	
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(integerPart)) {
		var devider = '\u00A0';
		if(tw.language == 'de'){
			devider = '\u02BC';
		}
		integerPart = integerPart.replace(rgx, '$1' + devider + '$2');
	}
	return (integerPart + fractionPart);
}
function abortAjax(arrAjax) {
	try {
		for (oRequest in arrAjax) {
			if (arrAjax[oRequest].readyState !== 0 && arrAjax[oRequest].readyState != 4) arrAjax[oRequest].abort();
		}
	} catch (e) {}
}
function clearAjax(arrAjax) {
	try {
		for (oRequest in arrAjax) {
			if (arrAjax[oRequest].readyState === 0 || arrAjax[oRequest].readyState == 4)  delete arrAjax[oRequest];
		}
	} catch (e) {}
}
function checkAjaxError(xhr, options){
	if (xhr.readyState == 4 && xhr.status == 200 && (xhr.statusText && xhr.statusText != 'parsererror')) {
		return;
	}
	options = options || {};
	xhr.url = xhr.url || '';
	options.retryTime = options.retryTime||5000;
	if (options.repeats > 0) {
		options.repeats--;
		setTimeout(function(){
			try {
				options.RetryFunction();
			} 
			catch (e) {
			}
		}, options.retryTime);
	} else {
		if (xhr.readyState == 4) {
			switch (xhr.status) {
				//case 502:
				case 0:// no connection
					addPopup({
						error: true,
						reason: l10n.popup.noConnection,
						comment: l10n.popup.noConnectionComment,
						close_button: true,
						button: l10n.popup.close,
						actionButton: "removePopup();"
					});
					break;
				default://something wrong on server + timeout,504,404 etc
					if(!options.simpleRequest){
						addPopup({
							error: true,
							reason: l10n.popup.warning,
							comment: l10n.popup.serverText,
							close_button: true,
							button: l10n.popup.close,
							actionButton: "removePopup();"
						});
					}
					break;
			}
			switch (xhr.status) {
				case 500:
					kmqRecord({name: 'ERROR_500', url: xhr.url});
					break;
				case 403:
					kmqRecord({name: 'ERROR_403', url: xhr.url});
					break;
				case 502:
					kmqRecord({name: 'ERROR_502', url: xhr.url});
					break;
				default:
					kmqRecord({name: 'ERROR_OTHER', url: xhr.url, text: xhr.status});
					break;
			}
		} else {
			if (xhr.status === 0) {//setup timeout
				if (!options.simpleRequest) {
					addPopup({
						error: true,
						reason: l10n.popup.noConnection,
						comment: l10n.popup.noConnectionComment,
						close_button: true,
						button: l10n.popup.close,
						actionButton: "removePopup();"
					});
				}
				kmqRecord({name: 'ERROR_TIMEOUT', url: xhr.url, text: xhr.status + '  ajax setup timeout'})
			} else {//worstscenario
				if (options.backupRepeats) {
					options.repeats = 1;
					options.backupRepeats = false;
					setTimeout(function(){
						try {
							options.RetryFunction();
						} 
						catch (e) {
						}
					}, options.retryTime);
				} else {
					if (!options.simpleRequest) {
						addPopup({
							error: true,
							reason: l10n.popup.warning,
							comment: l10n.popup.serverText,
							close_button: true,
							button: l10n.popup.close,
							actionButton: "removePopup();"
						});
					}
				}
			}
		}
		if (!options.repeats || options.repeats < 1) {
			try {
				options.ErrorFunction();
			} 
			catch (e) {
			}
		}
	}
}
String.prototype.replaceByArray = function(arr){
	var str = this.valueOf();
	for(var i =0, AL = arr.length; i< AL; i++) {
		if (arr[i] instanceof Date) {
			str = str.replace(new RegExp('\\{'+i+'\\(([^\\}]+)\\)\\}', 'g'), function(substr){
				return arr[i].format1(substr.match(/\((.+)\)/)[1]);
			})
		} else {
			str = str.replace('{'+i+'}', arr[i]);
		}
	}
	return str;
};
String.prototype.replaceByHash = function(obj){
	var str = this.valueOf();
	for(var i in obj) {
		if (obj[i] instanceof Date) {
			str = str.replace(new RegExp('\\{'+i+'\\(([^\\}]+)\\)\\}', 'g'), function(substr){
				return obj[i].format1(substr.match(/\((.+)\)/)[1]);
			})
		} else {
			str = str.replace(new RegExp('{'+i+'}','g'),obj[i]);
		}
	}
	return str;
};
String.prototype.replaceBy = function(obj){
	if(obj instanceof Array) {
		return this.replaceByArray(obj);
	} else {
		return this.replaceByHash(obj);
	}
};
function makeCookie(name, value, days) {// На замену setCookie
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	}
	document.cookie = name + "=" + escape(value) + ((days) ? "; expires=" + date.toGMTString() : "") + "; path=/";
}
function setCookie(options){
	if (!options || options.name == null || options.value == null) {
		return;
	}
	var str = options.name + '=' + encodeURIComponent(options.value);
	if (options.days) {
		var date = new Date();
		date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
		str += '; expires=' + date.toGMTString();
	}
	if (options.path) {
		str += ';path=' + options.path;
	} else {
		str += ';path=/';
	}
	if (!options.domain && window.location.hostname.indexOf("http://www.onetwotrip.com/js/onetwotrip.com") > -1) {
		options.domain = "http://www.onetwotrip.com/js/onetwotrip.com";
	}
	if (options.domain) {
		str += ';domain=' + options.domain;
	}
	if (options.secure) {
		str += ';secure';
	}
	document.cookie = str;
	if (options.xdm && window.location.hostname.indexOf("http://www.onetwotrip.com/js/onetwotrip.com") == -1) {
		setPMCookie(options);
	}
}
function setPMCookie(options){
	iframe = document.getElementById('pm');
	if (!iframe) return;
	iframe.contentWindow.postMessage({
		type: 'cookie',
		options: options
	}, iframe.src);		
}
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			return unescape(c.substring(nameEQ.length, c.length));
		}
	}
	return null;
}
function deleteCookie(options) {
	if(!options || !options.name) {
		return;
	}
	var str = options.name + "=" + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	if (options.path) {
		str += ';path=' + options.path;
	} else {
		str += ';path=/';
	}
	if (!options.domain && window.location.hostname.indexOf("http://www.onetwotrip.com/js/onetwotrip.com") > -1) {
		options.domain = "http://www.onetwotrip.com/js/onetwotrip.com";
	}
	if (options.domain) {
		str += ';domain=' + options.domain;
	}
	document.cookie = str; 
}
function cloneObj(o){
    if (!o || "object" !== typeof o) {
        return o;
    }
    var c = "function" === typeof o.pop ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && "object" === typeof v) {
                if (v instanceof Date) {
                   c[p] = new Date(v.getTime());
                } else {
                    c[p] = cloneObj(v);
                }
            } else {
                c[p] = v;
            }
        }
    }
    return c;
}
//delete oldCookies
/*document.cookie =  "currency=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
document.cookie =  "bg_color=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
document.cookie =  "dynamic=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";*/