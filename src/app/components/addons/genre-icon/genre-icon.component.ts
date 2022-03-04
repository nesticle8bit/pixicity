import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-genre-icon',
  templateUrl: './genre-icon.component.html',
  styleUrls: ['./genre-icon.component.scss']
})
export class GenreIconComponent implements OnInit {
  @Input() class: string = '';
  
  private _genre: any;

  @Input() set genre(value: any) {
    this._genre = value;
  }

  get genre(): any {
    return this._genre;
  }

  @Input() isFA: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }

}
