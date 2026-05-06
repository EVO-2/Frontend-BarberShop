import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuscripcionVencidaComponent } from './suscripcion-vencida.component';

describe('SuscripcionVencidaComponent', () => {
  let component: SuscripcionVencidaComponent;
  let fixture: ComponentFixture<SuscripcionVencidaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SuscripcionVencidaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SuscripcionVencidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
