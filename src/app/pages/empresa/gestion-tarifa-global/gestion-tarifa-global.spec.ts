import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTarifaGlobal } from './gestion-tarifa-global';

describe('GestionTarifaGlobal', () => {
  let component: GestionTarifaGlobal;
  let fixture: ComponentFixture<GestionTarifaGlobal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTarifaGlobal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionTarifaGlobal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
