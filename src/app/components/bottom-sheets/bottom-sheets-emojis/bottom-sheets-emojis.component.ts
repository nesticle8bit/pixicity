import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottom-sheets-emojis',
  templateUrl: './bottom-sheets-emojis.component.html',
  styleUrls: ['./bottom-sheets-emojis.component.scss'],
})
export class BottomSheetsEmojisComponent implements OnInit {
  constructor(
    private ref: MatBottomSheetRef<BottomSheetsEmojisComponent>
  ) {}

  ngOnInit(): void {}

  addEmoji(emoji: any): void {
    this.ref.dismiss(emoji);
  }
}
