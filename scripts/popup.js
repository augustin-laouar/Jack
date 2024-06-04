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

export function initOpenPopupEvent(openButtonId) {
    const openPopupBtn = document.getElementById(openButtonId);
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    openPopupBtn.addEventListener('click', function () {
        overlay.classList.remove('hidden');
        popup.classList.remove('hidden');
    });
}

export function fillPopupContent(htmlContent) {
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = htmlContent;
}

export function showPopupInfo(content) {
    if(!(e instanceof error.Error)){
        return;
      }
      const message = error.errorToString(e);
      const infoLabel = document.getElementById('info-popup');
      infoLabel.innerHTML = message;
}