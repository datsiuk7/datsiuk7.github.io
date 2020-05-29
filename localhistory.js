load();
function load() {
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (Number.isInteger(parseInt(i)) && localStorage[i] != undefined) {
      document.write(localStorage[i]);
      document.write("<br>");
    }
  }
}

function clearhistory() {
  localStorage.clear();
  location.reload();
}
