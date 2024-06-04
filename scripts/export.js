import * as storage from './tools/storage.js';
import * as error from './exception/error.js';
import * as crypto from './tools/crypto.js';

function get_meta_data() {
    const version = 1; //Jack's Mails accoutn file version
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return {
        version: version,
        creation: formattedTime
    };
}
async function get_json() {
    const masterPswHash = await storage.read('masterPswHash');
    const connectionDuration = await storage.read('connectionDuration');
    const emails = await storage.read('emails');
    const logs = await storage.read('logs');
    const metadata = get_meta_data();
    const jsonData = {
        metadata: metadata,
        masterPswHash: masterPswHash,
        connectionDuration: connectionDuration,
        emails: emails,
        logs: logs
    };
    return jsonData;
}

export async function export_account(password, givenFileName) {
    if(await crypto.validPassword(password) === false){
        throw new error.Error('Your current password is invalid.', true);
    }
    const jsonObject = await get_json();
    var filename;
    if(givenFileName === '') {
        filename = 'jack-mail-data.json';
    }
    else {
        filename = givenFileName + '.json';
    }

    const jsonStr = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function store_from_json(json) {
    //Check if every values exists
    const masterPswHash = json.masterPswHash;
    const connectionDuration = json.connectionDuration;
    const emails = json.emails;
    const logs = json.logs;
    
    if(masterPswHash === null) {
        throw new error.Error('JSON file is corrupted. Master password was not found.', true);
    }
    await storage.store({ masterPswHash: masterPswHash});
    if(connectionDuration === null) {
        await storage.store({ connectionDuration: 3});
    }
    else {
        await storage.store({ connectionDuration: connectionDuration});
    }
    if(emails !== null) {
        await storage.store({emails: emails});
    }
    if(logs !== null) {
        await storage.store({ logs: logs});
    }
}

async function read_json_file(jsonfile) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(jsonfile);
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                resolve(jsonData);
            } catch (e) {
                reject(new error.Error('Error reading account file.', true));
            }
        };
        reader.onerror = function() {
            reject(new error.Error('Account file is unreadable.', true));
        };
    });
}

export async function import_account(jsonfile, password, keepCurrPsw) {
    const json = await read_json_file(jsonfile);
    //Check if these required values exists
    if (!(json.metadata && json.metadata.version && json.masterPswHash)) {
        throw new error.Error('Account file is corrupted.', true);
    }
    const version = json.metadata.version;
    if(version !== 1) { // If, in a future version of Jack's Mails, the file account won't be the same 
        throw new error.Error("This account file version is not supported. Please udpate Jack's Mails to import this account.", true);
    }
    const masterPswHash = json.masterPswHash;
    const connectionDuration = json.connectionDuration ?? 3; // 3 mins is default value
    const emails = json.emails ?? []; //Empty list by default
    const logs = json.logs ?? [];

    if(!(await crypto.isValidHash(password, masterPswHash))) {
        throw new error.Error('Invalid password. Unable to decrypt the file.', true);
    }

    if(keepCurrPsw) {
        const currentKey = await crypto.getDerivedKey();
        try {
            const otherKey = await crypto.generateDerivedKey(password);
            var newEmails = [];
            var newLogs = [];
            for(const element of emails) {
                const email = await crypto.decryptWithAES(element.email, otherKey);
                const newEncryption = await crypto.encryptWithAES(email, currentKey);
                const newElement = {
                    id: element.id,
                    email: newEncryption
                };
                newEmails.push(newElement);
            }
            for(const element of logs) {
                const url = await crypto.decryptWithAES(element.content.url, otherKey);
                const username = await crypto.decryptWithAES(element.content.username, otherKey);
                const password = await crypto.decryptWithAES(element.content.password, otherKey);
            
                const newUrl = await crypto.encryptWithAES(url, currentKey);
                const newUsername = await crypto.encryptWithAES(username, currentKey);
                const newPassword = await crypto.encryptWithAES(password, currentKey);
            
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
        }
        catch(e) {
            throw new error.Error('Unable to decrypt account file. It may be corrupted.', true);
        }
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: newEmails });
        await storage.store({ logs: newLogs });
    }

    else {
        await storage.store({ masterPswHash: masterPswHash});
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: emails});
        await storage.store({ logs: logs });
        const newKey = await crypto.generateDerivedKey(password);
        await crypto.storeDerivedKey(newKey);
    }
}