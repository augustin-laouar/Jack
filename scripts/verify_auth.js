import * as tools from './tools.js';
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

while(true) {
  if(!tools.isLogged()){
    window.location.href = '../html/login.html';
  }
  await wait(10000);
}