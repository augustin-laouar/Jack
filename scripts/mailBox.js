import * as emailTools from './email_tools.js';


async function loginAssociatedAccount() {
    const params = new URLSearchParams(window.location.search);
    const emailId = params.get('emailId');
    var email = emailTools.getAccountStored(emailId);
    var res = await emailTools.login(email);
    if(res){
        emailTools.storeAccount(emailId, email);
        return email;
    }
    else{
        console.log('Error during login');
        return null;
    }
}


function changeDateFormat(oldDateFormat) {
    const currentDate = new Date();
    const newDate = new Date(oldDateFormat);
    const diffInSeconds = (currentDate - newDate) /1000;
    var newFormat = '';
    if(diffInSeconds <= 60) { //Less than 1 minute
        newFormat = 'Now';
    }
    else if(diffInSeconds < 3600){ // Less than 1 hour
        const nbMinutes = diffInSeconds / 60;
        if(nbMinutes === 1){
            newFormat = Math.floor(nbMinutes) + ' minute ago';
        }
        else{
            newFormat = Math.floor(nbMinutes) + ' minutes ago';
        }
    } 
    else if(diffInSeconds < 86400) { // Less than 1 day
        newFormat = newDate.getHours() + ':' + newDate.getMinutes();
    }
    else {
        newFormat = newDate.getFullYear() + '/' + newDate.getMonth() + '/' + newDate.getDate();
    }

    return newFormat;
}

async function fillEmailList(myMail){
    var messages = await emailTools.getMessages(myMail);
    var tab = document.querySelector('#tab-body');
    tab.innerHTML = '';
    for(const message of messages) {
        const trElement = document.createElement('tr');
        const tdDate = document.createElement('td');
        const tdFrom = document.createElement('td');
        const tdSubject = document.createElement('td');
        const tdContent = document.createElement('td');
        const tdConsult = document.createElement('td');
        const tdDelete = document.createElement('td');
        tdDate.textContent = changeDateFormat(message.createdAt);
        tdFrom.textContent = message.from.name + '(' + message.from.address + ')';
        tdSubject.textContent = message.subject;
        tdContent.innerHTML = '<p>' + message.intro;

        const buttonConsult = document.createElement('button');
        const buttonId = 'consult-' + message.id;
        buttonConsult.setAttribute('id', buttonId);
        buttonConsult.textContent = 'Consult';
        buttonConsult.addEventListener('click', async function () {
            var m = await emailTools.getMessage(myMail, message.id);
            const newHTML = await emailTools.messageToHtml(m, myMail.token);
            const newWindow = window.open();
            newWindow.document.open();
            newWindow.document.write(newHTML);
            newWindow.document.close();
        });

        const buttonDelete = document.createElement('button');
        const buttonId2 = 'delete-' + message.id;
        buttonDelete.setAttribute('id', buttonId2);
        buttonDelete.textContent = 'Delete';
        buttonDelete.addEventListener('click', function () {
            console.log('delete message');
        });
        tdConsult.appendChild(buttonConsult);
        tdDelete.appendChild(buttonDelete);
        trElement.appendChild(tdDate);
        trElement.appendChild(tdFrom);
        trElement.appendChild(tdSubject);
        trElement.appendChild(tdContent);
        trElement.appendChild(tdConsult);
        trElement.appendChild(tdDelete);
        tab.appendChild(trElement);
    }
}


async function init(){
    var email = await loginAssociatedAccount();
    if(email === null) {
        throw Error('Error during login');
    }
    const h2Element = document.querySelector('#address');
    h2Element.innerHTML = 'Mail box for ' + email.address;
    fillEmailList(email);
}   
init();





