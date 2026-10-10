import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';

@Component({
    selector: 'app-who-is-ip',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './who-is-ip.component.html',
    styleUrls: ['./who-is-ip.component.scss']
})
export class WhoIsIpComponent implements OnInit {
  readonly IP = input<string | null | undefined>(undefined);
  
  constructor() { }

  ngOnInit(): void {
  }

}
