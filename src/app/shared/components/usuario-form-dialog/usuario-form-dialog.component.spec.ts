import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioFormDialogComponent } from './usuario-form-dialog.component';

describe('UsuarioFormDialogComponent', () => {
  let component: UsuarioFormDialogComponent;
  let fixture: ComponentFixture<UsuarioFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsuarioFormDialogComponent]
    });
    fixture = TestBed.createComponent(UsuarioFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
