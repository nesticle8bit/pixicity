import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateUpdateNoticiasComponent } from './dialog-create-update-noticias.component';

describe('DialogCreateUpdateNoticiasComponent', () => {
  let component: DialogCreateUpdateNoticiasComponent;
  let fixture: ComponentFixture<DialogCreateUpdateNoticiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateUpdateNoticiasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateUpdateNoticiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
