import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRangosChangesReportComponent } from './dialog-rangos-changes-report.component';

describe('DialogRangosChangesReportComponent', () => {
  let component: DialogRangosChangesReportComponent;
  let fixture: ComponentFixture<DialogRangosChangesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogRangosChangesReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRangosChangesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
