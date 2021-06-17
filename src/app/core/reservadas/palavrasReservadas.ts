

export const RESERVADAS = {

    palavrasReservadas: [
        {
            token: 'EQ',
            codigo: '='
        },
        {
            token: 'readVar',
            codigo: 'INPUT'
        },
        {
            token: 'readOut',
            codigo: 'OUTPUT'
        },
        {
            token: '==',
            codigo: 'if'
        },
        {
            token: '!',
            codigo: 'else'
        },
        {
            token: 'LOOP',
            codigo: 'while'
        },
        {
            token: '+',
            codigo: '+'
        },
        {
            token: '-',
            codigo: '-'
        },
        {
            token: 'BTEQ',
            codigo: '>'
        },
        {
            token: 'LTEQ',
            codigo: '<'
        },
        {
            token: 'EQ',
            codigo: '=='
        },
        {
            token: 'NE',
            codigo: '!='
        },
        {
            token: 'AND',
            codigo: '&&'
        },
        {
            token: 'OR',
            codigo: '||'
        },
        {
            token: 'NOT',
            codigo: '!'
        },
        // {
        //     token: 'true',
        //     codigo: 'true'
        // },
        // {
        //     token: 'false',
        //     codigo: 'false'
        // },
    ], //todas as palavras reservadas
    tiposVariaveis: [
        {
            token: '$In',
            codigo: 'number'
        },
        {
            token: '$Fl',
            codigo: 'number'
        },
        {
            token: '$St',
            codigo: 'string'
        },
        {
            token: '$Bo',
            codigo: 'boolean'
        },
    ], // todos os tipos de variaveis
    simbolosReservados: [
        {
            token: '=',
            codigo: '='
        },
        {
            token: '(',
            codigo: '('
        },
        {
            token: ')',
            codigo: ')'
        },
        {
            token: ';',
            codigo: ';'
        },
        {
            token: '<<',
            codigo: '{'
        },
        {
            token: '>>',
            codigo: '}'
        },
        {
            token: '"',
            codigo: '"'
        },
        {
            token: '+',
            codigo: '+'
        },
        {
            token: '#',
            codigo: '//'
        },
    ], //todos os simbolos da linguagem
    operadoresLogicos: [
        {
            token: 'BTEQ',
            codigo: '>'
        },
        {
            token: 'LTEQ',
            codigo: '<'
        },
        {
            token: 'EQ',
            codigo: '=='
        },
        {
            token: 'NE',
            codigo: '!='
        },
        {
            token: 'AND',
            codigo: '&&'
        },
        {
            token: 'OR',
            codigo: '||'
        },
        {
            token: 'NOT',
            codigo: '!'
        },
    ],
    operadoresAritmeticos: [
        {
            token: '+',
            codigo: '+'
        },
        {
            token: '-',
            codigo: '-'
        },
        {
            token: '*',
            codigo: '*'
        },
        {
            token: '/',
            codigo: '/'
        },
        {
            token: 'PER',
            codigo: '%'
        }
    ],
    valores: [
        {
            token: new RegExp(/^v_[[a-zA-Z_$][a-zA-Z_$0-9]*$/),
            tipo: 'VAR'
        },
        {
            token: new RegExp(/^(["])(?:(?=(\\?))\2.)*?\1$/),
            tipo: '$St'
        },
        {
            token: new RegExp(/^[0-9][0-9]*$/),
            tipo: '$In'
        },
        {
            token: new RegExp(/^[0-9][0-9]*[.][0-9][0-9]*$/),
            tipo: '$Fl'
        },
        {
            token: new RegExp(/^((true)|(false))$/),
            tipo: '$Bo'
        },
    ]
}

export function isBool(value) {
    return (value === 'true' || value === 'false' );
}

export function isTipagem(token) {
    return !!RESERVADAS['tiposVariaveis'].find(tv => tv.token === token);
}

export function isReserved(token) {
    return !!RESERVADAS['palavrasReservadas'].find(tv => tv.token === token);
}

export function isSymbol(token) {
    return !!RESERVADAS['simbolosReservados'].find(tv => tv.token === token);
}

export function isVar(token) {
    return !!RESERVADAS['valores'][0].token.exec(token);
}

export function isOperator(token) {
    return !!RESERVADAS['operadoresLogicos'].find(op => op.token = token);
}