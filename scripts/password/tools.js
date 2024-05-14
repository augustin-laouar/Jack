import * as storage from '../tools/storage.js';
import * as crypto from '../tools/crypto.js';
import * as generator from '../tools/id.js';

 /*
  Format logs :
    logs : [
      {id:'2', content: {url:'test.com', username: 'titi', password: 'poisson8'}},
      ...
    ]
  */

export async function storeLogs(logs) {
  await storage.store(logs);
}

export async function getLogs() {
  const data = await storage.read('logs');
  if(data && 'logs' in data) {
    return data.logs;
  }
  return null;
}

export async function decryptLogs(encryptedLogs) {
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

export async function getDecryptedLogs() {
  const encryptedLogs = await getLogs();
  const decryptedLogs = await decryptLogs(encryptedLogs);
  return decryptedLogs;
}


export async function getLog(id) {
  const data = await storage.read('logs');
  if(data && 'logs' in data) {
    for(const element of data.logs) {
      if(element.id === id){
        return element;
      }
    }
  }
  return null;
}

export async function decryptLog(encryptedLog) {
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

export async function getDecryptedLog(id) {
  const encryptedLog = await getLog(id);
  const decryptedLog = await decryptLog(encryptedLog);
  return decryptedLog;
}

function isUniqueId(id, logs) {
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

export async function addLog(url, username, password) {
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

export async function deleteLog(id) {
  var logs = await getLogs();
  if(logs === null) {
    return;
  }

  var updatedLogs = logs.filter(log => log.id !== id);
  await storage.store({ logs: updatedLogs });
}

export async function modifyLog(id, url, username, password) {
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


// Re encrypt all passwords

export async function encryptLogsWithNewKey(oldKey) {
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