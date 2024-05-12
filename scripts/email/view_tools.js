import * as errorManager from '../exception/mailError.js';


export async function downloadMessage(myMail, myMessage) {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    };
  
    if (myMail.token) {
      requestOptions.headers['Authorization'] = `Bearer ${myMail.token}`;
    }
    const response = await fetch(baseUrl + myMessage.downloadUrl, requestOptions);
    if(!response.ok){
      throw new errorManager.Error(1, 1, response.statusText);
    }
    const htmlContent = await response.text();
    return htmlContent;
    
  }
  
  
  function replaceAllOccurrences(text, regex, replacements) {
    let currentIndex = 0;
    const modifiedText = text.replace(regex, (match) => {
      const replacement = replacements[currentIndex % replacements.length];
      currentIndex++;
      return replacement;
    });
    return modifiedText;
  }
  
  function extractImgTags(htmlString) {
    const regex = /<img[\s\S]*?src=[\s\S]*?>/gi;
    const imgTags = htmlString.match(regex) || [];
    return imgTags;
  }
  
  function findAttachmentSrc(inputString) {
    const regex = /src="attachment:([a-zA-Z0-9]+)"/i;
    const match = inputString.match(regex);
    
    if (match) {
      const attachment = match[1];
      return attachment;
    }
    
    return null;
  }
  
  async function downloadAndEncodeImage(url, token) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
  
    const response = await fetch(url, { headers });
    if(!response.ok){
      throw new errorManager.Error(1, 1, response.statusText);
    }
    const blob = await response.blob();
  
    const reader = new FileReader();
    reader.readAsDataURL(blob);
  
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
      };
  
      reader.onerror = () => {
        reject('Unexpected error.');
      };
    });
  }
  async function getNewSrc(oldTag, messageId, token) {
    const attachementId = findAttachmentSrc(oldTag);
    if(attachementId !== null){
      const downloadUrl = baseUrl + messageId + '/attachment/' + attachementId;
      const base64String = await downloadAndEncodeImage(downloadUrl, token);
      const replacementString = 'src="' + base64String + '"';
      return replacementString;
    }
    else{
      return null;
    }
  }
  
  async function replaceSrc(imgTags, messageId, token) {
    const modifiedImgTags = await Promise.all(imgTags.map(async (tag) => {
      const oldTag = tag;
      const replacementString = await getNewSrc(oldTag, messageId, token);
      if (replacementString !== null) {
        const newTag = tag.replace(/src="[\s\S]*?"/gi, replacementString);
        return newTag;
      }
      return oldTag;
    }));
    return modifiedImgTags;
  }
  
  
  export async function messageToHtml(myMessage, token) {
    const regex = /<img[\s\S]*?src=[\s\S]*?>/gi;
    var imgs = extractImgTags(myMessage.html[0]);
    var res = await replaceSrc(imgs, myMessage.id, token);
    var newHtml = replaceAllOccurrences(myMessage.html[0],regex, res);
    return newHtml;
  }
  
  
  export async function howMuchUnread(myMail){
    var res = 0;
    var pageNumber = 1;
    while(true){
      var res =  await getMessages(myMail, pageNumber);
      var messages = res.messages;
      if(messages.length === 0){
        break;
      }
      for(const message in messages){
        if(!message.seen){
          res += 1;
        }
      }
    }
    return res;
  }
  
  //ATTACHEMENT
  
  export async function downloadAttachment(url, token) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
  
    const response = await fetch(baseUrl + url, { headers });
    if(!response.ok){
      throw new errorManager.Error(1, 1, response.statusText);
    }
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    return downloadUrl;
  }