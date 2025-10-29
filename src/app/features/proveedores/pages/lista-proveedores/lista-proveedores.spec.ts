import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProveedores } from './lista-proveedores';

describe('ListaProveedores', () => {
  let component: ListaProveedores;
  let fixture: ComponentFixture<ListaProveedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaProveedores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaProveedores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
