import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogVerUsuariosComponent } from './dialog-ver-usuarios.component';

describe('DialogVerUsuariosComponent', () => {
  let component: DialogVerUsuariosComponent;
  let fixture: ComponentFixture<DialogVerUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogVerUsuariosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogVerUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
