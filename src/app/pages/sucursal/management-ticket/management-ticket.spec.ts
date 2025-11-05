import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementTicket } from './management-ticket';

describe('ManagementTicket', () => {
  let component: ManagementTicket;
  let fixture: ComponentFixture<ManagementTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementTicket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
