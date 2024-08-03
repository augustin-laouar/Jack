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

import * as crypto from '../../tools/crypto.js';
import * as storage from '../../tools/storage.js';
import * as error from '../../exception/error.js';
import { setDerivedKey, getDerivedKey } from '../vars.js';


async function storeHashedPassword(password) {
    const hash = await crypto.hashPasswordWithSalt(password);
    const jsonData = { masterPswHash: hash };
    await storage.store(jsonData);
}

async function encryptCredsWithNewkey(oldKey, newKey) {
    try {
        const creds = await storage.read('credentials');
        var newCreds = [];
        if(creds === null) {
            return;
        }
      for(const element of creds) {
        const decryptedContent = await crypto.decryptWithAES(element.content, oldKey);
        const encryptedContent = await crypto.encryptWithAES(decryptedContent, newKey);
  
        const newElement = {
          id: element.id,
          content: encryptedContent
        };
        newCreds.push(newElement);
      }
      await storage.store({ credentials: newCreds });
    }
    catch(e) {
      throw error.castError(e, false);
    }
}

async function encryptEmailsWithNewKey(oldKey, newKey) {
    const encryptedEmails = await storage.read('emails');
    var newEmails = [];
    if(encryptedEmails === null) {
        return;
    }
    for(const element of encryptedEmails) {
        const email = await crypto.decryptWithAES(element.email, oldKey);
        const newEncryption = await crypto.encryptWithAES(email, newKey);
        const newElement = {
            id: element.id,
            email: newEncryption
        };
        newEmails.push(newElement);
    }
    await storage.store({ emails: newEmails });

}

export async function handle(message) {
    if(message.type === 'set') {
        const password = message.params.password;
        await storeHashedPassword(password)
        return true;
    }

    if(message.type === 'update') {
        const password = message.params.password;        
        const oldKey = getDerivedKey();
        const newKey = await crypto.generateDerivedKey(password);

        await encryptCredsWithNewkey(oldKey, newKey);
        await encryptEmailsWithNewKey(oldKey, newKey);
        setDerivedKey(newKey);
        await storeHashedPassword(password);
        return true;
    }

    if(message.type === 'verify') {
        const password = message.params.password;
        const storedHash = await storage.read('masterPswHash');
        const isValid = await crypto.isValidHash(password, storedHash);
        return isValid;
    }
}