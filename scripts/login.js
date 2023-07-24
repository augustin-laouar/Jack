import * as tools from './tools.js';

document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("login-form");
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    await tools.storeHashedPassword("titi"); //enlever
    var password = document.getElementById("password").value;
    if (await tools.validPassword(password)) {
      tools.storeLastLogin();
      window.location.href = "../html/emails.html";
    }
  });
});