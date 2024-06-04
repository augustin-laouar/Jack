export function initClosePopupEvent() {
    const closePopupBtn = document.getElementById('close-popup');
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    closePopupBtn.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });

    overlay.addEventListener('click', function () {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    });
}

export function fillPopupContent(htmlContent) {
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = htmlContent;
}

export function openPopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
}
export function closePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    overlay.classList.add('hidden');
    popup.classList.add('hidden');
}

export function setPopupSize(width, height) {
    const popup = document.getElementById('popup');
    popup.style.width = width + 'px';
    popup.style.height = height + 'px';
}