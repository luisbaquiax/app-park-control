import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { COMMON_IMPORTS } from '../../shared/common-imports';
import { NavigationService } from '../../services/navigation.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
  roleIds?: number[];
  showWhenLoggedIn?: boolean;
}

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatMenu, MatMenuTrigger],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.scss'
})
export class NavigationBar {
  menuItems: MenuItem[] = [];
  idUsuarioActual: number | null = null;
  nombreRolActual: string | null = null;
  nombreUsuarioActual: string | null = null;
  private routerSubscription: any;
  private menuSubscription: any;

  constructor(
    private router: Router, 
    private snackBar: MatSnackBar, 
    private loginService: LoginService,  
    private navigationService: NavigationService
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarDatosUsuarioYMenu();
      });
  }

  private allMenuItems: MenuItem[] = [
    {
      icon: 'local_shipping',
      label: 'General',
      route: '/',
      showWhenLoggedIn: false,
    },
    {
      icon: 'account_circle',
      label: 'Iniciar Sesión',
      route: '/login',
      showWhenLoggedIn: false,
    },
    // OPCIONES DEL USUARIO EMPRESA
    {
      icon: 'business_center',
      label: 'Control Sucursal',
      route: '/control-sucursal',
      roles: ['EMPRESA'],
    },
    {
      icon: 'business_center',
      label: 'Gestionar Planes',
      route: '/gestion-planes',
      roles: ['EMPRESA'],
    },
    // OPCIONES DEL USUARIO SUCURSAL
    {
      icon: 'business_center',
      label: 'Gestionar Sucursal',
      route: '/gestion-sucursal',
      roles: ['SUCURSAL'],
    },
  ];

  ngOnInit() {
    this.cargarDatosUsuarioYMenu();

    this.menuSubscription = this.navigationService.refreshMenu$.subscribe(() => {
      this.refreshMenu();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }

  private cargarDatosUsuarioYMenu() {
    const idUsuario = sessionStorage.getItem('idUsuario');
    const nombreRol = sessionStorage.getItem('nombreRol');
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');

    if (idUsuario && idUsuario.trim() !== '' && !isNaN(Number(idUsuario))) {
      this.idUsuarioActual = Number(idUsuario);
      this.nombreRolActual = nombreRol && nombreRol.trim() !== '' ? nombreRol : null;
      this.nombreUsuarioActual = nombreUsuario && nombreUsuario.trim() !== '' ? nombreUsuario : null;
      this.filtrarMenu();
    } else {
      this.limpiarSesion();
    }
  }

  private limpiarSesion() {
    this.idUsuarioActual = null;
    this.nombreRolActual = null;
    this.nombreUsuarioActual = null;
    this.menuItems = this.allMenuItems.filter((item) => !item.roles && !item.roleIds);
  }

  private filtrarMenu() {
    this.menuItems = this.allMenuItems.filter((item) => {
      // Si el usuario está logueado y el ítem no debe mostrarse cuando hay login, lo excluimos
      if (this.idUsuarioActual && item.showWhenLoggedIn === false) {
        return false;
      }
      
      // Si el ítem no tiene restricciones de roles
      if (!item.roles && !item.roleIds) {
        // Solo mostramos si no tiene flag de showWhenLoggedIn o si este es true
        return item.showWhenLoggedIn === undefined || item.showWhenLoggedIn;
      }

      // Si el ítem tiene roles y el usuario tiene un rol
      if (item.roles && this.nombreRolActual) {
        if (item.roles.includes(this.nombreRolActual)) {
          return true;
        }
      }
      return false;
    });
  }

  elementoMenuSeleccionado(item: MenuItem) {
    this.router.navigate([item.route]);
  }

  quitarVerificacionDosPasos() {
    const idUsuario = sessionStorage.getItem('idUsuario');

    if (idUsuario) {
      this.loginService.cambiar2FA(Number(idUsuario)).subscribe({
        next: (response) => {
          this.mostrarMensaje(response.message, 'success');
        },
        error: (error) => {
          this.mostrarMensaje('Error al cambiar Autentificación','error');
        },
      });
    } else {
      this.mostrarMensaje('No existe una Sesión Activa', 'error');
    }
  }

  cerrarSesionDesdeMenu() {
    if (this.idUsuarioActual !== null) {
      try {
        sessionStorage.clear();
        this.limpiarSesion();
        this.mostrarMensaje('Sesión cerrada correctamente', 'success');
        this.router.navigate(['/']);
      } catch (error) {
        this.mostrarMensaje('Error al cerrar sesión', 'error');
      }
    } else {
      this.mostrarMensaje('No hay usuario registrado', 'info');
    }
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  // Método para refrescar el menú (útil si el rol cambia durante la sesión)
  refreshMenu() {
    this.cargarDatosUsuarioYMenu();
  }

  // Método helper para verificar si el usuario tiene un rol específico
  hasRole(roleName: string): boolean {
    return this.nombreRolActual === roleName;
  }

  // Método helper para verificar si el usuario tiene uno de varios roles
  hasAnyRole(roleNames: string[]): boolean {
    return this.nombreRolActual ? roleNames.includes(this.nombreRolActual) : false;
  }
}