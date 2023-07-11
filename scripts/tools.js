
/**
 * This file contains every tools we have to use in other modules
 */



//COOKIE
export function createCookie(name, value, url, minutes) {
    const milliseconds = minutes * 60 * 1000;
    const expirationDate = new Date(Date.now() + milliseconds).getTime() / 1000;
    
    const cookie = {
      //url: browser.extension.getURL(""), // associate url is local
      url: url,
      name: name,
      value: value,
      expirationDate: expirationDate
    };
    
    browser.cookies.set(cookie)
      .then(() => {
        console.log('Le cookie a été créé avec succès.'); //TODO gérer les erreurs
      })
      .catch((error) => {
        console.error('Erreur lors de la création du cookie :', error);
      });
  }

export function getCookie(name, url) {
    const query = { 
        url: url,
        name: name
     };

    return browser.cookies.get(query)
        .then((cookie) => {
        if (cookie) {
            return cookie.value;
        } else {
            return null;
        }
        })
        .catch((error) => {
        console.error('Erreur lors de la récupération du cookie :', error);
        return null;
        });
  }  

export function deleteCookie(name, url) {
    const query = { 
        url: url,
        name: name
     };
  
    return browser.cookies.remove(query)
      .then((details) => {
        return details;
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression du cookie :', error);
        return false;
      });
  }


  //Login
  function sessionExpired(minutes) {
    const storedDate = localStorage.getItem('lastLogin');
    
    if (storedDate) {
      const currentDate = new Date();
      const storedDateObj = new Date(storedDate);

        const elapsedTime = currentDate.getTime() - storedDateObj.getTime();

        if (elapsedTime >= minutes * 60000) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }  


export function storeLastLogin() {
    const currentDate = new Date();
    localStorage.setItem('lastLogin', currentDate.toISOString());
 }

export function isLogged() {
    if(sessionExpired(10)){
        return false;
    }
    return true;

 }

 export function logout() {
  var now = new Date();
  var toStore = new Date(now.getTime() - (10 * 60 * 1000)); 
  localStorage.setItem('lastLogin', toStore.toISOString());
  window.location.href = '../html/login.html';
 }

