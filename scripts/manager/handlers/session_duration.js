import * as storage from '../../tools/storage.js'


function storeConnexionDuration(connectionDuration){
    storage.store( {connectionDuration:connectionDuration })
    .catch(e => {
      throw error.castError(e, false);
    });
} 

async function getConnectionDuration(){ // in minutes
  try {
    const duration = await storage.read('connectionDuration');
    if(duration === null) {
      return 0;
    }
    return parseFloat(duration);
  }
  catch(e) {
    throw error.castError(e, false);
  }
}



export async function handle(message) {
    if(message.type === 'set') {
        const duration = message.params.duration;
        storeConnexionDuration(duration);
        return true;
    }

    if(message.type === 'get') {
        const duration = await getConnectionDuration();
        return duration;
    }
}