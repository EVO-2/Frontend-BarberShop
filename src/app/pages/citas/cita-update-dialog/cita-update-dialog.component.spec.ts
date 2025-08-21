import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaUpdateDialogComponent } from './cita-update-dialog.component';

describe('CitaUpdateDialogComponent', () => {
  let component: CitaUpdateDialogComponent;
  let fixture: ComponentFixture<CitaUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaUpdateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitaUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
