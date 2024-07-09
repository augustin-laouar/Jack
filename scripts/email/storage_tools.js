import * as error from '../exception/error.js';
import * as crypto from '../tools/crypto.js';
import * as storage from '../tools/storage.js';
import * as api from './api_tools.js';
import * as random from '../tools/rand_char.js';

export const maxEmailNumber = 10;

  export async function getEmails() {
    const emails = await storage.read('emails');
    return emails;
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
    const emails = await storage.read('emails');
    if(emails === null) {
      return null;
    }
    for(const element of emails) {
      if(element.id === id){
        return element.email;
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
  
  export async function createEmail(addr){
    if(!canCreateEmail()){
      throw new error.Error('You have reached the maximum number of allowed addresses.', true);
    }
    try{
      const psw = random.generateAllChars(10);
      const email = await api.createAccount(addr, psw);
      await addEmail(email);
    }
    catch(e){
      throw error.castError(e, false);
    }
  }
  
  export async function createRandomEmail(domain = null, tryNumber = 0) { 
    if(!canCreateEmail()){
      throw new error.Error('You have reached the maximum number of allowed addresses.', true);
    }
    try{
        if(domain === null || domain === '') {
          const domains = await api.getDomains();
          domain = domains[0];
        }
        const name = random.generateAlphaNumeric(10);
        const addr = name + '@' + domain;
        const psw = random.generateAlphaNumeric(10);
        const email = await api.createAccount(addr, psw);
        await addEmail(email);
    }
    catch(e){
      if(tryNumber === 5){
        throw error.castError(e, false);
      }
      else{
        await createRandomEmail(domain, tryNumber + 1);
      }
    }
  }

  // Re encrypt all
  export async function encryptEmailsWithNewKey(oldKey) {
    const key = await crypto.getDerivedKey();
    const encryptedEmails = await getEmails();
    var newEmails = [];
    if(encryptedEmails === null) {
        return;
    }
    for(const element of encryptedEmails) {
        const email = await crypto.decryptWithAES(element.email, oldKey);
        const newEncryption = await crypto.encryptWithAES(email, key);
        const newElement = {
            id: element.id,
            email: newEncryption
        };
        newEmails.push(newElement);
    }
    await storage.store({ emails: newEmails });

  }