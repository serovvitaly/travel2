var chat_messages = 0;
var tmpl_QuestionField;
$(function(){
	function CheckChat(){
		var current_messages = $('p[id*="habla_msg_"]');
		setTimeout(function(){
			if(current_messages.length>0 && !chat_messages) {
				chat_messages = current_messages.length;
			}
			if(chat_messages && chat_messages != current_messages.length) {
				chat_messages = current_messages.length;
				var mes = $(current_messages).last().find('span')[1];
				var mes_text = $(mes).text();
				if (mes_text.indexOf('[Q') > -1 && mes_text.indexOf(']') > -1) {
					var mes_q = parseInt(mes_text.substring(2, mes_text.indexOf(']')), 10);
					/*$('#habla_window_div').removeClass('olrk-state-expanded').addClass('olrk-state-compressed');
					$('#habla_expanded_div').hide();
					$('#habla_compressed_div').show();*/
					if(document.getElementById('LearnFAQ')){
						removePopup();
					}
					showFAQ(mes_q);
				}
				if (mes_text.indexOf('[R') > -1 && mes_text.indexOf(']') > -1) {
					var mes_q = mes_text.substring(2, mes_text.indexOf(']'));
					/*$('#habla_window_div').removeClass('olrk-state-expanded').addClass('olrk-state-compressed');
					$('#habla_expanded_div').hide();
					$('#habla_compressed_div').show();*/
					var data = objAvia.parseKey(mes_q);
					if(data) {removePopup();objAvia.changeRequest(data);}
				}
			}
			CheckChat();
		}, 1000);
	}
	CheckChat();
});

function showFAQ(q){
	var self = this;
	var popup = addPopup({
		id: "LearnFAQ",
		className: "yellow",
		close_button: true
	});
	this.elContent = document.createElement("div");
	this.elContent.className = "content questions";
	$(popup).append(this.elContent);
	appendLoader({
		appendTo: this.elContent,
		text: l10n.loaders.loading
	});
	$.ajax({
		type: "get",
		dataType: "html",
		data: {
			popup: true
		},
		url: "/faq/",
		timeout: 120000,
		beforeSend: function(){
			$("<link/>", {
				rel: "stylesheet",
				type: "text/css",
				href: "../css/faq.css"/*tpa=http://www.onetwotrip.com/css/faq.css*/
			}).appendTo("head");
		},
		success: function(data){
			$(self.elContent).html(data);
			if (browser.mobile) {
				$.getScript('iscroll.js'/*tpa=http://www.onetwotrip.com/js/iscroll.js*/, function(){
					startQuestions();
				});
			} else {
				startQuestions();
			}
		},
		error: function(){
			removePopup();
			addPopup({
				error: true,
				reason: l10n.popup.problem,
				comment: l10n.popup.problemComment,
				close_button: true
			});
		}
	});
	startQuestions = function(){
		setTimeout(function(){
			if (q) {
				new Question("q" + q);
			} else {
				new Question();
			}
		}, 200);
	};
}

function Question(questionId){
	var self = this;
	if(browser.mobile){
		new iScroll('QuestionList');
	}
	this.tags = l10n.faq;
	
	tmpl_QuestionField = $("#tmpl_QuestionField").trim();
	this.field = new QuestionField({
		appendTo: $('.Fieldpanel')[0],
		name: "SearchQuestion",
		value: "",
		defaultValue: l10n.faqDefault
	});
	this.input = this.field.input;
	this.input.focus();
	this.listBody = $('.FAQlist')[0];
	this.ListWrapper = $('.listWrapper', this.listBody)[0];
	
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
				if (self.input.value.length >= 3) {
					self.makeSuggest();
				} else {
					self.hide();
					self.tempValue = self.input.value.toLowerCase();
				}
			}
		}
	});
	this.selectedRow = null;
	if(questionId) {
		this.currentResult = questionId;
		this.setCurrentResult();
	}
}
Question.prototype.makeSuggest = function() {
	this.tempValue = this.input.value.toLowerCase();
	var queryString = this.tempValue;
	if (queryString.length >= 3) {
		this.getResult(queryString);
		if(this.results.length>0) {
			this.draw();
		} else {
			this.hide();
		}
	}
};
Question.prototype.getResult = function(queryString){
	var self = this;
	this.results = [];
	queryString = queryString.replace(/^\s*/, "").replace(/\s{2,}/g, " ");
	var Qstring = queryString.split(" ");
	for (var i in this.tags) {
		var curTag = self.tags[i];
		for (var j = 0, QL = Qstring.length; j < QL; j++) {
			if (Qstring[j] != "" && Qstring[j].length > 2 && curTag.indexOf(Qstring[j]) != -1) {
				self.results.push(i);
			}
		}
	}
	
};
Question.prototype.create = function(){
	this.elSuggest = document.getElementById("helpSuggest");
	if (!this.elSuggest) {
		this.elSuggest = document.createElement("div");
		this.elSuggest.id = "helpSuggest";
		this.elSuggest.className = "suggest invisible";
		$(this.elSuggest).click(function(event) {
			event.stopPropagation();
		});
		$(this.listBody).append(this.elSuggest);
	} else {
		this.elSuggest.innerHTML = "";
	}
};
Question.prototype.draw = function() {
	var self = this;
	this.create();
	
	var elList = document.createElement("ul");
	for(var i = 0, ResultsCount = this.results.length; i < ResultsCount; i++){
		var qid = this.results[i];
		var elLi = document.createElement("li");
			elLi.Code = qid;
			var elTable = document.createElement("table");
			var elRow = elTable.insertRow(-1);
			var elNameCell = elRow.insertCell(0);
				elNameCell.innerHTML = $('#'+qid).text();
			elLi.appendChild(elTable);
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
Question.prototype.show = function() {
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
Question.prototype.setOffset = function(){
	var offset = $(this.input).offset();
	this.elSuggest.style.top = this.input.offsetHeight + "px";
	this.elSuggest.style.left = "25px";
	this.elSuggest.style.minWidth = this.input.offsetWidth - 2 + "px";
};
Question.prototype.hide = function() {
	var self = this;
	$(window).unbind('resize', self.linkSetOffset);
	$(document).unbind("click", self.link_clickOutside);
	$(this.input).unbind("keydown", self.link_onKeyDown);
	this.currentResult = null;
	var elSuggest = document.getElementById("helpSuggest");
	if (elSuggest) {
		$(elSuggest).remove();
	}
};
Question.prototype.clickOutside = function(event){
	if (event.target != this.input) {
		this.hide();
	}
};
Question.prototype.onKeyDown = function(event) {
	switch (event.keyCode) {
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
Question.prototype.setPrevRowHover = function() {
	if (this.selectedRow) {
		var PrewRow = this.selectedRow.previousSibling;
		if (PrewRow) {
			this.setRowHover(PrewRow);
			this.selectedRow = PrewRow;
		}
	}
};
Question.prototype.setNextRowHover = function() {
	if (this.selectedRow) {
		var NextRow = this.selectedRow.nextSibling;
		if (NextRow) {
			this.setRowHover(NextRow);
			this.selectedRow = NextRow;
		}
	}
};
Question.prototype.setRowHover = function(elRow){
	if (this.selectedRow) {
		if (this.selectedRow == elRow) {
			return;
		}
		this.dropRowHover(this.selectedRow);
	}
	$(elRow).addClass("hover");
	this.selectedRow = elRow;
	this.currentResult = elRow.Code;
};
Question.prototype.dropRowHover = function(elRow){
	$(elRow).removeClass("hover");
};
Question.prototype.setCurrentResult = function(){
	var self = this;
	$(this.ListWrapper).scrollTo($('#' + self.currentResult)[0], 500);
	this.input.value = "";
	this.field.setPlaceholder();
};

function QuestionField(options){
	var self = this;
	/* До создания шаблона */
	this.options = options || {};
	this.value = this.options.value || null;
	
	/* Создание шаблона */
	this.setField();
	
	$(this.input).bind("input keyup paste", function(event){
		if (event.type == "input" || event.type == "keyup" && IEVersion) handler();
		if (event.type == "paste" && IEVersion < 9) setTimeout(handler, 0);
		function handler(){
			self.setPlaceholder();
		}
	});
	this.setGlow();
	
	if (this.options.appendTo) $(this.elField).appendTo(this.options.appendTo);
}
QuestionField.prototype.setField = function(){
	this.elField = $.tmpl(tmpl_QuestionField, this.options)[0];
	this.input = $("input:not([disabled])", this.elField)[0];
	this.placeholder = $("input[readonly]", this.elField)[0];
};
QuestionField.prototype.setGlow = function(){
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
QuestionField.prototype.setPlaceholder = function(){
	if (this.placeholder) {
		if (!this.input.value || this.input.value == "\n") {/* При отмене ввода в FF7.0.1 value == "\n" */
			this.placeholder.value = this.placeholder.defaultValue;
		} else {
			this.placeholder.value = "";
		}
	}
};