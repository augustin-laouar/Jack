import * as tools from './login_tools.js';
import * as error from './exception/error.js';
import * as export_tools from './export.js';
import * as crypto from './tools/crypto.js';

function showError(e){
    if(!(e instanceof error.Error)){
        return;
    }
    const message = error.errorToString(e);
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-warning';
}

function showInfo(message){
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-info';

}

async function changePassword(oldPsw, newPsw, newPswConfirm){
    try{
        if(newPsw !== newPswConfirm){
            throw new error.Error('Passwords are not the same.', true);
        }
        if(await crypto.validPassword(oldPsw) === false){
            throw new error.Error('Your current password is invalid.', true);
        }
        await tools.changePassword(newPsw);
    }
    catch(e){
        throw error.castError(e, false);
    }
}


function closeAddPopup()  {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('password-popup');
    overlay.classList.add('hidden');
    popup.classList.add('hidden');
}


//MAIN
document.addEventListener('DOMContentLoaded', function() {
        const changePswForm = document.getElementById('change-password');
        changePswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const oldPsw = document.getElementById('old-psw');
            const newPsw = document.getElementById('new-psw');
            const newPswConfirm = document.getElementById('new-psw-confirm');
            try{
                await changePassword(oldPsw.value, newPsw.value, newPswConfirm.value);
                showInfo('Password updated !');
            }
            catch(error){
                showError(error);
            }
            oldPsw.value = '';
            newPsw.value = '';
            newPswConfirm.value = '';
        });
        const changeConnDurationForm = document.getElementById('change-connection-duration');
        changeConnDurationForm.addEventListener('submit', function(event){
            event.preventDefault();
            const connDurationSelect = document.getElementById('connection-duration-value');
            tools.storeConnexionDuration(connDurationSelect.value);
            showInfo('Connection duration updated !');
        });

        const importAccountButton = document.getElementById('import-account');
        importAccountButton.addEventListener('click', async function(){
            const importAccountFile = document.getElementById('import-account-file');
            const pswCheckInput = document.getElementById('import-psw');
            const keepCurrPsw = document.getElementById('import-keep-psw');
            if(importAccountFile.files.length === 0) {
                showError(new error.Error('Please select an account file to import.', true));
                return;
            }
            if (!confirm('Do you want to import this account file? Your current data will be lost.')) {
                return;
            }
            try {
                const file = importAccountFile.files[0];
                await export_tools.import_account(file,pswCheckInput.value, keepCurrPsw.checked);
                showInfo('Account imported with success !');
            }
            catch(e) {
                showError(e);
            }
        });

        const exportDataButton = document.getElementById('export-account');
        exportDataButton.addEventListener('click', async function(){
            const pswCheckInput = document.getElementById('export-psw');
            try{
                await export_tools.export_account(pswCheckInput.value);
            }
            catch(e) {
                showError(new error.Error('Unexpected error while exporting your account.', true));
            }
        });
});