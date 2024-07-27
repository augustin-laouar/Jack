import * as storage from '../tools/storage.js';
import * as generator from '../tools/rand_char.js';
import * as error from '../exception/error.js';
import * as encryptor from '../tools/encryptor_interface.js';

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
    for(const element of encryptedLogs) {
      const title = await encryptor.decrypt(element.content.title);
      const url = await encryptor.decrypt(element.content.url);
      const username = await encryptor.decrypt(element.content.username);
      const password = await encryptor.decrypt(element.content.password);
      const description = await encryptor.decrypt(element.content.description);

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
    const title = await encryptor.decrypt(encryptedLog.content.title);
    const url = await encryptor.decrypt(encryptedLog.content.url);
    const username = await encryptor.decrypt(encryptedLog.content.username);
    const password = await encryptor.decrypt(encryptedLog.content.password);
    const description = await encryptor.decrypt(encryptedLog.content.description);

    const decryptedLog = {
      id: encryptedLog.id,
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
    const encryptedTitle = await encryptor.encrypt(title);
    const encryptedUrl = await encryptor.encrypt(url);
    const encrytedUsername = await encryptor.encrypt(username);
    const encryptedPassword = await encryptor.encrypt(password); 
    const encryptedDescription = await encryptor.encrypt(description);  
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
    const encryptedTitle = await encryptor.encrypt(title);
    const encryptedUrl = await encryptor.encrypt(url);
    const encrytedUsername = await encryptor.encrypt(username);
    const encryptedPassword = await encryptor.encrypt(password);  
    const encryptedDescription = await encryptor.encrypt(description);
 
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

export async function encryptLogsWithNewKey() {
  try {
    const encryptedLogs = await getLogs();
    var newLogs = [];
    if(encryptedLogs === null) {
        return;
    }
    for(const element of encryptedLogs) {
      const title = await encryptor.decrypt(element.content.title);
      const url = await encryptor.decrypt(element.content.url);
      const username = await encryptor.decrypt(element.content.username);
      const password = await encryptor.decrypt(element.content.password);
      const description = await encryptor.decrypt(element.content.description);

      const newTitle = await encryptor.encryptWithTempKey(title); 
      const newUrl = await  encryptor.encryptWithTempKey(url); 
      const newUsername = await  encryptor.encryptWithTempKey(username);
      const newPassword = await  encryptor.encryptWithTempKey(password);
      const newDescription = await encryptor.encryptWithTempKey(description); 

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