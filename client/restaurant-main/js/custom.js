(function($) {
    "use strict";
	
	/* ..............................................
	Loader 
    ................................................. */
	
	$(window).on('load', function() { 
		$('.preloader').fadeOut(); 
		$('#preloader').delay(550).fadeOut('slow'); 
		$('body').delay(450).css({'overflow':'visible'});
	});
	
	/* ..............................................
    Fixed Menu
    ................................................. */
    
	$(window).on('scroll', function () {
		if ($(window).scrollTop() > 50) {
			$('.top-header').addClass('fixed-menu');
		} else {
			$('.top-header').removeClass('fixed-menu');
		}
	});
	
	/* ..............................................
    Gallery
    ................................................. */
	
	if ($.fn.superslides && $('#slides').length) {
		$('#slides').superslides({
			inherit_width_from: '.cover-slides',
			inherit_height_from: '.cover-slides',
			play: 5000,
			animation: 'fade',
		});
	}
	
	if ($('.cover-slides ul li').length) {
		$( ".cover-slides ul li" ).append( "<div class='overlay-background'></div>" );
	}
	
	/* ..............................................
    Map Full
    ................................................. */
	
	$(document).ready(function(){ 
		$(window).on('scroll', function () {
			if ($(this).scrollTop() > 100) { 
				$('#back-to-top').fadeIn(); 
			} else { 
				$('#back-to-top').fadeOut(); 
			} 
		}); 
		$('#back-to-top').click(function(){ 
			$("html, body").animate({ scrollTop: 0 }, 600); 
			return false; 
		}); 
	});
	
	/* ..............................................
    Special Menu
    ................................................. */
	
	var Container = $('.container');
	if ($.fn.imagesLoaded && $.fn.isotope && Container.length && $('.special-list').length) {
		Container.imagesLoaded(function () {
			var portfolio = $('.special-menu');
			portfolio.on('click', 'button', function () {
				$(this).addClass('active').siblings().removeClass('active');
				var filterValue = $(this).attr('data-filter');
				$grid.isotope({
					filter: filterValue
				});
			});
			var $grid = $('.special-list').isotope({
				itemSelector: '.special-grid'
			});
		});
	}
	
	/* ..............................................
    BaguetteBox
    ................................................. */
	
	if (typeof baguetteBox !== 'undefined' && $('.tz-gallery').length) {
		baguetteBox.run('.tz-gallery', {
			animation: 'fadeIn',
			noScrollbars: true
		});
	}
	
	
	
	/* ..............................................
    Datepicker
    ................................................. */
	
	if ($.fn.pickadate && $('.datepicker').length) {
		$('.datepicker').pickadate();
	}
	
	if ($.fn.pickatime && $('.time').length) {
		$('.time').pickatime();
	}
	
	/* ..............................................
    Theme Toggle (Dark/Light)
    ................................................. */

	$(document).ready(function () {
		var savedTheme = localStorage.getItem('theme-mode');
		if (savedTheme === 'dark') {
			$('body').addClass('dark-mode');
		}

		if (!$('.theme-toggle-btn').length) {
			$('body').append('<button class="theme-toggle-btn" type="button">Dark Mode</button>');
		}

		var syncButtonText = function () {
			if ($('body').hasClass('dark-mode')) {
				$('.theme-toggle-btn').text('Light Mode');
			} else {
				$('.theme-toggle-btn').text('Dark Mode');
			}
		};

		syncButtonText();

		$(document).on('click', '.theme-toggle-btn', function () {
			$('body').toggleClass('dark-mode');
			localStorage.setItem('theme-mode', $('body').hasClass('dark-mode') ? 'dark' : 'light');
			syncButtonText();
		});
	});
	
	
	
	
}(jQuery));
