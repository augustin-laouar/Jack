import * as tools from '../login_tools.js';

async function checkLogin() {
  const isLogged = await tools.isLogged();
  const sessionExpired = await tools.sessionExpired();
  if(isLogged && sessionExpired){
    tools.logout();
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onPeriod(ms){
  while(true) {
    await checkLogin();
    await wait(ms);
  }
}

onPeriod(1000);