import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoIsIpComponent } from './who-is-ip.component';

describe('WhoIsIpComponent', () => {
  let component: WhoIsIpComponent;
  let fixture: ComponentFixture<WhoIsIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhoIsIpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhoIsIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
