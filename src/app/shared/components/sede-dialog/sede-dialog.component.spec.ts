import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SedeDialogComponent } from './sede-dialog.component';

describe('SedeDialogComponent', () => {
  let component: SedeDialogComponent;
  let fixture: ComponentFixture<SedeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SedeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SedeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
