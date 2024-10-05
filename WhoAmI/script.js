document.addEventListener('DOMContentLoaded', function () {
    // Масив об'єктів з шляхами до картинок та відповідним текстом
    const imageData = [
        { src: 'img/hello.gif', text: 'Вітаю, тут трішки про мене😊' },
        { src: 'img/myphoto.jpg', text: 'Це я😊' },
        { src: 'img/piano.gif', text: 'Люблю грати на синтезаторі, іноді це виглядає смішно 😅' },
        { src: 'img/drive.gif', text: 'Обожнюю кататися на електросамокаті ⚡️' },
        { src: 'img/flawer.gif', text: 'Дарую квіти лише одній особливій людині 🌷' },
        { src: 'img/compliment.gif', text: 'Часто надсилаю компліменти, бо це піднімає настрій ❤️' },
        { src: 'img/Sagittarius.gif', text: 'Я — Стрілець ♐️' },
        { src: 'img/break_heart.gif', text: 'На жаль, мені тричі розбивали серце 💔' },
        { src: 'img/eatnight.gif', text: 'Буває, що ночами захоплююсь чимось цікавим 🎬' },
        { src: 'img/cook.gif', text: 'Люблю експериментувати на кухні, готую цікаві страви 🍳' },
        { src: 'img/cook2.gif', text: 'Завжди прагну до розвитку й самовдосконалення 📈, вчуся новому, розвиваю навички.' },
        { src: 'img/plan.gif', text: 'Маю амбіції реалізувати кілька важливих проектів, які мене надихають 🚀' },
        { src: 'img/book2.gif', text: 'Люблю читати книги 📚, особливо на тему саморозвитку, бізнес, психологію та мотивації.' },
        { src: 'img/money.gif', text: 'Працюю над тим, щоб досягти фінансової стабільності 💼 і створити комфортне життя для себе та своєї половинки.' },
        { src: 'img/loyalty.gif', text: 'Ціную вірність і чесність, це основа стосунків для мене 🤝.' },
        
        { src: 'img/work1.gif', text: 'Ось так я працюю 💻' },
        { src: 'img/work2.gif', text: 'А іноді ось так😅' },
        { src: 'img/work_love.gif', text: 'Але насправді хочеться ось так' },
        { src: 'img/work_love2.gif', text: 'І навіть так хочеться' },
        
        { src: 'img/addme.gif', text: 'Шукаю ту, яка буде доповнювати мене 👫' },
        { src: 'img/style.gif', text: 'Хочу, щоб у тебе був свій стиль 🌟' },
        
        { src: 'img/book.gif', text: 'Мені важливо, щоб ти розуміла мої цілі та прагнення 📖' },
        { src: 'img/harmful.gif', text: 'Щоб разом ніколи не було нудно' },
        { src: 'img/harmful2.gif', text: 'а ти була трішки "вредненька" 😉' },
        { src: 'img/her_word.gif', text: 'Важливо, щоб ти мала власну думку 💡' },
        { src: 'img/motivation.gif', text: 'Ти будеш моїм мотиватором 💪' },
        { src: 'img/nice_moment.gif', text: 'Цінуватимемо кожен момент разом ❤️' },
        
        { src: 'img/tenderness.gif', text: 'Бути ніжними одне до одного❤️.' },
        { src: 'img/her_massage.gif', text: 'Робитиму масажик👐' },
        { src: 'img/support.gif', text: 'Будемо підтримувати одне одного в будь-якій ситуації 🤝' },
        { src: 'img/wave.gif', text: 'Бути на одній хвилі,' },
        { src: 'img/wave2.gif', text: 'Думати схоже 🌊' },
        { src: 'img/full_around.gif', text: 'І навіть дуркувати разом 😂' },
        { src: 'img/every_kiss.gif', text: 'Де кожен поцілунок буде особливим 💋' },
        { src: 'img/every_dance.gif', text: 'А кожен танець – сповненим пристрасті та любові 💃🕺' },
        { src: 'img/enjoy.gif', text: 'Насолоджуватимемося кожною миттю одне з одним 🌸' },
        { src: 'img/care.gif', text: 'Турбуватимемося одне про одного ❤️‍🩹' },
        { src: 'img/no_ban.gif', text: 'У стосунках не буде обмежень (в межах розумного) 🚫' },
        { src: 'img/smiles.gif', text: 'І багато сміху разом 😄' },
        { src: 'img/peace.gif', text: 'Навіть якщо трапляться суперечки, миритимемося 💕' },
        { src: 'img/dream.gif', text: 'Мріятимемо разом 🌙' },
        { src: 'img/achievement.gif', text: 'І досягатимемо великих цілей 🏆' },

        { src: 'img/music.gif', text: 'Музика – це частина мого життя 🎶' },
        { src: 'img/learn_together.gif', text: 'Разом будемо розвиватися та вчитися новому 📚' },
        { src: 'img/little_nice.gif', text: 'Я люблю робити маленькі приємності для близьких 🎁' },
        { src: 'img/princes.gif', text: 'Ти будеш для мене королевою 👑' },
        { src: 'img/good_think.gif', text: 'Намагатимемось робити лише добро, навіть коли це залишається непомітним 🌼' },
        { src: 'img/bedtogether.gif', text: 'Важливо проводити більше часу разом 🛏' },

        { src: 'img/.gif', text: 'Ось такий я! Сподіваюся, тобі цікаво буде дізнатися більше 😉' },
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