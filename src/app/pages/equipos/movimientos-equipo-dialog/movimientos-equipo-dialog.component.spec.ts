import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientosEquipoDialogComponent } from './movimientos-equipo-dialog.component';

describe('MovimientosEquipoDialogComponent', () => {
  let component: MovimientosEquipoDialogComponent;
  let fixture: ComponentFixture<MovimientosEquipoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimientosEquipoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MovimientosEquipoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
