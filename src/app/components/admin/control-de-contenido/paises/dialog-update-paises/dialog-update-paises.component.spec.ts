import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdatePaisesComponent } from './dialog-update-paises.component';

describe('DialogUpdatePaisesComponent', () => {
  let component: DialogUpdatePaisesComponent;
  let fixture: ComponentFixture<DialogUpdatePaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogUpdatePaisesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUpdatePaisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
