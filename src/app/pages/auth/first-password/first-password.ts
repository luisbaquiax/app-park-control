import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../../services/login.service';
import { PrimerInicioContraseniaRequest } from '../../../models/login.model';
import { COMMON_IMPORTS } from '../../../shared/common-imports';

@Component({
  selector: 'app-first-password',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './first-password.html',
  styleUrl: './first-password.scss'
})
export class FirstPassword implements OnInit {
  contraseniaForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  idUsuario: number | null = null;

  // Requisitos de contraseña
  requisitos = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.contraseniaForm = this.fb.group({
      nuevaContrasenia: ['', [Validators.required, this.validarContrasenia.bind(this)]],
      confirmarContrasenia: ['', [Validators.required]]
    }, { validators: this.contrasenasIguales });
  }

  ngOnInit() {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    
    if (idUsuarioStr && idUsuarioStr.trim() !== '' && !isNaN(Number(idUsuarioStr))) {
      this.idUsuario = Number(idUsuarioStr);
    } else {
      this.mostrarMensaje('No se encontró información del usuario', 'error');
      this.router.navigate(['/login']);
    }

    this.contraseniaForm.get('nuevaContrasenia')?.valueChanges.subscribe(value => {
      this.actualizarRequisitos(value);
    });
  }

  validarContrasenia(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    
    if (!password) return null;

    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }
    if (!/[A-Z]/.test(password)) {
      errors['hasUpperCase'] = true;
    }
    if (!/[a-z]/.test(password)) {
      errors['hasLowerCase'] = true;
    }
    if (!/[0-9]/.test(password)) {
      errors['hasNumber'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['hasSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  contrasenasIguales(group: AbstractControl): ValidationErrors | null {
    const password = group.get('nuevaContrasenia')?.value;
    const confirmPassword = group.get('confirmarContrasenia')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { noCoinciden: true };
  }

  actualizarRequisitos(password: string) {
    this.requisitos.minLength = password.length >= 8;
    this.requisitos.hasUpperCase = /[A-Z]/.test(password);
    this.requisitos.hasLowerCase = /[a-z]/.test(password);
    this.requisitos.hasNumber = /[0-9]/.test(password);
    this.requisitos.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  onSubmit() {
    if (this.contraseniaForm.invalid || this.idUsuario === null) {
      this.contraseniaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const request: PrimerInicioContraseniaRequest = {
      idUsuario: this.idUsuario,
      nuevaContrasenia: this.contraseniaForm.get('nuevaContrasenia')?.value
    };

    this.loginService.primerInicioContrasenia(request).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message || 'Contraseña establecida correctamente', 'success');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        const mensajeError = error.error?.message || 'Error al establecer la contraseña';
        this.mostrarMensaje(mensajeError, 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
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

  getErrorMessage(field: string): string {
    const control = this.contraseniaForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field === 'confirmarContrasenia' && this.contraseniaForm.hasError('noCoinciden')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
