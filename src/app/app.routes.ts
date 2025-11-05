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
    },
    {
        path: 'suscripciones', loadComponent: () => import('./pages/cliente/subscription/subscription').then(m => m.Subscription), title: "Suscripciónes"
    },
    {
      path: 'gestion-vehiculos', loadComponent: () => import('./pages/sucursal/gestion-vehiculos-component/gestion-vehiculos-component').then(m => m.GestionVehiculosComponent), title: "Gestion Vehiculos"
    },
    {
      path: 'vehiculos-propietario', loadComponent: () => import('./pages/sucursal/gestion-vehiculos-component/vehiculos-propietario/vehiculos-propietario').then(m => m.VehiculosPropietarioComponent), title: "Vehiculos Propietario"
    }
    ,
    {
      path: 'gestion-empresas', loadComponent: () => import('./pages/admin/gestion-empresas-component/gestion-empresas-component').then(m => m.GestionEmpresasComponent), title: "Gestion Empresas"
    },
    {
      path: 'comercio-afiliado', loadComponent: () => import('./pages/empresa/affiliate-commerce/affiliate-commerce').then(m => m.AffiliateCommerce), title: "Comercio Afiliado"
    },
    {
      path: 'management-ticket', loadComponent: () => import('./pages/sucursal/management-ticket/management-ticket').then(m => m.ManagementTicket), title: "Gestión Ticket"
    },
    {
      path: 'incidencia-ticket', loadComponent: () => import('./pages/sucursal/incident-ticket/incident-ticket').then(m => m.IncidentTicket), title: "Incidencia Ticket"
    },
    {
      path: 'incidencia-resolver', loadComponent: () => import('./pages/empresa/incident-resolve/incident-resolve').then(m => m.IncidentResolve), title: "Incidencia Resolver"
    },
    {
      path: 'cambio-placa', loadComponent: () => import('./pages/cliente/plate-change/plate-change').then(m => m.PlateChange), title: "Cambio Placa"
    },
    {
      path: 'placa-resolucion', loadComponent: () => import('./pages/backoffice/resolution-plate/resolution-plate').then(m => m.ResolutionPlate), title: "Placa Resolución"
    },
    {
      path: 'permiso-temporal', loadComponent: () => import('./pages/cliente/temporary-permit/temporary-permit').then(m => m.TemporaryPermit), title: "Permiso Temporal"
    },
    {
      path: 'permiso-temporal-backoffice', loadComponent: () => import('./pages/backoffice/temporary-permit-backoffice/temporary-permit-backoffice').then(m => m.TemporaryPermitBackoffice), title: "Permiso Temporal Backoffice"
    },
    {
      path: 'corte', loadComponent: () => import('./pages/empresa/court/court').then(m => m.Court), title: "Cortes de Caja"
    },
    {
      path: 'gestion-vehiculos', loadComponent: () => import('./pages/sucursal/gestion-vehiculos-component/gestion-vehiculos-component').then(m => m.GestionVehiculosComponent), title: "Gestion Vehiculos"
    },
    {
      path: 'vehiculos-propietario', loadComponent: () => import('./pages/sucursal/gestion-vehiculos-component/vehiculos-propietario/vehiculos-propietario').then(m => m.VehiculosPropietarioComponent), title: "Vehiculos Propietario"
    },
    {
      path: 'gestion-tarifa-global' , loadComponent: () => import('./pages/empresa/gestion-tarifa-global/gestion-tarifa-global').then(m => m.GestionTarifaGlobal), title: "Gestión Tarifa Global"
    },
    {
      path: 'ver-tickets', loadComponent:() => import('./pages/cliente/ticktes/ticktes').then(m => m.Ticktes), title: "Ver Tickets"
    },
    {
      path: 'gestion-flotilla' , loadComponent: () => import('./pages/empresa/flotilla/flotilla').then(m => m.Flotilla), title: "Gestión Flotilla"
    }
];
