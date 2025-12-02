import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasTable } from './ventas-table';

describe('VentasTable', () => {
  let component: VentasTable;
  let fixture: ComponentFixture<VentasTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
