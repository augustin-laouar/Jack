import * as storage from '../tools/storage.js';
import * as crypto from '../tools/crypto.js';
import * as generator from '../tools/rand_char.js';
import * as error from '../exception/error.js';
 /*
  Format logs :
    logs : [
      {id:'2', content: {url:'test.com', username: 'titi', password: 'poisson8'}},
      ...
    ]
  */

export async function storeLogs(logs) {
  try{
    await storage.store(logs);
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function getLogs() {
  try {
    const logs = await storage.read('logs');
    return logs;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function decryptLogs(encryptedLogs) {
  try {
    if(encryptedLogs === null) {
      return [];
    }
    var decryptedList = [];
    const key = await crypto.getDerivedKey();
    for(const element of encryptedLogs) {
      const url = await crypto.decryptWithAES(element.content.url, key);
      const username = await crypto.decryptWithAES(element.content.username, key);
      const password = await crypto.decryptWithAES(element.content.password, key);

      const decryptedElement = {
        id: element.id,
        content: {
          url: url,
          username: username,
          password: password
        }
      };

      decryptedList.push(decryptedElement); 
    }
    return decryptedList;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function getDecryptedLogs() {
  try {
    const encryptedLogs = await getLogs();
    const decryptedLogs = await decryptLogs(encryptedLogs);
    return decryptedLogs;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}


export async function getLog(id) {
  try{
    const logs = await storage.read('logs');
    if(logs === null) {
      return null;
    }
    for(const element of logs) {
      if(element.id === id){
        return element;
      }
    }
    return null;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function decryptLog(encryptedLog) {
  try {
    const key = await crypto.getDerivedKey();
    const url = await crypto.decryptWithAES(encryptedLog.content.url, key);
    const username = await crypto.decryptWithAES(encryptedLog.content.username, key);
    const password = await crypto.decryptWithAES(encryptedLog.content.password, key);

    const decryptedLog = {
      id: encryptedLog.id,
      content: {
        url: url,
        username: username,
        password: password
      }
    };
    return decryptedLog;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function getDecryptedLog(id) {
  try {
    const encryptedLog = await getLog(id);
    const decryptedLog = await decryptLog(encryptedLog);
    return decryptedLog;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

function isUniqueId(id, logs) {
  try {
    if(logs === null) {
      return true;
    }
    for(const element of logs){
      if(element.id === id) {
        return false;
      }
    }
    return true;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function addLog(url, username, password) {
  try {
    var logs = await getLogs();
    const key = await crypto.getDerivedKey();
    const encryptedUrl = await crypto.encryptWithAES(url, key);
    const encrytedUsername = await crypto.encryptWithAES(username, key);
    const encryptedPassword = await crypto.encryptWithAES(password, key);   
    var id = generator.generate(15);
    while(!isUniqueId(id, logs)){
      id = generator.generate(15);
    }  
    const log = {
      id: id,
      content: {
        url: encryptedUrl,
        username: encrytedUsername,
        password: encryptedPassword
      }
    };
    if (logs === null) { //if it's first time we store logs
      const newLogs = {
        logs: [
          log
        ]
      };
      await storage.store(newLogs);
    }
    else{
      logs.push(log);
      await storage.store({logs: logs});
    }
    return id;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function deleteLog(id) {
  try {
    var logs = await getLogs();
    if(logs === null) {
      return;
    }

    var updatedLogs = logs.filter(log => log.id !== id);
    await storage.store({ logs: updatedLogs });
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function modifyLog(id, url, username, password) {
  try {
    var logs = await getLogs();
    if(logs === null) {
      return;
    }
    var updatedLogs = logs.filter(log => log.id !== id);
    const key = await crypto.getDerivedKey();
    const encryptedUrl = await crypto.encryptWithAES(url, key);
    const encrytedUsername = await crypto.encryptWithAES(username, key);
    const encryptedPassword = await crypto.encryptWithAES(password, key);   
    const log = {
      id: id,
      content: {
        url: encryptedUrl,
        username: encrytedUsername,
        password: encryptedPassword
      }
    };
    updatedLogs.push(log);
    await storage.store({logs: updatedLogs});
  }
  catch(e) {
    throw error.castError(e, false);
  }
}


// Re encrypt all passwords

export async function encryptLogsWithNewKey(oldKey) {
  try {
    const key = await crypto.getDerivedKey();
    const encryptedLogs = await getLogs();
    var newLogs = [];
    if(encryptedLogs === null) {
        return;
    }
    for(const element of encryptedLogs) {
      const url = await crypto.decryptWithAES(element.content.url, oldKey);
      const username = await crypto.decryptWithAES(element.content.username, oldKey);
      const password = await crypto.decryptWithAES(element.content.password, oldKey);

      const newUrl = await crypto.encryptWithAES(url, key);
      const newUsername = await crypto.encryptWithAES(username, key);
      const newPassword = await crypto.encryptWithAES(password, key);

      const newElement = {
        id: element.id,
        content: {
          url: newUrl,
          username: newUsername,
          password: newPassword
        }
      };
      newLogs.push(newElement);
    }
    await storage.store({ logs: newLogs });
  }
  catch(e) {
    throw error.castError(e, false);
  }
}