let changecrupts = 1;

function changecrupt() {
  if (changecrupts) {
    changecrupts = 0;
    document.getElementById("mainButton").value = "Дешифрувати";
  } else {
    changecrupts = 1;
    document.getElementById("mainButton").value = "Шифрувати";
  }
  // console.log(changecrupts);
}

//функція для видалення всіх символів крім букв
// function elseLiter(){
//   for
// }

function repeatString(firstString, secondString) {
  let resultString = "";
  // Длина финальной строки
  let firstStringLength = firstString.length;
  let it = 0;
  for (let i = 0; i < secondString.length; i++) {
    if (i % firstStringLength === 0) {
      it = 0;
    }
    resultString += firstString[it];
    it++;
  }
  return resultString;
}
//0 - стандарт
//1 - великі та малі лише
//2 - великі та спец символи
//3 - тільки великі
//4 - тільки малі
function textlanguage(stan) {
  lang = document.getElementById("textlanguage").value;
  lang_spec_sumbols = ""
  lang_spec_sumbolsB = " ,.!#$%^&*()";
  en = "";
  pl = "";
  ru = "";
  ua = "";
  enL = "abcdefghijklmnopqrstuvwxyz";
  plL = "aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż";
  ruL = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
  uaL = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
  enB = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  plB = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ";
  ruB = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
  uaB = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";
  //0 - стандарт
  if (stan == 0) {
    lang_spec_sumbols = lang_spec_sumbolsB;
    en = enB + enL;
    pl = plB + plL;
    ru = ruB + ruL;
    ua = uaB + uaL;
  }
  //1 - великі та малі лише
  else if (stan == 1) {
    en = enB + enL;
    pl = plB + plL;
    ru = ruB + ruL;
    ua = uaB + uaL;
  }
  //2 - великі та спец символи
  else if (stan == 2) {
    lang_spec_sumbols = lang_spec_sumbolsB;
    en = enB;
    pl = plB;
    ru = ruB;
    ua = uaB;
  }
  //3 - тільки великі
  else if (stan == 3) {
    en = enB;
    pl = plB;
    ru = ruB;
    ua = uaB;
  }
  //4 - тільки малі
  else if (stan == 4) {
    en = enL;
    pl = plL;
    ru = ruL;
    ua = uaL;
  }

  switch (lang) {
    case "en":
      lang = en;
      break;
    case "pl":
      lang = pl;;
      break;
    case "ru":
      lang = ru;
      break;
    case "ua":
      lang = ua;
      break;
    default:
      alert("error");
  }
  return lang + lang_spec_sumbols;
}

//валідація на правильність введення тексту, якщо правильно то 0, якщо неправильно то виводить перший неправильний символ
function validation(text, stan) {
  lang = textlanguage(stan);
  for (l in text) {
    if (lang.indexOf(text[l]) == -1) {
      return text[l];
    }
  }
  return 0;
}
//для віженера
function out(text) {
  textAll = document.getElementById('text').innerHTML;
  document.getElementById('text').innerHTML = "'" + text + "'" + "<br>" + textAll;
}

function cleartext() {
  document.getElementById('text').innerHTML = " ";
}
//для цезаря
function out1(text, num) {
  document.getElementById('text').innerHTML += "RT" + num + "&emsp;'" + text + "'" + "<br>";
}

function deletemark(text) {
  if (text[0] == "'" && text[text.length - 1] == "'") {
    text = text.slice(1, -1);
  }
  return text;
}

function localstorage(text) {
  if (!parseInt(localStorage.getItem(text))) {
    localStorage.setItem(text, 1);
  } else {
    localStorage.setItem(text, parseInt(localStorage.getItem(text)) + 1);
    console.log(localStorage.getItem(text));
  }
}
function cookie(name, text) {
  localStorage.setItem(localStorage.length, name + ":" + text);
}
