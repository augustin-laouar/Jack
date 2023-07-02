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

async function fillAttachement(myMail, message) {
    var attachmentDiv = document.getElementById("attachments");
    attachmentDiv.innerHTML = '';
    for(var i =0; i < message.attachments.length; i++) {
        var attachmentUrl = message.attachments[i].downloadUrl;
        var attachmentName = message.attachments[i].filename;  
        var downloadUrl = await emailTools.downloadAttachment(attachmentUrl, myMail.token);      
        var downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = attachmentName;
        downloadLink.textContent = attachmentName;
        downloadLink.classList.add('btn', 'btn-dark', 'text-light');
        attachmentDiv.appendChild(downloadLink);
    }
}

async function showMailContent(myMail, message) {
    var m = await emailTools.getMessage(myMail, message.id);
    const newHTML = await emailTools.messageToHtml(m, myMail.token);
    var sender = document.getElementById("sender");
    var receiver = document.getElementById("receiver");
    var date = document.getElementById("date");
    var mailContentDiv = document.getElementById("mailContent");
    sender.innerText = 'From : ' + m.from.name + ' <' + m.from.address + '>';
    receiver.innerText = 'To : ';
    for(var i = 0; i<m.to.length; i++) {
        receiver.innerText = receiver.innerText + m.to[i].name + ' <' + m.to[i].address + '>';
        if(i !== m.to.length - 1){ 
            receiver.innerText = receiver.innerText + '; ';
        }
    }
    const creationDate = new Date(m.createdAt);
    date.innerText = (creationDate.getMonth() + 1) + '/' + creationDate.getDate() + '/' + creationDate.getFullYear() + '  ' + creationDate.getHours() + ':' + creationDate.getMinutes() + ':' + creationDate.getSeconds();
    subject.innerText = m.subject;
    mailContentDiv.innerHTML = newHTML;
    fillAttachement(myMail, m);
}


function getTrContent(message) {
    var from = message.from.name;
    var createdAt = changeDateFormat(message.createdAt);
    var subject = message.subject;
    var intro = message.intro;
    if(from === "" || from === null) {
        from = message.from.address;
    }
    var codeHTML = `<td>
                  <div class="container">
                    <div class="row">
                      <div class="col-10">
                        <div class="d-flex align-items-center">
                          <div class="mx-2">
                            <div class="text-center">
                                <h3 style="text-align: initial;">${from}</h2>
                                <h4 style="text-align: initial;">${subject}</h3>
                                <p style="text-align: initial;">${intro}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-2">
                        <div class="d-flex align-items-center justify-content-center">
                          <div class="text-center">${createdAt}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>`;
    return codeHTML;
    

}

async function fillEmailList(myMail){
    var messages = await emailTools.getMessages(myMail);
    var tab = document.querySelector('#tab-body');
    tab.innerHTML = '';
    for(const message of messages) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(message);
        trElement.addEventListener('click', function() {
            var showMailContainer = document.getElementById('showMailContainer');
            //change style of the mail div first time we click on a mail
            showMailContainer.classList.add('bg-light');
            showMailContainer.classList.add('text-dark');
            showMailContainer.style.setProperty('overflow', 'scroll');
            showMailContent(myMail, message);
        });
        tab.appendChild(trElement);
    }
}


async function init(){
    var email = await loginAssociatedAccount();
    if(email === null) {
        throw Error('Error during login');
    }
    const h2Element = document.querySelector('#address');
    h2Element.innerHTML = '<strong>' + email.address + '</strong>';
    fillEmailList(email);
}   

init();
browser.tabs.insertCSS({ file: "../css/mailbox.css" });
browser.tabs.insertCSS({ file: "../css/bootstrap.min.css" });





