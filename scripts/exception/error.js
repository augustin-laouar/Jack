export class Error {
    constructor(message, show = false) {
        this.show = show;
        if(message === null || message === ''){
            this.message = 'Unexpected error.';
        }
        else{
            this.message = message;
        }
    }
}

export function errorToString(error) {
    if(error.show) {
        return error.message;
    }
    else {
        //debug mode
        console.log(error.message);
        return 'Unexpected error.';
    }
}

export function castError(error, show = false) {
    if(error instanceof Error){
        return error;
    }
    if ('message' in error) {
        return new Error(error.message, show);
    } 
    else {
        return new Error('Unexpected Error.', show);
    }
}