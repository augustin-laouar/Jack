import * as pswTools from './tools.js';
import * as storage from '../tools/storage.js'

async function fillInputs() {
  const data = await storage.read('popupData');
  const { id, url, username, psw } = data.popupData;
  document.getElementById('url').value = url;
  document.getElementById('username').value = username;
  document.getElementById('password').value = psw;
  storage.remove('popupData');
  return id;
}

window.onload = async function() {
  const id = await fillInputs();
  const pwdForm = document.getElementById("pwd-form");
  pwdForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const url = document.getElementById("url").value;
    const username = document.getElementById("username").value;
    const pwd = document.getElementById("password").value;
    try {
      await pswTools.modifyLog(id, url, username, pwd);
      browser.runtime.sendMessage({ action: "updatePswList" });
      window.close();
    } catch (error) {
      browser.runtime.sendMessage({
        action: "errorUpdatePsw",
        error: {
          message: "Error updating password.",
          type: 1
        } });
      window.close();
    }
  });
};
