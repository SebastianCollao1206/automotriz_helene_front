import { TestBed } from '@angular/core/testing';

import { NotificacionSweet } from './notificacion-sweet';

describe('NotificacionSweet', () => {
  let service: NotificacionSweet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionSweet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
