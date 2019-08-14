Vue.component('paginate', VuejsPaginate)
var Vue = new Vue({
  el: '#app',
  components: {
    VueSlider: window['vue-slider-component'],
  },
  data: {
    max: 9,
    page: 9,
    action: 0,
    slidermin: 3,
    slidermax: 100,
    sliderminfilter: 0,
    slidermaxfilter: 100,
    sortMainName: 'default',
    minprice: 0,
    maxprice: 100,
    value_slider: [0, 100],
    items: [
      { id:1, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:2, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:3, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
    ],
    womenShoesItems: [
      { id:1, url: 'images/shoes/1.png', name: 'Foo1', price: 90, date: 20190720, sale: 0 },
      { id:2, url: 'images/shoes/1.png', name: 'Bar2', price: 81, date: 20190721, sale: 0 },
      { id:3, url: 'images/shoes/1.png', name: 'Bar3', price: 21, date: 20190822, sale: 0 },
    ],
    womenClothesItems: [
      { id:1, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:2, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:3, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:4, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:5, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:6, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:7, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:8, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:9, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:10, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:11, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:12, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:13, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:14, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:15, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:16, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:17, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:18, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:19, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:20, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:21, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:22, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:23, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:24, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:25, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:26, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:27, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:28, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:29, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:1, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:2, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:3, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:4, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:5, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:6, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:7, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:8, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:9, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:10, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:11, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:12, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:13, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:14, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:15, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:16, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:17, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:18, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:19, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:20, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:21, url: 'images/dress/1.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:22, url: 'images/dress/2.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:23, url: 'images/dress/3.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:24, url: 'images/dress/4.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:25, url: 'images/dress/5.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 0 },
      { id:26, url: 'images/dress/6.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },
      { id:27, url: 'images/dress/7.png', name: 'nadia dress', price: 64.95, date: 20190720, sale: 0 },
      { id:28, url: 'images/dress/8.png', name: 'sofi blouse', price: 26.95, date: 20190721, sale: 1 },
      { id:29, url: 'images/dress/9.png', name: 'gooding short', price: 79.95, date: 20190722, sale: 0 },



    ],
    cart: [{}],
    cartprice: 0
  },
  computed: {
    ringeprice: function () {
      this.max = this.page;
      var sliderminfilter = this.sliderminfilter;
      var slidermaxfilter = this.slidermaxfilter;
      var action = this.action;
      return this.items.filter(function (item) {
          if(action == 0){
            return item.price >= sliderminfilter && item.price <= slidermaxfilter;
          }
          else{
            return item.price >= sliderminfilter && item.price <= slidermaxfilter && item.sale;
          }
      })
    }
  },

  methods: {
    paginate (pageNum) {
      this.max = pageNum*this.page;
      console.log(pageNum)
    },
    sortPriceMin: function (d1, d2) {
      this.sortMainName = 'min price';
      this.action = 0;
      return this.ringeprice.sort(sortByPriceMin);
    },
    sortPriceMax: function (d1, d2) {
      this.sortMainName = 'max price';
      this.action = 0;
      return this.ringeprice.sort(sortByPriceMax);
    },
    sortDate: function (d1, d2) {
      this.sortMainName = 'date';
      this.action = 0;
      return this.ringeprice.sort(sortByPriceDate);
    },
    sortId: function (d1, d2) {
      this.sortMainName = 'default';
      this.action = 0;
      return this.ringeprice.sort(sortById);
    },
    sortSale: function (d1, d2) {
      this.sortMainName = 'action';
      this.action = 1;
      return this.ringeprice.sort(sortBySale);
      console.log(this.ringeprice);
    },
    womenClothes: function () {
      this.items = this.womenClothesItems;
    },
    womenShoes: function () {
      this.items = this.womenShoesItems;
    },
    filter: function () {
      // this.ringe = this.ringeprice;
      this.sliderminfilter =  this.value_slider[0];
      this.slidermaxfilter =  this.value_slider[1];
    },
    addCart: function (id) {
      this.cart.push(this.ringeprice[id - 1]);
      // console.log(this.ringeprice[id]);
      // console.log(id);
      this.cartprice += this.ringeprice[id - 1].price;
      this.cartprice = Math.round(this.cartprice*100)/100;
      console.log(this.cart);
    }
  },

})


var sortByPriceMin = function (d1, d2) { return (d1.price > d2.price) ? 1 : -1; };
var sortByPriceMax = function (d1, d2) { return (d1.price < d2.price) ? 1 : -1; };
var sortByPriceDate = function (d1, d2) { return (d1.date < d2.date) ? 1 : -1; };
var sortById= function (d1, d2) { return (d1.id > d2.id) ? 1 : -1; };
var sortBySale= function (d1, d2) { return (d1.sale < d2.sale) ? 1 : -1; };



var owl = $('.owl-carousel').owlCarousel({
  loop: true,
  margin: 10,
  nav: false,
  responsive: {
    0: {
      items: 1
    }
  }
})
$('.owlNextBtn').click(function() {
  owl.trigger('next.owl.carousel');
});
$('.owlPreviousBtn').click(function() {
  owl.trigger('prev.owl.carousel');
});

var par = document.querySelectorAll("#ul1 .li1");
console.log(par);
var ii = 0;
for(var i=0; i<par.length; i++){
  par[i].onclick = function(){
    if(ii == 0){
      this.classList.toggle("minus");
      ii += 1;
    }
    else{
      ii -=1;
    }
  }
}
