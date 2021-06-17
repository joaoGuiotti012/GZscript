import { Component, HostListener } from '@angular/core';
import { AnalisadorService } from './core/analisador.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.codigoFonte = localStorage.getItem('code');
  }

  limparEditor() {
    this.codigoFonte = '';
    localStorage.removeItem('code');
  }

  compilar() {
    localStorage.setItem('code', this.codigoFonte)
    this.saida = this.analisador.compilaGz(this.codigoFonte);
  }

}
