$(document).ready(function() {

});

document.getElementById('butShowContact').onclick = function() {
  document.getElementById('boxSliseContact').classList.toggle('displayNone');
  document.getElementById('boxSliseContactMessage').classList.toggle('displayShow');
}





var owlblock5 = $('.block5__carusel').owlCarousel({
  loop: true,
  nav: false,
  margin: 15,
  responsive: {
    0: {
      items: 1
    },
    470: {
      items: 2
    },
    700: {
      items: 3
    },
    1000: {
      items: 4
    }
  }
})
$('.block5__arrows__arrow__right').click(function() {
  owlblock5.trigger('next.owl.carousel');
});
$('.block5__arrows__arrow__left').click(function() {
  owlblock5.trigger('prev.owl.carousel');
});


var owlblock6 = $('.block6__carusel').owlCarousel({
  loop: false,
  nav: false,
  dots: false,
  // margin: 10,
  onInitialized: counter,
  onTranslated: counter,
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
    800: {
      items: 4
    },
    1000: {
      items: 5
    }
  }
})

function counter(event) {
  var element = event.target; // DOM element, in this example .owl-carousel
  var items = event.item.count; // Number of items
  var item = event.item.index + 1;
  var arrowleft = document.getElementById("block6arrowleft");
  var arrowright = document.getElementById("block6arrowright");
  if (item == 1) {
    arrowleft.classList.add("displayNone");
    arrowright.classList.remove("displayNone");
  }
  else if(item == 6){
    arrowright.classList.add("displayNone");
    arrowleft.classList.remove("displayNone");
  }
  else{
    arrowleft.classList.remove("displayNone");
    arrowright.classList.remove("displayNone");
  }
}
$('.block6__arrows__arrow__right').click(function() {
  owlblock6.trigger('next.owl.carousel');
});
$('.block6__arrows__arrow__left').click(function() {
  owlblock6.trigger('prev.owl.carousel');
});
var owlblock4 = $('.block4__carusel').owlCarousel({
  loop: true,
  margin: 20,
  nav: false,
  dots: false,
  responsive: {
    0: {
      items: 1
    },
    200: {
      items: 2
    },
    400: {
      items: 3
    },
    600: {
      items: 4
    },
    700: {
      items: 5
    },
    800: {
      items: 6
    }
  }
})
$('.block4__arrows__arrowright').click(function() {
  owlblock4.trigger('next.owl.carousel');
});
$('.block4__arrows__arrowleft').click(function() {
  owlblock4.trigger('prev.owl.carousel');
});
