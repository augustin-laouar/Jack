import * as storage from './tools/storage.js';
import { validPassword } from './tools/crypto.js';

async function removeAllData() {
    await storage.remove('derivedKey');
    await storage.remove('emails');
    await storage.remove('lastLogin');
    await storage.remove('connectionDuration');
    await storage.remove('logs');
    await storage.remove('masterPswHash')
}

export async function reset(password) {
    if(await validPassword(password)) {
        removeAllData();
    }
}