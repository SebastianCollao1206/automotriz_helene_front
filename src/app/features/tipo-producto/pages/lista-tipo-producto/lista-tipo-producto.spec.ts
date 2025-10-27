import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTipoProducto } from './lista-tipo-producto';

describe('ListaTipoProducto', () => {
  let component: ListaTipoProducto;
  let fixture: ComponentFixture<ListaTipoProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTipoProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaTipoProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
