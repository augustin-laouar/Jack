export class Error {
    constructor(type, details) {
        this.type = type; //1 for system, 2 for user
        if(details === null){
            this.details = 'No details.';
        }
        else{
            this.details = details;
        }
    }
}