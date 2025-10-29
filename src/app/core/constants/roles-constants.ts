export const ROLE_NAMES: Record<string, string> = {
  'ROLE_ADMIN': 'Administrador',
  'ROLE_MANAGER': 'Gerente',
  'ROLE_SUPERVISOR': 'Supervisor',
  'ROLE_SELLER': 'Vendedor',
  'ROLE_EMPLOYEE': 'Empleado'
};

export const ROLE_BADGE_CLASSES: Record<string, string> = {
  'ROLE_ADMIN': 'badge-administrativo',
  'ROLE_MANAGER': 'badge-gerente',
  'ROLE_SUPERVISOR': 'badge-supervisor',
  'ROLE_SELLER': 'badge-vendedor',
  'ROLE_EMPLOYEE': 'badge-empleado'
};

export const ROLE_HIERARCHY: Record<string, number> = {
  'ROLE_MANAGER': 5,
  'ROLE_ADMIN': 4,
  'ROLE_SELLER': 3,
  'ROLE_SUPERVISOR': 2,
  'ROLE_EMPLOYEE': 1
};

export function obtenerRolMayorJerarquia(roles: string[]): string {
  if (!roles || roles.length === 0) return 'Usuario';

  let rolMayor = roles[0];
  let jerarquiaMayor = ROLE_HIERARCHY[rolMayor] || 0;

  for (const rol of roles) {
    const jerarquia = ROLE_HIERARCHY[rol] || 0;
    if (jerarquia > jerarquiaMayor) {
      jerarquiaMayor = jerarquia;
      rolMayor = rol;
    }
  }

  return ROLE_NAMES[rolMayor] || rolMayor;
}