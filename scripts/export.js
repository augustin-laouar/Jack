import * as storage from './tools/storage.js';
import * as error from './exception/error.js';
import * as crypto from './tools/crypto.js';

async function get_json() {
    const masterPswHash = await storage.read('masterPswHash');
    const connectionDuration = await storage.read('connectionDuration');
    const emails = await storage.read('emails');
    const logs = await storage.read('logs');
    const jsonData = {
        masterPswHash: masterPswHash,
        connectionDuration: connectionDuration,
        emails: emails,
        logs: logs
    };
    return jsonData;
}

export async function export_account() {
    const jsonObject = await get_json();
    const filename = 'account.json';

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

export async function import_account(json, password) {
    const masterPswHash = json.masterPswHash;

}