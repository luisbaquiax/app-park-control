import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { LoginService } from '../../../services/login.service';
import { LoginResponse, Verificar2FAResponse } from '../../../models/login.model';
import { NavigationService } from '../../../services/navigation.service';
import { GestionarEmpresaService } from '../../../services/empresa/gestionarEmpresa.service';
import { InformacionEmpresaResponse } from '../../../models/empresa/gestionarEmpresa.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  tokenForm: FormGroup;
  hidePassword: boolean = true;
  isLoading: boolean = false;
  mostrarDialogToken: boolean = false;
  isVerificandoToken: boolean = false;
  isReenviandoCodigo: boolean = false;
  nombreRolActual: string = "";
  
  constructor( private fb: FormBuilder,  private router: Router, private snackBar: MatSnackBar, private loginService: LoginService, private navigationService: NavigationService, private gestionarEmpresaService: GestionarEmpresaService) {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.tokenForm = this.fb.group({
      token: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]{6}$')
      ]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.loginService.iniciarSesion(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.autenticacion.debeCambiarContrasenia) {
            this.guardarInformacionInicialUsuario(response);
            this.router.navigate(['/primer-ingreso']);
          } else {
            if (!response.autenticacion.autenticacion) {
              this.guardarInformacionInicialUsuario(response);
            } else {
              this.guardarInformacionInicialUsuario(response);
              this.mostrarDialogToken = true;
              this.tokenForm.reset();
            }
          }
        },
        error: (error) => {
          const mensajeError = error?.error?.message || 'Error al iniciar sesión';
          this.mostrarMensaje(mensajeError, 'error');
          this.isLoading = false;
        }
      })
    } else {
      this.marcarToqueFormulario(this.loginForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  verificarToken(): void {
    if (this.tokenForm.valid) {
      this.isVerificandoToken = true;

      const token = sessionStorage.getItem('token');

      const verificacion = {
        token: token || "",
        codigoVerificacion: this.tokenForm.value.token || ""
      }

      this.loginService.verificar2FA(verificacion).subscribe({
        next: (response) => {
          this.isVerificandoToken = false;
          this.cerrarDialogToken();
          this.guardarInformacionAdicionalUsuario(response);
        },
        error: (error) => {
          const mensajeError = error?.error?.message || 'Código incorrecto o expirado';
          this.mostrarMensaje(mensajeError, 'error');
          this.isVerificandoToken = false;
          this.tokenForm.get('token')?.setErrors({ 'incorrect': true });
        }
      });
    }
  }

  cerrarDialogToken(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarDialogToken = false;
    this.tokenForm.reset();
    this.isVerificandoToken = false;
  }

  private guardarInformacionInicialUsuario(response: LoginResponse): void {
    sessionStorage.setItem('idUsuario', response.credenciales.idUsuario.toString());
    this.nombreRolActual = response.credenciales.nombreRol || "";

    if (response.autenticacion.autenticacion) {
      sessionStorage.setItem('token', response.credenciales.token || "");
    } else {
      sessionStorage.setItem('rol', response.credenciales.rol?.toString() ?? "");
      sessionStorage.setItem('nombreRol', response.credenciales.nombreRol || "");
      sessionStorage.setItem('nombreUsuario', response.credenciales.nombreUsuario || "");
      this.mostrarMensaje(response.credenciales.mensaje, 'info');
      this.mostrarVista();
    }
  }

  private guardarInformacionAdicionalUsuario(response: Verificar2FAResponse): void {
    this.mostrarMensaje(response.mensaje, 'info');
    sessionStorage.setItem('rol', response.rol.toString());
    sessionStorage.setItem('nombreRol', response.nombreRol);
    sessionStorage.setItem('nombreUsuario', response.nombreUsuario);
    console.log("Datos")
    console.log(response.rol.toString())
    console.log(response.nombreRol)
    console.log(response.nombreUsuario)
    sessionStorage.removeItem('token');
    this.mostrarVista();
  }

  private mostrarVista() {
    if (this.nombreRolActual === "SUCURSAL") {
      this.router.navigate(['/']);
    } else if (this.nombreRolActual === "BACKOFFICE") {
      this.router.navigate(['/']);
    } else if (this.nombreRolActual === "CLIENTE") {
      this.router.navigate(['/']);
    } else if (this.nombreRolActual === "SISTEMA") {
      this.router.navigate(['/']);
    } else if (this.nombreRolActual === "EMPRESA") {
      // Guardamos Info de la Empresa
      const idUsuarioEmpleado = Number (sessionStorage.getItem('idUsuario'));

      this.gestionarEmpresaService.obtenerEmpresaPorID(idUsuarioEmpleado).subscribe({
        next: (response: InformacionEmpresaResponse[]) => {
          sessionStorage.setItem('idEmpresa', response[0].idEmpresa.toString());
          sessionStorage.setItem('nombreEmpresa', response[0].nombreComercial);
          sessionStorage.setItem('direccion', response[0].direccionFiscal);
        },
        error: (error) => {
          this.mostrarMensaje('Error al cargar información de la empresa', 'error');
        }
      });
      this.router.navigate(['/']);
    }
    this.navigationService.triggerRefreshMenu();
  }

  private marcarToqueFormulario(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  irARecuperarContrasenia(): void {
    this.router.navigate(['/recuperar-contrasenia']);
  }

  irARegistrame(): void {
    this.router.navigate(['/crear-usuario']);
  }
}