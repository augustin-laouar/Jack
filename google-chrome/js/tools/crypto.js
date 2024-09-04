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

// DERIVED KEY
export async function generateDerivedKey(password, nonce = null, salt = null, iterations = 100000) {
  const encoder = new TextEncoder();
  
  if (salt === null) {
    salt = crypto.getRandomValues(new Uint8Array(16)); 
  }
  var toEncode = encoder.encode(password);
  if(nonce !== null) {
    const nonceEncoded = encoder.encode(nonce);
    const minLength = Math.min(toEncode.length, nonceEncoded.length);
    for (let i = 0; i < minLength; i++) {
      toEncode[i] ^= nonceEncoded[i];
    }
  }
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toEncode,
    'PBKDF2',
    false, 
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM', 
      length: 256 
    },
    false, 
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}


export async function encryptWithAES(data, key) {
  const encodedData = new TextEncoder().encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for GCM

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const encryptedArray = new Uint8Array(encryptedData);
  const ivHex = Array.prototype.map
    .call(iv, byte => ('00' + byte.toString(16)).slice(-2))
    .join('');

  const encryptedHex = Array.prototype.map
    .call(encryptedArray, byte => ('00' + byte.toString(16)).slice(-2))
    .join('');

  const encryptedResult = ivHex + encryptedHex;
  return encryptedResult;
}

export async function decryptWithAES(encryptedData, key) {
  const ivHex = encryptedData.substr(0, 24); // 12 bytes IV
  const encryptedHex = encryptedData.substr(24);

  const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedArray
  );

  const decryptedString = new TextDecoder().decode(decryptedData);
  return decryptedString;
}
