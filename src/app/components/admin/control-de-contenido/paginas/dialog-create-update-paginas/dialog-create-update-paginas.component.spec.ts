import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateUpdatePaginasComponent } from './dialog-create-update-paginas.component';

describe('DialogCreateUpdatePaginasComponent', () => {
  let component: DialogCreateUpdatePaginasComponent;
  let fixture: ComponentFixture<DialogCreateUpdatePaginasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateUpdatePaginasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateUpdatePaginasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
