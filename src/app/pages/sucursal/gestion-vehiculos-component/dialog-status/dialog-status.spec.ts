import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogStatus } from './dialog-status';

describe('DialogStatus', () => {
  let component: DialogStatus;
  let fixture: ComponentFixture<DialogStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
