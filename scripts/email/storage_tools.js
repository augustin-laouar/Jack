import * as errorManager from '../exception/mailError.js';
import * as crypto from '../tools/crypto.js';
import * as storage from '../tools/storage.js';
import * as api from './api_tools.js';
import * as id from '../tools/id.js';

export const maxEmailNumber = 10;

  export async function getEmails() {
    const data = await storage.read('emails');
    if(data && 'emails' in data) {
      return data.emails;
    }
    return null;
  }

  export async function decryptEmails(encryptedEmails) {
    if(encryptedEmails === null) {
        return [];
    }
    var decryptedEmails = [];
    const key = await crypto.getDerivedKey();

    for(const element of encryptedEmails) {
        const email = await crypto.decryptWithAES(element.email, key);
        const jsonEmail = JSON.parse(email);
        const decryptedElement = {
            id: element.id,
            email: jsonEmail
        };

        decryptedEmails.push(decryptedElement);
    }
    
    return decryptedEmails;
  }

  export async function getDecrytpedEmails() {
    const encryptedEmails = await getEmails();
    const decryptedEmails = await decryptEmails(encryptedEmails);
    return decryptedEmails;
  }

  export async function encryptEmail(email) {
    const jsonEmail = JSON.stringify(email);
    const aesKey = await crypto.getDerivedKey();
    const encryptedJsonEmail = await crypto.encryptWithAES(jsonEmail, aesKey);
    return encryptedJsonEmail;
  }

  export async function storeEmail(email) {
    const id = email.id;
    const encryptedEmail = await encryptEmail(email);
    const json = {
        id: id,
        email: encryptedEmail
    };
    

  }
  export async function addEmail(email) {
    var emails = await getEmails();

    const id = email.id;
    const encryptedEmail = await encryptEmail(email);
    const json = {
        id: id,
        email: encryptedEmail
    };

    if(emails === null) {
        const newEmails = {
            emails: [
                json
            ]
        };
        await storage.store(newEmails);
    }
    else {
        emails.push(json);
        await storage.store({emails: emails});
    }
    return id;
  }
  
  export async function deleteEmail(id) {
    var emails = await getEmails();
    if(emails === null) {
        return;
    }
    var updatedEmails = emails.filter(email => email.id !== id);
    await storage.store({ emails: updatedEmails });
  }

  export async function getEmail(id) {
    const data = await storage.read('emails');
    if(data && 'emails' in data) {
        for(const element of data.emails) {
          if(element.id === id){
            return element.email;
          }
        }
    }
    return null;
    }

  export async function decryptEmail(email) {
    const key = await crypto.getDerivedKey();
    const decryptedJsonEmail = await crypto.decryptWithAES(email, key);
    return JSON.parse(decryptedJsonEmail);
  }

  export async function getDecryptedEmail(id) {
    const encryptedEmail = await getEmail(id);
    const decryptedEmail = await decryptEmail(encryptedEmail);
    return decryptedEmail;
  }

  // EMAIL GENERATION

  async function canCreateEmail() {
    const emails = await getEmails();
    if(emails === null) {
        return true;
    }
    if(emails.length >= maxEmailNumber) {
        return false;
    }
    return true;
  }
  
  export async function createEmail(addr, psw){
    if(!canCreateEmail()){
      throw new errorManager.Error(3, 2, 'Can\'t create account.');
    }
    try{
      const email = await api.createAccount(addr, psw);
      await addEmail(email);
    }
    catch(error){
      if(error instanceof errorManager.Error){
        error.details = 'This address is maybe already taken.';
      }
      throw error;
    }
  }
  
  export async function createRandomEmail(tryNumber = 0) { 
    if(!canCreateEmail()){
      throw new errorManager.Error(3, 2, 'Can\'t create account.');
    }
    try{
        var addr = id.generateAlphaNumeric(10);
        var psw = id.generateAlphaNumeric(10);
        const email = await api.createAccount(addr, psw);
        await addEmail(email);
    }
    catch(error){
      if(tryNumber === 5){
        throw new errorManager.Error(4, 1, 'Error while creating random account.');
      }
      else{
        await createRandomEmail(tryNumber + 1);
      }
    }
  }

  // Re encrypt all
  export async function encryptEmailsWithNewKey(oldKey, newKey) {
    const encryptedEmails = await getEmails();
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