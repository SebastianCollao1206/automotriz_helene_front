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

            //ACA HACER UNA DE BIENVENIDA
            {
                path: '',
                redirectTo: 'bienvenida',
                pathMatch: 'full'
            },

            {
                path: 'bienvenida',
                component: Bienvenida
            },
            //USUARIOS-GERENTE
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
