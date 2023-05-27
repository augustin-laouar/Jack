import * as emailTools from './email_tools.js';

const params = new URLSearchParams(window.location.search);
const emailId = params.get('emailId');

var email = emailTools.getAccountStored(emailId);

const h2Element = document.querySelector('#address');
h2Element.innerHTML = 'Mail box for ' + email.address;



