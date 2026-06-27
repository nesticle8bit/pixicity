import { Component } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-comunidades-index',
  templateUrl: './comunidades-index.component.html',
  styleUrls: ['./comunidades-index.component.scss'],
})
export class ComunidadesIndexComponent {
  constructor(private displayService: DisplayComponentService) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }
}
