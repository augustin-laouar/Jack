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

import * as error from '../exception/error.js';

export function showError(e){
    if(!(e instanceof error.Error)){
        return;
    }
    const message = error.errorToString(e);
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-warning';
}

export function showInfo(message){
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-info';

}

export function showPopupInfo(message, warning = false) {
    const infoLabel = document.getElementById('popup-info');
    infoLabel.innerHTML = message;
    if(warning) {
        infoLabel.classList.remove('text-info');
        infoLabel.classList.add('text-warning');
    }
    else {
        infoLabel.classList.remove('text-warning');
        infoLabel.classList.add('text-info');
    }
}

export function showPopupError(e){
    if(!(e instanceof error.Error)){
      return;
    }
    const message = error.errorToString(e);
    showPopupInfo(message, true);
}