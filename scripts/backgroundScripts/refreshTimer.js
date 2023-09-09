import * as tools from '../tools.js';

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener('click', function(){
        tools.storeLastLogin();
    });
  });