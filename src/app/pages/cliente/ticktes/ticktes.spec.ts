import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ticktes } from './ticktes';

describe('Ticktes', () => {
  let component: Ticktes;
  let fixture: ComponentFixture<Ticktes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ticktes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ticktes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
