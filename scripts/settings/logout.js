import * as request from '../manager/manager_request.js';

document.addEventListener('DOMContentLoaded', function() {
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(){
      await request.makeRequest('logout', null, null);
      window.location.href = "/html/login.html";
    });
});