var color = "#00a99d";
// var color = "#3498db";
// var color = "LimeGreen";
var color = "purple";
//////////////////
//carusell
//////////////////

var owl10 = $('.carousel-block10').owlCarousel({
  loop: true,
  nav: false,
  dot: false,
  margin: 10,
  responsive: {
    0: {
      items: 1
    },
    400: {
      items: 2
    },
    600: {
      items: 3
    },
    1000: {
      items: 4
    }
  }
})

$('.block10NextBtn').click(function() {
  owl10.trigger('next.owl.carousel');
});
$('.block10PreviousBtn').click(function() {
  owl10.trigger('prev.owl.carousel');
});

var owl11 = $('.carousel-block11').owlCarousel({
  loop: true,
  nav: false,
  dot: false,
  margin: 10,
  responsive: {
    0: {
      items: 1

    }
  }
})

$('.block11NextBtn').click(function() {
  owl11.trigger('next.owl.carousel');
});
$('.block11PreviousBtn').click(function() {
  owl11.trigger('prev.owl.carousel');
});

var owl12 = $('.carousel-block12').owlCarousel({
  loop: true,
  nav: false,
  dot: false,
  margin: 10,
  responsive: {
    0: {
      items: 1
    },
    400: {
      items: 2
    },
    600: {
      items: 3
    },
    1000: {
      items: 4
    }
  }
})

$('.block12NextBtn').click(function() {
  owl12.trigger('next.owl.carousel');
});
$('.block12PreviousBtn').click(function() {
  owl12.trigger('prev.owl.carousel');
});


//////////////////
//scroll view percent
//////////////////

function scroll() {
  $(document).ready(function() {
    for (var i = 1; i < 7; i++) {
      const element = document.querySelector('#circle' + i);
      element.classList.add('animated', 'flipInX', 'zoomIn');
      $('#circle' + i).circliful({
        animation: 1,
        animationStep: 3,
        start: 0,
        showPercent: 1,
        backgroundColor: '#fff',
        foregroundColor: color,
        fontColor: '#fff',
        multiPercentage: 1,
        foregroundBorderWidth: 3,
        backgroundBorderWidth: 3,
      });
    }
  });
}
jQuery(function($) {
  for (var i = 1; i < 7; i++) {
    $("#circle3").viewportChecker({
      offset: 50,
      repeat: false,
      callbackFunction: function() {

        scroll();
      }
    });
  }
});

//////////////////
//scroll view block
//////////////////

jQuery(document).ready(function() {
  for (var i = 1; i < 18; i++) {
    if (i != 2) {
      jQuery('.block' + i).viewportChecker({
        classToAdd: 'visible animated fadeIn',
        offset: 100,
      });
    }
  }
});

////////////////////////
///go to top
//////////////////////

$(document).ready(function() {
  $(document).on('click', 'a', function(e) {


    if ($(document).width() < 570) {
      // $("link[id='circledown']").attr('href', '#block2');
      $("#circledown").attr("href", "#block3");
      console.log($(document).width());
    } else {
      // $("link[id='circledown']").attr('href', '#block3');
      $("#circledown").attr("href", "#block2");
      console.log($(document).width());
    }

    elementClick = $(this).attr("href");
    if ($(this).attr("href") == "#block2") {
      // console.log($(this).attr("href"));
      destination = $(elementClick).offset().top;
      // console.log(destination);

      $("body,html").animate({
        scrollTop: destination
      }, 800);
      return false;
    } else {
      console.log($(this).attr("href"));
      destination = $(elementClick).offset().top - 60;
      // console.log(destination);
      $("body,html").animate({
        scrollTop: destination
      }, 800);
      return false;
    }

  });
});


////////////////////////
///fixed menu
//////////////////////

$(window).bind('scroll', function() {
  if ($(window).scrollTop() > $(window).height()) {
    $('.heightmenu').addClass('heightmenu2'),
      $('.menu').addClass('fixed shadows');
  } else {
    $('.heightmenu').removeClass('heightmenu2'),
      $('.menu').removeClass('fixed shadows');
  }
});


////////////////////////
///menu scroll
//////////////////////


(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 60)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 70
  });

})(jQuery); // End of use strict
