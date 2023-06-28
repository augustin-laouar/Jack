import * as tools from './tools.js';

document.addEventListener("DOMContentLoaded", function() {
  var logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", async function(event){
    tools.logout();
  });

  var stockerButton = document.getElementById("pwdForm");
  stockerButton.addEventListener("click", async function(event){
    tools.stockerDonnees();
  });
});