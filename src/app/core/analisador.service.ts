import { Injectable } from '@angular/core';
import { TokenService } from './Token.service';
import {
  OPERATORS,
  isQuebraLinha,
  isOperator
} from './comparadores'

import { RESERVADAS } from './reservadas'

interface Lexer {
  type: string;
  value: any;
}

const ST_MAX = 333;
const IN_MIN = -100000000;
const IN_MAX = 100000000;
const FL_MIN = -100000000;
const FL_MAX = 100000000;

@Injectable({
  providedIn: 'root'
})
export class AnalisadorService {

  _lexer: Lexer;
  _token: any;

  EOF = 0;
  reservedWord: any = [];
  variables: any = [];
  linhas: any;
  errors: any = [];

  constructor(private token: TokenService) { }

  begin(): void {
    console.log(RESERVADAS);
    this.reservedWord = [];
    this.linhas = null;
    this.errors = [];
  }

  analisarLx(code: string): Lexer[] {
    return code.split(/\s+/)
      .filter((t) => t.length > 0)
      .map((t: any) => {
        return isOperator(t)
          ? { type: 'operator', value: t }
          : isNaN(t)
            ? { type: 'word', value: t }
            : { type: 'number', value: t }
      });
  }


  // current token (LX) => em loop
  // LX.type === 'Operator' | 'word' | 'numeiric' 

  // word => pegar token para validar expressao => cont ++
  // Operator => switch simbols => 
  // Int teste = 0;
  // teste++;

  //OBJETIVO
  // Realizar operacoes matemaaticas basicas (+, -)
  // Imprimir hello GzWord !
  parser(last: string, lexer: Lexer[], cont: number = 0) {
    var current_lx = lexer[cont];
    var EOF = lexer.length;

    if (EOF === cont) {
      
    }


    switch (current_lx.type) {

      case 'word':

        if (this.token.getTokenBycode(current_lx.value)) {
          this._token = this.token.getTokenBycode(current_lx.value)
        } else {
          this.reservedWord.push(current_lx.value);
          this.parser
        }
        this.parser('word', lexer, cont++);

        break;

      case 'number':

        break;

      case 'operator':

        break;

      default:
        break;
    }







    // while (lexer.length > 0) {
    //   var current_lx = lexer.shift();
    //   var _token: any;
    //   var _lexer: Lexer;
    //   var _reserved: any;

    //   if (current_lx.type === 'word') {

    //     if (this.token.getTokenBycode(current_lx.value)) {
    //       _lexer = lexer.shift();
    //       _token = this.token.getTokenBycode(current_lx.value);

    //       _reserved = _lexer.value;

    //       if (lexer.shift().value === '=') {
    //         _lexer = lexer.shift();

    //         if (!!_token.token.exec(_lexer.value)) {
    //           this.reservedWord = { [_reserved]: _lexer.value.split(';')[0] };
    //           console.log(_lexer.value.split(';')[0]);
    //         } else {
    //           this.errors.push('Valor atribuido invalido para o tipo da variavel ' + _reserved);
    //           throw ('Valor atribuido invalido para o tipo da variavel ' + _reserved)
    //         }
    //       } else {
    //         this.errors.push('Erro Linha, valor esperado "="');
    //         throw ('Erro Linha, valor esperado "="')
    //       }

    //     } else {
    //       this.errors.push('Tipo invalido: ' + current_lx.value)
    //       throw ('Tipo invalido: ' + current_lx.value)
    //     }

    //   }
    // }
  }

  compilaGz(code) {
    try {
      this.begin();
      this.EOF = this.analisarLx(code).length;
      this.parser(null, this.analisarLx(code));
      alert('código compilado com sucesso!');
    } catch (error) {
      alert('Erro ao compilar!');
      console.error(error)
    }
    return { errors: this.errors, reservedWord: this.reservedWord }
  }


}
