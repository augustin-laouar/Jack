import * as storage from '../../tools/storage.js'
import * as crypto from '../../tools/crypto.js'
import * as random from '../../tools/rand_char.js';
import * as api from '../../tools/emails_api.js';
import { getDerivedKey } from '../vars.js';

const maxEmailNumber = 10; 
 
async function getEmails() {
    const emails = await storage.read('emails');
    return emails;
}
async function decryptEmails(encryptedEmails) {
    if(encryptedEmails === null) {
        return [];
    }
    const derivedKey = getDerivedKey();
    var decryptedEmails = [];
    for(const element of encryptedEmails) {
        const email = await crypto.decryptWithAES(element.email, derivedKey);
        const jsonEmail = JSON.parse(email);
        const decryptedElement = {
            id: element.id,
            email: jsonEmail
        };

        decryptedEmails.push(decryptedElement);
    }
    
    return decryptedEmails;
}

async function getDecryptedEmails() {
    const encryptedEmails = await getEmails();
    const decryptedEmails = await decryptEmails(encryptedEmails);
    return decryptedEmails;
}


async function getEmail(id) {
    const emails = await storage.read('emails');
    if(emails === null) {
      return null;
    }
    for(const element of emails) {
      if(element.id === id){
        return element;
      }
    }
    return null;
}

async function decryptEmail(email) {
    const derivedKey = getDerivedKey();
    const decryptedContent = await crypto.decryptWithAES(email.email, derivedKey);
    const jsonContent = JSON.parse(decryptedContent);
    const decryptedEmail = {
        id: email.id,
        email: jsonContent
    }
    return decryptedEmail;
}

async function getDecryptedEmail(id) {
    const encryptedEmail = await getEmail(id);
    const decryptedEmail = await decryptEmail(encryptedEmail);
    return decryptedEmail;
}

async function encryptEmail(email) {
    const derivedKey = getDerivedKey();
    const jsonEmail = JSON.stringify(email);
    const encryptedJsonEmail = await crypto.encryptWithAES(jsonEmail, derivedKey);
    return encryptedJsonEmail;
}

async function addEmail(email) {
    var emails = await getEmails();

    const id = email.id;
    const encryptedEmail = await encryptEmail(email);
    const jsonEmail = {
        id: id,
        email: encryptedEmail
    };

    if(emails === null) {
        const newEmails = {
            emails: [
                jsonEmail
            ]
        };
        await storage.store(newEmails);
    }
    else {
        emails.push(jsonEmail);
        await storage.store({emails: emails});
    }
    return id;
  }

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

async function createEmail(addr){
    if(!canCreateEmail()){
        throw new error.Error('You have reached the maximum number of allowed addresses.', true);
    }
    try{
      const psw = random.generateAlphaNumeric(20);
      const email = await api.createAccount(addr, psw);
      const id = await addEmail(email);
      return id;
    }
    catch(e){
      throw error.castError(e, false);
    }
}
  
async function createRandomEmail(domain = null, tryNumber = 0) { 
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
        const psw = random.generateAlphaNumeric(20);
        const email = await api.createAccount(addr, psw);
        const id = await addEmail(email);
        return id;
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

async function deleteEmail(id, total) {
    var emails = await getEmails();
    if(emails === null) {
        return;
    }
    if(total) {
        const emailToDelete = await getDecryptedEmail(id);
        await api.deleteAccount(emailToDelete.email);
    }
    var updatedEmails = emails.filter(email => email.id !== id);
    await storage.store({ emails: updatedEmails });
}

export async function handle(message) {
    if(message.type === 'create') {
        if(message.params.random) {
            const result = await createRandomEmail(message.params.domainName);
            return result;
        }
        else {
            const result = await createEmail(message.params.emailName);
            return result;
        }
    }

    if(message.type === 'add') {
        const result = await addEmail(message.params.email);
        return result;
    }

    if(message.type === 'get') {
        if(message.params.id) { //ask for a specific email
            if(message.params.decrypted) {
                const email = await getDecryptedEmail(message.params.id);
                return email;
            }
            else {
                const email = await getEmail(message.params.id);
                return email;
            }
        }
        else { //ask for all emails
            if(message.params.decrypted) {
                const emails = await getDecryptedEmails();
                return emails;
            }
            else {
                const emails = await getEmails();
                return emails;
            }
        }
    }

    if(message.type === 'delete') {
        await deleteEmail(message.params.id, message.params.total);
        return true;
    }
}