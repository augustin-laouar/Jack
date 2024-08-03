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

import * as error from '../../exception/error.js';
import * as storage from '../../tools/storage.js'
import { getIsLogged, setLastAction, getLastAction } from '../vars.js';

async function sessionExpired() {
    try{
        const isLogged = getIsLogged();
        const lastAction = getLastAction();
        if(lastAction === null) {
            return true;
        }
        if(!isLogged) {
            return true;
        }
        const sessionDuration = await storage.read('connectionDuration');
        if(!sessionDuration) {
            return true;
        }
        const currentDate = new Date();
        const elapsedTime = currentDate.getTime() - lastAction.getTime();
        if (elapsedTime >= sessionDuration * 60000) {
            return true;
        } 
        else {
            return false;
        }
    }
    catch(e) {
        throw error.castError(e, false);
    }
} 

async function sessionTimeout() {
    const lastAction = getLastAction();
    if(lastAction === null) {
        return false;
    }
    const sessionDuration = await storage.read('connectionDuration');
    if(!sessionDuration) {
        return false;
    }
    const currentDate = new Date();
    const elapsedTime = currentDate.getTime() - lastAction.getTime();
    if (elapsedTime >= sessionDuration * 60000) {
        return true;
    } 
    else {
        return false;
    }
}
function updateLastAction() {
    try{
        const currentDate = new Date();
        setLastAction(currentDate);
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

async function isFirstLogin(){
    try {
        const hash = await storage.read('masterPswHash');
        if(hash === null) {
            return true;
        }
        return false;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}
/*
* CHECK : check if session is active
* UPDATE : update lastAction
*/
export async function handle(message) {
    if(message.type === 'check') {
        const expired = await sessionExpired();
        const result = !expired;
        return result;
    }
    if(message.type === 'timeout') {
        const result = await sessionTimeout();
        return result;
    }
    if(message.type === 'update') {
        updateLastAction();
        return true;
    }
    if(message.type === 'isFirstLogin') {
        const result = await isFirstLogin();
        return result;
    }
}