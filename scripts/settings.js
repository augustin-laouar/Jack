import * as tools from './tools.js';
import * as errorManager from './exception/settingsError.js';

function showError(error){
    if(!(error instanceof errorManager.Error)){
      return;
    }
    const errorStr = error.details;
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = errorStr;
    if(error.type === 1){
      infoLabel.className = 'text-danger';
    }
    if(error.type === 2){
        infoLabel.className = 'text-warning';

    }
  }

  function showInfo(message){
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-info ';

  }

async function changePassword(oldPsw, newPsw, newPswConfirm){
    if(newPsw !== newPswConfirm){
        throw new errorManager.Error(2, 'Passwords are not the same.');
    }
    if(await tools.validPassword(oldPsw) === false){
        throw new errorManager.Error(2, 'Your current password is unvalid.');

    }
    try{    
        await tools.changePassword(newPsw);
    }
    catch(error){
        throw new errorManager.Error(1, 'Unexpected error.');
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
        const changeConnexionDurationForm = document.getElementById('change-connexion-duration');
        changeConnexionDurationForm.addEventListener('submit', function(event){
            event.preventDefault();
            const connexionDurationSelect = document.getElementById('connexion-duration-value');
            tools.storeConnexionDuration(connexionDurationSelect.value);
            showInfo('Connexion duration updated !');
        });
        const loadDataButton = document.getElementById('load-data');
        loadDataButton.addEventListener('click', function(){
            const loadDataFile = document.getElementById('load-data-file');
            const pswCheckInput = document.getElementById('psw-check');
            //TODO
        });
        const exportDataButton = document.getElementById('export-data');
        newEncryptionKeyButton.addEventListener('click', function(){
            const pswCheckInput = document.getElementById('psw-check');
            //TODO
        });
});