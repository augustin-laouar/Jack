import * as random from '../tools/rand_char.js';

export function getRandomPassword(generator) {
    if(generator === 'default') {
        return random.generate(10);
    }
}