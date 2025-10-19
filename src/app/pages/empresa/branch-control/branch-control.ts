import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { GestionarEmpresaService } from '../../../services/empresa/gestinarEmpresa.service';
import { CrearSucursalRequest, CrearSucursalResponse, SucursalResponse } from '../../../models/empresa/control.model';
import { InformacionEmpresaResponse } from '../../../models/empresa/gestionarEmpresa.model';
import { departamentosMunicipios, Departamento, Municipio } from '../../../models/extras/ubicacion.model';
import { ControlSucursalService } from '../../../services/empresa/controlSucursal.service';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { UsuarioDTO, SucursalDTO } from '../../../models/empresa/control.model';

@Component({
  selector: 'app-control-sucursal',
  standalone: true,
  imports: [...COMMON_IMPORTS,
    MatTableModule,
    MatTabGroup,
    MatTab,
    MatChip
  ],
  templateUrl: './branch-control.html',
  styleUrl: './branch-control.scss'
})
export class BranchControl implements OnInit {
  sucursalForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  isLoadingSucursales = false;
  isLoadingEmpresas = false;
  
  // Empresas disponibles
  empresas: InformacionEmpresaResponse[] = [];
  
  // Para búsqueda de sucursales
  idEmpresaBusqueda: number | null = null;
  sucursales: SucursalResponse[] = [];
  
  // Modal de detalles del encargado
  mostrarModalEncargado: boolean = false;
  encargadoSeleccionado: UsuarioDTO | null = null;
  sucursalSeleccionada: SucursalDTO | null = null;
  
  // Datos de ubicación
  departamentos: Departamento[] = [];
  municipiosFiltradosUsuario: Municipio[] = [];
  municipiosFiltradosSucursal: Municipio[] = [];
  
  // Fechas
  maxDate: Date;
  
  // Columnas para la tabla
  displayedColumns: string[] = ['nombre', 'direccion', 'ciudad', 'horario', 'capacidad', 'estado', 'acciones'];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private controlSucursalService: ControlSucursalService,
    private gestionarEmpresaService: GestionarEmpresaService
  ) {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.sucursalForm = this.crearSucursalForm();
    this.cargarDepartamentos();
  }

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  crearSucursalForm(): FormGroup {
    return this.formBuilder.group({
      // Información del Usuario Encargado
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
      pais: ['Guatemala', [Validators.required]],
      departamentoUsuario: ['', [Validators.required]],
      ciudadUsuario: ['', [Validators.required]],
      codigoPostal: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{5}$')
      ]],
      direccionCompleta: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      nombreUsuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      contraseniaHash: ['', [
        Validators.required,
        Validators.minLength(4)
      ]],
      
      // Información de la Sucursal
      idEmpresa: ['', [Validators.required]],
      nombreSucursal: ['', [Validators.required, Validators.minLength(3)]],
      direccionCompletaSucursal: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      departamentoSucursal: ['', [Validators.required]],
      ciudadSucursal: ['', [Validators.required]],
      horaApertura: ['', [Validators.required]],
      horaCierre: ['', [Validators.required]],
      capacidad2Ruedas: ['', [Validators.required, Validators.min(1)]],
      capacidad4Ruedas: ['', [Validators.required, Validators.min(1)]],
      latitud: ['', [Validators.required]],
      longitud: ['', [Validators.required]],
      telefonoContactoSucursal: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ]],
      correoContactoSucursal: ['', [Validators.required, Validators.email]]
    });
  }

  cargarDepartamentos(): void {
    this.departamentos = Object.keys(departamentosMunicipios) as Departamento[];
  }

  cargarEmpresas(): void {
    this.isLoadingEmpresas = true;
    this.gestionarEmpresaService.obtenerEmpresas().subscribe({
      next: (response: InformacionEmpresaResponse[]) => {
        this.isLoadingEmpresas = false;
        this.empresas = response.filter(empresa => empresa.estado === 'ACTIVA');
        
        console.log(response)

        if (this.empresas.length === 0) {
          this.mostrarMensaje('No hay empresas activas disponibles', 'info');
        }
      },
      error: (error: any) => {
        this.isLoadingEmpresas = false;
        const mensajeError = error.error?.message || 'Error al cargar las empresas';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  onDepartamentoUsuarioChange(): void {
    const departamentoSeleccionado = this.sucursalForm.get('departamentoUsuario')?.value;
    
    if (departamentoSeleccionado) {
      this.municipiosFiltradosUsuario = departamentosMunicipios[departamentoSeleccionado] || [];
      this.sucursalForm.get('ciudadUsuario')?.reset();
      this.sucursalForm.get('ciudadUsuario')?.enable();
    } else {
      this.municipiosFiltradosUsuario = [];
      this.sucursalForm.get('ciudadUsuario')?.disable();
    }
  }

  onDepartamentoSucursalChange(): void {
    const departamentoSeleccionado = this.sucursalForm.get('departamentoSucursal')?.value;
    
    if (departamentoSeleccionado) {
      this.municipiosFiltradosSucursal = departamentosMunicipios[departamentoSeleccionado] || [];
      this.sucursalForm.get('ciudadSucursal')?.reset();
      this.sucursalForm.get('ciudadSucursal')?.enable();
    } else {
      this.municipiosFiltradosSucursal = [];
      this.sucursalForm.get('ciudadSucursal')?.disable();
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
    if (this.sucursalForm.valid) {
      this.isLoading = true;
      
      const formValue = this.sucursalForm.value;
      
      const sucursalData: CrearSucursalRequest = {
        // Información del usuario encargado
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        fechaNacimiento: this.formatearFecha(formValue.fechaNacimiento),
        dpi: formValue.dpi.trim(),
        correo: formValue.correo.trim().toLowerCase(),
        telefono: formValue.telefono.trim(),
        direccionCompleta: formValue.direccionCompleta.trim(),
        ciudad: formValue.ciudadUsuario,
        pais: formValue.pais,
        codigoPostal: formValue.codigoPostal.trim(),
        nombreUsuario: formValue.nombreUsuario.trim(),
        contraseniaHash: formValue.contraseniaHash,
        
        // Información de la sucursal
        idEmpresa: Number(formValue.idEmpresa),
        nombreSucursal: formValue.nombreSucursal.trim(),
        direccionCompletaSucursal: formValue.direccionCompletaSucursal.trim(),
        ciudadSucursal: formValue.ciudadSucursal,
        departamentoSucursal: formValue.departamentoSucursal,
        horaApertura: formValue.horaApertura,
        horaCierre: formValue.horaCierre,
        capacidad2Ruedas: Number(formValue.capacidad2Ruedas),
        capacidad4Ruedas: Number(formValue.capacidad4Ruedas),
        latitud: Number(formValue.latitud),
        longitud: Number(formValue.longitud),
        telefonoContactoSucursal: formValue.telefonoContactoSucursal.trim(),
        correoContactoSucursal: formValue.correoContactoSucursal.trim().toLowerCase()
      };

      this.controlSucursalService.crearSucursal(sucursalData).subscribe({
        next: (response: CrearSucursalResponse) => {
          this.isLoading = false;
          this.mostrarMensaje(response.message || 'Sucursal creada exitosamente', 'success');
          this.limpiarFormulario();
        },
        error: (error: any) => {
          this.isLoading = false;
          const mensajeError = error.error?.message || 'Error al crear la sucursal';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos();
      this.mostrarMensaje('Por favor, complete todos los campos requeridos correctamente', 'warning');
    }
  }

  buscarSucursales(): void {
    if (!this.idEmpresaBusqueda || this.idEmpresaBusqueda <= 0) {
      this.mostrarMensaje('Por favor, seleccione una empresa', 'warning');
      return;
    }

    this.isLoadingSucursales = true;
    this.controlSucursalService.obtenerSucursalesPorEmpresa(this.idEmpresaBusqueda).subscribe({
      next: (response: SucursalResponse[]) => {
        this.isLoadingSucursales = false;
        this.sucursales = response;
        
        if (this.sucursales.length === 0) {
          this.mostrarMensaje('No se encontraron sucursales para esta empresa', 'info');
        } else {
          const empresaNombre = this.empresas.find(e => e.idEmpresa === this.idEmpresaBusqueda)?.nombreComercial || 'la empresa';
          this.mostrarMensaje(`Se encontraron ${this.sucursales.length} sucursal(es) para ${empresaNombre}`, 'success');
        }
      },
      error: (error: any) => {
        this.isLoadingSucursales = false;
        const mensajeError = error.error?.message || 'Error al buscar sucursales';
        this.mostrarMensaje(mensajeError, 'error');
        this.sucursales = [];
      }
    });
  }

  // Nuevo método para ver detalles del encargado
  verDetallesEncargado(sucursal: SucursalResponse): void {
    this.encargadoSeleccionado = sucursal.sucursalDTO.usuario;
    this.sucursalSeleccionada = sucursal.sucursalDTO;
    this.mostrarModalEncargado = true;
  }

  // Nuevo método para cerrar modal
  cerrarModalEncargado(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalEncargado = false;
    this.encargadoSeleccionado = null;
    this.sucursalSeleccionada = null;
  }

  // Método auxiliar para formatear fecha legible
  formatearFechaLegible(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  limpiarFormulario(): void {
    this.sucursalForm.reset({
      pais: 'Guatemala'
    });
    
    this.municipiosFiltradosUsuario = [];
    this.municipiosFiltradosSucursal = [];
    
    Object.keys(this.sucursalForm.controls).forEach(key => {
      const control = this.sucursalForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  limpiarBusqueda(): void {
    this.idEmpresaBusqueda = null;
    this.sucursales = [];
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.sucursalForm.controls).forEach(key => {
      const control = this.sucursalForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    
    if (fecha instanceof Date) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
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