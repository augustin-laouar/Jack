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

import * as storage from '../../tools/storage.js';

function get_meta_data() {
    const version = 1; //Jack file version
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return {
        version: version,
        creation: formattedTime
    };
}
async function get_json() {
    const masterPswHash = await storage.read('masterPswHash');
    const connectionDuration = await storage.read('connectionDuration');
    const emails = await storage.read('emails');
    const creds = await storage.read('credentials');
    const generators = await storage.read('generators');
    const metadata = get_meta_data();
    const jsonData = {
        metadata: metadata,
        masterPswHash: masterPswHash,
        connectionDuration: connectionDuration,
        emails: emails,
        credentials: creds,
        generators: generators
    };
    return jsonData;
}

async function export_account(givenFileName) {
    const jsonObject = await get_json();
    const jsonStr = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    return blob;
}


export async function handle(message) {
    const blob = await export_account();
    return blob;
}