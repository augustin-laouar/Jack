import * as tools from './login_tools.js';
import * as crypto from './tools/crypto.js';
import { storeDefaultGenerator } from './password/generator.js';
import { updatePasswordStrength } from './password/pswStrength .js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("create-psw-form");
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm');
    updatePasswordStrength(passwordInput.value);
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      if(passwordInput.value !== confirmInput.value){
        document.getElementById('info').innerText = "Passwords are not the same.";
        return;
      }
      try{
        await crypto.storeHashedPassword(passwordInput.value);
        await storeDefaultGenerator();
        tools.storeConnexionDuration(3);
        window.location.href = "../html/login.html";
      }
      catch(error){
        document.getElementById('info').innerText = "Unexpected error.";
      }
    });
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(passwordInput.value);
    });

  });