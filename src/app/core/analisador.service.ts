import { Injectable } from '@angular/core';
import { TokenService } from './Token.service';
import {
  OPERATORS,
  isQuebraLinha,
  isOperator
} from './comparadores'

import { RESERVADAS, isTipagem, isReserved, isSymbol, isVar, isBool } from './reservadas'

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

  reservedVars: any = [];
  variables: any = [];
  linhas: any;
  errors: any = [];

  constructor(private token: TokenService) { }

  begin(): void {
    console.log(RESERVADAS);
    this.reservedVars = [];
    this.linhas = null;
    this.errors = [];
  }

  isComentario(value) {
    return /\/\//.exec(value);
  }

  analisarLx(code: string): any[] {
    let contLinhas = 0
    const split = code.split(';')
      .filter((line: string) => {
        if (line != '')
          contLinhas++;
        return !this.isComentario(line)
      }).map((t: any) => {
        // Ponto a alterar
        // - metodos auxiliares para reconher tipos dos tokens
        return t.split(/\s+/).map((t) => {
          let response: string = null;
          if (t != "") {
            if (isTipagem(t)) {
              response = 'TYPE';
            } else if (isNaN(t)) { //se for string
              if (isSymbol(t)) {//se for simbolo reservda
                response = 'SYMBOL';
              } else if (isReserved(t)) { //se for palavra reservda
                response = 'RESERVED';
              } else {
                response = 'STRING';
              }
            } else {
              response = 'NUMBER'
            }
            return { type: response, value: t }
          }
        });
      });
    this.linhas = contLinhas;
    return split;
  }

  //OBJETIVO
  // Indentificar gramatiaca
  // e realizar log do lexer
  async parser(lexer: any) {

    console.log(lexer);
    // for paara cada tokne da sua lista
    //for validar string pertence ao arquivo de palavras reservadas
    var currentIndex = 1;
    await lexer.forEach(line => {
      if (line.length === 1 && line[0] === undefined) { return }
      console.log(currentIndex);
      currentIndex++;

      var _varName: string = null; // guarda nome da var
      var _varType: string = null; // guarda se existir tipagem
      line.forEach((l: Lexer) => { // percore a mesma linha;
        if (l === undefined) { return }
        // console.log('l =>', l);
        // l.type ==> 'word' | 'operator' | 'numeric'  ||  l.value

        switch (l.type) {

          case 'TYPE':
            _varType = l.value;
            break;

          case 'RESERVED':
            break;


          case 'SYMBOL':

            break;

          case 'STRING':
            if (!!_varType) {
              if (isVar(l.value)) {
                if (!!_varName) {
                  this.errors.push('Erro de sintaxe linha: ' + currentIndex);
                  return;
                }
                _varName = isBool(l.value) ? Boolean(l.value) : l.value;
              } else {
                let regExp = RESERVADAS['valores'].filter(vl => vl.tipo == _varType)[0].token;
                if (!!regExp && regExp.exec(l.value)) {
                  this.reservedVars.push({ var: _varName, type: _varType, value: l.value });
                } else {
                  this.errors.push('valor não corresponde ao tipo declarado para a variavel ' + _varName + ', linha: ' + currentIndex);
                }
              }
            }
            break;

          case 'NUMBER':

            if (!!_varType) {
              if (isVar(l.value)) {
                if (!!_varName) {
                  this.errors.push('Erro de sintaxe linha: ' + currentIndex);
                  return;
                }
                _varName = l.value;
              } else {
                let regExp = RESERVADAS['valores'].filter(vl => vl.tipo == _varType)[0].token;
                if (!!regExp && regExp.exec(l.value)) {
                  this.reservedVars.push({ var: _varName, type: _varType, value: l.value });
                } else {
                  this.errors.push('O valor ' + l.value + ' não corresponde ao tipo declarado para a variavel ' + _varName);
                }
              }
            }
            break;

          default:

            break;
        }

      });
    });
    console.log('Reserved Word ==> ', this.reservedVars);
  }

  compilaGz(code) {
    try {
      this.begin();
      this.parser(this.analisarLx(code));
    } catch (error) {
      this.errors.push(error);
      console.error(error)
    }
    return {
      linhas: this.linhas,
      errors: this.errors,
      reservedVars: this.reservedVars,
      lx: this.analisarLx(code)
    }
  }


}
