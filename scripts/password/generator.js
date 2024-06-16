import * as random from '../tools/rand_char.js';
import * as storage from '../tools/storage.js';
import * as error from '../exception/error.js';


export function getCharList(lowercase, uppercase, numbers, specials, excluded_chars) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';
    
    let charList = '';
    
    if (lowercase) {
        charList += lowercaseChars;
    }
    if (uppercase) {
        charList += uppercaseChars;
    }
    if (numbers) {
        charList += numberChars;
    }
    if (specials) {
        charList += specialChars;
    }
    
    const charArray = charList.split('').filter(char => !excluded_chars.includes(char));
    
    if(charArray.length === 0 ){
        throw new error.Error('All characters are excluded.', true);
    }
    return charArray;
}

export async function addGenerator(name, length, char_list) {
    var generators;
    try {
        generators = await getGenerators();
    }
    catch (e) {
        throw error.castError(e, false);
    }
    if(generators.some(gen => gen.name === name)) {
        throw new error.Error('A password generator with the same name exists.', true);
    }
    var id = random.generateAlphaNumeric(10);
    while(generators.some(gen => gen.id === id)) {
        id = random.generateAlphaNumeric(10);
    }
    var generator = {
        id: id,
        name:name,
        psw_length: length,
        char_list: char_list
    }
    try {
        generators.push(generator);
        await storage.store({ psw_generators: generators });
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

export async function getGenerator(id) {
    try{
        const generators = await getGenerators();
        for(const generator of generators) {
          if(generator.id === id){
            return generator;
          }
        }
        return null;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

export async function deleteGenerator(id) {
    try {
        var generators = await getGenerators();
        if(generators === null) {
          return;
        }
    
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        await storage.store({ psw_generators: updatedGenerators });
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

export async function updateGenerator(id, newGenerator) {
    try{
        const generators = await getGenerators();
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        updatedGenerators.push(newGenerator);
        await storage.store({ psw_generators: updatedGenerators });
    }
    catch(e) {
        throw error.castError(e, false);
    }

}

export async function getGenerators() {
    try {
        const generators = await storage.read('psw_generators');
        if(generators === null) {
            return [];
        }
        return generators;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}


export async function getRandomPassword(generator_id) { 
    const generator = await getGenerator(generator_id);
    return random.generate(generator.psw_length, generator.char_list);
}