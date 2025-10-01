import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioCardDialogComponent } from './servicio-card-dialog.component';

describe('ServicioCardDialogComponent', () => {
  let component: ServicioCardDialogComponent;
  let fixture: ComponentFixture<ServicioCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioCardDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicioCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
