import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberoDashboardComponent } from './barbero-dashboard.component';

describe('BarberoDashboardComponent', () => {
  let component: BarberoDashboardComponent;
  let fixture: ComponentFixture<BarberoDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BarberoDashboardComponent]
    });
    fixture = TestBed.createComponent(BarberoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
