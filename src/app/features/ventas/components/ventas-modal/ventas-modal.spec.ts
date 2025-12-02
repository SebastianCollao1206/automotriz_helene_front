import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasModal } from './ventas-modal';

describe('VentasModal', () => {
  let component: VentasModal;
  let fixture: ComponentFixture<VentasModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
