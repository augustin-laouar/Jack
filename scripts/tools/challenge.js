import * as crypto from './crypto.js';
import { generateAlphaNumeric } from './rand_char.js';

export async function createChallenge(password) {
    const key = await crypto.generateDerivedKey(password);
    const randomString = generateAlphaNumeric(64);
    const encryptedString = await crypto.encryptWithAES(randomString, key);
    const jsonChallenge = { challenge: encryptedString, answer: randomString };
    return jsonChallenge;
}

export async function checkChallenge(password, challenge) {
    try {
        const key = await crypto.generateDerivedKey(password);
        const answer = await crypto.decryptWithAES(challenge.challenge, key);
        if(answer ===  challenge.answer) {
            return true;
        }
        else {
            return false;
        }
    }
    catch(e) {
        return false;
    }

}
