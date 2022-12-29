import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableVotosComponent } from './table-votos.component';

describe('TableVotosComponent', () => {
  let component: TableVotosComponent;
  let fixture: ComponentFixture<TableVotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableVotosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableVotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
