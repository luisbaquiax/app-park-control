import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { COMMON_IMPORTS } from '../../../shared/common-imports';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.scss'
})
export class RecoverPassword implements OnInit {
  currentStep: number = 1;
  isLoading: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  
  // Forms
  emailForm!: FormGroup;
  verificationForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // Data storage
  userEmail: string = '';
  userName: string = '';
  recoveryToken: string = '';
  userId: number = 0;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    this.inicializarForms();
  }

  private inicializarForms(): void {
    this.emailForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
      codigoVerificacion: ['', [
        Validators.required, 
        Validators.pattern(/^\d{6}$/)
      ]]
    });

    this.passwordForm = this.fb.group({
      nuevaContrasenia: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]],
      confirmarContrasenia: ['', [Validators.required]]
    }, { validators: this.validaContrasenia });
  }

  private validaContrasenia(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('nuevaContrasenia');
    const confirmPassword = control.get('confirmarContrasenia');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  requestRecovery(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      
      const requestData = {
        correo: this.emailForm.get('correo')?.value
      };

      this.loginService.recuperarContrasenia(requestData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.userEmail = requestData.correo;
          this.userId = response.user;
          this.recoveryToken = response.token;
          
          sessionStorage.setItem('token', this.recoveryToken);
          this.mostrarMensaje(response.mensaje, "info");
          this.currentStep = 2;
        },
        error: (error) => {
          this.mostrarMensaje(error.error?.message || "Error al Solicitar Recuperación de Contraseña", "error");
        }
      });
    }
  }

  verificaCodigoDeSeguridad(): void {
    if (this.verificationForm.valid) {
      this.isLoading = true;
      
      const requestData = {
        token: this.recoveryToken,
        codigoVerificacion: this.verificationForm.get('codigoVerificacion')?.value
      };

      this.loginService.verificarCodigoRecuperacion(requestData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.userId = response.idUsuario;
          this.userName = response.nombreUsuario;
          this.recoveryToken = response.token;
          
          sessionStorage.setItem('idUsuario', this.userId.toString());
          sessionStorage.setItem('token', this.recoveryToken);
          
          this.mostrarMensaje(response.mensaje, "info");
          this.currentStep = 3;
        },
        error: (error) => {
          this.mostrarMensaje(error.error?.message || "Error al Solicitar Cambio de Contraseña", "error");
        }
      });
    }
  }

  resetPassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      
      const storedUserId = sessionStorage.getItem('idUsuario');
      const idUsuario = this.userId || (storedUserId ? parseInt(storedUserId) : 0);
      
      const requestData = {
        idUsuario: idUsuario,
        token: this.recoveryToken,
        nuevaContrasenia: this.passwordForm.get('nuevaContrasenia')?.value
      };

      this.loginService.resetearContrasenia(requestData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.mostrarMensaje(response.message, "success");
          this.currentStep = 4;
        },
        error: (error) => {
          this.mostrarMensaje(error.error?.message || "Error al Cambiar la Contraseña", "error");
        }
      });
    }
  }

  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  resetProcess(): void {
    this.currentStep = 1;
    this.emailForm.reset();
    this.verificationForm.reset();
    this.passwordForm.reset();
    this.userEmail = '';
    this.userName = '';
    this.recoveryToken = '';
    this.userId = 0;
    this.isLoading = false;
  }
}
