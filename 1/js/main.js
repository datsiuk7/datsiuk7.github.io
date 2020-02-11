// $(document).ready(function() {
//   let countRandomNum = 12;
//
//   let player = document.getElementById('player');
//   let cellPlayer = document.getElementById('id1');
//   let cellPosition = cellPlayer.getBoundingClientRect();
//   let positionPlayer = 1;
//   player.style.left = cellPosition.x + cellPosition.width / 2 + "px";
//
//   // function playerPosition() {
//   //
//   // }
//   //
//   // function cellPosition() {
//   //
//   // }
//   //
//   // function random() {
//   //
//   // }
//
//   function newCircle() {
//
//   }
//
//   function clickRandom() {
//     ///random
//     let randclick = Math.floor(Math.random() * countRandomNum) + 1;
//     positionPlayer = parseInt(randclick)+parseInt(cellPlayer.id.substr(2, 4));
//
//     //new circle
//     if(positionPlayer > 34){
//       positionPlayer-=34;
//       cellPlayer = document.getElementById('id'+positionPlayer);
//
//       console.log(positionPlayer+" > 34");
//     }
//     else{
//       cellPlayer = document.getElementById('id'+positionPlayer);
//     }
//   }
//
//
//
//   function fps() {
//     console.log(cellPlayer.id.substr(2, 4));
//     console.log(positionPlayer);
//     // if(positionPlayer != cellPlayer.id.substr(2, 4)){
//     //   positionPlayer++;
//     // }
//
//     cellPosition = cellPlayer.getBoundingClientRect();
//
//     player.style.top = cellPosition.y + cellPosition.height / 3 + "px";
//     player.style.left = cellPosition.x + cellPosition.width / 2 + "px";
//
//   }
//
//   // function randomClik() {
//
//   var click = document.getElementById('click');   // get a reference to your element
//   click.onclick = clickRandom;
//
//   // $(".click").click(clickRandom());
//
//   setInterval(() => fps(), 500);
//
// });


/**
 **
 **name, html, money, credit,
 **
 */
var countPlayers;

$(".playerSetting").hide();
$(".main").hide();
$(".win").hide();

function countPlayer() {
  $(".countPlayer").hide();
  $(".playerSetting").show();
  //get radiobutton count players
  countPlayers = countPlayersForm.countPlayer.value;

  if (countPlayers <= 3) {
    $(".player-input4").hide();
    $("#player4").hide();
    $(".player4Money").hide();
    if (countPlayers == 2) {
      $("#player3").hide();
      $(".player-input3").hide();
      $(".player3Money").hide();
    }
  }
}


/**
 **
 **Створення головного обєкту
 **
 */
let mainObject = new Array;



let player = new Array;
let cellPlayer = document.getElementById('id1');
let cellPosition = cellPlayer.getBoundingClientRect();

function startGame() {

  $(".playerSetting").hide();
  $(".main").show();

  player = new Array;
  cellPlayer = document.getElementById('id1');
  cellPosition = cellPlayer.getBoundingClientRect();
  for (let i = 0; i < countPlayers; i++) {
    mainObject[i] = {
      name: document.getElementById("player" + (i + 1) + "name").value,
      //robot: document.getElementById("player" + (i + 1) + "random").value,
      money: 8000,
      color: "",
      credit: {
        summ: 0,
        circle: 0
      },
      robber: 0,
      tax: 0,
      freeprison: 0,
      sale50: 0,
      freecredit: 0,
      position: 1,
      die: 0,
      build: new Array
    };
    for (let j = 0; j < 35; j++) {
      mainObject[i].build[j] = 0;
    }

    player[i] = document.getElementById('player' + (i + 1));
    player[i].style.top = cellPosition.y + "px";
    player[i].style.left = cellPosition.x + i * 20 + "px";

  }
  changePlayerColor();
  moneyPlayer();

  mainObject[4] = {
    salary: 750,
    rate: 2,
    taxCost: 100
  };
  mainObject[6] = {
    allBuild: new Array
  };
  mainObject[7] = {
    buildPriceStart: new Array,
    buildPrice: new Array,
    buildName: new Array,
  };
  let build = [
    '', 'Старт',
    'Херсон', 'Миколаїв', 'Сімферополь',
    'Податок', 'Скриня скарбів', 'Грабіжник',
    'Одеса', 'Вінниця', 'Чернігів',

    'Одеський вокзал',

    'Ужгород', 'Івано-Франк.', 'Тернопіль',
    'Львів', 'Луцьк', 'Рівне',

    'Луцький вокзал',

    'Хмельницьк', 'Житомир', 'Черкаси',
    //'', '', '',
    'Податок', 'Скриня скарбів', 'Грабіжник',
    'Київ', 'Чернігів', 'Суми',

    'Харківський вокзал',

    'Харків', 'Луганськ', 'Донецьк',
    'Полтава', 'Дніпро', 'Запоріжжя'
  ];
  // mainObject[6].allBuild = new Array;
  // mainObject[7].buildPrice = new Array;
  for (let j = 0; j < 35; j++) {
    mainObject[6].allBuild[j] = -1;
    mainObject[7].buildName[j] = build[j];
    if (j == 11 || j == 18 || j == 28) {
      mainObject[7].buildPriceStart[j] = 2000;
      mainObject[7].buildPrice[j] = mainObject[7].buildPriceStart[j];
    } else if (j != 1) {
      mainObject[7].buildPriceStart[j] = j * 40 + 600;
      mainObject[7].buildPrice[j] = mainObject[7].buildPriceStart[j];
    } else {
      mainObject[7].buildPrice[j] = mainObject[4].salary;
    }
  }
  addDivInDivadeTable();
  buildColorMonopoly();

  // console.log(mainObject);

  // console.log(cellPosition);
}

function addDivInDivadeTable() { //імена будівель та їхня вартість яка записується в html
  for (let j = 1; j < 35; j++) {
    $('#id' + j).append('<div class="textInTablesUp">' + mainObject[7].buildName[j] + '</div>');
    if (j != 1 && j != 5 && j != 6 && j != 7 && j != 22 && j != 23 && j != 24) {
      $('#id' + j).append('<div class="textInTablesDown" id="textInTablesDown' + j + '">' + mainObject[7].buildPrice[j] + '</div>');
    } else if (j == 1) {
      $('#id' + j).append('<div class="textInTablesDown" id="textInTablesDown' + j + '">+' + mainObject[7].buildPrice[j] + '</div>');
    }
  }
}


mainObject[5] = {
  cubeRand: 0
};
mainObject[5] = {
  nextplayer: 0
};
let onceCast = 0; //скільки разів кинути кубик


function tossCube() {
  if (onceCast == 0) {
    tossCubeDone();
    onceCast++;
    console.log("Кубик кинутий!");

  } else {
    console.log("Ви уже кидали кубик!");
  }
}

function tossCubeDone() {
  if (mainObject[5].nextplayer == countPlayers) {
    mainObject[5].nextplayer -= countPlayers;
  }
  let randOne = Math.floor(Math.random() * 6) + 1;
  let randTwo = Math.floor(Math.random() * 6) + 1;
  mainObject[5].cubeRand = randOne + randTwo;
  document.getElementById('imgCube1').src='./img/' + randOne + '.jpg';
  document.getElementById('imgCube2').src='./img/' + randTwo + '.jpg';

  historyAdd("У гравця " + mainObject[mainObject[5].nextplayer].money);
  historyAdd("Кубик кинутий! Випало " + mainObject[5].cubeRand);

  player[mainObject[5].nextplayer] = document.getElementById('player' + (mainObject[5].nextplayer + 1));

  salary();

  cellPlayer = document.getElementById('id' + (mainObject[5].cubeRand + mainObject[mainObject[5].nextplayer].position));
  cellPosition = cellPlayer.getBoundingClientRect();
  mainObject[mainObject[5].nextplayer].position += mainObject[5].cubeRand;

  player[mainObject[5].nextplayer].style.top = cellPosition.y + "px";
  player[mainObject[5].nextplayer].style.left = cellPosition.x + mainObject[5].nextplayer * 20 + "px";
  // console.log("rand = " + mainObject[5].cubeRand);
  // console.log("nextplayer = " + mainObject[5].nextplayer);
  // console.log("position = " + mainObject[mainObject[5].nextplayer].position);
  // console.log(cellPlayer);
  // if(mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] != -1 &&
  //   mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] != mainObject[mainObject[5].nextplayer]){
  //   console.log("Платіть ренту");
  // }

  // console.log("чия будівля" + mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]);
  // console.log("хто" + mainObject[5].nextplayer);
  tax();
  goldbox();
  robber();
  rent();
  moneyPlayer();
  playerDie();
}

function tax() {
  if (mainObject[mainObject[5].nextplayer].position == 5 || mainObject[mainObject[5].nextplayer].position == 22) {
    if (mainObject[mainObject[5].nextplayer].tax == 0) {
      let taxCount = 0;
      for (let i in mainObject[6].allBuild) {
        if (mainObject[6].allBuild[i] == mainObject[5].nextplayer) {
          taxCount++;
        }
      }
      console.log("money do " + mainObject[mainObject[5].nextplayer].money);
      console.log("taxaCostsss" + taxCount * mainObject[4].taxCost);
      historyAdd("Заплатив податку: " + taxCount * mainObject[4].taxCost);
      mainObject[mainObject[5].nextplayer].money -= taxCount * mainObject[4].taxCost;
      console.log("money end " + mainObject[mainObject[5].nextplayer].money);
    } else {
      mainObject[mainObject[5].nextplayer].tax -= 1;
      console.log("Гравець вільний від податку цього разу");
      historyAdd("Гравець вільний від податку цього разу");
    }

  }
}

function goldbox() {
  if (mainObject[mainObject[5].nextplayer].position == 6 || mainObject[mainObject[5].nextplayer].position == 23) {
    // let goldboxRandom = Math.ceil(Math.random()*1000);
    // mainObject[mainObject[5].nextplayer].money += goldboxRandom;
    // console.log("goldbox = " + goldboxRandom);
    let goldboxRandom = Math.ceil(Math.random() * 2);
    console.log("Виграш = " + goldboxRandom);
    if (goldboxRandom == 0) {
      console.log("Вільний від грабіжника");
      historyAdd("Вільний від грабіжника");
      mainObject[mainObject[5].nextplayer].robber += 1;
    } else if (goldboxRandom == 1) {
      console.log("Вільний від податку");
      mainObject[mainObject[5].nextplayer].tax += 1;
      historyAdd("Вільний від податку");
    } else if (goldboxRandom == 2) {
      let goldboxRandomMoney = Math.ceil(Math.random() * 500) + 500;
      // let goldboxRandomMoney = 1;
      mainObject[mainObject[5].nextplayer].money += goldboxRandomMoney;
      console.log("Гроші + " + goldboxRandomMoney);
      historyAdd("Виграв " + goldboxRandomMoney + " валюти");
    }
  }
}

function robber() {
  if (mainObject[mainObject[5].nextplayer].position == 7 || mainObject[mainObject[5].nextplayer].position == 24) {
    if (mainObject[mainObject[5].nextplayer].robber == 0) {
      let robberRandom = Math.ceil(Math.random() * 200) + 100;
      mainObject[mainObject[5].nextplayer].money -= robberRandom;
      console.log("robber = " + robberRandom);
      historyAdd("Грабіжник викрав: " + robberRandom);
    } else {
      mainObject[mainObject[5].nextplayer].robber -= 1;
      console.log("Гравець вільний від грабіжника цього разу!)");
      historyAdd(mainObject[mainObject[5].nextplayer].name + " вільний від грабіжника цього разу!)");
    }

  }
}

function salary() {
  if ((mainObject[5].cubeRand + mainObject[mainObject[5].nextplayer].position) > 34) {
    mainObject[mainObject[5].nextplayer].position -= 34;
    mainObject[mainObject[5].nextplayer].money += mainObject[4].salary;
    historyAdd(mainObject[mainObject[5].nextplayer].name + " отримав " + mainObject[4].salary + " зарплати")
  }
}



function rent() {
  if (mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] != -1 && mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] != mainObject[5].nextplayer) {
    // console.log("кому заплатити" + mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] );
    // console.log("хто ти "  + mainObject[5].nextplayer);
    // console.log("Скільки маєш заплатити" + mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]);
    // console.log("Скільки було спочатку тому кому треба було заплатити" + mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].money);
    // console.log("Скільки було спочатку той хто має платити" + mainObject[mainObject[5].nextplayer].money);
    console.log(" + " + mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].money +
      " ===== - " + mainObject[mainObject[5].nextplayer].money);

    mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].money += mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position];
    mainObject[mainObject[5].nextplayer].money -= mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position];

    console.log(" + " + mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].money +
      " ===== - " + mainObject[mainObject[5].nextplayer].money);
    // console.log("Скільки в кінці залишилося тому кому треба було заплатити" + mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].money);
    // console.log("Скільки в кінці залишилося той хто має платити" + mainObject[mainObject[5].nextplayer].money);
    console.log(mainObject[5].nextplayer + " заплатив " + mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] + " : " + (mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]));
    historyAdd(mainObject[mainObject[5].nextplayer].name + " заплатив " + mainObject[mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]].name + " : " + (mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]));

  }
}

function moneyPlayer() {
  for (let i = 0; i < countPlayers; i++) {
    document.getElementById('player' + (i + 1) + 'MoneyScore').innerHTML = mainObject[i].name + ":" + mainObject[i].money;
  }
}

function changePlayerColor() {
  let j = ["255,0,0", "0,255,0", "0,0,255", "255,255,0"];
  for (let i = 0; i < countPlayers; i++) {
    mainObject[i].color = j[i];
    player[i].style.backgroundColor = "rgba(" + j[i] + ",1)";
    var colorPlayerScore = document.getElementById('player' + (i + 1) + 'MoneyScore');
    colorPlayerScore.style.backgroundColor = "rgba(" + j[i] + ",0.5)";
  }
}
/*
 **
 **Перевірка чи кинутий кубик
 **
 */
function endMove() {
  if (onceCast == 0) {
    console.log("Ви некинули кубика!");
    alert("Гравець (" + mainObject[mainObject[5].nextplayer].name + ") ви некинули кубика!");

  } else {
    endMoveDone();
  }

}
/*
 **
 **Якщо кинутий кубик то змінюємо гравця
 **
 */
function endMoveDone() {

  animateActivePlayer();
  historyAdd("Гравець зупиняється на " + mainObject[7].buildName[mainObject[mainObject[5].nextplayer].position]);
  historyAdd("У гравця " + mainObject[mainObject[5].nextplayer].money);
  if (mainObject[5].nextplayer == parseInt(countPlayers - 1)) {
    mainObject[5].nextplayer = 0;
  } else {
    mainObject[5].nextplayer++;
  }
  if (mainObject[mainObject[5].nextplayer].die == 1) {
    historyAdd("Гравець програв");
    animateActivePlayer();
    endMove();
  }
  // playerDie();
  onceCast = 0;
}

function playerDie() {
  if (mainObject[mainObject[5].nextplayer].money < 0) {
    historyAdd("Гравець (" + mainObject[mainObject[5].nextplayer].name + ") ви програли!!!");
    // animateActivePlayer();
    // mainObject[5].nextplayer++;
    mainObject[mainObject[5].nextplayer].die = 1;
    resetPlayerBuild();
    winplayers();
  }
}
function resetPlayerBuild(){
  for(var i = 0; i < 36; i++){
    if(mainObject[6].allBuild[i] == mainObject[5].nextplayer){
      mainObject[6].allBuild[i] = -1;
      document.getElementById('textInTablesDown' + i).style.backgroundColor = "rgba(0,0,0,0)";
      mainObject[7].buildPrice[i] = mainObject[7].buildPriceStart[i];
      $("#textInTablesDown" + i).text(mainObject[7].buildPriceStart[i]);

    }
  }
}
var countTempswinplayer = 0;
function winplayers(){
  for (var i = 0; i < countPlayers; i++) {
    console.log("norm" + i);
    if(mainObject[i].die == 1){
      countTempswinplayer++;
    }
  }
  console.log(countTempswinplayer + "temps");
  if(countTempswinplayer == (countPlayers-1)){
    //$(".main").hide();
    for (var i = 0; i < countPlayers; i++) {
      if(mainObject[i].die == 0){
        console.log(mainObject[i].name);
        $(".win").show();
        $('.win').append("Переможець = " + mainObject[i].name);
      }
    }
    // $(".win").show();
  }
  console.log(countTempswinplayer + "temps");
  countTempswinplayer=0;
  // else{
  //   countTemps=0;
  // }
}
/*
 **
 **Перевірка чи можна купити буділю і чи це є будьвля
 **
 */
function buy() {
  // if(mainObject[6].allBuild[mainObject[mainObject[5].nextplayer+1].position] == 0){
  // }
  // console.log(mainObject[5].nextplayer);
  // console.log(mainObject[mainObject[5].nextplayer].position);
  // console.log(mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]);
  if (mainObject[mainObject[5].nextplayer].position != 1 &&
    mainObject[mainObject[5].nextplayer].position != 5 &&
    mainObject[mainObject[5].nextplayer].position != 6 &&
    mainObject[mainObject[5].nextplayer].position != 7 &&
    // mainObject[mainObject[5].nextplayer].position != 11 &&
    // mainObject[mainObject[5].nextplayer].position != 18 &&
    mainObject[mainObject[5].nextplayer].position != 22 &&
    mainObject[mainObject[5].nextplayer].position != 23 &&
    mainObject[mainObject[5].nextplayer].position != 24 //&&
    // mainObject[mainObject[5].nextplayer].position != 28
  ) {
    if (mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] == -1 && mainObject[mainObject[5].nextplayer].money >= mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]) {
      mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position] = mainObject[5].nextplayer;
      // alert(mainObject[6].allBuild[mainObject[mainObject[5].nextplayer].position]);
      // alert(mainObject[5].nextplayer);
      // mainObject[mainObject[5].nextplayer].money -= mainObject[mainObject[7].buildPrice[mainObject[5].nextplayer].position];
      mainObject[mainObject[5].nextplayer].money -= mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position];
      console.log("money = " + mainObject[mainObject[5].nextplayer].money);
      console.log(mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]);
      console.log(mainObject[7].buildName[mainObject[mainObject[5].nextplayer].position]);
      console.log("Успішно куплено!");
      historyAdd(mainObject[7].buildName[mainObject[mainObject[5].nextplayer].position] + " куплено за " + mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]);
      document.getElementById('textInTablesDown' + mainObject[mainObject[5].nextplayer].position).style.backgroundColor = "rgba(" + mainObject[mainObject[5].nextplayer].color + ",1)";//0.4
      // $('#id' + mainObject[mainObject[5].nextplayer].position).after('<div class="textInTablesDown" id="textInTablesDown' + mainObject[mainObject[5].nextplayer].position + '">' + mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position] + '</div>');
      mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position] = mainObject[7].buildPriceStart[mainObject[mainObject[5].nextplayer].position] / mainObject[4].rate;
      $("#textInTablesDown" + mainObject[mainObject[5].nextplayer].position).text(mainObject[7].buildPrice[mainObject[mainObject[5].nextplayer].position]);
      monopolyLevel()
      moneyPlayer();
    } else {
      console.log("Неможна купити, зайнято! Або у вас невистачає грошей!");
    }
  } else {
    console.log("це неможна купляти!!!");
  }
}
/*
 **
 **Монополія
 **
 */

function historyAdd(a) {
  if (mainObject[mainObject[5].nextplayer].die != 1) {

    document.getElementById('windowHistory').innerHTML =
      "<div style='background-color: rgba(" + mainObject[mainObject[5].nextplayer].color + ",0.5) '>" + a + "</div>" +
      document.getElementById('windowHistory').innerHTML;
  }
  // mainObject[mainObject[5].nextplayer].color
  // mainObject[mainObject[5].nextplayer].style.backgroundColor = "rgba(" + j[i] + ",0.5)";
}


/*
 **
 **Анімація активного гравця
 **
 */
function animateActivePlayer() {
  // console.log("delete: " + (mainObject[5].nextplayer+1));
  document.getElementById("player" + (mainObject[5].nextplayer + 1)).classList.remove("animateActivePlayer");

  if ((mainObject[5].nextplayer + 2) == (parseInt(countPlayers) + 1)) {
    // console.log("addtrue: " + ((parseInt(countPlayers)+1)-mainObject[5].nextplayer-1));
    document.getElementById("player" + ((parseInt(countPlayers) + 1) - mainObject[5].nextplayer - 1)).classList.add("animateActivePlayer");
  } else {
    // console.log("add: " + (mainObject[5].nextplayer+2));
    document.getElementById("player" + (mainObject[5].nextplayer + 2)).classList.add("animateActivePlayer");
  }
}

var monopolyLevelOne = [
  [2, 3],
  [2, 4],
  [3, 4],

  [8, 9],
  [8, 10],
  [9, 10],

  [12, 13],
  [12, 14],
  [13, 14],

  [15, 16],
  [15, 17],
  [16, 17],

  [19, 20],
  [19, 21],
  [20, 21],

  [25, 26],
  [25, 27],
  [26, 27],

  [29, 30],
  [29, 31],
  [30, 31],

  [32, 33],
  [32, 34],
  [33, 34],

  [11, 18],
  [11, 28],
  [18, 28],
];
var monopolyLevelTwo = [
  [2, 3, 4],
  [8, 9, 10],
  [11, 18, 28],
  [12, 13, 14],
  [15, 16, 17],
  [19, 20, 21],
  [25, 26, 27],
  [29, 30, 31],
  [32, 33, 34]
];
function buildColorMonopoly() {
  let colorArrBuildMonopoly = [
    "122,122,0",
    "0,122,122",
    "0,122,255",
    "180,255,50",
    "122,122,0",
    "0,122,122",
    "50,50,125",
    "125,255,120",
    "50,122,0",
    "205,100,100"
  ];
  var colorBuild;
  for (var i = 0; i < monopolyLevelTwo.length; i++) {
    for (var j = 0; j < 3; j++) {
      colorBuild = document.getElementById("id" + monopolyLevelTwo[i][j]);
      colorBuild.style.backgroundColor = "rgba(" + colorArrBuildMonopoly[i] + ",0.8)";
      // $("#id" + monopolyLevelTwo[i][0]).style.backgroundColor = "rgba(" + colorArrBuildMonopoly[i] + ",1)";
    }
  }
  colorBuild = document.getElementById("id1");
  colorBuild.style.backgroundColor = "rgba(" + colorArrBuildMonopoly[9] + ",0.8)";
}

function monopolyLevel() {
  //historyAdd("Зайшло у левел");
  for (var i = 0; i < monopolyLevelOne.length; i++) {
    console.log(monopolyLevelOne[i][0]);
    // if (mainObject[mainObject[5].nextplayer].build[monopolyLevelOne[i][0]] && mainObject[mainObject[5].nextplayer].build[monopolyLevelOne[i][1]]) {
    // historyAdd(mainObject[6].allBuild[monopolyLevelOne[i][0]] + " === " + mainObject[5].nextplayer);
    if (mainObject[6].allBuild[monopolyLevelOne[i][0]] == mainObject[5].nextplayer && mainObject[6].allBuild[monopolyLevelOne[i][1]] == mainObject[5].nextplayer) {
      mainObject[7].buildPrice[monopolyLevelOne[i][0]] = mainObject[7].buildPriceStart[monopolyLevelOne[i][0]] / mainObject[4].rate * 2;
      mainObject[7].buildPrice[monopolyLevelOne[i][1]] = mainObject[7].buildPriceStart[monopolyLevelOne[i][1]] / mainObject[4].rate * 2;
      $("#textInTablesDown" + monopolyLevelOne[i][0]).text(mainObject[7].buildPrice[monopolyLevelOne[i][0]]);
      $("#textInTablesDown" + monopolyLevelOne[i][1]).text(mainObject[7].buildPrice[monopolyLevelOne[i][1]]);
      //historyAdd("У когось монополія із двох");
    }
  }
  for (var i = 0; i < monopolyLevelTwo.length; i++) {
    if (mainObject[6].allBuild[monopolyLevelTwo[i][0]] == mainObject[5].nextplayer && mainObject[6].allBuild[monopolyLevelTwo[i][1]] == mainObject[5].nextplayer && mainObject[6].allBuild[monopolyLevelTwo[i][2]] == mainObject[5].nextplayer) {
      mainObject[7].buildPrice[monopolyLevelTwo[i][0]] = mainObject[7].buildPriceStart[monopolyLevelTwo[i][0]] / mainObject[4].rate * 3;
      mainObject[7].buildPrice[monopolyLevelTwo[i][1]] = mainObject[7].buildPriceStart[monopolyLevelTwo[i][1]] / mainObject[4].rate * 3;
      mainObject[7].buildPrice[monopolyLevelTwo[i][2]] = mainObject[7].buildPriceStart[monopolyLevelTwo[i][2]] / mainObject[4].rate * 3;
      $("#textInTablesDown" + monopolyLevelTwo[i][0]).text(mainObject[7].buildPrice[monopolyLevelTwo[i][0]]);
      $("#textInTablesDown" + monopolyLevelTwo[i][1]).text(mainObject[7].buildPrice[monopolyLevelTwo[i][1]]);
      $("#textInTablesDown" + monopolyLevelTwo[i][2]).text(mainObject[7].buildPrice[monopolyLevelTwo[i][2]]);

      //historyAdd("У когось монополія із трьох");
    }
  }
}
/*
$(document).ready(function() {
  let countPlayers = 3;
  let namePlayer = ["Саня", "Бодя", "Антон"];
  let randomMaxCount = 12;

  let players;

  function createArrPlayers(countPlayers) {
    //кільксть гравців(масивів в масиві)
    if (countPlayers == 4) players = [
      [],
      [],
      [],
      []
    ];
    else if (countPlayers == 3) players = [
      [],
      [],
      []
    ];
    else players = [
      [],
      []
    ];
    //запис ім'я + html гравців
    for (let i = 0; i < countPlayers; i++) {
      players[i][0] = namePlayer[i];
      players[i][1] = document.getElementById('player' + (i + 1));
    }

  }

  //html код блоку
  let cellBlock = document.getElementById('id1');
  //властивосі/позиція блоку
  let cellPosition = cellBlock.getBoundingClientRect();

  // console.log(cellPosition);

  function firstPosition() {
    for (let i = 0; i < countPlayers; i++) {
      players[i][1].style.top = cellPosition.y + "px";
      players[i][1].style.left = cellPosition.x + "px";
    }
  }

  function randomClick() {
    console.log(players);

    return Math.floor(Math.random() * randomMaxCount) + 1;
  }

  createArrPlayers(countPlayers);
  firstPosition();
  randomClick();

  let clickRand = document.getElementById('clickRand');   // get a reference to your element
  clickRand.onclick = randomClick;





  console.log(players);









});
*/
