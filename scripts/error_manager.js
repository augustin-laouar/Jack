export class Error {
    constructor(id, type, details) {
        this.id = id;
        this.type = type;
        if(details === null){
            this.details = 'No details.';
        }
        else{
            this.details = details;
        }
    }
}
function idToString(id){
    if(id === 1){
        return 'API request error.';
    }
    else if(id === 2){
        return 'Local storage error.'
    }
    else if(id === 3){
        return 'Maximum number of email address reached.'
    }
    else if(id===4){
        return 'Unexpected error.'
    }
    return 'Undefined error.'
}

function typeToString(type) {
    if(type === 1){
        return 'System error';
    }
    if(type === 2){
        return 'User error';
    }
    return 'Undefined type of error';
}
export function errorToString(error) {
    const idString = idToString(error.id);
    const typeString = typeToString(error.type);
    return '<strong>' + typeString + ' : ' + idString + '</strong> ' + error.details; 
}