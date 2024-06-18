
import { logout } from '../login_tools.js';

document.addEventListener('DOMContentLoaded', function() {
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(){
      logout(true);
    });
});