import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageProtocoloComponent } from './page-protocolo.component';

describe('PageProtocoloComponent', () => {
  let component: PageProtocoloComponent;
  let fixture: ComponentFixture<PageProtocoloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageProtocoloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageProtocoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
