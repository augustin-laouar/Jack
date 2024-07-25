import { logout } from "./login_tools.js";

document.addEventListener('DOMContentLoaded', function() {
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      logout(true);
    });


    var navLinks = document.querySelectorAll('.nav-link');
    var contents = document.querySelectorAll('.content');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(function(nav) {
                nav.classList.remove('active');
            });
            link.classList.add('active');
            
            var target = link.getAttribute('data-target');
            contents.forEach(function(content) {
                content.classList.remove('active');
            });
            document.querySelector(target).classList.add('active');
        });
    });
});