import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';

interface AccionEnVivo {
  usuario: string;
  avatar: string;
  usuarioUrl: string;
  accion: string;
  titulo: string;
  tituloUrl: string;
  tipo: string;
  fecha: string | Date;
}

@Component({
  standalone: false,
  selector: 'app-en-vivo',
  templateUrl: './en-vivo.component.html',
  styleUrls: ['./en-vivo.component.scss'],
})
export class EnVivoComponent implements OnInit, OnDestroy {
  public acciones: AccionEnVivo[] = [];
  public totalAcciones: number = 0;
  public velocidad: string = '0,00';
  public play: boolean = true;
  public time: any;

  private readonly MAX_FILAS = 60;
  private startTime: Date = new Date();
  private timer: any;
  private actividadSub?: Subscription;
  private timestamps: number[] = [];

  constructor(
    private displayService: DisplayComponentService,
    private signalrService: SignalrService
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.displayTime();

    this.actividadSub = this.signalrService.actividad$.subscribe((accion: AccionEnVivo) =>
      this.onAccion(accion)
    );

    this.signalrService.startEnVivo();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.actividadSub?.unsubscribe();
    this.signalrService.stopEnVivo();
  }

  private onAccion(accion: AccionEnVivo): void {
    this.totalAcciones++;
    this.timestamps.push(Date.now());

    // En pausa seguimos contando estadísticas pero no movemos la tabla.
    if (!this.play) {
      return;
    }

    this.acciones.unshift(accion);

    if (this.acciones.length > this.MAX_FILAS) {
      this.acciones.length = this.MAX_FILAS;
    }
  }

  displayTime(): void {
    let timeDiff = (+new Date() - +this.startTime) / 1000;

    const seconds = Math.round(timeDiff % 60);
    timeDiff = Math.floor(timeDiff / 60);
    const minutes = Math.round(timeDiff % 60);
    timeDiff = Math.floor(timeDiff / 60);
    const hours = Math.round(timeDiff % 24);

    this.time = `${this.displayZero(hours)}:${this.displayZero(minutes)}:${this.displayZero(seconds)}`;

    // Velocidad: acciones en los últimos 5 segundos, promediadas por segundo.
    const ahora = Date.now();
    this.timestamps = this.timestamps.filter((t) => ahora - t <= 5000);
    this.velocidad = (this.timestamps.length / 5).toFixed(2).replace('.', ',');

    this.timer = setTimeout(() => this.displayTime(), 1000);
  }

  displayZero(number: number): string {
    return number.toString().length === 1 ? `0${number}` : number.toString();
  }
}
