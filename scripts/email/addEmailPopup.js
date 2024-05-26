

document.addEventListener("DOMContentLoaded", function() {
    const openPopupBtn = document.getElementById('add-email-button');
    const closePopupBtn = document.getElementById('close-add-popup');
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('add-popup');

    openPopupBtn.addEventListener('click', function () {
        overlay.classList.remove('hidden');
        popup.classList.remove('hidden');
    });

    closePopupBtn.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });

    overlay.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });
});