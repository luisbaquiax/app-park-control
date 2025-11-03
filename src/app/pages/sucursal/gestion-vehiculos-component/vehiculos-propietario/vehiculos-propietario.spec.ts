import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculosPropietarioComponent } from './vehiculos-propietario';

describe('VehiculosPropietario', () => {
  let component: VehiculosPropietarioComponent;
  let fixture: ComponentFixture<VehiculosPropietarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculosPropietarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculosPropietarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
