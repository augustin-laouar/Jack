import * as crypto from '../../tools/crypto.js';
import * as storage from '../../tools/storage.js';
import * as error from '../../exception/error.js';
import { setIsLogged, setDerivedKey, setLastAction } from '../vars.js';


async function login(password){
    try{
        const storedHash = await storage.read('masterPswHash');
        const isValid = await crypto.isValidHash(password, storedHash);
        if (isValid) {
            const currentDate = new Date();
            const derivedKey = await crypto.generateDerivedKey(password);
            setIsLogged(true);
            setLastAction(currentDate);
            setDerivedKey(derivedKey);
            return true;
        }
        return false;
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

export async function handle(message) {
    const password = message.params.password;
    const result = await login(password);
    return result;
}