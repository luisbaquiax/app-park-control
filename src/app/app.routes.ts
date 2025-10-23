import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';

export const routes: Routes = [
    {
        path: '', redirectTo: '/login', pathMatch: 'full'
    },
    {
        path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), title: "Iniciar Sesión"
    },
    {
        path: 'crear-usuario', loadComponent: () => import('./pages/auth/create-user/create-user').then(m => m.CreateUser), title: 'Crear Cliente'
    },
    {
        path: 'recuperar-contrasenia', loadComponent: () => import('./pages/auth/recover-password/recover-password').then(m => m.RecoverPassword), title: "Recuperación Contraseña"
    },
    {
        path: 'primer-ingreso', loadComponent: () => import('./pages/auth/first-password/first-password').then(m => m.FirstPassword), title: "Primer Ingreso"
    },
    {
        path: 'control-sucursal', loadComponent: () => import('./pages/empresa/branch-control/branch-control').then(m => m.BranchControl), title: "Control Sucursal"
    },
    {
        path: 'gestion-sucursal', loadComponent: () => import('./pages/sucursal/branch-management/branch-management').then(m => m.BranchManagement), title: "Gestión Sucursal"
    },
    {
        path: 'gestion-planes', loadComponent: () => import('./pages/empresa/plan-management/plan-management').then(m => m.PlanManagement), title: "Gestión Planes"
    }
];
