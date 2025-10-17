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
    }
];
