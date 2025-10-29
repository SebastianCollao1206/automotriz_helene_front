import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorTable } from './proveedor-table';

describe('ProveedorTable', () => {
  let component: ProveedorTable;
  let fixture: ComponentFixture<ProveedorTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
