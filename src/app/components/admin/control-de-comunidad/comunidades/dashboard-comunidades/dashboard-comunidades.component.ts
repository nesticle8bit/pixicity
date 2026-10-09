import { Component } from '@angular/core';
import { TableComunidadesCategoriasComponent } from '../table-comunidades-categorias/table-comunidades-categorias.component';

@Component({
    selector: 'app-dashboard-comunidades',
    templateUrl: './dashboard-comunidades.component.html',
    styleUrls: ['./dashboard-comunidades.component.scss'],
    imports: [TableComunidadesCategoriasComponent],
})
export class DashboardComunidadesComponent {}
