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

export class Error {
    constructor(message, show = false) {
        this.show = show;
        if(message === null || message === ''){
            this.message = 'Unexpected error.';
        }
        else{
            this.message = message;
        }
    }
}

export function errorToString(error) {
    if(error.show) {
        return error.message;
    }
    else {
        return 'Unexpected error.';
    }
}

export function castError(error, show = false) {
    if(error instanceof Error){
        return error;
    }
    if ('message' in error) {
        if('show' in error) {
            return new Error(error.message, error.show);
        }
        return new Error(error.message, show);
    } 
    else {
        return new Error('Unexpected Error.', show);
    }
}