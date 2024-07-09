import * as tools from '../login_tools.js';

async function checkLogin() {
  try {
    const isLogged = await tools.isLogged();
    const sessionExpired = await tools.sessionExpired();
    if (isLogged && sessionExpired) {
      await tools.logout();
    }
  } catch (error) {
    //console.error('Error in checkLogin:', error);
  }
}

browser.alarms.onAlarm.addListener(async () => {
  await checkLogin();
  browser.alarms.create({ delayInMinutes: 0.05 });
});

browser.alarms.create({ delayInMinutes: 0.05 });