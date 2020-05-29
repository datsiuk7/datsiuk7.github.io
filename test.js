function str(number) {
  tmp = ""
  if (number % 2 == 0) {
    tmp = "парне";
    console.log(tmp);
  } else {
    tmp = "непарне";
    console.log(tmp);
  }
  return tmp;
}
