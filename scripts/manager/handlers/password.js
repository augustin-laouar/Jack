import * as crypto from '../../tools/crypto.js';
import * as storage from '../../tools/storage.js';
import * as error from '../../exception/error.js';
import { setDerivedKey, getDerivedKey } from '../vars.js';


async function storeHashedPassword(password) {
    const hash = await crypto.hashPasswordWithSalt(password);
    const jsonData = { masterPswHash: hash };
    await storage.store(jsonData);
}

async function encryptCredsWithNewkey(oldKey, newKey) {
    try {
        const creds = await storage.read('credentials');
        var newCreds = [];
        if(creds === null) {
            return;
        }
      for(const element of creds) {
        const decryptedContent = await crypto.decryptWithAES(element.content, oldKey);
        const encryptedContent = await crypto.encryptWithAES(decryptedContent, newKey);
  
        const newElement = {
          id: element.id,
          content: encryptedContent
        };
        newCreds.push(newElement);
      }
      await storage.store({ credentials: newCreds });
    }
    catch(e) {
      throw error.castError(e, false);
    }
}

async function encryptEmailsWithNewKey(oldKey, newKey) {
    const encryptedEmails = await storage.read('emails');
    var newEmails = [];
    if(encryptedEmails === null) {
        return;
    }
    for(const element of encryptedEmails) {
        const email = await crypto.decryptWithAES(element.email, oldKey);
        const newEncryption = await crypto.encryptWithAES(email, newKey);
        const newElement = {
            id: element.id,
            email: newEncryption
        };
        newEmails.push(newElement);
    }
    await storage.store({ emails: newEmails });

}

export async function handle(message) {
    if(message.type === 'set') {
        const password = message.params.password;
        await storeHashedPassword(password)
        return true;
    }

    if(message.type === 'update') {
        const password = message.params.password;        
        const oldKey = getDerivedKey();
        const newKey = await crypto.generateDerivedKey(password);

        await encryptCredsWithNewkey(oldKey, newKey);
        await encryptEmailsWithNewKey(oldKey, newKey);
        setDerivedKey(newKey);
        await storeHashedPassword(password);
        return true;
    }

    if(message.type === 'verify') {
        const password = message.params.password;
        const storedHash = await storage.read('masterPswHash');
        const isValid = await crypto.isValidHash(password, storedHash);
        return isValid;
    }
}