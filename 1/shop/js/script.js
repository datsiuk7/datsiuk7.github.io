var list = new Vue({
  el: '#app',
  data: {
    min: 0,
    max: 9,
    page: 9,
    nextlist: 9,
    page1: 1,
    page2: 2,
    page3: 3,
    page4: '>',
    action: 1,
    slidermin: 3,
    slidermax: 100,
    sortMainName: 'default',
    items: [
      { id:1, url: 'images/1.png', name: 'Foo1', price: 90, date: 20190720, sale: 0 },
      { id:2, url: 'images/2.png', name: 'Bar2', price: 30, date: 20190721, sale: 0 },
      { id:3, url: 'images/3.png', name: 'Bar3', price: 52, date: 20190822, sale: 0 },

      { id:4, url: 'images/4.png', name: 'Bar4', price: 50, date: 20190623, sale: 1 },
      { id:5, url: 'images/5.png', name: 'Bar5', price: 55, date: 20190725, sale: 0 },
      { id:6, url: 'images/6.png', name: 'Foo6', price: 22, date: 20190710, sale: 1 },

      { id:7, url: 'images/7.png', name: 'Foo7', price: 34, date: 20190722, sale: 0 },
      { id:8, url: 'images/8.png', name: 'Foo8', price: 29, date: 20190721, sale: 1 },
      { id:9, url: 'images/8.png', name: 'Foo8', price: 29, date: 20190729, sale: 0 },

      { id:10, url: 'images/1.png', name: 'Foo10', price: 90, date: 20190728, sale: 0 },
      { id:11, url: 'images/5.png', name: 'Foo11', price: 90, date: 20190620, sale: 0 },
      { id:12, url: 'images/2.png', name: 'Bar12', price: 30, date: 20190721, sale: 0 },
      { id:13, url: 'images/3.png', name: 'Bar13', price: 52, date: 20190122, sale: 0 },
      { id:14, url: 'images/4.png', name: 'Bar14', price: 50, date: 20190629, sale: 0 },
      { id:15, url: 'images/5.png', name: 'Bar15', price: 55, date: 20190721, sale: 1 },
      { id:16, url: 'images/6.png', name: 'Foo16', price: 22, date: 20190715, sale: 0 },
      { id:17, url: 'images/7.png', name: 'Foo17', price: 34, date: 20190727, sale: 0 },
      { id:18, url: 'images/8.png', name: 'Foo18', price: 29, date: 20190726, sale: 0 },
      { id:19, url: 'images/8.png', name: 'Foo19', price: 29, date: 20190724, sale: 0 },
      { id:20, url: 'images/8.png', name: 'Foo20', price: 29, date: 20190728, sale: 0 },
    ]
  },
  computed: {
    ringeprice: function () {
      var slidermax = this.slidermax;
      var slidermin = this.slidermin;
      return this.items.filter(function (item) {
          console.log(slidermax);
          return item.price < slidermax && item.price > slidermin;
      })
    }
    // ,
    // ringesale: function () {
    //   return this.items.filter(function (item) {
    //       console.log(this.action);
    //       return item.price < 60 && item.price > 30 && item.sale == 1;
    //   })
    // }
  },
  methods: {
    changelistPage1: function() {
      if(this.page1 == "<"){
        this.page2--;
        this.page3--;
        this.page4 = ">";
        if(this.page2 == 2){
          this.page1 = 1;
        }
      }
      else{
        this.min = this.page * this.page1 - this.page;
        this.max = this.page * this.page1;
      }
      console.log(Math.ceil(this.items.length/this.page));
    },
    changelistPage2: function() {
      this.min = this.page * this.page2 - this.page;
      this.max = this.page * this.page2;
      if(this.page2 > 2){
        this.page2--;
        this.page3--;
        this.page4 = ">";
      }
      if(this.page2 == 2){
        this.page1 = this.page2 - 1;
      }
    },
    changelistPage3: function() {
      this.min = this.page * this.page3 - this.page;
      this.max = this.page * this.page3;

      if((this.page3 + 1) >= Math.ceil(this.items.length/this.page)){
        this.page3 = Math.ceil(this.items.length/this.page) - 1;
        this.page4 = Math.ceil(this.items.length/this.page);
      }
      else{
        this.page1 = '<';
        this.page2++;
        this.page3++;
        if((this.page3 + 1) >= Math.ceil(this.items.length/this.page)){
          this.page3 = Math.ceil(this.items.length/this.page) - 1;
          this.page4 = Math.ceil(this.items.length/this.page);
        }
      }
    },
    changelistPage4: function() {
       if((this.page3 + 1) >= Math.ceil(this.items.length/this.page)){
         this.page4 = Math.ceil(this.items.length/this.page);
         this.min = this.page * this.page4 - this.page;
         this.max = this.page * this.page4;
       }
       else{
         this.page1 = '<';
         this.page2++;
         this.page3++;
         this.page4 = ">";
         if((this.page3 + 1) >= Math.ceil(this.items.length/this.page)){
           this.page4 = Math.ceil(this.items.length/this.page);
         }
       }
    },


    sortPriceMin: function (d1, d2) {
      this.sortMainName = 'min price';
      return this.items.sort(sortByPriceMin);
    },
    sortPriceMax: function (d1, d2) {
      this.sortMainName = 'max price';

      return this.items.sort(sortByPriceMax);
    },
    sortDate: function (d1, d2) {
      this.sortMainName = 'date';

      return this.items.sort(sortByPriceDate);
    },
    sortId: function (d1, d2) {
      this.sortMainName = 'default';

      return this.items.sort(sortById);
    },
    sortSale: function (d1, d2) {
      this.sortMainName = 'action';
      this.action = 1;
      // console.log(this.action);

      return this.items.sort(sortBySale);
    },
  },
})
var sortByPriceMin = function (d1, d2) { return (d1.price > d2.price) ? 1 : -1; };
var sortByPriceMax = function (d1, d2) { return (d1.price < d2.price) ? 1 : -1; };
var sortByPriceDate = function (d1, d2) { return (d1.date < d2.date) ? 1 : -1; };
var sortById= function (d1, d2) { return (d1.id > d2.id) ? 1 : -1; };
var sortBySale= function (d1, d2) { return (d1.sale < d2.sale) ? 1 : -1; };

// new Vue({
//   el: '#app',
//   data: {
//     name: "Max",
//     age: 33,
//     currentBook: "Vuejs book",
//     books: [],
//     url: 'http://google.com'
//   },
//   methods: {
//     changeName: function() {
//       this.name = "Julia"
//     },
//     addBook: function() {
//       this.books.push(this.currentBook)
//     }
//   },
//   computed: {
//     userInfo: function() {
//       return this.name + " is " + this.age
//     }
//   },
//   watch: {
//     name: function() {
//       console.log(this.name);
//     }
//   }
// })









//////////////////
//carusell
//////////////////

// var owl10 = $('.carousel-block10').owlCarousel({
//   loop:true,
//   margin:10,
//   nav:true,
//   responsive: {
//     0: {
//       items: 1
//     }
//   }
// })
//
// $('.block10NextBtn').click(function() {
//   owl10.trigger('next.owl.carousel');
// });
// $('.block10PreviousBtn').click(function() {
//   owl10.trigger('prev.owl.carousel');
// });


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
