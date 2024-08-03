import * as popup from '../popup.js';
import {showPopupInfo} from './info.js';
import { togglePassword } from '../style/toggle_password.js';
import * as request from '../manager/manager_request.js';


export async function reset() {
    await request.makeRequest('reset', null, null);
}

function passwordConfirmPopupContent() {
    return `
      <p class="lead">Confirm your password</p>
      <p class="text-warning" style="font-size:0.9em;">Warning: Resetting will permanently delete all your data and cannot be undone.</p>
      <form id="confirm-psw-form">
          <div class="m-1">
            <div class="form-group password-wrapper">
                <input type="password" id="confirm-psw-input" class="form-control dark-input d-block mx-auto" placeholder="Enter your password" autocomplete="off" required>
                <span id="toggle-btn" class="toggle-password">
                    <img id="show-psw" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <button type="submit" class="confirm-button mt-2 d-block mx-auto">Reset</button>
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
    
    const togglePasswordElement = popupContent.querySelector('#toggle-btn');
    const showIcon = popupContent.querySelector('#show-psw');
    const hideIcon = popupContent.querySelector('#hide-psw');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(confirmPswInput, showIcon, hideIcon);
    });
    return new Promise((resolve, reject) => {
        confirmPswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmPswInput.value;
            try {
                const isValid = await request.makeRequest('password', 'verify', { password: givenPsw});
                if (!isValid) {
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
        await askForPasswordConfirm(); 
        await reset();
        window.location.href = "/html/firstConnection.html";
    });
});