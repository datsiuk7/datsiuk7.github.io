if (window.innerWidth < 900) {
  $('.pigandtextmove').css('margin-top', '0px');
}
$(window).scroll(function() {
  var fourpugs = $('.fourpack__main__imgpacks').offset().top;
  var heightPigs = $('.pigandtextmove').height();
  var height = fourpugs - window.innerHeight / 2;
  // if (window.innerHeight / 2 > height) {
  //   $('.pigandtextmove').css('margin-top', '0px');
  // } else {

  if (window.innerWidth > 900) {

    if ($(this).scrollTop() > fourpugs - window.innerHeight / 2) {
      if ($(this).scrollTop() < height + fourpugs / 2) {
        $('.pigandtextmove').css('margin-top', $(this).scrollTop() - height - fourpugs / 2 + 'px');
      } else {
        $('.pigandtextmove').css('margin-top', '0px');
      }
    } else {
      $('.pigandtextmove').css('margin-top', -fourpugs / 2 + 'px');
    }
  } else {
    $('.pigandtextmove').css('margin-top', '0px');

  }
  var twoimg = $('.twoimg').offset().top;

  if ($(this).scrollTop() > twoimg) {
    // window.scrollTo(0, 0);
  }


  // }
  // console.log("fourpugs = " + fourpugs);
  // console.log("heightPigs = " + heightPigs);
  // console.log("height = " + height);
  // console.log("features - window.innerHeight/2 = " + (features - window.innerHeight/2));
  // console.log("heightPigs = " + heightPigs);
});

const anchors = document.querySelectorAll('a[href*="#"]')

for (let anchor of anchors) {
  anchor.addEventListener("click", function(event) {
    event.preventDefault();
    const blockID = anchor.getAttribute("href")
    document.querySelector('' + blockID).scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
  })
}

// const endtext = document.querySelector('#endtext')
// endtext.scroll(function() {
// $( "#log" ).append( "<div>Handler for .scroll() called.</div>" );
// console.log("кінець тексту");
// });
// endtext.addEventListener('scroll', function(event) {
//   // document.getElementById('showScroll').innerHTML = pageYOffset + 'px';
//   console.log(pageYOffset);
// });
// var box;
// var count = 0;
// var tumbler = 0;
// $(document).ready(function() {
//   var box = $('.fourpack__main__imgpig');
//   $(window).scroll(function() {
//     var scroll = $(window).scrollTop() + $(window).height() / 2;
//     var box2 = $('.fourpack__main__imgpig');
//     console.log(box2);
//     // var scroll = $(window).scrollTop();
//     //Если скролл до конца елемента
//     //var offset = $element.offset().top + $element.height();
//     //Если скролл до начала елемента
//     var offset = box.offset().top;
//     if (scroll > offset) {
//       if(tumbler == 0){
//         $("html").css("overflow", "hidden");
//       }
//     }
//   });
//
// });
// $(window).on('wheel', function(event){
//
//   // deltaY obviously records vertical scroll, deltaX and deltaZ exist too
//   $(".fourpack__main__imgpig").css("margin-top", count - 100 + "px");
//
//   if(event.originalEvent.deltaY < 0){
//     console.log( 'wheeled up');
//     if(count > 0){
//       count-=10;
//     }
//   }
//   else {
//     console.log( 'wheeled down');
//     if(count < 100){
//       count+=10;
//     }
//     if(count > 90){scroll
//       $("html").css("overflow", "scroll");
//
//     }
//     // wheeled down
//   }
// });
var box;
var count = 0;
$(document).ready(function() {
  var box = $('.twoimgs');
  $(window).scroll(function() {
    var scroll = $(window).scrollTop() + $(window).height() / 2;
    // var scroll = $(window).scrollTop();
    //Если скролл до конца елемента
    //var offset = $element.offset().top + $element.height();
    //Если скролл до начала елемента
    var offset = box.offset().top + box.height() / 2;
    if (scroll > offset && scroll < box.offset().top + box.height() ) {

      if (count < box.height()) {
        window.scrollTo(0, box.offset().top - ($(window).height() - box.height()) / 2);
        $("html").css("overflow", "hidden");
        console.log(scroll + "----" + box.offset().top + box.height());
        scrollableElement.addEventListener('wheel', moveimg);

      } else if (count < 0) {
        console.log("visible");
        $("html").css("overflow", "visible");
      }
      // console.log(scroll);
      // console.log($(this).scrollTop());
    }
  });

  var scrollableElement = document.getElementById('aboutChicos');


  function moveimg(event) {
    console.log("scroll");
    var delta;

    if (event.wheelDelta) {
      delta = event.wheelDelta;
    } else {
      delta = -1 * event.deltaY;
    }

    if (delta < 0) {
      console.log("DOWN = " + count);
      if (count < box.height()) {
        count += 10;
        if(count > box.height()){
          count = box.height()
        }
      } else {
        $("html").css("overflow", "visible");
      }
      console.log(count);
      $('.twoimg__img1__img').css('height', count + 'px');
    } else if (delta > 0) {
      if (count > 0) {
        count -= 10;
        $('.twoimg__img1__img').css('height', count + 'px');
      } else {
        $("html").css("overflow", "visible");
      }
      console.log("UP = " + count);
    }


  }
});
