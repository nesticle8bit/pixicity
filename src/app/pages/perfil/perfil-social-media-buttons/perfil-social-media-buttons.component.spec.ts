import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilSocialMediaButtonsComponent } from './perfil-social-media-buttons.component';

describe('PerfilSocialMediaButtonsComponent', () => {
  let component: PerfilSocialMediaButtonsComponent;
  let fixture: ComponentFixture<PerfilSocialMediaButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerfilSocialMediaButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilSocialMediaButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
