import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateUpdateCategoriasComponent } from './dialog-create-update-categorias.component';

describe('DialogCreateUpdateCategoriasComponent', () => {
  let component: DialogCreateUpdateCategoriasComponent;
  let fixture: ComponentFixture<DialogCreateUpdateCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateUpdateCategoriasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateUpdateCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
