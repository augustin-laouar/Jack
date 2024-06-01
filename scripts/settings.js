import * as tools from './login_tools.js';
import * as error from './exception/error.js';
import * as export_tools from './export.js';

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
        if(await tools.validPassword(oldPsw) === false){
            throw new error.Error('Your current password is invalid.', true);
        }
        await tools.changePassword(newPsw);
    }
    catch(e){
        throw error.castError(e, false);
    }
}

async function export_account(password) {
    if(await tools.validPassword(password) === false){
        throw new error.Error('Your current password is invalid.', true);
    }
    try{
        await export_tools.export_account();
    }
    catch(e) {
        throw new error.Error('Unexpected error while exporting your account.', true);
    }
}

async function import_account(jsonfile, password) {
    //Appel popup "etes vous sur"
    //Verification du password
    //Appel de la fonction de export.js
}

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
            if(importAccountFile.files.length === 0) {
                showError(error.Error('Please select a file.', true));
            }
            try {
                const file = importAccountFile.files[0];
                await import_account(file,pswCheckInput.value);
            }
            catch(e) {
                showError(e);
            }
        });

        const exportDataButton = document.getElementById('export-account');
        exportDataButton.addEventListener('click', async function(){
            const pswCheckInput = document.getElementById('export-psw');
            try {
                await export_account(pswCheckInput.value);
            }
            catch(e) {
                showError(e);
            }
        });
});