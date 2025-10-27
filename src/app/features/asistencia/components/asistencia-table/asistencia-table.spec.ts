import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaTable } from './asistencia-table';

describe('AsistenciaTable', () => {
  let component: AsistenciaTable;
  let fixture: ComponentFixture<AsistenciaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
