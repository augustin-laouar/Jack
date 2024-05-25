import * as logsTools from './password/tools.js';
import * as emailStorage from './email/storage_tools.js';
import * as crypto from './tools/crypto.js';
import * as storage from './tools/storage.js';
import * as error from './exception/error.js';

  //Login
  async function sessionExpired(minutes) {
    try{
      const storedDate = await storage.read('lastLogin');
      if(storedDate === null) {
        return true;
      }
      const currentDate = new Date();
      const storedDateObj = new Date(storedDate);
      const elapsedTime = currentDate.getTime() - storedDateObj.getTime();
      if (elapsedTime >= minutes * 60000) {
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
    const connDuration = await getConnectionDuration();
    const res = await sessionExpired(connDuration);
    if(res){
      return false;
    }
    return true;
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

 //verify password, generate and store the derived key based on the password
 export async function login(password){
  try{
    if (await validPassword(password)) {
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
 export async function logout(logoutButtonUsed = false) {
  try{
    if(logoutButtonUsed){
      var now = new Date();
      const connectionDuration = await getConnectionDuration();
      var toStore = new Date(now.getTime() - (parseInt(connectionDuration * 60 * 1000))); 
      storage.store({ lastLogin:toStore.toISOString()})
      .catch(e => {
        error.castError(e, false);
      });
    }
    crypto.deleteDerivedKey();
    window.location.href = '../html/login.html';
  }
  catch(e) {
    throw error.castError(e, false);
  }
 }

async function hashPassword(psw) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(psw);
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } 
  catch (e) {
    throw error.castError(e, false);
  }
}

export async function storeHashedPassword(psw) {
  try {
    const hash = await hashPassword(psw);
    storage.store({ masterPswHash:hash });
  } 
  catch (e) {
    throw error.castError(e, false);
  }
}

export async function validPassword(psw) {
  try {
    const hash = await hashPassword(psw);
    const storedHash = await storage.read('masterPswHash');
    return hash === storedHash;
  } catch (e) {
    throw error.castError(e, false);
  }
}


//re encrypt all data
export async function changePassword(newPsw){
  try {
    const oldKey = await crypto.getDerivedKey();
    const newKey = await crypto.generateDerivedKey(newPsw);
    await storeHashedPassword(newPsw);
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


export function loadDataFromFile(file){
  //TODO
}

export function exportData(){
  //TODO
}