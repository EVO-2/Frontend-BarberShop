import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarCitaComponent } from './reservar-cita.component';

describe('ReservarCitaComponent', () => {
  let component: ReservarCitaComponent;
  let fixture: ComponentFixture<ReservarCitaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReservarCitaComponent]
    });
    fixture = TestBed.createComponent(ReservarCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
