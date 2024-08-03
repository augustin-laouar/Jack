import * as error from '../../exception/error.js';
import * as storage from '../../tools/storage.js'
import { getIsLogged, setLastAction, getLastAction } from '../vars.js';

async function sessionExpired() {
    try{
        const isLogged = getIsLogged();
        const lastAction = getLastAction();
        if(lastAction === null) {
            return true;
        }
        if(!isLogged) {
            return true;
        }
        const sessionDuration = await storage.read('connectionDuration');
        if(!sessionDuration) {
            return true;
        }
        const currentDate = new Date();
        const elapsedTime = currentDate.getTime() - lastAction.getTime();
        if (elapsedTime >= sessionDuration * 60000) {
            return true;
        } 
        else {
            return false;
        }
    }
    catch(e) {
        throw error.castError(e, false);
    }
} 

async function sessionTimeout() {
    const lastAction = getLastAction();
    if(lastAction === null) {
        return false;
    }
    const sessionDuration = await storage.read('connectionDuration');
    if(!sessionDuration) {
        return false;
    }
    const currentDate = new Date();
    const elapsedTime = currentDate.getTime() - lastAction.getTime();
    if (elapsedTime >= sessionDuration * 60000) {
        return true;
    } 
    else {
        return false;
    }
}
function updateLastAction() {
    try{
        const currentDate = new Date();
        setLastAction(currentDate);
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function isFirstLogin(){
    try {
        const hash = await storage.read('masterPswHash');
        if(hash === null) {
            return true;
        }
        return false;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}
/*
* CHECK : check if session is active
* UPDATE : update lastAction
*/
export async function handle(message) {
    if(message.type === 'check') {
        const expired = await sessionExpired();
        const result = !expired;
        return result;
    }
    if(message.type === 'timeout') {
        const result = await sessionTimeout();
        return result;
    }
    if(message.type === 'update') {
        updateLastAction();
        return true;
    }
    if(message.type === 'isFirstLogin') {
        const result = await isFirstLogin();
        return result;
    }
}