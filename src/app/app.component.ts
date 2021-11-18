import { Component, HostListener } from '@angular/core';
import { AnalisadorService } from './core/analisador.service';
import { Lexer, Group, Rule, Token, TokenSequence } from '@jlguenego/lexer';

interface Variavel {
  type: string;
  name: unknown | string;
  valor: any;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Compilador GZscript';
  isJsonExpanded = true;
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
        name: 'read-variable',
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
      symbols,
      ...valores,
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
    const _tokensByLine: TokenSequence[] = this.separaArrysTokensByLine(this.tokenSequence);

    for (let line = 0; line < _tokensByLine.length; line++) {
      let _currentLineTokens: TokenSequence = _tokensByLine[line];

      _currentLineTokens.forEach((_token: Token, indexToken: number) => {
        let lastValIndex = variaveis.length - 1;
        switch (_token.group) {
          case Group.IDENTIFIERS:

            break;

          case Group.LITTERALS:

            if (variaveis.find(v => v.valor === '#') && _currentLineTokens[indexToken - 1].attribute === '=') {

              if (_currentLineTokens[indexToken + 1]?.name === 'OA' && _currentLineTokens[indexToken + 2].group === Group.LITTERALS) {
                variaveis[lastValIndex].valor = this.castTo(_token) + this.castTo(_currentLineTokens[indexToken + 2]);
                return;
              }
              let lastVal = variaveis[lastValIndex];
              if (typeof (this.castTo(_token)) !== lastVal.type)
                throw (`ERROR: variavel "${lastVal.name}" não pertence ao tipo ${typeof (this.castTo(_token))}, POSITION: ${JSON.stringify(_token.position)} `);

              variaveis[lastValIndex].valor = this.castTo(_token);
            }
            break;

          case Group.KEYWORDS:

            if (_token.name === 'variable' && _currentLineTokens[indexToken + 1].attribute === '=') {

              if (variaveis.find(v => v.name === _token.attribute))
                throw ('ERROR: Duplicidade de variaveis, POSITION: ' + JSON.stringify(_token.position));

              variaveis.push({ type: _currentLineTokens[indexToken - 1].name, name: _token.attribute, valor: '#' })
            }
            if (_token.name === 'read-output' && (aceitaIF || aceitaELSE)) {
              alert(variaveis.find(v => v.name === _currentLineTokens[indexToken + 2].attribute)?.valor || _currentLineTokens[indexToken + 2].attribute);
              return
            }
            // if (_token.name === 'read-output' && aceitaELSE)
            //   alert(variaveis.find(v => v.name === _currentLineTokens[indexToken + 2].attribute)?.valor || _currentLineTokens[indexToken + 2].attribute);

            break;

          case Group.OPERATORS:

            if (_currentLineTokens[indexToken - 2].name === "inicio-condicao") {

              if (_token.name === 'OA') {
                console.log('OA ==> ', _token);

                return;
              }

              if (['EQ', 'NE', 'AND', 'OR', 'BTEQ', 'LTEQ'].includes(_token.name)) {
                let a = _currentLineTokens[indexToken - 1].group === Group.LITTERALS
                  ? this.castTo(_currentLineTokens[indexToken - 1])
                  : variaveis.find(v => v.name === _currentLineTokens[indexToken - 1].attribute)?.valor;

                let b = _currentLineTokens[indexToken + 1].group === Group.LITTERALS
                  ? this.castTo(_currentLineTokens[indexToken + 1])
                  : variaveis.find(v => v.name === _currentLineTokens[indexToken + 1].attribute)?.valor;

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

            if (_token.name === 'else' && !aceitaIF) {
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
    if (['$In', '$Fl'].includes(_token.name))
      result = Number(_token.attribute);

    if (_token.name === '$Bo')
      result = Boolean(_token.attribute);
    return result;
  }

  /**
   * @method separaArrysTokensByLine
   * @return TokenSequence[]
   */
  private separaArrysTokensByLine(tokens: TokenSequence): TokenSequence[] {
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
