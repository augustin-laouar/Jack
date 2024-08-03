/*
 * Author: Augustin Laouar
 * Project Repository: https://github.com/augustin-laouar/Jack
 * License: GNU General Public License v3.0
 * 
 * This project is licensed under the GNU General Public License v3.0.
 * You may obtain a copy of the License at
 * 
 *     https://www.gnu.org/licenses/gpl-3.0.en.html
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as random from '../../tools/rand_char.js';
import * as storage from '../../tools/storage.js';
import * as error from '../../exception/error.js';

const default_generator_id = '6675636b75';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const specialChars = '!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';

function getCharList(lowercase, uppercase, numbers, specials, excluded_chars) {
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
    
    const filteredCharList = charList.split('').filter(char => !excluded_chars.includes(char)).join('');
    
    if(filteredCharList.length === 0 ){
        throw new error.Error('All characters are excluded.', true);
    }
    return filteredCharList;
}

async function getGenerators() {
    try {
        const generators = await storage.read('generators');
        if(generators === null) {
            return [];
        }
        else if(generators.length === 0){
            return [];
        }
        return generators;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

async function getGenerator(id) {
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

async function addGenerator(name, length, char_params, id = null) {
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
    if(length < 6) {
        throw new error.Error('Password length is less than 6.', true);
    }
    try {
        if(!id){
            id = random.generateAlphaNumeric(10);
            while(generators.some(gen => gen.id === id)) {
                id = random.generateAlphaNumeric(10);
            }
        }
        const char_list = getCharList(
            char_params.lowercase,
            char_params.uppercase, 
            char_params.numbers, 
            char_params.specials,
            char_params.excluded_chars
        );
        char_params = refactorCharParams(char_params, char_list);
        var generator = {
            id: id,
            name: name,
            psw_length: length,
            char_params: char_params,
            char_list: char_list
        }
        generators.push(generator);
        await storeGenerators(generators);
        return id;
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function deleteGenerator(id) {
    try {
        var generators = await getGenerators();
        if(generators === null) {
          return;
        }
    
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        await storeGenerators(updatedGenerators);
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

async function updateGenerator(id, name, length, char_params) {
    var generators;
    var current_name;
    try {
        generators = await getGenerators();
        const current_generator = await getGenerator(id);
        current_name = current_generator.name;
    }
    catch (e) {
        throw error.castError(e, false);
    }
    if(name !== current_name) { //if name changed we check if there is already a generator with this name
        if(generators.some(gen => gen.name === name)) {
            throw new error.Error('A password generator with the same name exists.', true);
        }
    }
    if(length < 6) {
        throw new error.Error('Password length is less than 6.', true);
    }
    try{
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        const char_list = getCharList(
            char_params.lowercase,
            char_params.uppercase, 
            char_params.numbers, 
            char_params.specials,
            char_params.excluded_chars
        );
        char_params = refactorCharParams(char_params, char_list);
        var newGenerator = {
            id: id,
            name: name,
            psw_length: length,
            char_params: char_params,
            char_list: char_list
        }
        updatedGenerators.push(newGenerator);
        await storeGenerators(updatedGenerators);
    }
    catch(e) {
        throw error.castError(e, false);
    }

}


async function storeDefaultGenerator() {
    try {
        const char_params ={
            lowercase: true,
            uppercase: true, 
            numbers: true, 
            specials: true,
            excluded_chars: ''
        };
        await addGenerator('Default generator', 12, char_params, default_generator_id);
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function storeGenerators(generators) { //sort list before storing
    generators.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));    
    const defaultIndex = generators.findIndex(generator => generator.id === default_generator_id);
    if (defaultIndex !== -1) {
        const [defaultGenerator] = generators.splice(defaultIndex, 1);
        generators.unshift(defaultGenerator);
    }
    await storage.store({ generators: generators });
}



function hasCommonElement(A, B) {
    for (let char of A) {
        if (B.includes(char)) {
            return true;
        }
    }
    return false;
}

function refactorCharParams(char_params, char_list) {
    let lowercase = char_params.lowercase;
    let uppercase = char_params.uppercase;
    let numbers = char_params.numbers;
    let specials = char_params.specials;

    if(lowercase) {
        if(!hasCommonElement(lowercaseChars, char_list)) {
            lowercase = false;
        }
    }
    if(uppercase) {
        if(!hasCommonElement(uppercaseChars, char_list)) {
            uppercase = false;
        }
    }
    if(numbers) {
        if(!hasCommonElement(numberChars, char_list)) {
            numbers = false;
        }
    }
    if(specials) {
        if(!hasCommonElement(specialChars, char_list)) {
            specials = false;
        }
    }
    return {
        lowercase: lowercase,
        uppercase: uppercase,
        numbers: numbers,
        specials: specials,
        excluded_chars: char_params.excluded_chars
    }
}

function containsCharFromSet(password, charSet) {
    for (let char of password) {
        if (charSet.includes(char)) {
            return true;
        }
    }
    return false;
}

function isValidPassword(generator, password) {
    if(generator.char_params.lowercase) {
        if(!containsCharFromSet(password, lowercaseChars))
            return false;
    }
    if(generator.char_params.uppercase) {
        if(!containsCharFromSet(password, uppercaseChars))
            return false;
    }
    if(generator.char_params.numbers) {
        if(!containsCharFromSet(password, numberChars))
            return false;
    }
    if(generator.char_params.specials) {
        if(!containsCharFromSet(password, specialChars))
            return false;
    }
    return true;
}

async function getRandomPassword(generator_id) { 
    const generator = await getGenerator(generator_id);
    let password;
    do {
        password = random.generate(generator.psw_length, generator.char_list);
    } while (!isValidPassword(generator, password));
    return password;
}

export async function handle(message) {
    if(message.type === 'add') {
        if(message.params.default) {
            await storeDefaultGenerator();
            return true;
        }
        else {
            const result = await addGenerator(
                message.params.name,
                message.params.length,
                message.params.char_params,
            );
            return result;
        }
    }

    if(message.type === 'update') {
        await updateGenerator(
            message.params.id,
            message.params.name,
            message.params.length,
            message.params.char_params
        );
        return true;
    }

    if(message.type === 'get') {
        if(message.params.default) {
            const result = await getGenerator(default_generator_id);
            return result;
        }
        if(message.params.id) {
            const result = await getGenerator(message.params.id);
            return result;
        }
        else {
            const result = await getGenerators();
            return result;
        }
    }

    if(message.type === 'delete') {
        await deleteGenerator(message.params.id);
        return true;
    }

    if(message.type === 'generate') {
        const result = await getRandomPassword(message.params.generator_id);
        return result;
    }
}