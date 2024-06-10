import * as storage from '../tools/storage.js';
import * as crypto from '../tools/crypto.js';
import * as generator from '../tools/rand_char.js';
import * as error from '../exception/error.js';
 /*
  Format logs :
    logs : [
      {id:'2', content: {url:'test.com', username: 'titi', password: 'poisson8' ...}},
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
      const title = await crypto.decryptWithAES(element.content.title, key);
      const url = await crypto.decryptWithAES(element.content.url, key);
      const username = await crypto.decryptWithAES(element.content.username, key);
      const password = await crypto.decryptWithAES(element.content.password, key);
      const description = await crypto.decryptWithAES(element.content.description, key);

      const decryptedElement = {
        id: element.id,
        content: {
          title: title,
          url: url,
          username: username,
          password: password,
          description: description
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
    const title = await crypto.decryptWithAES(encryptedLog.content.title, key);
    const url = await crypto.decryptWithAES(encryptedLog.content.url, key);
    const username = await crypto.decryptWithAES(encryptedLog.content.username, key);
    const password = await crypto.decryptWithAES(encryptedLog.content.password, key);
    const description = await crypto.decryptWithAES(encryptedLog.content.description, key);

    const decryptedLog = {
      id: element.id,
      content: {
        title: title,
        url: url,
        username: username,
        password: password,
        description: description
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

export async function addLog(title, url, username, password, description) {
  try {
    var logs = await getLogs();
    const key = await crypto.getDerivedKey();
    const encryptedTitle = await crypto.encryptWithAES(title, key);
    const encryptedUrl = await crypto.encryptWithAES(url, key);
    const encrytedUsername = await crypto.encryptWithAES(username, key);
    const encryptedPassword = await crypto.encryptWithAES(password, key); 
    const encryptedDescription = await crypto.encryptWithAES(description, key);  
    var id = generator.generateAlphaNumeric(15);
    while(!isUniqueId(id, logs)){
      id = generator.generateAlphaNumeric(15);
    }  
    const log = {
      id: id,
      content: {
        title: encryptedTitle,
        url: encryptedUrl,
        username: encrytedUsername,
        password: encryptedPassword,
        description: encryptedDescription
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

export async function modifyLog(id, title, url, username, password, description) {
  try {
    var logs = await getLogs();
    if(logs === null) {
      return;
    }
    var updatedLogs = logs.filter(log => log.id !== id);
    const key = await crypto.getDerivedKey();
    const encryptedTitle = await crypto.encryptWithAES(title, key);
    const encryptedUrl = await crypto.encryptWithAES(url, key);
    const encrytedUsername = await crypto.encryptWithAES(username, key);
    const encryptedPassword = await crypto.encryptWithAES(password, key);  
    const encryptedDescription = await crypto.encryptWithAES(description, key);
 
    const log = {
      id: id,
      content: {
        title: encryptedTitle,
        url: encryptedUrl,
        username: encrytedUsername,
        password: encryptedPassword,
        description: encryptedDescription
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
      const title = await crypto.decryptWithAES(element.content.title, oldKey);
      const url = await crypto.decryptWithAES(element.content.url, oldKey);
      const username = await crypto.decryptWithAES(element.content.username, oldKey);
      const password = await crypto.decryptWithAES(element.content.password, oldKey);
      const description = await crypto.decryptWithAES(element.content.description, oldKey);

      const newTitle = await crypto.encryptWithAES(title, key); 
      const newUrl = await crypto.encryptWithAES(url, key); 
      const newUsername = await crypto.encryptWithAES(username, key);
      const newPassword = await crypto.encryptWithAES(password, key);
      const newDescription = await crypto.encryptWithAES(description, key); 

      const newElement = {
        id: element.id,
        content: {
          title: newTitle,
          url: newUrl,
          username: newUsername,
          password: newPassword,
          description: newDescription
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