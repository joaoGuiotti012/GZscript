import { Injectable } from "@angular/core";


const TOKENS = [
    {
        token: new RegExp(/^(["])(?:(?=(\\?))\2.)*?\1$/),
        codigo: 'St'
    },
    {
        token: new RegExp(/^((true)|(false))$/),
        codigo: 'Bo'
    },
    {
        token: new RegExp(/^[0-9][0-9]*$/),
        codigo: 'In'
    },
    {
        token: new RegExp(/^[0-9][0-9]*[.][0-9][0-9]*$/),
        codigo: 'Fl'
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
