document.addEventListener('DOMContentLoaded', function () {
    // Масив об'єктів з шляхами до картинок та відповідним текстом
    const imageData = [
        { src: 'img/beautifullEyes.gif', text: 'Киць це для тебе🥰' },
        { src: 'img/avaValerii.jpg', text: 'Кохана моя Лєрочка🥰' },
        { src: 'img/loveyouandme.gif', text: 'Ти знаєш як ми одне одного кохаємо!' },
        { src: 'img/say.gif', text: 'і хочу тобі сказати що' },

        { src: 'img/eat.gif', text: 'Ти дуже любиш поїсти' },
        { src: 'img/eatnight.gif', text: 'Навіть в ночі' },
        { src: 'img/eatall.gif', text: 'по їжу ти навіть на край світу підеш' },
        { src: 'img/bathe.gif', text: 'ти дуже любиш купатися і бути читенькою, прям як кішечка' },
        { src: 'img/worknight.gif', text: 'ти буваєш пізно працюєш але все таки доробиш роботу' },
        { src: 'img/drive.gif', text: 'киця моя дуже любить гасати по місту і за містом теж' },

        { src: 'img/massageMe.gif', text: 'Я дуже люблю як ти робиш мені масажик!' },
        { src: 'img/kittysleep.gif', text: 'Я дуже люблю дивитися як ти спиш!' },

        { src: 'img/bedtogether.gif', text: 'нам бракує час разом ось так проводити' },

        { src: 'img/cry.gif', text: 'ти сумуєш дуже коли ми давно не бачились' },
        { src: 'img/jumpToMeOnHeads.gif', text: 'а це коли ми довго не бачилися' },
        { src: 'img/hisbest.gif', text: 'це ти коли кажеш що я найкращий' },
        { src: 'img/thank.gif', text: 'дякую тобі за це' },
        
        { src: 'img/angry.gif', text: 'ти буваєш дуже злючкою коли не все так як тобі хочеться' },
        { src: 'img/sad.gif', text: 'мені сумно коли ти на мене сердишся' },
        { src: 'img/funny.gif', text: 'але коли я з тобою поговорю ти стаєш добренькою' },
        { src: 'img/clever.gif', text: 'і навіть не супереч з цим!' },
        
        { src: 'img/glow.gif', text: 'ти аж світишся від щастя коли я тобі роблю приємно' },
        
        
        { src: 'img/workoff.gif', text: 'а це я коли нарешті дописав проект і щасливий, і пишу тобі' },
        { src: 'img/rejoice.gif', text: 'ти радієш коли я тобі пишу прємності' },
        
        { src: 'img/bigbelly.gif', text: 'киця мабуть хоче мене ось так накормити' },
        { src: 'img/dance.gif', text: 'я хочу якось з тобою красиво потанцювати' },
        { src: 'img/beautifullyou.gif', text: 'ти у мене ще та прекрасна кішечка' },

        { src: 'img/lovemykitty.gif', text: 'я просто обожнюю бути з тобою' },
        { src: 'img/end.gif', text: 'киць вітаю тебе з святим Валентином❤️' },
        

    ];

    let currentIndex = 0; // Початковий індекс

  const imageElement = document.getElementById('currentImage');
  const imageTextElement = document.getElementById('imageText');
  const imageIndicatorElement = document.getElementById('imageIndicator'); // Елемент індикатора
  const nextImageButton = document.getElementById('changeImage');
  const previousImageButton = document.getElementById('previousImage');

  function updateImageIndicator() {
    imageIndicatorElement.textContent = `${currentIndex + 1} з ${imageData.length}`; // Оновлення індикатора
  }

  function changeImage(next = true) {
    imageElement.classList.add('hidden');
    setTimeout(function() {
      if (next) {
        currentIndex = (currentIndex + 1) % imageData.length; // Наступне зображення
      } else {
        currentIndex = (currentIndex - 1 + imageData.length) % imageData.length; // Попереднє зображення
      }
      imageElement.src = imageData[currentIndex].src;
      imageTextElement.textContent = imageData[currentIndex].text; // Оновлення тексту
      imageElement.classList.remove('hidden');
      updateImageIndicator(); // Виклик оновлення індикатора
    }, 100);
  }

  nextImageButton.addEventListener('click', function() {
    changeImage(true);
  });

  previousImageButton.addEventListener('click', function() {
    changeImage(false);
  });

  updateImageIndicator(); // Початкове оновлення індикатора
});