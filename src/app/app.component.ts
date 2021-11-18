import { Component, HostListener } from '@angular/core';
import { AnalisadorService } from './core/analisador.service';
import { Lexer, Group, Rule, Token, TokenSequence } from '@jlguenego/lexer';

interface Variavel {
  type: string;
  name: unknown | string;
  value: any;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Compilador GZscript';
  isJsonExpanded = false;
  codigoFonte: string = '';
  tokenSequence: TokenSequence;
  logErros: any = [];
  variaveis: Variavel[] = [];

  private rules: Rule[] = [];

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    // CTRL + ENTER 
    if (e.ctrlKey && e.keyCode === 13) {
      this.reconhecerTokens();
    }
  }

  expandir() {
    this.isJsonExpanded = !this.isJsonExpanded;
  }

  constructor(private analisador: AnalisadorService) { }

  ngOnInit(): void {
    this.codigoFonte = localStorage.getItem('code');
  }

  limparEditor() {
    this.codigoFonte = '';
    localStorage.removeItem('code');
  }

  /**
   * @method reconhecerTokens
   * Metodo responsavel por reconhecer a sequencia de 
   * token e compilar
   */
  reconhecerTokens() {
    this.logErros = [];
    localStorage.setItem('code', this.codigoFonte)
    try {
      this.tokenSequence = this.lexer(this.codigoFonte);
      this.compilar();
    } catch (e) {
      this.logErros.push(e);
      alert(e);
    }
  }

  /**
   * @method lexer
   * Metodo por organizar as regras da linguagem
   * e retornar a sequencia de token
   */
  lexer(code: string): any {
    // declare all the language rules.

    const blank = new Rule({
      name: 'blank',
      pattern: /\s+/,
      ignore: true,
    });

    const valores = Rule.createGroup(Group.LITTERALS, [
      {
        name: '$St',
        pattern: new RegExp(/^(["])(?:(?=(\\?))\2.)*?\1$/),
      },
      {
        name: '$In',
        pattern: new RegExp(/^[0-9][0-9]*$/),
      },
      {
        name: '$Fl',
        pattern: new RegExp(/^[0-9][0-9]*[.][0-9][0-9]*$/),
      },
      {
        name: '$Bo',
        pattern: new RegExp(/^((true)|(false))$/),
      },
    ]);

    const word = new Rule({
      name: 'unknow',
      pattern: /\w+/,
      group: Group.NONE
    });

    const identifiers = Rule.createGroup(Group.IDENTIFIERS, [
      {
        name: 'string',
        pattern: /^[$](St)$/,
      },
      {
        name: 'boolean',
        pattern: /^[$](Bo)$/,
      },
      {
        name: 'number',
        pattern: /^[$](Fl)$/,
      },
      {
        name: 'number',
        pattern: /^[$](In)$/,
      },
    ]);

    const operators = Rule.createGroup(Group.OPERATORS, [
      {
        name: 'BT',
        pattern: /^(BT)$/
      },
      {
        name: 'LT',
        pattern: /^(LT)$/
      },
      {
        name: 'BTEQ',
        pattern: /^(BTEQ)$/
      },
      {
        name: 'LTEQ',
        pattern: /^(LTEQ)$/
      },
      {
        name: 'EQ',
        pattern: /^(EQ)$/
      },
      {
        name: '===',
        pattern: /^(===)$/
      },
      {
        name: 'NE',
        pattern: /^(NE)$/
      },
      {
        name: 'AND',
        pattern: /^(AND)$/
      },
      {
        name: 'OR',
        pattern: /^(OR)$/
      },
      {
        name: 'NOT',
        pattern: /^(NOT)$/
      },
      {
        name: 'OA',
        pattern: /([+]|[-]|[*]|[/]|[%])/,
      },
    ]);

    const separators = Rule.createGroup(Group.SEPARATORS, [
      {
        name: 'break-line',
        pattern: ';',
      },
      {
        name: 'if',
        pattern: /^==/
      },
      {
        name: 'else',
        pattern: /[!]/
      },
      {
        name: 'inicio-condicao',
        pattern: /[(]/
      },
      {
        name: 'fim-condicao',
        pattern: /[)]/
      },
      {
        name: 'inicio-escopo',
        pattern: /^<<$/
      },
      {
        name: 'fim-escopo',
        pattern: /^>>$/
      },
      {
        name: 'inicio-read',
        pattern: '<'
      },
      {
        name: 'fim-read',
        pattern: '>'
      },
    ]);

    const keywords = Rule.createGroup(Group.KEYWORDS, [
      {
        name: 'variable',
        pattern: /^v_[[a-zA-Z_$][a-zA-Z_$0-9]*$/,
      },
      {
        name: 'read-var',
        pattern: 'readVar'
      },
      {
        name: 'read-output',
        pattern: 'readOut'
      },
    ]);

    const assigment = new Rule({
      name: 'assigment',
      pattern: '=',
    });

    const symbols = new Rule({
      name: 'interpolacao',
      pattern: /^(["])(?:(?=(\\?))\2.)*?\1$/,
    });

    // the order is important. Token are applied from first to last.
    this.rules = [
      blank,
      ...operators,
      ...keywords,
      ...identifiers,
      ...separators,
      assigment,
      ...valores,
      symbols,
      word
    ];

    // Do the job.
    return new Lexer(this.rules).tokenize(code);
  }

  /**
   * @method compilar
   * Metodo que realiza as validações(Aceita e Rejeita)
   */
  compilar() {
    let aceitaIF: boolean = false;
    let aceitaELSE: boolean = false;
    let variaveis: Variavel[] = [];
    let leituras: { position?: any, value: any }[] = [];
    const _tokensByLine: TokenSequence[] = this.separaArraysTokensByLine(this.tokenSequence);

    for (let line = 0; line < _tokensByLine.length; line++) {
      let _currentLineTokens: TokenSequence = _tokensByLine[line];

      _currentLineTokens.forEach((_token: Token, indexToken: number) => {
        let lastValIndex = variaveis.length - 1;
        switch (_token.group) {
          case Group.IDENTIFIERS:

            break;

          case Group.LITTERALS:

            if (variaveis.length === 0 || (variaveis.find(v => v.value === '#') && _currentLineTokens[indexToken - 1].attribute === '=')) {

              if (_currentLineTokens[indexToken + 1]?.name === 'OA' && _currentLineTokens[indexToken + 2].group === Group.LITTERALS) {
                variaveis[lastValIndex].value = this.castTo(_token) + this.castTo(_currentLineTokens[indexToken + 2]);
                return;
              }
              let lastVal = variaveis[lastValIndex];
              if (typeof (this.castTo(_token)) !== lastVal.type)
                throw (`ERROR: variavel "${lastVal.name}" não pertence ao tipo ${typeof (this.castTo(_token))}, POSITION: ${JSON.stringify(_token.position)} `);

              variaveis[lastValIndex].value = this.castTo(_token);
            }
            break;

          case Group.KEYWORDS:

            if (_token.name === 'variable' && _currentLineTokens[indexToken + 1].attribute === '=') {

              if (variaveis.find(v => v.name === _token.attribute))
                throw ('ERROR: Duplicidade de variaveis, POSITION: ' + JSON.stringify(_token.position));

              variaveis.push({ type: _currentLineTokens[indexToken - 1].name, name: _token.attribute, value: '#' })
            }

            if (_token.name === 'read-output' && (aceitaIF || aceitaELSE)) {
              let readOutData = null;

              if (!!_currentLineTokens.find(t => t.name === 'read-var')) {
                _currentLineTokens.forEach((t, i) => {
                  if (t.name === 'read-var') {
                    readOutData = prompt(String(_currentLineTokens[i + 2].attribute));
                    leituras.push({ position: _token.position, value: readOutData });
                    return;
                  }
                });
              } else {
                readOutData = variaveis.find(v => v.name === _currentLineTokens[indexToken + 2].attribute)?.value
                  || _currentLineTokens[indexToken + 2].attribute;
              }

              if ([null, undefined].includes(readOutData))
                throw (`ERROR: a função readOut não permite a impressão do que foi informado, ERRO: ${JSON.stringify(_token.position)}`);

              // if (leituras.find(l => l.value === String(_currentLineTokens[indexToken + 2]?.attribute)))
              // return;
              alert(readOutData);
              return
            }

            if (_token.name === 'read-var' && (aceitaIF || aceitaELSE) && !leituras.find(l => l.position.line == _token.position.line)) {
              let l = prompt(String(_currentLineTokens[indexToken + 2].attribute));
              leituras.push({ position: _token.position, value: l });
            }

            break;

          case Group.OPERATORS:

            // trata operações com condições
            // EX : == ( 10 EQ 10 )
            if (_currentLineTokens[indexToken - 2].name === "inicio-condicao") {

              if (_token.name === 'OA') {
                console.log('OA ==> ', _token);

                return;
              }

              if (['EQ', 'NE', 'AND', 'OR', 'BTEQ', 'LTEQ'].includes(_token.name)) {
                let a = _currentLineTokens[indexToken - 1].group === Group.LITTERALS
                  ? this.castTo(_currentLineTokens[indexToken - 1])
                  : variaveis.find(v => v.name === _currentLineTokens[indexToken - 1].attribute)?.value;

                let b = _currentLineTokens[indexToken + 1].group === Group.LITTERALS
                  ? this.castTo(_currentLineTokens[indexToken + 1])
                  : variaveis.find(v => v.name === _currentLineTokens[indexToken + 1].attribute)?.value;

                if ([a, b].includes(undefined))
                  throw (`ERROR: Variavel inexistente ou valores inconsistentes, POSITION: ${JSON.stringify(_token.position)} `);

                if (_token.name === 'EQ')
                  aceitaIF = a == b;
                else if (_token.name === 'NE')
                  aceitaIF = a != b;
                else if (_token.name === 'AND')
                  aceitaIF = a && b;
                else if (_token.name === 'OR')
                  aceitaIF = a || b;
                else if (_token.name === 'BTEQ')
                  aceitaIF = a >= b;
                else if (_token.name === 'BT')
                  aceitaIF = a > b;
                else if (_token.name === 'LTEQ')
                  aceitaIF = a <= b;
                else if (_token.name === 'LT')
                  aceitaIF = a < b;
              }

            }
            break;

          case Group.SEPARATORS:

            if (_token.name === 'inicio-condicao' && !_currentLineTokens.find(token => token.name === 'fim-condicao'))
              throw (`ERROR: Faltou o fecha da condição ")", POSITION: ${JSON.stringify(_token.position)} `)

            if (_token.name === 'else' && (!aceitaIF || _currentLineTokens[indexToken + 1]?.name === 'inicio-escopo')) {
              aceitaIF = false;
              aceitaELSE = true;
              return
            }

            if (_token.name === 'else' && aceitaIF) {
              aceitaIF = false;
              aceitaELSE = false;
              return;
            }

            if (_token.name === "fim-escopo" && (_currentLineTokens[indexToken + 1]?.name === "break-line" || _currentLineTokens[indexToken + 1] === undefined)) {
              aceitaIF = false;
              aceitaELSE = false;
              return;
            }
            break;

          default:
            if (_token.name === 'unknow')
              throw (`ERROR: Error syntaxe unknow, POSITION: ${JSON.stringify(_token.position)}`)
            break;
        }
      });
    }
    this.variaveis = variaveis;
  }

  /**
   * @method castTo
   * @param _token 
   * @returns 
   */
  castTo(_token: Token) {
    let result = null;
    if (_token.name === '$St')
      result = String(_token.attribute)
    if (['$In', '$Fl'].includes(_token.name))
      result = Number(_token.attribute);

    if (_token.name === '$Bo')
      result = Boolean(_token.attribute);
    return result;
  }

  /**
   * @method separaArraysTokensByLine
   * @return TokenSequence[]
   */
  private separaArraysTokensByLine(tokens: TokenSequence): TokenSequence[] {
    let arrayByLine: TokenSequence[] = [];
    let _currentLineTokens: TokenSequence = []
    if (tokens.slice(-1)[0].name != 'break-line')
      throw (`ERROR: faltou fechar com ';'. POSITION ${JSON.stringify(tokens.slice(-1)[0].position)}`)

    tokens.forEach((_token: Token) => {
      if (_token.name === 'break-line' || _token.name === "inicio-escopo") {
        arrayByLine.push(_currentLineTokens);
        console.log(_currentLineTokens);
        _currentLineTokens = [];
        return
      }
      _currentLineTokens.push(_token);
    });
    return arrayByLine;
  }

}
