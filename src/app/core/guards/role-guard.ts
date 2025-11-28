import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPermission = route.data['permission'];

  if (!requiredPermission) {
    return true;
  }

  let tienePermiso = false;

  switch (requiredPermission) {
    case 'gestionarUsuarios':
      tienePermiso = authService.puedeGestionarUsuarios();
      break;
    case 'gestionarProductos':
      tienePermiso = authService.puedeGestionarProductos();
      break;
    case 'gestionarCategorias':
      tienePermiso = authService.puedeGestionarCategorias();
      break;
    case 'gestionarProveedores':
      tienePermiso = authService.puedeGestionarProveedores();
      break;
    case 'verAsistencia':
      tienePermiso = authService.puedeVerAsistencia();
      break;
    // Permisos de pedidos
    case 'verPedidos':
      tienePermiso = authService.puedeVerPedidos();
      break;
    case 'gestionarPedidos':
      tienePermiso = authService.puedeGestionarPedidos();
      break;
    case 'recibirPedidos':
      tienePermiso = authService.puedeRecibirPedidos();
      break;
    case 'modificarDetallesPedido':
      tienePermiso = authService.puedeModificarDetallesPedido();
      break;
    //PARA PREDICCIONES
    case 'verPredicciones':
      tienePermiso = authService.puedeVerPredicciones();
      break;  
    //DEFECTO
    default:
      tienePermiso = true;
  }

  if (!tienePermiso) {
    router.navigate(['/productos']);
    return false;
  }

  return true;
};