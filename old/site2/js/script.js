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
// var box;
// $(document).ready(function() {
//   var box = $('.twoimg');
//   $(window).scroll(function() {
//     var scroll = $(window).scrollTop() + $(window).height() / 2;
//     // var scroll = $(window).scrollTop();
//     //Если скролл до конца елемента
//     //var offset = $element.offset().top + $element.height();
//     //Если скролл до начала елемента
//     var offset = box.offset().top;
//     if (scroll > offset) {
//       // $("html").css("overflow", "hidden");
//     }
//   });
//
// });
