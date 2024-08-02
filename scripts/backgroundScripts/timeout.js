import { directRequest } from '../manager/manager.js';

async function checkLogin() {
  try {
    const sessionTimeout = await directRequest('session', 'timeout', null);
    if (sessionTimeout) {
      await directRequest('logout', null, null);
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