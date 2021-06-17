import { Injectable } from "@angular/core";


const TOKENS = [
    {
        token: new RegExp(/^v_[[a-zA-Z_$][a-zA-Z_$0-9]*$/),
        codigo: 'VAR'
    },
    {
        token: new RegExp(/^(["])(?:(?=(\\?))\2.)*?\1$/),
        codigo: '$St'
    },
    {
        token: new RegExp(/^[0-9][0-9]*$/),
        codigo: '$In'
    },
    {
        token: new RegExp(/^[0-9][0-9]*[.][0-9][0-9]*$/),
        codigo: '$Fl'
    },
    {
        token: new RegExp(/^((true)|(false))$/),
        codigo: '$Bo'
    },
]

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor() {}

    public getTokenBycode(code: string) {
        return !!TOKENS.filter(t => t.codigo === code)[0] ? TOKENS.filter(t => t.codigo === code)[0] : null; 
    }

    get tokens() {
        return TOKENS;
    }
}


