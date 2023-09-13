import * as emailTools from './tools.js';
import * as errorManager from '../exception/mailError.js';

function showError(error){
    if(!(error instanceof errorManager.Error)){
      return;
    }
    const errorStr = errorManager.errorToString(error);
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = errorStr;
    if(error.type === 1){
      infoLabel.classList.remove('text-warning');
      infoLabel.classList.add('text-danger'); //system error
    }
    if(error.type === 2){
      infoLabel.classList.remove('text-danger');
      infoLabel.classList.add('text-warning'); //user error
    }
  }


async function markAsRead(myMail, message, trElement) {
    try{
        await emailTools.marksAsRead(myMail, message.id);
        trElement.querySelector('#messageSubject').classList.remove('fw-bolder');
        trElement.querySelector('#messageSubject').classList.remove('text-info');
        message.seen = true;
    }
    catch(error){
        showError(error);
    }
}

async function markAsUnread(myMail, message, trElement) {
    try{
        await emailTools.marksAsUnread(myMail, message.id);
        message.seen = false;
        trElement.querySelector('#messageSubject').classList.add('fw-bolder');
        trElement.querySelector('#messageSubject').classList.add('text-info');
    }
    catch(error){
        showError(error);
    }

}

async function loginAssociatedAccount() {
    try{
        const params = new URLSearchParams(window.location.search);
        const emailId = params.get('emailId');
        var email = await emailTools.getAccountStored(emailId);
        email = await emailTools.login(email);
        emailTools.storeAccount(emailId, email);
        return email;
    }
    catch(error){
        showError(error);
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
        try{
            var downloadUrl = await emailTools.downloadAttachment(attachmentUrl, myMail.token);      
            var downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = attachmentName;
            downloadLink.textContent = attachmentName;
            downloadLink.classList.add('btn', 'btn-secondary', 'text-light');
            downloadLink.style.marginRight = '3px';
            attachmentDiv.appendChild(downloadLink);
        } 
        catch(error){
            showError(error);
        }
    }
}

async function showMailContent(myMail, message) {
    try{
        var m = await emailTools.getMessage(myMail, message.id);
        const newHTML = await emailTools.messageToHtml(m, myMail.token);
        var subject = document.getElementById("subject");
        var sender = document.getElementById("sender");
        var receiver = document.getElementById("receiver");
        var date = document.getElementById("date");
        var cc = document.getElementById("cc");
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
        if(m.subject === ''){
            subject.innerText = 'No subject';
        }
        else{
            subject.innerText = m.subject;
        }
        if(m.cc.lenght > 0){
            cc.innerText = 'CC : ';
        }
        for(var i = 0; i<m.cc.length; i++) {
            cc.innerText = cc.innerText + m.cc[i].name + ' <' + m.cc[i].address + '>';
            if(i !== m.cc.length - 1){ 
                cc.innerText = cc.innerText + '; ';
            }
        }
        document.getElementById("border").classList.add('border-top');
        mailContentDiv.innerHTML = newHTML;
        fillAttachement(myMail, m);
    }
    catch(error){
        showError(error);
    }
}

function emptyMailContent(){
    document.getElementById("subject").innerText = '';
    document.getElementById("sender").innerText = '';
    document.getElementById("receiver").innerText = '';
    document.getElementById("date").innerText = '';
    document.getElementById("cc").innerText = '';
    document.getElementById("mailContent").innerHTML = '';
    document.getElementById("attachments").innerHTML = '';
}

function getTrContent(message) {
    var from = message.from.name;
    var createdAt = changeDateFormat(message.createdAt);
    var subject = message.subject;
    if(subject === '') {
        subject = 'No subject'
    }
    var intro = message.intro;
    if(from === "" || from === null) {
        from = message.from.address;
    }
    var h4Class = '';
    if(!message.seen){
        h4Class = 'class="fw-bolder text-info"';
    }
    var codeHTML = `<td>
                  <div class="container">
                    <div class="row">
                      <div class="col-10">
                        <div class="d-flex align-items-center">
                          <div class="mx-2">
                            <div class="text-center">
                                <h4 style="text-align: initial;">${from}</h4>
                                <h5 id='messageSubject' ${h4Class} style="text-align: initial;">${subject}</h5>
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

function getMoreButtonContent(){
    var codeHTML = `<td class="d-flex align-items-center justify-content-center">
                        <div class="container">
                            <h4 class="text-center text-info">More</h4>
                        </div>
                    </td>`;
    return codeHTML; 
}

function showCustomMenu(x, y, myMail, message, tab, trElement) {
    var customMenu = document.createElement("div");
    customMenu.id = 'customMenu';
    customMenu.style.position = "absolute";
    customMenu.style.backgroundColor = "#000";
    customMenu.style.border = "1px solid #ccc";
    customMenu.style.padding = "5px 0";
    //delete 
    var deleteMenuItem = document.createElement("div");
    deleteMenuItem.textContent = "Delete";
    deleteMenuItem.style.padding = "5px 20px";
    deleteMenuItem.style.cursor = "pointer";
    deleteMenuItem.addEventListener("click", async function() {
        try{
            await emailTools.deleteMessage(myMail, message.id);
            tab.removeChild(trElement);
            document.body.removeChild(customMenu);
            var showMailContainer = document.getElementById('showMailContainer');
            showMailContainer.classList.remove('bg-light');
            showMailContainer.classList.remove('text-dark');
            showMailContainer.classList.add('bg-dark');
            showMailContainer.classList.add('text-light');
            showMailContainer.style.removeProperty('overflow');
            emptyMailContent();
        }
        catch(error){
            showError(error);
        }
    });
    customMenu.appendChild(deleteMenuItem);
    //Separator
    var separator = document.createElement("div");
    separator.classList.add("border-top");
    separator.style.margin = "10px 10px";
    customMenu.appendChild(separator);
    //Mark as read/unread
    var markAsReadMenuItem = document.createElement("div");
    if(message.seen){
        markAsReadMenuItem.textContent = "Mark as unread";
    }
    else{
        markAsReadMenuItem.textContent = "Mark as read";
    }
    markAsReadMenuItem.style.padding = "5px 20px";
    markAsReadMenuItem.style.cursor = "pointer";
    markAsReadMenuItem.addEventListener("click", async function() {
        if(message.seen){
            try{
                markAsUnread(myMail, message, trElement);
            }
            catch(error){
                showError(error);
            }
        }
        else {
            try{
                markAsRead(myMail, message, trElement);
            }
            catch(error){
                showError(error);
            }        
        }
        document.body.removeChild(customMenu);
    });
    customMenu.appendChild(markAsReadMenuItem);
    document.body.appendChild(customMenu);
    customMenu.style.left = x + "px";
    customMenu.style.top = y + "px";
}

function hideCustomMenu(event) {
    if (!event.target.closest("#customMenu")) {
        var customMenu = document.getElementById("customMenu");
        if (customMenu) {
            document.body.removeChild(customMenu);
        }
    }
}

async function fillEmailList(myMail, pageNumber = 1){
    try{
        var res = await emailTools.getMessages(myMail, pageNumber);
        var messages = res.messages;
        var tab = document.querySelector('#tab-body');
        tab.innerHTML = '';
        for(const message of messages) {
            const trElement = document.createElement('tr');
            trElement.innerHTML = getTrContent(message);
            trElement.addEventListener('click', function() {
                var showMailContainer = document.getElementById('showMailContainer');
                showMailContainer.classList.remove('bg-dark');
                showMailContainer.classList.remove('text-light');
                showMailContainer.classList.add('bg-light');
                showMailContainer.classList.add('text-dark');
                showMailContainer.style.setProperty('overflow', 'scroll');
                showMailContent(myMail, message);
                if(!message.seen){
                    try{
                        markAsRead(myMail,message,trElement);
                    }
                    catch(error){
                        showError(error);
                    }
                }
            });
            trElement.addEventListener('contextmenu', function(event) {
                event.preventDefault();
                hideCustomMenu(event);
                showCustomMenu(event.clientX, event.clientY, myMail, message, tab, trElement);
            });
            tab.appendChild(trElement);
        }
        if(res.hasMoreMessages){
            const moreMessageButton = document.createElement('tr');
            moreMessageButton.innerHTML = getMoreButtonContent();
            moreMessageButton.style.cursor = 'pointer';
            moreMessageButton.addEventListener('click', function(){
                fillEmailList(myMail, pageNumber + 1);
                tab.removeChild(moreMessageButton);
            });
            tab.appendChild(moreMessageButton);
        }
        document.getElementById('totalItems').innerHTML = '<strong>' + res.totalItems + '</strong> messages in <strong>' + myMail.address + '</strong> mail box.';
        }
    catch(error){
        showError(error);
    }
    
}


async function init(){
    try{
        var email = await loginAssociatedAccount();
        fillEmailList(email);
        return email;
    }
    catch(error){
        showError(error);
    }
}   
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
async function onPeriod(ms, email){
    while(true){
        console.log('autorefresh');
        fillEmailList(email);
        await wait(ms);
    }
}


document.addEventListener("DOMContentLoaded", async function() {
    const email = await init();
    document.addEventListener('click', function(event) { 
        hideCustomMenu(event);
    });
    document.getElementById('refreshButton').addEventListener('click', function() {
        fillEmailList(email);
    });
    document.getElementById('title').innerText = email.address;
    browser.tabs.insertCSS({ file: "../css/bootstrap.min.css" });

    //autorefrsh
    onPeriod(5000, email);
  });






