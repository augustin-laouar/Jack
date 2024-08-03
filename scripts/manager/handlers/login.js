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