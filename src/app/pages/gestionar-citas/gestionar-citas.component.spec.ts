import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarCitasComponent } from './gestionar-citas.component';

describe('GestionarCitasComponent', () => {
  let component: GestionarCitasComponent;
  let fixture: ComponentFixture<GestionarCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarCitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionarCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
