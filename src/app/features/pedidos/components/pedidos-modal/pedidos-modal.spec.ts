import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosModal } from './pedidos-modal';

describe('PedidosModal', () => {
  let component: PedidosModal;
  let fixture: ComponentFixture<PedidosModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
