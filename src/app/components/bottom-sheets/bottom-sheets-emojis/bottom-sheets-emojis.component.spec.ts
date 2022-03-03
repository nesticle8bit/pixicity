import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetsEmojisComponent } from './bottom-sheets-emojis.component';

describe('BottomSheetsEmojisComponent', () => {
  let component: BottomSheetsEmojisComponent;
  let fixture: ComponentFixture<BottomSheetsEmojisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSheetsEmojisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomSheetsEmojisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
