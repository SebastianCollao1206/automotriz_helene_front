import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcasTable } from './marcas-table';

describe('MarcasTable', () => {
  let component: MarcasTable;
  let fixture: ComponentFixture<MarcasTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcasTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcasTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
