import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-en-vivo',
  templateUrl: './en-vivo.component.html',
  styleUrls: ['./en-vivo.component.scss'],
})
export class EnVivoComponent implements OnInit {
  public acciones: any[] = [];
  private startTime: Date = new Date();
  public time: any;
  public play: boolean = true;

  constructor(private displayService: DisplayComponentService) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
    });
  }

  ngOnInit(): void {
    this.displayTime();
  }

  displayTime(): void {
    // later record end time
    let endTime = new Date();

    // time difference in ms
    var timeDiff = +endTime - +this.startTime;

    // strip the miliseconds
    timeDiff /= 1000;

    // get seconds
    var seconds = Math.round(timeDiff % 60);

    // remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get minutes
    var minutes = Math.round(timeDiff % 60);

    // remove minutes from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get hours
    var hours = Math.round(timeDiff % 24);

    // remove hours from the date
    timeDiff = Math.floor(timeDiff / 24);

    // the rest of timeDiff is number of days
    var days = timeDiff;

    this.time = `${this.displayZero(hours)}:${this.displayZero(minutes)}:${this.displayZero(seconds)}`;

    setTimeout(() => {
      this.displayTime();
    }, 1000);
  }

  displayZero(number: number): string {
    if (number.toString().length === 1) {
      return `0${number}`;
    } else {
      return number.toString();
    }
  }
}
