function start() {
  globaltext = document.getElementById("textencrupt").value;
  globaltext = deletemark(globaltext);
  resvalidtext = validation(globaltext.toLowerCase(), 4);
  if (resvalidtext != 0) {
    errorstr = "Символ '" + resvalidtext + "' в тексті неможе бути, так як його немає в алфавіті! Можливо потрібно переключити мову."
    alert(errorstr);
  } else {
    Affineout(globaltext);
  }
}
console.log();

function Affineout(text) {
  if (changecrupts) {
    exitvig = new Affine(3, 4).encrypt(text)
  } else {
    exitvig = new Affine(3, 4).decrypt(text)
  }
  out(exitvig);
}

class Affine{
    constructor(a, b) {
        this.alphabet = textlanguage(4);
        // a: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 и 25
        this.a = a;
        this.b = b;
    }
    encrypt(message) {
        let encryptMessage = "";
        for (let i = 0; i < message.length; i++) {
            // encryptChar = (ax + b) mod alphabet.length
            let encryptChar =
                (this.a * this.alphabet.indexOf(message[i].toLowerCase()) +
                    this.b) %
                this.alphabet.length;

            encryptMessage += this.alphabet[encryptChar];
        }
        return encryptMessage;
    }
    decrypt(message) {
        let decryptMessage = "";
        let aInverse = 0;
        let flag = 0;
        for (let i = 0; i < message.length; i++) {
            flag = (this.a * i) % this.alphabet.length - 1;
            if (flag) {
                aInverse = i;
            }
        }
        for (let i = 0; i < message.length; i++) {
            //decryptChar = this.a-1 * (y + alphabet.length - this.b) % alphabet.length
            let decryptChar =
                (aInverse *
                    (this.alphabet.indexOf(message[i].toLowerCase()) +
                        this.alphabet.length -
                        this.b)) %
                this.alphabet.length;
            decryptMessage += this.alphabet[decryptChar];
        }
        return decryptMessage;
    }
}
