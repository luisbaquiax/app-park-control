import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEmpresasComponent } from './gestion-empresas-component';

describe('GestionEmpresasComponent', () => {
  let component: GestionEmpresasComponent;
  let fixture: ComponentFixture<GestionEmpresasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEmpresasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEmpresasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
