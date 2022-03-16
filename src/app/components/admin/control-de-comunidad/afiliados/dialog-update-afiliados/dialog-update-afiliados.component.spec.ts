import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdateAfiliadosComponent } from './dialog-update-afiliados.component';

describe('DialogUpdateAfiliadosComponent', () => {
  let component: DialogUpdateAfiliadosComponent;
  let fixture: ComponentFixture<DialogUpdateAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogUpdateAfiliadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUpdateAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
