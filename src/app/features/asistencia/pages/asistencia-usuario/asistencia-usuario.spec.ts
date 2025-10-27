import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaUsuario } from './asistencia-usuario';

describe('AsistenciaUsuario', () => {
  let component: AsistenciaUsuario;
  let fixture: ComponentFixture<AsistenciaUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
