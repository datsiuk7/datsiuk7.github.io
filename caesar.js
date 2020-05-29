document.getElementById('count').innerHTML = localStorage.getItem("ceasar");

function start() {
  cleartext();
  globaltext = document.getElementById("textencrupt").value;
  globaltext = deletemark(globaltext);
  resvalidtext = validation(globaltext, 0);
  if (resvalidtext != 0) {
    errorstr = "Символ '" + resvalidtext + "' в тексті неможе бути, так як його немає в алфавіті! Можливо потрібно переключити мову."
    alert(errorstr);
  } else {
    Caesarout(globaltext);
  }
}

function Caesarout(text) {
  localstorage("ceasar");
  cookie(text, "ceasar");
  let n = 0;
  while (n < textlanguage(0).length) {
    if (changecrupts) {
      exitvig = new Caesar(n).encrypt(text)
    } else {
      exitvig = new Caesar(n).decrypt(text)
    }
    out1(exitvig, n);
    n++
  }
  document.getElementById('count').innerHTML = localStorage.getItem("ceasar");
}


class Caesar {
  constructor(shift) {
    this.alphabet = textlanguage(0);
    this.characters = "/*  ";
    this.shift = shift;
    this._shiftedAlphabet = "";
  }
  _shiftAlhabet() {
    this._shiftedAlphabet = this.alphabet.slice(this.shift);
    this._shiftedAlphabet += this.alphabet.slice(0, this.shift);
    this._shiftedAlphabet += this.characters;
    this.alphabet += this.characters;
  }
  encrypt(message) {
    let encryptMessage = "";
    this._shiftAlhabet();
    for (let i = 0; i < message.length; i++) {
      let letterPositionInAlphabet = this.alphabet.indexOf(message[i]);
      encryptMessage += this._shiftedAlphabet[letterPositionInAlphabet];
    }
    return encryptMessage;
  }
  decrypt(message) {
    let decryptMessage = "";
    this._shiftAlhabet();
    for (let i = 0; i < message.length; i++) {
      let letterPositionInAlphabet = this._shiftedAlphabet.indexOf(
        message[i]
      );
      decryptMessage += this.alphabet[letterPositionInAlphabet];
    }
    return decryptMessage;
  }
}

function toggle_light_mode() {
  var app = document.getElementsByTagName("BODY")[0];
  var app3 = document.getElementById("fbsetting");
  if (localStorage.lightMode == "dark") {
    localStorage.lightMode = "light";
    app.setAttribute("data-light-mode", "light");
    app3.setAttribute("data-color-scheme", "light");
  } else {
    localStorage.lightMode = "dark";
    app.setAttribute("data-light-mode", "dark");
    app3.setAttribute("data-color-scheme", "dark");
  }
}
