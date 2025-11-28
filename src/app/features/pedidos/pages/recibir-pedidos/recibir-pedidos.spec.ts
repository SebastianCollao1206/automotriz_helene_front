import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibirPedidos } from './recibir-pedidos';

describe('RecibirPedidos', () => {
  let component: RecibirPedidos;
  let fixture: ComponentFixture<RecibirPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecibirPedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecibirPedidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
