import { Routes } from '@angular/router';
import { MarcarAsistencia } from './features/asistencia/pages/marcar-asistencia/marcar-asistencia';
import { GestionUsuarios } from './features/users/pages/gestion-usuarios/gestion-usuarios';
import { MainLayout } from './layouts/main-layout/main-layout';
import { ListaUsuarios } from './features/users/pages/lista-usuarios/lista-usuarios';
import { Login } from './features/auth/login/login';
import { AsistenciaDiaria } from './features/asistencia/pages/asistencia-diaria/asistencia-diaria';
import { AsistenciaUsuario } from './features/asistencia/pages/asistencia-usuario/asistencia-usuario';
import { ListaCategorias } from './features/categorias/pages/lista-categorias/lista-categorias';
import { ListaMarcas } from './features/marcas/pages/lista-marcas/lista-marcas';
import { ListaTipoProducto } from './features/tipo-producto/pages/lista-tipo-producto/lista-tipo-producto';
import { ListaUnidadesMedida } from './features/unidades-medida/pages/lista-unidades-medida/lista-unidades-medida';
import { ListaProductos } from './features/productos/pages/lista-productos/lista-productos';
import { GestionProductos } from './features/productos/pages/gestion-productos/gestion-productos';
import { GestionProveedores } from './features/proveedores/pages/gestion-proveedores/gestion-proveedores';
import { ListaProveedores } from './features/proveedores/pages/lista-proveedores/lista-proveedores';
import { NoAuthGuard } from './core/guards/no-auth-guard';
import { AuthGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Bienvenida } from './shared/components/bienvenida/bienvenida';
import { ListaPredicciones } from './features/predicciones/pages/lista-predicciones/lista-predicciones';
import { DetallePrediccion } from './features/predicciones/pages/detalle-prediccion/detalle-prediccion';
import { ListaPedidos } from './features/pedidos/pages/lista-pedidos/lista-pedidos';
import { GestionPedidos } from './features/pedidos/pages/gestion-pedidos/gestion-pedidos';
import { RecibirPedidos } from './features/pedidos/pages/recibir-pedidos/recibir-pedidos';
import { CatalogoProductos } from './features/ventas/pages/catalogo-productos/catalogo-productos';
import { DetalleProducto } from './features/ventas/pages/detalle-producto/detalle-producto';
import { CarritoCompra } from './features/ventas/pages/carrito-compra/carrito-compra';
import { Pagar } from './features/ventas/pages/pagar/pagar';
import { Historial } from './features/ventas/pages/historial/historial';
import { Dashboard } from './features/dashboard/page/dashboard/dashboard';

export const routes: Routes = [

    //LIBRES
    {
        path: 'marcar',
        component: MarcarAsistencia,
    },
    {
        path: 'login',
        component: Login,
        canActivate: [NoAuthGuard]
    },
    {
        path: '',
        component: MainLayout,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'bienvenida',
                pathMatch: 'full'
            },

            {
                path: 'bienvenida',
                component: Bienvenida
            },
            // USUARIOS - Solo GERENTE
            {
                path: 'usuarios',
                component: ListaUsuarios,
                canActivate: [roleGuard],
                data: { permission: 'gestionarUsuarios' }
            },
            {
                path: 'usuarios/agregar',
                component: GestionUsuarios,
                canActivate: [roleGuard],
                data: { permission: 'gestionarUsuarios' }
            },
            {
                path: 'usuarios/editar/:id',
                component: GestionUsuarios,
                canActivate: [roleGuard],
                data: { permission: 'gestionarUsuarios' }
            },

            // CATEGORÍAS DE PRODUCTO - Solo ADMINISTRADOR
            {
                path: 'categorias',
                component: ListaCategorias,
                canActivate: [roleGuard],
                data: { permission: 'gestionarCategorias' }
            },
            {
                path: 'marcas',
                component: ListaMarcas,
                canActivate: [roleGuard],
                data: { permission: 'gestionarCategorias' }
            },
            {
                path: 'tipos-producto',
                component: ListaTipoProducto,
                canActivate: [roleGuard],
                data: { permission: 'gestionarCategorias' }
            },
            {
                path: 'unidades-medida',
                component: ListaUnidadesMedida,
                canActivate: [roleGuard],
                data: { permission: 'gestionarCategorias' }
            },

            // PRODUCTOS - ADMINISTRADOR y GERENTE
            {
                path: 'productos',
                component: ListaProductos,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProductos' }
            },
            {
                path: 'productos/agregar',
                component: GestionProductos,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProductos' }
            },
            {
                path: 'productos/editar/:id',
                component: GestionProductos,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProductos' }
            },

            // PROVEEDORES - ADMINISTRADOR y GERENTE
            {
                path: 'proveedores',
                component: ListaProveedores,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProveedores' }
            },
            {
                path: 'proveedores/agregar',
                component: GestionProveedores,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProveedores' }
            },
            {
                path: 'proveedores/editar/:id',
                component: GestionProveedores,
                canActivate: [roleGuard],
                data: { permission: 'gestionarProveedores' }
            },

            //PREDICCIONES - GERENTE y ADMINISTRADOR
            {
                path: 'predicciones',
                component: ListaPredicciones,
                canActivate: [roleGuard],
                data: { permission: 'verPredicciones' }
            },
            {
                path: 'predicciones/detalle/:id',
                component: DetallePrediccion,
                canActivate: [roleGuard],
                data: { permission: 'verPredicciones' }
            },

            //PEDIDOS
            {
                path: 'pedidos',
                component: ListaPedidos,
                canActivate: [roleGuard],
                data: { permission: 'puedeVerPedidos' }
            },
            {
                path: 'pedidos/agregar',
                component: GestionPedidos,
                canActivate: [roleGuard],
                data: { permission: 'puedeGestionarPedidos' }
            },
            {
                path: 'pedidos/editar/:id',
                component: GestionPedidos,
                canActivate: [roleGuard],
                data: { permission: 'puedeGestionarPedidos' }
            },
            {
                path: 'pedidos/recibir/:id',
                component: RecibirPedidos,
                canActivate: [roleGuard],
                data: { permission: 'puedeRecibirPedidos' }
            },

            //VENTAS - Solo VENDEDOR
            {
                path: 'venta',
                component: CatalogoProductos,
                canActivate: [roleGuard],
                data: { permission: 'puedeRealizarVentas' }
            },
            {
                path: 'venta/producto/detalle/:id',
                component: DetalleProducto,
                canActivate: [roleGuard],
                data: { permission: 'puedeRealizarVentas' }
            },
            {
                path: 'venta/carrito',
                component: CarritoCompra,
                canActivate: [roleGuard],
                data: { permission: 'puedeRealizarVentas' }
            },
            {
                path: 'venta/pagar',
                component: Pagar,
                canActivate: [roleGuard],
                data: { permission: 'puedeRealizarVentas' }
            },
            {
                path: 'ventas/historial',
                component: Historial,
                canActivate: [roleGuard],
                data: { permission: 'verHistorialVentas' }
            },

            //Dashboard - Solo GERENTE
            {
                path: 'dashboard',
                component: Dashboard,
                canActivate: [roleGuard],
                data: { permission: 'verDashboard' }
            },


            // ASISTENCIA - Solo GERENTE
            {
                path: 'asistencia/diaria',
                component: AsistenciaDiaria,
                canActivate: [roleGuard],
                data: { permission: 'verAsistencia' }
            },
            {
                path: 'asistencia/usuario',
                component: AsistenciaUsuario,
                canActivate: [roleGuard],
                data: { permission: 'verAsistencia' }
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
