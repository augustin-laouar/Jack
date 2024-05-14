import * as tools from '../tools.js';

async function checkLogin() {
  const firstCon = await tools.isFirstLogin();

  if(firstCon){
    window.location.href = '../html/firstConnection.html';
  }
  else{
    const isLogged = await tools.isLogged();
    if(!isLogged){
      window.location.href = '../html/login.html';
      tools.logout();
    }
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onPeriod(ms){
  var counter = 0;
  while(true) {
   await checkLogin();
   if(document.getElementById('info').innerHTML !== '')
      counter ++;
  
    if(counter == 5){ 
      document.getElementById('info').innerHTML = '';
      counter = 0;
    }
    await wait(ms);
  }

}

checkLogin();
document.addEventListener("DOMContentLoaded", function() {
  onPeriod(1000);
});