import * as tools from './login_tools.js';
import * as error from './exception/error.js';

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
    infoLabel.className = 'text-info ';

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
        /*const loadDataButton = document.getElementById('load-data');
        loadDataButton.addEventListener('click', function(){
            const loadDataFile = document.getElementById('load-data-file');
            const pswCheckInput = document.getElementById('psw-check');
            //TODO
        });
        const exportDataButton = document.getElementById('export-data');
        exportDataButton.addEventListener('click', function(){
            const pswCheckInput = document.getElementById('psw-check');
            //TODO
        });*/
});