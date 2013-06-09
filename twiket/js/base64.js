window.twiket = window.twiket || {};
twiket.OKeys = {};
$(function(){
	readKeys();
	try{
		$('.show_order').livequery(function(){
			var _newKey = $(this).attr('p');
			var _stringKey = makeKey();
			$(this).attr('k', _stringKey);
			var _encodedString = encryptGString( _newKey, _stringKey );
			this.href = '/ticket/?c=' + _encodedString;
			$(this).removeAttr('p');
			$(this).click(function(){
				writeKeys( $(this).attr('k') );
			});
		});
	} catch(e){}
});

function readKeys(){
	var strKeys = readCookie("OKeys");
	if(strKeys) {
		var keysArr = strKeys.split('|');
		for(var i=0, KL = keysArr.length; i< KL; i++) {
			if(keysArr[i] != ''){
				twiket.OKeys[keysArr[i]] = 1;
			}
		}
	}
}
function writeKeys(stringKey){
	var strKeys = readCookie("OKeys")||'';
	var keysArr = strKeys.split('|');
	if(keysArr.length >4) {
		keysArr.splice(0,1);
		strKeys = keysArr.join('|'); 
	}
	if(strKeys.indexOf(stringKey) == -1) {
		strKeys+= stringKey + '|';
	}
	setCookie({
		name: "OKeys",
		value: strKeys
	});
}

var Base64keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function stringEncode64(input) {
	input = escape(input);
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;
	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}
		output = output +
		Base64keyStr.charAt(enc1) +
		Base64keyStr.charAt(enc2) +
		Base64keyStr.charAt(enc3) +
		Base64keyStr.charAt(enc4);
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
	} while (i < input.length);
		return output;
	}

function stringDecode64(input) {
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;
	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) {
	/*alert("There were invalid base64 characters in the input text.\n" +
	        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
	        "Expect errors in decoding.");*/
		return "";//error
	}
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	do {
		enc1 = Base64keyStr.indexOf(input.charAt(i++));
		enc2 = Base64keyStr.indexOf(input.charAt(i++));
		enc3 = Base64keyStr.indexOf(input.charAt(i++));
		enc4 = Base64keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		output = output + String.fromCharCode(chr1);
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
   } while (i < input.length);
   return unescape(output);
}

function encryptGString( string_to_encrypt, string_key ) {
	var to_enc = string_to_encrypt;
	var the_res=""; var j = 0;
	for(i=0;i<to_enc.length;++i) {
		if( j < string_key.length ) j++; else j = 0;
		xor_key = string_key.charCodeAt(j); if( xor_key > 100 ) {xor_key = xor_key - 100;}
		the_res+=String.fromCharCode(xor_key^to_enc.charCodeAt(i));
	}
	return stringEncode64( the_res );
}

function decryptGString( string_to_decrypt, string_key ) {
	var to_dec= stringDecode64( string_to_decrypt );
	var the_res = ""; var j = 0;
	for(i=0;i<to_dec.length;i++) {
		if( j < string_key.length ) {j++;} else {j = 0;}
		xor_key = string_key.charCodeAt(j); if( xor_key > 100 ) xor_key = xor_key - 100;
		the_res+=String.fromCharCode(xor_key^to_dec.charCodeAt(i));
	}
	return the_res;
}
function GetG(){return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)}
function makeKey(){
	return (GetG() + GetG() + GetG() + GetG() + GetG() + GetG() + GetG() + GetG()).toUpperCase();
}