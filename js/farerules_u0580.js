function showFareRules(options){
	this.options = options;
	var popup = document.getElementById("fareRules");
	if (!popup) {
		popup = addPopup({
			id: "fareRules",
			close_button: true
		});
	}
	if (!this.options.obj.fareRulesFull) {
		appendLoader({
			appendTo: popup,
			text: l10n.loaders.loading
		});
		getFareRules(this.options);
	} else {
		removeLoader();
		
		var elContent = document.createElement("div");
			elContent.className = "content";
			elContent.innerHTML = l10n.fareRules.head;

		var elCaution = document.createElement('div');
			elCaution.className = "caution";
			elCaution.innerHTML = l10n.fareRules.caution_notused;
		if (this.options.obj.fareRulesFull.routes.length > 1) {
			elCaution.innerHTML += l10n.fareRules.caution_strict;
		}
			elCaution.innerHTML += l10n.fareRules.caution_penalties;
			elContent.appendChild(elCaution);
		
		var elMenu = document.createElement('ul');
			elMenu.className = 'menu';
		var elRules = document.createElement('ul');
			elRules.className = 'rules';	
		for (var i = 0, length = this.options.obj.fareRulesFull.routes.length; i < length; i++) {
			var route = this.options.obj.fareRulesFull.routes[i];
			
			var	elMenuItem = document.createElement('li');
				elMenuItem.index = i;
				elMenuItem.innerHTML += ref.getCityName(route.from) + ' → ' + ref.getCityName(route.to);
				elMenuItem.innerHTML += ', ' + route.airCompany + '-' + route.flightNumber;

				elMenuItem.innerHTML += ', '
				if(route.serviceClass == 'F') {
					elMenuItem.innerHTML += l10n.ticket.cls[3];
				} else if(route.serviceClass == 'B'){
					elMenuItem.innerHTML += l10n.ticket.cls[2];
				} else if(route.serviceClass == 'W'){
					elMenuItem.innerHTML += l10n.ticket.cls[1];
				} else {
					elMenuItem.innerHTML += l10n.ticket.cls[0];
				}
				if (route.reservClass) elMenuItem.innerHTML += ' (' + route.reservClass + ')';

				$(elMenuItem).wrapInner('<span class="link dotted">');
			elMenu.appendChild(elMenuItem);

			var	elRulesItem = document.createElement('li');
			
			var elTitle = document.createElement('div');
				elTitle.className = 'title';
				elTitle.innerHTML = ref.getCityName(route.from) + ' → ' + ref.getCityName(route.to);
				//var startDate = new Date(Date.parse(route.startDate));
				//elTitle.innerHTML += ', ' + startDate.getDate() + ' <span class="date">' + l10n.calendar.months_D[startDate.getMonth()].toLowerCase() + '</span>';
				//elTitle.innerHTML += ', <span class="weekday">' + l10n.calendar.days_N[startDate.getDay()].toLowerCase() + '</span>';
			elRulesItem.appendChild(elTitle);

			var elSubTitle = document.createElement("div");
				elSubTitle.className = "subTitle";
				elSubTitle.innerHTML = l10n.fareRules.tariff[0];
			if (route.withStops) {
				elSubTitle.innerHTML += l10n.fareRules.tariff[1];
			} else {
				elSubTitle.innerHTML += l10n.fareRules.tariff[2];
			}
			elRulesItem.appendChild(elSubTitle);

			var elNote = document.createElement("div");
				elNote.className = "note";
				elNote.innerHTML = l10n.fareRules.details;
			elRulesItem.appendChild(elNote);

			var elFull = document.createElement("div");
				elFull.className = "full";
			var elFullInner = document.createElement("div");
				elFullInner.innerHTML = route.rules;
				elFull.appendChild(elFullInner);
			elRulesItem.appendChild(elFull);

			elRules.appendChild(elRulesItem);

			if (!route.withStops) {
				var $toPenalties = $(".toPenalties", elNote);
				(function(elFull, rulesStr){
					$toPenalties.click(function(){
						var allLines = rulesStr.split("\n").length;
						var penaltiesLine = rulesStr.split(". PENALTIES")[0].split("\n").length;
						var scrollHeight = elFull.scrollHeight;
						scrollHeight -= parseInt($(elFull.firstChild).css("padding-top"), 10);
						scrollHeight -= parseInt($(elFull.firstChild).css("padding-bottom"), 10);
						var scrollToPenalties = ((scrollHeight / allLines) * penaltiesLine) + $(elFull).position().top + elContent.scrollTop;
						$(elContent).animate({
							scrollTop: scrollToPenalties
						}, "slow");
					});
				})(elFull, route.rules);
			}
		}

		if (elMenu.childNodes.length > 1) {
			elContent.appendChild(elMenu);
		}
		elContent.appendChild(elRules);
		$(elMenu.childNodes).click(function(){
			if (!$(this).hasClass('selected')) {
				$('li.selected', elMenu).removeClass('selected');
				$('li.selected', elRules).removeClass('selected');
				$(elRules.childNodes[this.index]).addClass('selected');
				$(this).addClass('selected');
			}
		});
		$(elMenu.childNodes[0]).click();

		popup.appendChild(elContent);

		if (browser.mobile) {
			if (this.options.obj.fareRulesFull.routes.length > 2) {
				$(elContent).wrapInner("<div/>");
				new iScroll(elContent);
			}
			$(".full", popup).each(function(){
				new iScroll(this);
			});
		}
	}
}
function getFareRules(options){
	var self = this;
	this.options = options;
	var requestOptions = {
		repeats: 1,
		backupRepeats: true,
		RetryFunction: function(){
			MakeRequest();
		}
	};
	kmqRecord({name: 'GF_BeforeBooking'});
	MakeRequest();
	function MakeRequest(){
		$.ajax({
			type: "post",
			dataType: "json",
			url: self.options.url,
			data: self.options.data,
			success: function(json){
				if (json.routes) {
					self.options.obj.fareRulesFull = json;
					if (document.getElementById("fareRules")) {
						showFareRules(self.options);
					}
				} else {
					addPopup({
						error: true,
						reason: l10n.fareRules.errorPopup.reason,
						comment: l10n.fareRules.errorPopup.comment,
						close_button: true,
						button: l10n.popup.close,
						actionButton: "removePopup();"
					});
				}
			},
			complete: function(xhr){
				xhr.url = this.url;
				checkAjaxError(xhr, requestOptions);
			}
		});
	}
}