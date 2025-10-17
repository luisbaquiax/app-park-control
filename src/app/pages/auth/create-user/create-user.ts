import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { LoginService } from '../../../services/login.service';
import { departamentosMunicipios, Departamento, Municipio } from '../../../models/extras/ubicacion.model';

export interface RegistroRequest {
    direccionCompleta: string;
    ciudad: string;
    pais: string;
    codigoPostal: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    dpi: string;
    correo: string;
    telefono: string;
    nombreUsuario: string;
    contraseniaHash: string;
}

export interface RegistroResponse {
    message: string;
    status: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss'
})
export class CreateUser implements OnInit {
  usuarioForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  departamentos: Departamento[] = [];
  municipiosFiltrados: Municipio[] = [];
  maxDate: Date;

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar,  private loginService: LoginService, private router: Router) {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.usuarioForm = this.crearUsuarioForm();
    this.cargarDepartamentos();
  }

  ngOnInit(): void {
    // No hay lógica de fortaleza de contraseña
  }

  crearUsuarioForm(): FormGroup {
    return this.formBuilder.group({
      // Información Personal
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', [Validators.required]],
      dpi: ['', [
        Validators.required, 
        Validators.minLength(13), 
        Validators.maxLength(13),
        Validators.pattern('^[0-9]{13}$')
      ]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{8}$')
      ]],
      
      // Información de Dirección
      pais: ['Guatemala', [Validators.required]],
      departamento: ['', [Validators.required]],
      ciudad: ['', [Validators.required]], // Esto es el municipio
      codigoPostal: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{5}$')
      ]],
      direccionCompleta: ['', [
        Validators.required, 
        Validators.minLength(10)
      ]],
      
      // Credenciales - Contraseña temporal simplificada
      nombreUsuario: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      contraseniaHash: ['', [
        Validators.required, 
        Validators.minLength(4) // Reducido a 4 para contraseña temporal
      ]]
    });
  }

  cargarDepartamentos(): void {
    this.departamentos = Object.keys(departamentosMunicipios) as Departamento[];
  }

  onDepartamentoChange(): void {
    const departamentoSeleccionado = this.usuarioForm.get('departamento')?.value;
    
    if (departamentoSeleccionado) {
      this.municipiosFiltrados = departamentosMunicipios[departamentoSeleccionado] || [];
      this.usuarioForm.get('ciudad')?.reset();
      this.usuarioForm.get('ciudad')?.enable();
    } else {
      this.municipiosFiltrados = [];
      this.usuarioForm.get('ciudad')?.disable();
    }
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  enviarFormulario(): void {
    if (this.usuarioForm.valid) {
      this.isLoading = true;
      
      const formValue = this.usuarioForm.value;
      
      // Preparar el objeto RegistroRequest
      const registroData: RegistroRequest = {
        // Información personal
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        fechaNacimiento: this.formatearFecha(formValue.fechaNacimiento),
        dpi: formValue.dpi.trim(),
        correo: formValue.correo.trim().toLowerCase(),
        telefono: formValue.telefono.trim(),
        
        // Información de dirección
        direccionCompleta: formValue.direccionCompleta.trim(),
        ciudad: formValue.ciudad, // Municipio seleccionado
        pais: formValue.pais,
        codigoPostal: formValue.codigoPostal.trim(),
        
        // Credenciales
        nombreUsuario: formValue.nombreUsuario.trim(),
        contraseniaHash: formValue.contraseniaHash
      };

      // Llamar al servicio de registro
      this.loginService.registrarCliente(registroData).subscribe({
        next: (response: RegistroResponse) => {
          this.isLoading = false;
          this.mostrarMensaje(response.message || 'Usuario creado exitosamente','success');
          this.limpiarFormulario();
          
          // Opcional: Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          const mensajeError = error.error?.message || 'Error al registrar el usuario';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos();
      this.mostrarMensaje('Por favor, complete todos los campos requeridos correctamente', 'warning');
    }
  }

  limpiarFormulario(): void {
    this.usuarioForm.reset({
      pais: 'Guatemala'
    });
    
    this.municipiosFiltrados = [];
    
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    
    // Si es una instancia de Date
    if (fecha instanceof Date) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Si es un string, intentar parsear
    if (typeof fecha === 'string') {
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return fecha.toString();
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}