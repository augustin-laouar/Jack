import * as tools from './tools.js';

document.addEventListener("DOMContentLoaded", function() {
    var logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", async function(event){
      tools.logout();
    });
  });
  document.getElementById("stockerBtn").addEventListener("click", tools.stockerDonnees);