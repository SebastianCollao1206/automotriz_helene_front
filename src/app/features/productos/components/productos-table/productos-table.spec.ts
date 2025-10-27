import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosTable } from './productos-table';

describe('ProductosTable', () => {
  let component: ProductosTable;
  let fixture: ComponentFixture<ProductosTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
