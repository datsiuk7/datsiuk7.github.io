
$(document).ready(function(){

    $( ".social li" ).click(function(){
        $(".social li").removeClass("active");
        $(this).addClass("active");
    });

    $( "#nav_icon" ).click(function(){
        $(this).toggleClass("open");
        $(this).closest('nav.menu').find('.menu_list').toggle('slow');

    });

    $( ".var_col" ).click(function(){
        $(this).toggleClass("active");
        $('.apartament_group').addClass("variator");
        $('.var_row').removeClass("active");
    });
    $( ".var_row" ).click(function(){
        $(this).toggleClass("active");
        $('.apartament_group').removeClass("variator");
        $('.var_col').removeClass("active");
    });


    $('.menu_list_item > span.link').click(function() {
        var wer = $(this).closest('.menu_list_item').find('.sub_menu');
        $('.menu_list_item').find('.sub_menu').not(wer).hide('slow');
        $(this).closest('.menu_list_item').find('.sub_menu').toggle('slow');
        $('.menu_list_item > span.link').not(this).removeClass("active");
        $(this).toggleClass("active");
    });

    $('.group_search select').styler();

    $('.my_filter').styler();

    $('#slider_top_object').owlCarousel({
        loop:true,
        margin:10,
        autoplay:true,
        nav:false,
        center:true,
        dots: false,
        responsive:{
            0:{
                items:1
            },
            400:{
                items:2
            },
            600:{
                items:3
            },
            1000:{
                items:4
            },
            1300:{
                items:5
            },
            1500:{
                items:6
            }
        }
    });

    $("#back-top").hide();

    $(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 700) {
                $('#back-top').fadeIn();
            } else {
                $('#back-top').fadeOut();
            }
        });
        $('#back-top a').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 500);
            return false;
        });
    });



    var size = 240,
        overflowContent= $('.description'),
        newsText = overflowContent.text();

    if(newsText.length > size){
        overflowContent.text(newsText.slice(0, size) + ' ...');
    }

    var size = 291,
        overflowContent= $('.info_description'),
        newsText = overflowContent.text();

    if(newsText.length > size){
        overflowContent.text(newsText.slice(0, size) + ' ...');
    }

    jQuery('.bxslider').bxSlider({
        nextText: '',
        prevText: '',
        controls:false,
        pagerCustom: '#bx-pager'
    });
    jQuery('.bx-pager_slider').bxSlider({
        nextText: '',
        prevText: '',
        minSlides: 3,
        maxSlides: 5,
        moveSlides: 1,
        slideMargin: 10,
        infiniteLoop: false,
        hideControlOnEnd:true,
        onSlideBefore: function($slideElement, oldIndex, newIndex){
            $slideElement.parent().find('a').removeClass('active')
            $slideElement.addClass('active');
        },
        responsive: true,
        slideWidth: 87

    });

});

