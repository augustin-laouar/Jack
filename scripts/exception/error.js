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
        return 'Unexpected error.';
    }
}
