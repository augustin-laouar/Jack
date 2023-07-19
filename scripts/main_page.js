import * as tools from './tools.js';

document.addEventListener("DOMContentLoaded", function() {
  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", async function(event){
    tools.logout();
  });
  var settingsButton = document.getElementById('settings');
  settingsButton.addEventListener('click', function(){
    const url = browser.runtime.getURL('../html/settings.html');
    browser.tabs.create({ url });
  });
});