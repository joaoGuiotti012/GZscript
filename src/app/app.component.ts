import { Component, HostListener } from '@angular/core';
import { AnalisadorService } from './core/analisador.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'compiladorTS';

  codigoFonte: string = '';
  saida: any;

  @HostListener('keydown', ['$event'])
  onKeyDown(e) {
    // CTRL + ENTER 
    if (e.ctrlKey && e.keyCode === 13) {
      this.compilar();
    }
  }

  constructor(private analisador: AnalisadorService) {
  }

  compilar() {
    this.saida = this.analisador.compilaGz(this.codigoFonte);
  }

}
