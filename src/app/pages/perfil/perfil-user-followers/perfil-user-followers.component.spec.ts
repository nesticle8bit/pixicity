import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilUserFollowersComponent } from './perfil-user-followers.component';

describe('PerfilUserFollowersComponent', () => {
  let component: PerfilUserFollowersComponent;
  let fixture: ComponentFixture<PerfilUserFollowersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerfilUserFollowersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilUserFollowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
