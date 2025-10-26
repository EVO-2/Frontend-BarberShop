import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioDialogComponent } from './servicio-dialog.component';

describe('ServicioDialogComponent', () => {
  let component: ServicioDialogComponent;
  let fixture: ComponentFixture<ServicioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
