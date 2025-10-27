import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaDiaria } from './asistencia-diaria';

describe('AsistenciaDiaria', () => {
  let component: AsistenciaDiaria;
  let fixture: ComponentFixture<AsistenciaDiaria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaDiaria]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaDiaria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
