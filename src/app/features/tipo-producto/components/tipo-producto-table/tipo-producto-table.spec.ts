import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoProductoTable } from './tipo-producto-table';

describe('TipoProductoTable', () => {
  let component: TipoProductoTable;
  let fixture: ComponentFixture<TipoProductoTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoProductoTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoProductoTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
