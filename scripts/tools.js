import * as logsTools from './password/tools.js';
import * as emailStorage from './email/storage_tools.js';
import * as crypto from './tools/crypto.js';
import * as storage from './tools/storage.js';

  //Login
  async function sessionExpired(minutes) {
    const data = await storage.read('lastLogin');
    if(!(data && 'lastLogin' in data)) {
      return true;
    }
    const storedDate = data.lastLogin;
    if (storedDate) {
      const currentDate = new Date();
      const storedDateObj = new Date(storedDate);

        const elapsedTime = currentDate.getTime() - storedDateObj.getTime();

        if (elapsedTime >= minutes * 60000) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }  


export function storeLastLogin() {
    const currentDate = new Date();
    storage.store({ lastLogin:currentDate.toISOString() })
 }

export async function isLogged() {
  const connDuration = await getConnexionDuration();
  const res = await sessionExpired(connDuration);
  if(res){
      return false;
  }
  return true;

 }

 //verify password, generate and store the derived key based on the password
 export async function login(password){
  if (await validPassword(password)) {
    storeLastLogin();
    const derivedKey = await crypto.generateDerivedKey(password);
    crypto.storeDerivedKey(derivedKey);
    return true;
  }
  return false;
 }

//set lastLogin to an expired value, and delete derivedKey
 export async function logout(logoutButtonUsed = false) {
  if(logoutButtonUsed){
    var now = new Date();
    const connexionDuration = await getConnexionDuration();
    var toStore = new Date(now.getTime() - (parseInt(connexionDuration * 60 * 1000))); 
    storage.store({ lastLogin:toStore.toISOString()})
  }
  crypto.deleteDerivedKey();
  window.location.href = '../html/login.html';
 }

async function hashPassword(psw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(psw);
  try {
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    throw error;//todo
  }
}

export async function storeHashedPassword(psw) {
  try {
    const hash = await hashPassword(psw);
    storage.store({ password:hash });
  } catch (error) {
    console.error('Error:', error); //todo
  }
}

export async function validPassword(psw) {
  try {
    const hash = await hashPassword(psw);
    const data = await storage.read('password');
    const storedHash = data.password;
    return hash === storedHash;
  } catch (error) {
    console.error('Error:', error); //todo
    return false;
  }
}


//re encrypt all data
export async function changePassword(newPsw){
  const oldKey = await crypto.getDerivedKey();
  const newKey = await crypto.generateDerivedKey(newPsw);
  await storeHashedPassword(newPsw);
  await crypto.storeDerivedKey(newKey);
  await emailStorage.encryptEmailsWithNewKey(oldKey);
  await logsTools.encryptLogsWithNewKey(oldKey);
}

export function storeConnexionDuration(connexionDuration){
  try {
    storage.store( {connexionDuration:connexionDuration })
  } catch (error) {
    //todo
  }
} 

export async function getConnexionDuration(){ // in minutes
  const data = await storage.read('connexionDuration');
  if(!(data && 'connexionDuration' in data)) {
    return 0;
  }
  const duration = data.connexionDuration;
  return parseFloat(duration);
}

export async function isFirstLogin(){
  const data = await storage.read('password');
  if(data && 'password' in data) {
    return false;
  }
  return true;
}


export function loadDataFromFile(file){
  //TODO
}

export function exportData(){
  //TODO
}