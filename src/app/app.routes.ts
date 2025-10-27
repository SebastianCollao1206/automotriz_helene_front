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

export const routes: Routes = [
    {
        path: 'marcar',
        component: MarcarAsistencia,
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'agregar/usuario',
                component: GestionUsuarios,
            },
            {
                path: 'usuario/editar/:id',
                component: GestionUsuarios,
            },
            {
                path: 'usuarios',
                component: ListaUsuarios,
            },
            {
                path: 'categorias',
                component: ListaCategorias,
            },
            {
                path: 'marcas',
                component: ListaMarcas,
            },
            {
                path: 'tipos-producto',
                component: ListaTipoProducto,
            },
            {
                path: 'unidades-medida',
                component: ListaUnidadesMedida,
            },
            {
                path: 'agregar/producto',
                component: GestionProductos,
            },
            {
                path: 'producto/editar/:id',
                component: GestionProductos,
            },
            {
                path: 'productos',
                component: ListaProductos,
            },



            {
                path: 'asistencia',
                component: AsistenciaDiaria,
            },
            {
                path: 'asistencia/usuario',
                component: AsistenciaUsuario,
            },
        ],
    },
];
