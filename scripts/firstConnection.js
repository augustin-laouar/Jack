import { updatePasswordStrength } from './password/pswStrength.js';
import { togglePassword } from './style/toggle_password.js';
import * as request from './manager/manager_request.js';

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
        await request.makeRequest('password', 'set', { password: passwordInput.value });
        await request.makeRequest('generators', 'add', { default: true });
        await request.makeRequest('sessionDuration', 'set', { duration: 3 });
        window.location.href = "../html/login.html";
      }
      catch(error){
        document.getElementById('info').innerText = "Unexpected error.";
      }
    });
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(passwordInput.value);
    });

    const togglePasswordElement = document.getElementById('toggle-btn-1');
    const showIcon = document.getElementById('show-psw-1');
    const hideIcon = document.getElementById('hide-psw-1');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(passwordInput, showIcon, hideIcon);
    });
    const togglePasswordElement2 = document.getElementById('toggle-btn-2');
    const showIcon2 = document.getElementById('show-psw-2');
    const hideIcon2 = document.getElementById('hide-psw-2');
    togglePasswordElement2.addEventListener('click', function() { 
        togglePassword(confirmInput, showIcon2, hideIcon2);
    });
  });