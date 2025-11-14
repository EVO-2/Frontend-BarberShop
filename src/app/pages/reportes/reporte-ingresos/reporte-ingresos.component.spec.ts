import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteIngresosComponent } from './reporte-ingresos.component';

describe('ReporteIngresosComponent', () => {
  let component: ReporteIngresosComponent;
  let fixture: ComponentFixture<ReporteIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteIngresosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporteIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
