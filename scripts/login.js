import * as tools from './tools.js';

async function hashPassword(psw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(psw);

  try {
    const hash = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    throw error;//todo
  }
}

async function validPassword(psw) {
  try {
    const hashedpsw = await hashPassword(psw);
    const storedHash = localStorage.getItem('password');
    return hashedpsw === storedHash;
  } catch (error) {
    console.error('Error:', error); //todo
    return false;
  }
}

async function storeHashedPassword(psw) {
  try {
    const hashedpsw = await hashPassword(psw);
    localStorage.setItem('password', hashedpsw);
  } catch (error) {
    console.error('Error:', error); //todo
  }
}

document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("login-form");
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    await storeHashedPassword("titi"); //enlever
    var password = document.getElementById("password").value;
    if (await validPassword(password)) {
      tools.storeLastLogin();
      window.location.href = "../html/emails.html";
    }
  });
});