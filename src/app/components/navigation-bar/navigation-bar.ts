import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatDrawerContainer, MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
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
    // Cerrar Sesión ya no está en el menú lateral, ahora está en el menú de usuario
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

    if (idUsuario && idUsuario.trim() !== '' && !isNaN(Number(idUsuario))) {
      this.idUsuarioActual = Number(idUsuario);
      this.nombreRolActual = nombreRol && nombreRol.trim() !== '' ? nombreRol : null;
      this.filtrarMenu();
    } else {
      // Si no hay sesión válida, limpiar y mostrar menú público
      this.limpiarSesion();
    }
  }

  private limpiarSesion() {
    this.idUsuarioActual = null;
    this.nombreRolActual = null;
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