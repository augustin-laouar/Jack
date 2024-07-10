import * as popup from '../popup.js';
import * as crypto from '../tools/crypto.js';
import * as login_tools from '../login_tools.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';
import { updatePasswordStrength } from '../password/pswStrength.js';
function changePasswordContent() {
    return `
    <div class="container d-flex justify-content-center align-items-center flex-column">
        <p class="lead text-center">Change password</p>
        <form id="change-password-form" class="d-flex flex-column align-items-center" style="width:85%;">
            <input required type="password" class="form-control dark-input mb-1" id="current-psw" placeholder="Current password" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="new-psw" placeholder="New password" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-2" id="new-psw-confirm" placeholder="Confirm new password" autocomplete="off">
            <button type="submit" class="confirm-button mb-2">Change password</button>
            <div id="password-strength-wrapper" class="password-strength-wrapper w-100" style="visibility: hidden;">
                <div class="password-strength" id="password-strength">
                    <div id="password-strength-bar" class="password-strength-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div id="password-strength-text" class="password-strength-text"'></div>
            </div>
        </form>
        <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
    </div>
  `;
}

async function changePassword() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(changePasswordContent());
    popup.openPopup();
    popup.setPopupSize(400, 300);
    const popupContent = document.getElementById('popup-content');
    const changePswForm = popupContent.querySelector('#change-password-form');
    const currentPsw = popupContent.querySelector('#current-psw');
    const newPsw = popupContent.querySelector('#new-psw');
    const newPswConfirm = popupContent.querySelector('#new-psw-confirm');
    currentPsw.value = '';
    newPsw.value = '';
    newPswConfirm.value = '';
    updatePasswordStrength(newPsw.value);
    newPsw.addEventListener('input', async function() {
        updatePasswordStrength(newPsw.value);
    });
    changePswForm.addEventListener('submit', async function(event) {
        try {
            event.preventDefault();
            if(newPsw.value === '' || newPsw.value === null) {
                return;
            }
            if (await crypto.validPassword(currentPsw.value) === false) {
                showPopupInfo('Wrong current password.', true);
                currentPsw.value = '';
            }
            else if(newPsw.value !== newPswConfirm.value){
                showPopupInfo('Passwords are not the same.', true);
                newPsw.value = '';
                newPswConfirm.value = ''
            }
            else {
                await login_tools.changePassword(newPsw.value);
                popup.closePopup();
                currentPsw.value = '';
                newPsw.value = '';
                newPswConfirm.value = ''
                showInfo('Password updated !');
            };
        }
        catch(e) {
            showPopupError(e);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const changePswButton = document.getElementById('change-psw');
    changePswButton.addEventListener('click', function() {
        changePassword();
    });
});