import { TestBed } from '@angular/core/testing';

import { DetallePedido } from './detalle-pedido';

describe('DetallePedido', () => {
  let service: DetallePedido;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallePedido);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
