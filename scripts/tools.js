import * as pswTools from './passwordScripts/tools.js';
import * as emailTools from './emailScripts/tools.js';
/**
 * This file contains every tools we have to use in other modules
 */



//COOKIE
export function createCookie(name, value, url, minutes) {
    const milliseconds = minutes * 60 * 1000;
    const expirationDate = new Date(Date.now() + milliseconds).getTime() / 1000;
    
    const cookie = {
      //url: browser.extension.getURL(""), // associate url is local
      url: url,
      name: name,
      value: value,
      expirationDate: expirationDate
    };
    
    browser.cookies.set(cookie)
      .then(() => {
        console.log('Le cookie a été créé avec succès.'); //TODO gérer les erreurs
      })
      .catch((error) => {
        console.error('Erreur lors de la création du cookie :', error);
      });
  }

export function getCookie(name, url) {
    const query = { 
        url: url,
        name: name
     };

    return browser.cookies.get(query)
        .then((cookie) => {
        if (cookie) {
            return cookie.value;
        } else {
            return null;
        }
        })
        .catch((error) => {
        console.error('Erreur lors de la récupération du cookie :', error);
        return null;
        });
  }  

export function deleteCookie(name, url) {
    const query = { 
        url: url,
        name: name
     };
  
    return browser.cookies.remove(query)
      .then((details) => {
        return details;
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression du cookie :', error);
        return false;
      });
  }


  //Login
  function sessionExpired(minutes) {
    const storedDate = localStorage.getItem('lastLogin');
    
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
    localStorage.setItem('lastLogin', currentDate.toISOString());
 }

export function isLogged() {
    if(sessionExpired(getConnexionDuration())){
        return false;
    }
    return true;

 }

 //verify password, generate and store the derived key based on the password
 export async function login(password){
  if (await validPassword(password)) {
    storeLastLogin();
    const derivedKey = await pswTools.generateDerivedKey(password);
    pswTools.storeDerivedKey(derivedKey);
    return true;
  }
  return false;
 }

//set lastLogin to an expired value, and delete derivedKey
 export function logout(logoutButtonUsed = false) {
  if(logoutButtonUsed){
    /*var now = new Date();
    const connexionDuration = getConnexionDuration();
    var toStore = new Date(now.getTime() - (parseInt(connexionDuration * 60 * 1000))); 
    localStorage.setItem('lastLogin', toStore.toISOString());*/
    localStorage.removeItem('lastLogin');
  }
  pswTools.deleteDerivedKey();
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
    const hashedpsw = await hashPassword(psw);
    localStorage.setItem('password', hashedpsw);
  } catch (error) {
    console.error('Error:', error); //todo
  }
}

export async function validPassword(psw) {
  try {
    const hashedpsw = await hashPassword(psw);
    const storedHash = localStorage.getItem('password');
    return hashedpsw === storedHash;
  } catch (error) {
    console.error('Error:', error); //todo
    return false;
  }
}


//re encrypt all data
export async function changePassword(newPsw){
  const addressList = emailTools.getEmailList(); 
  var decryptedEmailsList = [];
  for(const emailId of addressList) {
    const emailDecrypted = await emailTools.getAccountStored(emailId);
    const data = {id : emailId, email : emailDecrypted};
    decryptedEmailsList.push(data);
  }
  const logsList = pswTools.getLogsList();
  var decryptedLogsList = [];
  for(const logsUrl of logsList){
    const logsDecrypted = await pswTools.getLogs(logsUrl);
    const data = {url : logsUrl, logs : logsDecrypted};
    decryptedLogsList.push(data);
  }
  await storeHashedPassword(newPsw);
  const newKey = await pswTools.generateDerivedKey(newPsw);
  await pswTools.storeDerivedKey(newKey);
  for(const data of decryptedEmailsList){
    emailTools.storeAccount('email_' + data.id, data.email);
  }
  for(const data of decryptedLogsList){
    pswTools.storeLogs(data.logs.url, data.logs.id, data.logs.password);
  }
}

export function storeConnexionDuration(connexionDuration){
  try {
    localStorage.setItem('connexionDuration', connexionDuration);
  } catch (error) {
    //todo
  }
} 

export function getConnexionDuration(){ // in minutes
  return parseFloat(localStorage.getItem('connexionDuration'));
}

export function isFirstConnexion(){
  const passwordHashed = localStorage.getItem('password');
  if(passwordHashed === null){
    return true;
  }
  return false;
}


export function loadDataFromFile(file){
  //TODO
}

export function exportData(){
  //TODO
}