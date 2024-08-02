import * as storage from '../../tools/storage.js';
import { setDerivedKey, setIsLogged, setLastAction } from '../vars.js';

async function removeAllData() {
    await storage.remove('emails');
    await storage.remove('credentials');
    await storage.remove('connectionDuration');
    await storage.remove('masterPswHash');
    await storage.remove('generators');
    setDerivedKey(null);
    setIsLogged(false);
    setLastAction(null);
}

async function reset() {
    removeAllData();
}

export async function handle(message) {
    await reset();
    return true;
}