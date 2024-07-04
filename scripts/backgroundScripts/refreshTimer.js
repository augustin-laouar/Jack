import * as tools from '../login_tools.js';

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener('click', function(event){
        tools.storeLastLogin();
    });
  });