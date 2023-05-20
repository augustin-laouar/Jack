import * as tools from './tools.js';

sessionStorage.setItem('test',tools.isLogged());
if(!tools.isLogged()){
  window.location.href = '../html/login.html';
}