import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanearUsuarioComponent } from './banear-usuario.component';

describe('BanearUsuarioComponent', () => {
  let component: BanearUsuarioComponent;
  let fixture: ComponentFixture<BanearUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanearUsuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanearUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
