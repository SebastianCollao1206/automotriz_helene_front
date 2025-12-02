import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoProductos } from './catalogo-productos';

describe('CatalogoProductos', () => {
  let component: CatalogoProductos;
  let fixture: ComponentFixture<CatalogoProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
