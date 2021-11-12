import { Component, HostListener } from '@angular/core';
import { AnalisadorService } from './core/analisador.service';
import { Lexer, Group, Rule } from '@jlguenego/lexer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Compilador GZscript';

  isJsonExpanded = true;
  codigoFonte: string = '';
  saida: any;

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    // CTRL + ENTER 
    if (e.ctrlKey && e.keyCode === 13) {
      this.compilar();
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

  compilar() {
    localStorage.setItem('code', this.codigoFonte)
    this.saida = this.lexer(this.codigoFonte);
    return;
    this.saida = this.analisador.compilaGz(this.codigoFonte);
  }

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

    const tipos = Rule.createGroup(Group.IDENTIFIERS, [
      {
        name: 'string',
        pattern: /[$](St)/,
      },
      {
        name: 'boolean',
        pattern: /[$](Bo)/,
      },
      {
        name: 'float',
        pattern: /[$](Fl)/,
      },
      {
        name: 'Integer',
        pattern: /[$](In)/,
      },
    ]);

    const operators = Rule.createGroup(Group.OPERATORS, [
      {
        name: 'OL',
        pattern: /(BTEQ|LTEQ|EQ|===|NE|AND|OR|NOT)/,
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
        pattern: '=='
      },
      {
        name: 'eslse',
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
        pattern: '<<'
      },
      {
        name: 'fim-escopo',
        pattern: '>>'
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
    const rules = [
      blank,
      ...operators,
      ...keywords,
      ...tipos,
      ...separators,
      assigment,
      symbols,
      ...valores,
      word
    ];

    // Do the job.
    return new Lexer(rules).tokenize(code);
  }
}
