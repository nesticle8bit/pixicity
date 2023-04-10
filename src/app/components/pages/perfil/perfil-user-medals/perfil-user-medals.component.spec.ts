import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilUserMedalsComponent } from './perfil-user-medals.component';

describe('PerfilUserMedalsComponent', () => {
  let component: PerfilUserMedalsComponent;
  let fixture: ComponentFixture<PerfilUserMedalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerfilUserMedalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilUserMedalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
