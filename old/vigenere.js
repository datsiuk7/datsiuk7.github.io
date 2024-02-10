document.getElementById('count').innerHTML = localStorage.getItem("vigenereEn") + "/" + localStorage.getItem("vigenereDe");
function start() {
  globaltext = document.getElementById("textencrupt").value;
  globalkey = document.getElementById("key").value
  globaltext = deletemark(globaltext);
  resvalidtext = validation(globaltext, 0);
  resvalidkey = validation(globalkey, 0);
  if (resvalidtext != 0) {
    errorstr = "Символ '" + resvalidtext + "' в тексті неможе бути, так як його немає в алфавіті! Можливо потрібно переключити мову."
    alert(errorstr);
  }
  else if (resvalidkey != 0) {
    errorstr = "Символ '" + resvalidkey + "' в ключі неможе бути, так як його немає в алфавіті! Можливо потрібно переключити мову."
    alert(errorstr);
  } else {
    Vigenereout(globaltext, globalkey);
  }
}

function Vigenereout(text, key) {
  if (changecrupts) {
    exitvig = new Vigenere().encrypt(text, key);
    localstorage("vigenereEn");
    cookie(text, "vigenereEn");
  } else {
    exitvig = new Vigenere().decrypt(text, key)
    localstorage("vigenereDe");
    cookie(text, "vigenereDe");
  }
  document.getElementById('count').innerHTML = localStorage.getItem("vigenereEn") + "/" + localStorage.getItem("vigenereDe");
  out(exitvig);
}

class Vigenere {
  constructor() {
    this.alphabet = textlanguage(0);
    this.square = [];
  }
  // Генерируем квадрат Виженера
  generateSquare() {
    for (let i = 0; i < this.alphabet.length; i++) {
      let row = this.alphabet.slice(i);
      row += this.alphabet.slice(0, i);
      this.square.push(row);
    }
  }
  getSquare() {
    return this.square;
  }
  encrypt(message, key) {
    this.start = new Date().getTime();

    let encryptMessage = "";
    // Дублируем ключ до длины сообщения
    let newKey = repeatString(key, message);
    // Генерируем квадрат Виженера
    this.generateSquare();
    for (let it = 0; it < message.length; it++) {
      // Индекс строки раный символу сообщения
      let i = this.alphabet.indexOf(message[it]);
      // Индекс колонки раный символу ключа
      let j = this.alphabet.indexOf(newKey[it]);
      // Зашифрованный символ равный пересечению индекса строки и колонки
      encryptMessage += this.square[i][j];
    }
    return encryptMessage;
  }
  decrypt(message, key) {
    let decryptMessage = "";
    let newKey = repeatString(key, message);
    this.generateSquare();
    for (let it = 0; it < message.length; it++) {
      // Берем символ ключа и ищем индекс строки с данным символом
      let i = this.alphabet.indexOf(newKey[it]);
      let j = this.square[i].indexOf(message[it]);
      decryptMessage += this.alphabet[j];
    }
    return decryptMessage;
  }
}
