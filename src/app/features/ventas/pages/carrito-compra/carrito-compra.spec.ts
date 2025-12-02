import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarritoCompra } from './carrito-compra';

describe('CarritoCompra', () => {
  let component: CarritoCompra;
  let fixture: ComponentFixture<CarritoCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoCompra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarritoCompra);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
