import { TestBed } from '@angular/core/testing';

import { TipoProducto } from './tipo-producto';

describe('TipoProducto', () => {
  let service: TipoProducto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoProducto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
