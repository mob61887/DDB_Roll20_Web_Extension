const urlParams = new URLSearchParams(window.location.search);
const param1 = urlParams.get('param1');  // value1
const param2 = urlParams.get('param2');  // value2

console.log(param1, param2);