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

import * as storage from '../../tools/storage.js'

function storeWorkFactor(workFactor){
    storage.store( {workFactor: workFactor })
    .catch(e => {
      throw error.castError(e, false);
    });
} 

async function getWorkFactor(){ 
  try {
    const workFactor = await storage.read('workFactor');
    if(workFactor === null) {
      return 0;
    }
    return workFactor;
  }
  catch(e) {
    throw error.castError(e, false);
  }
}

export async function handle(message) {
    if(message.type === 'set') {
        const workFactor = message.params.workFactor;
        storeWorkFactor(workFactor);
        return true;
    }

    if(message.type === 'get') {
        const workFactor = await getWorkFactor();
        return workFactor;
    }
}