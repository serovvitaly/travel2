$(document).ready(function(){


	function hexFromRGB(r, g, b) {
		var hex = [
			r.toString( 16 )
		];
		$.each( hex, function( nr, val ) {
			if ( val.length === 1 ) {
				hex[ nr ] = "0" + val;
			}
		});
		return hex.join( "" ).toUpperCase();
	}
	function refreshSwatch() {
		var red = $( ".slider" ).slider( "value" ),
			hex = hexFromRGB( red );
	}
	
	$( ".slider" ).slider({
		orientation: "horizontal",
		range: "min",
		max: 100,
		value: 50
	});

	$( ".slider.sliderType2" ).slider({
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 1,
		value: 1
	});
	
	$( ".slider.sliderType1" ).slider( "value", 60 );
	$( ".slider.sliderType2" ).slider( "value", 0 );

	$( ".slider.sliderType2" ).slider({
		slide: function(){$(this).parent().toggleClass('toggle');}
	});

	//$.datepicker.setDefaults( $.datepicker.regional[ "ru" ] );
	$( ".datepicker" ).datepicker({
		numberOfMonths: 2
	});

	$('.datepicker .ui-state-default').append('<span class="grad"></span>');

	$('.calend .btn').click(function(){
		$(this).parent().parent().parent().find('.calendar').toggle();
	});
	$('.calend #flightType3').click(function(){
		$('.mainSearch .btn-toolbar.toolbar2').toggle();
	});
	$('.calend #flightType1, .calend #flightType2').click(function(){
		$('.mainSearch .btn-toolbar.toolbar2').hide();
	});


	$('.dynDateGraph li').hover(function(){
		$('.dynDateGraph').find('div.price').remove();
		$('.dynDateGraph li.active').removeClass('active');
		$(this).addClass('active').prepend('<div class="price">230 $</div>');
	})

	$('#regOpen').click(function(){
		$('.regOn, unReg').toggle();
	});

	$('.popupSide .popupSideBtn').click(function(){
		$(this).parent().toggleClass('open');
	})
	$('.popupSide .close').click(function(){
		$(this).parent().removeClass('open');
	})

	$('aside article.side h2').click(function(){
		$(this).next('.inn').toggle();
	})

	$('.labelDynamics').click(function(){
		$('.dynamics .hided').slideToggle();
		$(this).toggleClass('open');
		if($(this).hasClass('open')){
			$(this).text('закрыть')
		} else {$(this).text('календарь цен');}
	})
})