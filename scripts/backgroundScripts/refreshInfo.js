function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function onPeriod(ms){
    var counter = 0;
    while(true) {
     if(document.getElementById('info').innerHTML !== '')
        counter ++;
    
      if(counter == 5){ 
        document.getElementById('info').innerHTML = '';
        counter = 0;
      }
      await wait(ms);
    }
  
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    onPeriod(1000);
  });