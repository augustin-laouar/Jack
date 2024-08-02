import * as storage from '../../tools/storage.js'
import * as crypto from '../../tools/crypto.js'
import * as random from '../../tools/rand_char.js';
import { getDerivedKey } from '../vars.js';
import * as error from '../../exception/error.js';

async function getCredentials() {
    try {
      const creds = await storage.read('credentials');
      return creds;
    }
    catch(e) {
      throw error.castError(e, false);
    }
}
async function decryptCredentials(encryptedCreds) {
    try {
        if(encryptedCreds === null) {
        return [];
        }
        var decryptedList = [];
        const derivedKey = getDerivedKey();
        for(const element of encryptedCreds) {
            const content = await crypto.decryptWithAES(element.content, derivedKey);
            const jsonContent = JSON.parse(content);
            const decryptedElement = {
                id: element.id,
                content: jsonContent
            };
            decryptedList.push(decryptedElement); 
        }
        return decryptedList;
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function getDecryptedCreds() {
    try {
        const encryptedCreds = await getCredentials();
        const decryptedCreds = await decryptCredentials(encryptedCreds);
        return decryptedCreds;
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function getCred(id) {
    try{
        const creds = await storage.read('credentials');
        if(creds === null) {
            return null;
        }
        for(const element of creds) {
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

async function getDecryptedCred(id) {
    try{
        const cred = await getCred(id);
        const derivedKey = getDerivedKey();
        const content = await crypto.decryptWithAES(cred.content, derivedKey);
        const jsonContent = JSON.parse(content);
        const decryptedCred = {
            id: cred.id,
            content: jsonContent
        };
        return decryptedCred;
    }
    catch(e) {
        throw error.castError(e, false);
    }

}
function isUniqueId(id, creds) {
    try {
      if(creds === null) {
        return true;
      }
      for(const element of creds){
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
async function addCredential(title, url, username, password, description) {
    try {
        var creds = await getCredentials();
        var id = random.generateAlphaNumeric(15);
        while(!isUniqueId(id, creds)){
            id = random.generateAlphaNumeric(15);
        }  

        const derivedKey = getDerivedKey();
        const content = {
            title: title,
            url: url,
            username: username,
            password: password,
            description: description
        };

        const stringifyContent = JSON.stringify(content);
        const encryptedContent = await crypto.encryptWithAES(stringifyContent, derivedKey);
        const cred = {
            id: id,
            content: encryptedContent
        };
        if (creds === null) { //if it's first time we store logs
            const newCreds = {
                credentials: [
                    cred
                ]
            };
            await storage.store(newCreds);
        }
        else{
            creds.push(cred);
            await storage.store({credentials: creds});
        }
        return id;
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

export async function updateCredential(id, title, url, username, password, description) {
    try {
      var creds = await getCredentials();
      if(creds === null) {
        return;
      }
      var filteredCreds = creds.filter(cred => cred.id !== id);

      const derivedKey = getDerivedKey();
      const content = {
          title: title,
          url: url,
          username: username,
          password: password,
          description: description
      };
      const stringifyContent = JSON.stringify(content);
      const encryptedContent = await crypto.encryptWithAES(stringifyContent, derivedKey);
      const updatedCred = {
        id: id,
        content: encryptedContent
      };
      filteredCreds.push(updatedCred);
      await storage.store({credentials: filteredCreds});
    }
    catch(e) {
      throw error.castError(e, false);
    }
}

export async function deleteCredential(id) {
    try {
        var creds = await getCredentials();
        if(creds === null) {
            return;
        }
        var filteredCreds = creds.filter(cred => cred.id !== id);
        await storage.store({ credentials: filteredCreds });
        }
    catch(e) {
        throw error.castError(e, false);
    }
}


export async function handle(message) {
    if(message.type === 'add') {
        const result = await addCredential(
            message.params.title,
            message.params.url,
            message.params.username,
            message.params.password,
            message.params.description
        );
        return result;
    }

    if(message.type === 'get') {
        if(message.params.id) { //ask for a specific cred
            if(message.params.decrypted) {
                const result = await getDecryptedCred(message.params.id);
                return result;
            }
            else {
                const result = await getCred(message.params.id);
                return result;
            }
        }
        else { //ask for all creds
            if(message.params.decrypted) {
                const result = await getDecryptedCreds();
                return result;
            }
            else {
                const result = await getCredentials();
                return result;
            }
        }
    }

    if(message.type === 'update') {
        await updateCredential(
            message.params.id,
            message.params.title,
            message.params.url,
            message.params.username,
            message.params.password,
            message.params.description
        );
        return true;
    }

    if(message.type === 'delete') {
        await deleteCredential(message.params.id);
        return true;
    }
}