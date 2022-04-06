import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-re-captcha',
  templateUrl: './re-captcha.component.html',
  styleUrls: ['./re-captcha.component.scss']
})
export class ReCaptchaComponent implements OnInit {
  @Output() response = new EventEmitter<string>();

  public siteKey = environment.captchaKey;

  constructor() { }

  ngOnInit(): void {
  }

  resolved(captchaResponse: string) {
    this.response.emit(captchaResponse);
  }
}
