import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesSidebarComponent } from './mensajes-sidebar.component';

describe('MensajesSidebarComponent', () => {
  let component: MensajesSidebarComponent;
  let fixture: ComponentFixture<MensajesSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MensajesSidebarComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(MensajesSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
