var nonstopSchedule = {};
var firstSelectedStraightDirIndex = null; //Индекс дирекшена на котором была первый выбрана дата для прямого перелёта
var lastFirstMonthIndex = 0;
function Calendar(options){
	var self = this;
	this.options = options;
	
	this.data = this.options.parent.data;
	this.dirNumber = this.options.directionNumber;
	this.flightType = this.data.flightType;
	this.dataDirs = this.data.directions;
	this.dataDir = this.dataDirs[this.dirNumber];
	this.dataDirsCount = this.dataDirs.length;
	
	this.appendTo = '.mainSearch'; //document.body;
	
	this.today = (new Date()).cutTime();
	this.yesterday = new Date(this.today);
	this.yesterday.setDate(this.yesterday.getDate() - 1);
	this.min = new Date(this.yesterday);
	this.max = new Date();
	this.max.setDate(this.max.getDate() + 360);
	this.maxFirstMonthIndex = this.max.getFullYear() * 12 + this.max.getMonth() - this.min.getFullYear() * 12 - this.min.getMonth() - 1;
	
	this.date = new Date(this.min);
	this.getFirstMonthIndex();
	if (!this.dataDir.date) {
		this.firstMonthIndex = lastFirstMonthIndex;
	}
	
	this.checkSchedule();
	this.createStructure();
	$(this.elBody).scrollLeft(358 * this.firstMonthIndex);
	
	this.link_clickOutside = function(event){
		self.clickOutside(event);
	};
	this.link_setOffset = function(event){
		self.setOffset(event);
	};
	
	this.show();
}
Calendar.prototype.createStructure = function(){
	var self = this;
	
	this.getWeekdays();
	var caption = ref.getPointName(this.dataDir.from) + " → " + ref.getPointName(this.dataDir.to);
	var returnFlight = false;
	var elPlane = document.createElement("span");
		elPlane.className = "icoPlane";
	if(this.flightType != "multiway" && this.dirNumber === 1){
		returnFlight = true;
		elPlane.className += " returnFlight";
	}
	this.elCalendar = $.tmpl($('#tmpl_Calendar').trim(), {
		returnFlight: returnFlight,
		caption: caption,
		directFlights: l10n.index.calendar.directFlights,
		withStop: l10n.index.calendar.withStop,
		directFlightsOnly: l10n.index.calendar.directFlightsOnly,
		weekdays: this.arrWeekdays,
		weekends: this.arrWeekends
	})[0];
	$(this.elCalendar).click(function(event){
		event.stopPropagation();
	});
	this.elCaptionBlock = $("td.caption>div", this.elCalendar)[0];
	this.elCaption = $("span.caption", this.elCalendar)[0];
	$(elPlane).prependTo(this.elCaption);
	$("span.dashed", this.elCalendar).click(function(){
		self.hide();
		objSearchForm.setFlightType("oneway");
	});
	this.elLegend = $('td.legend', this.elCalendar)[0];
	
	this.elMonths = $('table.months', this.elCalendar)[0];
	this.elRollLeft = $('td.roll.left>span', this.elMonths)[0];
	$(this.elRollLeft).click(function(){
		self.rollLeft();
	});
	this.elRollRight = $('td.roll.right>span', this.elMonths)[0];
	$(this.elRollRight).click(function(){
		self.rollRight();
	});
	this.elPrevMonth = $('td.roll.left span.month', this.elMonths)[0];
	this.elNextMonth = $('td.roll.right span.month', this.elMonths)[0];
	this.elMonthLeft = $('td.month.left', this.elMonths)[0];
	this.elMonthRight = $('td.month.right', this.elMonths)[0];
	
	this.elRollTable = $("div.body table.roll", this.elCalendar)[0];
	this.elRollRow = this.elRollTable.rows[0];
	
	this.drawMonths();
	this.drawNavigation();
	this.elBody = $("div.body", this.elCalendar)[0];
	$(this.elCalendar).appendTo(this.appendTo);
};
Calendar.prototype.drawNavigation = function(){
	if (this.firstMonthIndex === 0) {
		$(this.elRollLeft).addClass("invisible");
	} else {
		$(this.elRollLeft).removeClass("invisible");
	}
	var tempDate = new Date(this.date);
		tempDate.setDate(1);
		tempDate.setMonth(tempDate.getMonth() + this.firstMonthIndex - 1);
	this.elPrevMonth.innerHTML = l10n.calendar.months_N[tempDate.getMonth()];
		tempDate.setMonth(tempDate.getMonth() + 1);
	if (tempDate.getFullYear() != this.today.getFullYear()) {
		this.elMonthLeft.innerHTML = l10n.calendar.months_N[tempDate.getMonth()] + '  <span>' + tempDate.getFullYear() + '</span>';
	} else {
		this.elMonthLeft.innerHTML = l10n.calendar.months_N[tempDate.getMonth()] + '  ' + tempDate.getFullYear();
	}
		tempDate.setMonth(tempDate.getMonth() + 1);
	if (tempDate.getFullYear() != this.today.getFullYear()) {
		this.elMonthRight.innerHTML = l10n.calendar.months_N[tempDate.getMonth()] + '  <span>' + tempDate.getFullYear() + '</span>';
	} else {
		this.elMonthRight.innerHTML = l10n.calendar.months_N[tempDate.getMonth()] + '  ' + tempDate.getFullYear();
	}
		tempDate.setMonth(tempDate.getMonth() + 1);
	this.elNextMonth.innerHTML = l10n.calendar.months_N[tempDate.getMonth()];
	if (tempDate.getTime() > this.max.getTime()) {
		$(this.elRollRight).addClass("invisible");
	} else {
		$(this.elRollRight).removeClass("invisible");
	}
};
Calendar.prototype.rollLeft = function(){
	this.firstMonthIndex--;
	$(this.elBody).animate({
		scrollLeft: this.firstMonthIndex * 358
	});
	this.drawNavigation();
};
Calendar.prototype.rollRight = function(){
	this.firstMonthIndex++;
	$(this.elBody).animate({
		scrollLeft: this.firstMonthIndex * 358
	});
	this.drawNavigation();
};
Calendar.prototype.getFirstMonthIndex = function(){
	this.firstMonthIndex = 0;
	var date = new Date(this.date);
	if (this.dataDir.date) {
		date = new Date(this.dataDir.date);
	}
     
	for (var i = this.dirNumber - 1; i >= 0; i--) {
		var dir = this.dataDirs[i];
		if (dir.date) {
			if (dir.date > date) {
				date = new Date(dir.date);
			} else {
				break;
			}
		}
	}
	this.firstMonthIndex = date.getFullYear() * 12 + date.getMonth() - this.min.getFullYear() * 12 - this.min.getMonth();
	if (this.firstMonthIndex > this.maxFirstMonthIndex) this.firstMonthIndex = this.maxFirstMonthIndex;
    if (this.dirNumber == 1 && this.firstMonthIndex > 0) {
        this.firstMonthIndex = this.firstMonthIndex - 1;
    }
	return this.firstMonthIndex;
};
Calendar.prototype.drawMonths = function(){
	var tempDate = new Date(this.min);
		tempDate.setDate(1);
	var i = 0;
	while (tempDate.getTime() <= this.max.getTime()) {
		this.elRollRow.insertCell(i).appendChild(this.drawMonth(i));
		tempDate.setMonth(tempDate.getMonth() + 1);
		i++;
	}
};
Calendar.prototype.drawMonth = function(i){
	var table = document.createElement("table");
		table.className = "calendar";
	this.drawDays(table, i);
	return table;
};
Calendar.prototype.getWeekdays = function() {
	this.arrWeekdays = [];
	this.arrWeekends = [];
	for (var wd = 0; wd < 7; wd++) {
		var n = wd + l10n.calendar.weekstart;
		if (n > 6) n = n - 7;
		this.arrWeekdays.push(l10n.calendar.days_S[n].toUpperCase());
		
		var weekend = false;
		for (var we = 0, length = l10n.calendar.weekend.length; we < length; we++) {
			var weDayNumber = l10n.calendar.weekend[we];
			if(n == weDayNumber){
				weekend = true;
				break;
			}
		}
		this.arrWeekends.push(weekend);
	}
	return this.arrWeekdays;
};
Calendar.prototype.drawDays = function(table, n){
	var self = this;
	if (this.schedule) {
		if (this.schedule.withStops) {
			$(".withStopLegend", this.elLegend).removeClass("invisible");
		} else {
			$(".withoutStopLegend", this.elLegend).removeClass("invisible");
		}
	}
	
	var tempDate = new Date(this.date);
		tempDate.setDate(1);
		tempDate.setMonth(tempDate.getMonth() + n);
	var month = tempDate.getMonth();
	var DayShift = (tempDate.getDay() - l10n.calendar.weekstart) % 7;
	if (DayShift < 0) DayShift += 7;
		tempDate.setDate(tempDate.getDate() - DayShift);
	for (var w = 0; w < 6; w++) {
		var row = table.insertRow(-1);
		for (var i = 0; i < 7; i++) {
			var cell = row.insertCell(-1);
			if (tempDate.getMonth() == month) {
				cell.className = tempDate.getTime();
				var elDay = document.createElement("div");
					elDay.className = 'day';
				var elDate = document.createElement("div");
					elDate.className = "date";
					elDate.appendChild(document.createTextNode(tempDate.getDate()));
					elDay.appendChild(elDate);
				
				if (tempDate < this.min || tempDate > this.max) {
					elDay.className += " disabled";
				} else {
					elDay.className += " enabled";
					var elStroke = document.createElement("div");
						elStroke.className = "stroke";
					elDay.appendChild(elStroke);
					$(elDay).click(function(event){
						event.stopPropagation();
						if(firstSelectedStraightDirIndex === null && $(this).hasClass("straight")){
							firstSelectedStraightDirIndex = self.dirNumber;
						}
						self.onclickDay(event, this.date);
					});
				}
				/*if (tempDate.getTime() == this.today.getTime()) {
					elDay.className += " today";
				}*/
				for (var d = 0; d < this.dataDirsCount; d++) {
					var dataDir = this.dataDirs[d];
					if (dataDir.date) {
						if (tempDate.getTime() == dataDir.date.getTime()) {
							elDay.className += " flight";
							var elPlane = document.createElement("div");
								elPlane.className = "icoPlane";
							if (this.flightType === "round" && d === 1) {
								elPlane.className += " returnFlight";
							}
							elDay.appendChild(elPlane);
						}
					}
				}
				if (this.schedule) {
					if (this.schedule[tempDate.getTime()]) {
						if (this.schedule[tempDate.getTime()] == 0) {
							elDay.className += " withStop";
						} else if(this.schedule[tempDate.getTime()] == 1) {
							elDay.className += " straight";
						} else if(this.schedule[tempDate.getTime()] == 2) {
							elDay.className += " prevdoStraight";
						}
					}
				}
				elDay.date = new Date(tempDate);
				cell.appendChild(elDay);
			}
			tempDate.setDate(tempDate.getDate() + 1);
		}
	}
};
Calendar.prototype.checkSchedule = function(){
	this.schedule = null;
	if (this.dataDir.from && this.dataDir.to) {
		var key = this.dataDir.from + this.dataDir.to + firstSelectedStraightDirIndex;
		if (nonstopSchedule[key]) {
			this.schedule = nonstopSchedule[key];
		} else {
			var dateFrom = new Date(this.min);
			var dateTo = new Date(this.max);
			this.getSchedule([dateFrom, dateTo]);
		}
	}
};
Calendar.prototype.getSchedule = function(period){
	var self = this;
	var key = this.dataDir.from + this.dataDir.to + firstSelectedStraightDirIndex;
	var dirs = [];
	for(var i = 0, length = this.dataDirs.length; i < length; i++){
		var dir = new Direction(this.dataDirs[i]);
		if(dir.date) dir.date = dir.date.format("yyyy/mm/dd");
		dirs.push(dir);
	}
	var params = {
		period: period[0].stringifyAPI() + period[1].stringifyAPI(),
		directions: dirs,
		dirIndex: this.dirNumber,
		firstSelected: firstSelectedStraightDirIndex
	};
	var requestOptions = {
		repeats: 2,
		retryTime: 2000,
		RetryFunction: function(){
			MakeRequest();
		}
	};
    
    params.source    = twiket.setup.source;
    params.srcmarker = twiket.setup.marker;
    
	MakeRequest();
	function MakeRequest() {
		$.ajax({
			type: "get",
			dataType: "jsonp",
			data: {
				params: JSON.stringify(params)
			},
			timeout: 10000,
			url: "https://secure.onetwotrip.com/_api/schedule/getNonstopDates1/",
			success: function(json) {
				if(json){
					if (json.days) {
						json.key = key;
						json.period = period;
						self.parseSchedule(json);
					}
				}
			},
			complete: function(xhr){
				xhr.url = 'schedule/getNonstopDates1/?'+JSON.stringify(params);
				checkAjaxError(xhr,requestOptions);
			}
		});
	}
};
Calendar.prototype.parseSchedule = function(json){
	var schedule = {};
	if(json.days.indexOf("0") >= 0 || json.days.indexOf("0") >= 0){
		schedule.withStops = true;
	}
	var lenght = json.days.length;
	var tempDate = new Date(json.period[0]);
	for (var i = 0; i < lenght; i++) {
		var flag = json.days.substr(i, 1);
		schedule[tempDate.getTime()] = flag;
		tempDate.setDate(tempDate.getDate() + 1);
	}
	this.schedule = schedule;
	nonstopSchedule[json.key] = this.schedule;
	this.setSchedule();
};
Calendar.prototype.setSchedule = function(){
	var self = this;
	if (this.elCalendar.offsetHeight > 0) {
		if(this.schedule.withStops){
			$(".withStopLegend", this.elLegend).removeClass("invisible");
		} else {
			$(".withoutStopLegend", this.elLegend).removeClass("invisible");
		}
		var $elDates = $("table.calendar div.enabled", this.elCalendar);
		$elDates.each(function(){
			if (self.schedule[this.date.getTime()]) {
				if (self.schedule[this.date.getTime()] == 0) {
					this.className += " withStop";
				} else if (self.schedule[this.date.getTime()] == 1) {
					this.className += " straight";
				} else if (self.schedule[this.date.getTime()] == 2) {
					this.className += " prevdoStraight";
				}
			}
		});
	}
};
Calendar.prototype.onclickDay = function(event, date){
	var self = this;
	this.date = new Date(date);
	this.dataDir.date = this.date;
	if (this.dataDirsCount == 2 && this.dirNumber === 0 && !this.dataDirs[1].date) {
		$(this.elCaptionBlock).animate({
			"margin-left": "-110%"
		}, "fast", function(){
			animateCallback();
		});
	} else {
		animateCallback();
	}
	function animateCallback(){
		self.hide();
		self.options.parent.setDate(self.dirNumber);
		self.options.parent.update();
	}
};
Calendar.prototype.show = function(){
	var self = this;
	this.setOffset();
	$(window).bind('resize', self.link_setOffset);
	$(document).bind("click", self.link_clickOutside);
	$(this.elCalendar).removeClass("invisible");
	this.setOffset();
};
Calendar.prototype.setOffset = function(){
	if(this.flightType == "round" && this.dirNumber === 1){
		var input = this.options.parent.dirRows[0].fromField.input;
	} else {
		var input = this.options.parent.dirRows[this.dirNumber].fromField.input;
	}
	var offset = $(input).offset();
	this.elCalendar.style.top = offset.top + input.offsetHeight + "px";
	//this.elCalendar.style.left = offset.left + "px";
};
Calendar.prototype.hide = function(){
	var self = this;
	if (!this.dataDir.date) {
		lastFirstMonthIndex = this.getFirstMonthIndex();
	} else {
		lastFirstMonthIndex = this.firstMonthIndex;
	}
	var overview = $(".overview",  this.elCalendar)[0];
	lastScrollTop = -parseInt($(overview).css("top"), 10);
	$(window).unbind('resize', self.link_setOffset);
	$(document).unbind("click", self.link_clickOutside);
	$(this.elCalendar).remove();
};
Calendar.prototype.clickOutside = function(event) {
	this.options.parent.setDate(this.dirNumber);
	this.hide();
};