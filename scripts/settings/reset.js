import * as storage from '../tools/storage.js';
import { validPassword } from '../tools/crypto.js';
import * as crypto from '../tools/crypto.js';
import * as popup from '../popup.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';

async function removeAllData() {
    await storage.remove('derivedKey');
    await storage.remove('emails');
    await storage.remove('lastLogin');
    await storage.remove('connectionDuration');
    await storage.remove('logs');
    await storage.remove('masterPswHash');
    await storage.remove('psw_generators');
}

export async function reset(password) {
    if(password) {
        if(await validPassword(password)) {
            removeAllData();
        }
    }
}

function passwordConfirmPopupContent() {
    return `
      <p class="lead">Confirm your password</p>
      <p class="text-warning" style="font-size:0.9em;">Warning: Resetting will permanently delete all your data and cannot be undone.</p>
      <form id="confirm-psw-form">
          <div class="m-1">
            <input placeholder="Enter your password" type="password" id="confirm-psw-input" autocomplete="off" class="form-control dark-input d-block mx-auto" style="width: 80%;">
            <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 80%;">Reset</button>
          </div>
      </form>
      <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
    `;
}

async function askForPasswordConfirm() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(passwordConfirmPopupContent());
    popup.setPopupSize(300, 300);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmPswForm = popupContent.querySelector('#confirm-psw-form');
    const confirmPswInput = popupContent.querySelector('#confirm-psw-input');

    return new Promise((resolve, reject) => {
        confirmPswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmPswInput.value;
            try {
                if (await crypto.validPassword(givenPsw) === false) {
                    showPopupInfo('Invalid password.', true);
                    confirmPswInput.value = '';
                } else {
                    popup.closePopup();
                    resolve(givenPsw);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}



document.addEventListener('DOMContentLoaded', function() {
    const resetDataButton = document.getElementById('reset-data');
    resetDataButton.addEventListener('click', async function() {
        const password = await askForPasswordConfirm(); 
        await reset(password);
    });
});