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


import * as crypto from './crypto.js';
import { generateAlphaNumeric } from './rand_char.js';

export async function createChallenge(password, workFactor, nonce = null, salt = null) {
    workFactor = parseInt(workFactor, 10);
    if(nonce === null) {
        if(workFactor !== 0) {
            nonce = Math.min(Math.floor(Math.random() * (workFactor + 1)), workFactor);
        }
    }
    const result = await crypto.generateDerivedKey(password, nonce, salt);
    const randomString = generateAlphaNumeric(64);
    const encryptedString = await crypto.encryptWithAES(randomString, result.key);
    const jsonChallenge = { challenge: encryptedString, answer: randomString, salt: result.salt };
    return jsonChallenge;
}

export async function checkChallenge(password, challenge, workFactor) {
    try {
        workFactor = parseInt(workFactor, 10);
        const salt = challenge.salt;
        if(workFactor === 0) {
            const result = await crypto.generateDerivedKey(password, null, salt);
            const answer = await crypto.decryptWithAES(challenge.challenge, result.key);
            if(answer ===  challenge.answer) {
                return result.key;
            }
            else {
                return null;
            }
        }
        else {
            let found = null;
            for (let nonce = 0; nonce <= workFactor; nonce++) {
                const result = await crypto.generateDerivedKey(password, nonce, salt);
                try {
                    const answer = await crypto.decryptWithAES(challenge.challenge, result.key);
                    if(answer ===  challenge.answer) {
                        found = result.key;
                    }
                }
                catch(e) {
                    //pass
                }
            }
            return found;
        }

    }
    catch(e) {
        return null;
    }
}
