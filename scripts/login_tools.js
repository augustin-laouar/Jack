import * as logsTools from './password/tools.js';
import * as emailStorage from './email/storage_tools.js';
import * as crypto from './tools/crypto.js';
import * as storage from './tools/storage.js';
import * as error from './exception/error.js';

  //Login
export async function sessionExpired() {
    try{
      const storedDate = await storage.read('lastLogin');
      const sessionDuration = await storage.read('connectionDuration');
      if(storedDate === null) {
        return true;
      }
      const currentDate = new Date();
      const storedDateObj = new Date(storedDate);
      const elapsedTime = currentDate.getTime() - storedDateObj.getTime();
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


export function storeLastLogin() {
  try{
    const currentDate = new Date();
    storage.store({ lastLogin:currentDate.toISOString() })
    .catch(e => {
      throw error.castError(e, false);
    });
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

export async function isLogged() {
  try {
    const logged = await storage.read('logged');
    return logged;
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

 //verify password, generate and store the derived key based on the password
 export async function login(password){
  try{
    if (await crypto.validPassword(password)) {
      storage.store({ logged: true })
      storeLastLogin();
      const derivedKey = await crypto.generateDerivedKey(password);
      crypto.storeDerivedKey(derivedKey)
      .catch(e => {
        throw error.castError(e, false);
      });
      return true;
    }
    return false;
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

//set lastLogin to an expired value, and delete derivedKey
 export async function logout() {
  try{
    crypto.deleteDerivedKey();
    window.location.href = '../html/login.html';
    storage.store({ logged: false })
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

//re encrypt all data
export async function changePassword(newPsw){
  try {
    const oldKey = await crypto.getDerivedKey();
    const newKey = await crypto.generateDerivedKey(newPsw);
    await crypto.storeHashedPassword(newPsw);
    await crypto.storeDerivedKey(newKey);
    await emailStorage.encryptEmailsWithNewKey(oldKey);
    await logsTools.encryptLogsWithNewKey(oldKey);
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export function storeConnexionDuration(connectionDuration){
    storage.store( {connectionDuration:connectionDuration })
    .catch(e => {
      throw error.castError(e, false);
    });
} 

export async function getConnectionDuration(){ // in minutes
  try {
    const duration = await storage.read('connectionDuration');
    if(duration === null) {
      return 0;
    }
    return parseFloat(duration);
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function isFirstLogin(){
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


