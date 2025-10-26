import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { ComercioAfiliadoService } from '../../../services/empresa/comercioAfiliado.service';
import { 
  CrearComercioRequest,
  ActualizarComercioRequest,
  ComercioActivoResponse,
  ConvenioResponse,
  CrearConvenioRequest,
  ActualizarConvenioResquest,
  ActualizarEstadoConvenioResquest,
  Convenio
} from '../../../models/empresa/comercioAfiliado.model';
import { ApiResponse } from '../../../models/sucursal/gestionSucursal.model';
import { MatChip } from '@angular/material/chips';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-affiliate-commerce',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule, MatChip, MatTabGroup, MatTab, MatMenuModule],
  templateUrl: './affiliate-commerce.html',
  styleUrl: './affiliate-commerce.scss'
})
export class AffiliateCommerce implements OnInit {
  
  // Formularios
  comercioForm: FormGroup;
  convenioForm: FormGroup;
  
  // Estados de carga
  isLoadingComercios = false;
  isLoadingConvenios = false;
  isSavingComercio = false;
  isSavingConvenio = false;
  
  // Datos
  comercios: ComercioActivoResponse[] = [];
  sucursalesConvenios: ConvenioResponse[] = [];
  todosLosConvenios: Array<Convenio & { sucursalInfo: ConvenioResponse }> = [];
  
  // Modales
  mostrarModalComercio = false;
  mostrarModalConvenio = false;
  mostrarModalConfirmacion = false; 
  comercioSeleccionado: ComercioActivoResponse | null = null;
  convenioSeleccionado: (Convenio & { sucursalInfo: ConvenioResponse }) | null = null;
  comercioADesactivar: number | null = null;

  // Edición
  comercioEditando: ComercioActivoResponse | null = null;
  convenioEditando: Convenio | null = null;
  modoEdicionComercio = false;
  modoEdicionConvenio = false;
  
  // IDs
  idUsuario: number = 0;
  idSucursal: number = 0;
  
  // Fecha mínima
  fechaMinima: string = '';
  
  // Columnas de tablas
  columnasComercio: string[] = ['nombre', 'razon', 'nit', 'tipo', 'contacto', 'estado', 'acciones'];
  
  // Opciones
  tiposComercio = [
    { value: 'RESTAURANTE', label: 'Restaurante' },
    { value: 'FERRETERIA', label: 'Ferretería' },
    { value: 'LIBRERIA', label: 'Librería' },
    { value: 'PANADERIA', label: 'Panadería' },
    { value: 'ZAPATERIA', label: 'Zapatería' }
  ];

  periodosCorte = [
    { value: 'DIARIO', label: 'Diario' },
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'MENSUAL', label: 'Mensual' },
    { value: 'ANUAL', label: 'Anual' }
  ];

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private comercioAfiliadoService: ComercioAfiliadoService) {
    this.fechaMinima = this.obtenerFechaActual();
    this.comercioForm = this.crearComercioForm();
    this.convenioForm = this.crearConvenioForm();
  }

  ngOnInit(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuario = idUsuarioStr ? parseInt(idUsuarioStr) : 0;
    
    if (this.idUsuario > 0) {
      this.cargarComercios();
      this.cargarConvenios();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario', 'error');
    }
  }
  
  crearComercioForm(): FormGroup {
    return this.formBuilder.group({
      idComercio: [''],
      nombreComercial: ['', [Validators.required, Validators.minLength(3)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.pattern('^[0-9]{6,10}$')]],
      tipoComercio: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      correoContacto: ['', [Validators.required, Validators.email]]
    });
  }

  crearConvenioForm(): FormGroup {
    const form = this.formBuilder.group({
      idConvenio: [''],
      idComercio: ['', [Validators.required]],
      horasGratisMaximo: ['', [Validators.required, Validators.min(0)]],
      periodoCorte: ['', [Validators.required]],
      fechaInicioConvenio: ['', [Validators.required]],
      fechaFinConvenio: ['', [Validators.required]]
    });

    form.setValidators(this.validadorFechasConvenio());

    form.get('fechaInicioConvenio')?.valueChanges.subscribe(() => {
      form.get('fechaFinConvenio')?.updateValueAndValidity({ emitEvent: false });
    });

    return form;
  }

  cargarComercios(): void {
    this.isLoadingComercios = true;
    
    this.comercioAfiliadoService.obtenerComerciosActivos().subscribe({
      next: (response: ComercioActivoResponse[]) => {
        this.isLoadingComercios = false;
        this.comercios = response;
      },
      error: (error: any) => {
        this.isLoadingComercios = false;
        const mensajeError = error.error?.message || 'Error al cargar los comercios';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarConvenios(): void {
    this.isLoadingConvenios = true;
    
    this.comercioAfiliadoService.obtenerConvenicosSucursales(this.idUsuario).subscribe({
      next: (response: ConvenioResponse[]) => {
        this.isLoadingConvenios = false;
        this.sucursalesConvenios = response;
        
        const sucursalConConvenio = response.find(s => s.convenios.length > 0);
        if (sucursalConConvenio) {
          this.idSucursal = sucursalConConvenio.idSucursal;
        } else if (response.length > 0) {
          this.idSucursal = response[0].idSucursal;
        }
        
        this.todosLosConvenios = [];
        response.forEach(sucursal => {
          sucursal.convenios.forEach(convenio => {
            this.todosLosConvenios.push({
              ...convenio,
              sucursalInfo: sucursal
            });
          });
        });
      },
      error: (error: any) => {
        this.isLoadingConvenios = false;
        const mensajeError = error.error?.message || 'Error al cargar los convenios';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  guardarComercio(): void {
    if (this.comercioForm.valid) {
      if (this.modoEdicionComercio && this.comercioEditando) {
        this.ejecutarEdicionComercio();
      } else {
        this.ejecutarCreacionComercio();
      }
    } else {
      this.marcarCamposInvalidos(this.comercioForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  private ejecutarCreacionComercio(): void {
    this.isSavingComercio = true;

    const comercioData: CrearComercioRequest = {
      nombreComercial: this.comercioForm.value.nombreComercial.trim(),
      razonSocial: this.comercioForm.value.razonSocial.trim(),
      nit: this.comercioForm.value.nit.trim(),
      tipoComercio: this.comercioForm.value.tipoComercio,
      telefono: this.comercioForm.value.telefono.trim(),
      correoContacto: this.comercioForm.value.correoContacto.trim().toLowerCase()
    };

    this.comercioAfiliadoService.crearComercio(comercioData).subscribe({
      next: (response: ApiResponse) => {
        this.isSavingComercio = false;
        this.mostrarMensaje(response.message || 'Comercio creado exitosamente', 'success');
        this.limpiarFormularioComercio();
        this.cargarComercios();
      },
      error: (error: any) => {
        this.isSavingComercio = false;
        const mensajeError = error.error?.message || 'Error al crear el comercio';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  private ejecutarEdicionComercio(): void {
    this.isSavingComercio = true;

    const comercioData: ActualizarComercioRequest = {
      idComercio: this.comercioForm.value.idComercio,
      nombreComercial: this.comercioForm.value.nombreComercial.trim(),
      razonSocial: this.comercioForm.value.razonSocial.trim(),
      nit: this.comercioForm.value.nit.trim(),
      tipoComercio: this.comercioForm.value.tipoComercio,
      telefono: this.comercioForm.value.telefono.trim(),
      correoContacto: this.comercioForm.value.correoContacto.trim().toLowerCase()
    };

    this.comercioAfiliadoService.actualizarComercio(comercioData).subscribe({
      next: (response: ApiResponse) => {
        this.isSavingComercio = false;
        this.mostrarMensaje(response.message || 'Comercio actualizado exitosamente', 'success');
        this.cancelarEdicionComercio();
        this.cargarComercios();
      },
      error: (error: any) => {
        this.isSavingComercio = false;
        const mensajeError = error.error?.message || 'Error al actualizar el comercio';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  editarComercio(comercio: ComercioActivoResponse): void {
    this.modoEdicionComercio = true;
    this.comercioEditando = comercio;

    this.comercioForm.patchValue({
      idComercio: comercio.idComercio,
      nombreComercial: comercio.nombreComercial,
      razonSocial: comercio.razonSocial,
      nit: comercio.nit,
      tipoComercio: comercio.tipoComercio,
      telefono: comercio.telefono,
      correoContacto: comercio.correoContacto
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionComercio(): void {
    this.modoEdicionComercio = false;
    this.comercioEditando = null;
    this.limpiarFormularioComercio();
  }

  limpiarFormularioComercio(): void {
    this.comercioForm.reset();
    
    Object.keys(this.comercioForm.controls).forEach(key => {
      const control = this.comercioForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  desactivarComercio(idComercio: number): void {
    this.comercioADesactivar = idComercio;
    this.mostrarModalConfirmacion = true;
  }

  confirmarDesactivacion(): void {
    if (this.comercioADesactivar !== null) {
      this.comercioAfiliadoService.desactivarComercio(this.comercioADesactivar).subscribe({
        next: (response: ApiResponse) => {
          this.mostrarMensaje(response.message || 'Comercio desactivado exitosamente', 'success');
          this.cerrarModalConfirmacion();
          this.cargarComercios();
        },
        error: (error: any) => {
          const mensajeError = error.error?.message || 'Error al desactivar el comercio';
          this.mostrarMensaje(mensajeError, 'error');
          this.cerrarModalConfirmacion();
        }
      });
    }
  }

  cerrarModalConfirmacion(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalConfirmacion = false;
    this.comercioADesactivar = null;
  }
  
  guardarConvenio(): void {
    if (this.convenioForm.valid) {
      if (this.modoEdicionConvenio && this.convenioEditando) {
        this.ejecutarEdicionConvenio();
      } else {
        this.ejecutarCreacionConvenio();
      }
    } else {
      this.marcarCamposInvalidos(this.convenioForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  private ejecutarCreacionConvenio(): void {
    this.isSavingConvenio = true;

    const convenioData: CrearConvenioRequest = {
      idComercio: Number(this.convenioForm.value.idComercio),
      idSucursal: this.idSucursal,
      horasGratisMaximo: this.convenioForm.value.horasGratisMaximo.toString(),
      periodoCorte: this.convenioForm.value.periodoCorte,
      fechaInicioConvenio: this.formatearFecha(this.convenioForm.value.fechaInicioConvenio),
      fechaFinConvenio: this.formatearFecha(this.convenioForm.value.fechaFinConvenio),
      creadoPor: this.idUsuario
    };

    this.comercioAfiliadoService.crearConvenio(convenioData).subscribe({
      next: (response: ApiResponse) => {
        this.isSavingConvenio = false;
        this.mostrarMensaje(response.message || 'Convenio creado exitosamente', 'success');
        this.limpiarFormularioConvenio();
        this.cargarConvenios();
      },
      error: (error: any) => {
        this.isSavingConvenio = false;
        const mensajeError = error.error?.message || 'Error al crear el convenio';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  private ejecutarEdicionConvenio(): void {
    this.isSavingConvenio = true;

    const convenioData: ActualizarConvenioResquest = {
      idConvenio: this.convenioForm.value.idConvenio,
      horasGratisMaximo: this.convenioForm.value.horasGratisMaximo.toString(),
      periodoCorte: this.convenioForm.value.periodoCorte,
      fechaInicioConvenio: this.formatearFecha(this.convenioForm.value.fechaInicioConvenio),
      fechaFinConvenio: this.formatearFecha(this.convenioForm.value.fechaFinConvenio)
    };

    this.comercioAfiliadoService.actualizarConvenio(convenioData).subscribe({
      next: (response: ApiResponse) => {
        this.isSavingConvenio = false;
        this.mostrarMensaje(response.message || 'Convenio actualizado exitosamente', 'success');
        this.cancelarEdicionConvenio();
        this.cargarConvenios();
      },
      error: (error: any) => {
        this.isSavingConvenio = false;
        const mensajeError = error.error?.message || 'Error al actualizar el convenio';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  editarConvenio(convenio: Convenio): void {
    this.modoEdicionConvenio = true;
    this.convenioEditando = convenio;

    this.convenioForm.patchValue({
      idConvenio: convenio.idConvenio,
      idComercio: convenio.comercioAfiliado.idComercio,
      horasGratisMaximo: convenio.horasGratisMaximo,
      periodoCorte: convenio.periodoCorte,
      fechaInicioConvenio: new Date(convenio.fechaInicioConvenio),
      fechaFinConvenio: new Date(convenio.fechaFinConvenio)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionConvenio(): void {
    this.modoEdicionConvenio = false;
    this.convenioEditando = null;
    this.limpiarFormularioConvenio();
  }

  limpiarFormularioConvenio(): void {
    this.convenioForm.reset();
    
    this.convenioForm.clearValidators();
    this.convenioForm.setValidators(this.validadorFechasConvenio());
    
    Object.keys(this.convenioForm.controls).forEach(key => {
      const control = this.convenioForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  cambiarEstadoConvenio(idConvenio: number, estado: 'ACTIVO' | 'VENCIDO' | 'INACTIVO'): void {
    const data: ActualizarEstadoConvenioResquest = {
      idConvenio,
      estado
    };

    this.comercioAfiliadoService.actualizarEstadoConvenio(data).subscribe({
      next: (response: ApiResponse) => {
        this.mostrarMensaje(response.message || 'Estado actualizado exitosamente', 'success');
        this.cargarConvenios();
      },
      error: (error: any) => {
        const mensajeError = error.error?.message || 'Error al actualizar el estado';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  // ==================== MODALES ====================
  
  verDetallesComercio(comercio: ComercioActivoResponse): void {
    this.comercioSeleccionado = comercio;
    this.mostrarModalComercio = true;
  }

  cerrarModalComercio(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalComercio = false;
    this.comercioSeleccionado = null;
  }

  verDetallesConvenio(convenio: Convenio & { sucursalInfo: ConvenioResponse }): void {
    this.convenioSeleccionado = convenio;
    this.mostrarModalConvenio = true;
  }

  cerrarModalConvenio(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalConvenio = false;
    this.convenioSeleccionado = null;
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatearFechaParaMostrar(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        return fecha.split('T')[0];
      }
      
      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  formatearFechaLegible(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        return fecha.split('T')[0];
      }
      
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return fechaObj.toLocaleDateString('es-GT', opciones);
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    
    let dateObj: Date;
    
    if (fecha instanceof Date) {
      dateObj = fecha;
    } else if (typeof fecha === 'string') {
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fecha;
      }
      dateObj = new Date(fecha);
    } else {
      return fecha.toString();
    }
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validadorFechasConvenio() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control as FormGroup;
      const fechaInicio = formGroup.get('fechaInicioConvenio')?.value;
      const fechaFin = formGroup.get('fechaFinConvenio')?.value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (inicio < hoy) {
        formGroup.get('fechaInicioConvenio')?.setErrors({ fechaPasada: true });
        return { fechaPasada: true };
      }

      if (fin < hoy) {
        formGroup.get('fechaFinConvenio')?.setErrors({ fechaPasada: true });
        return { fechaPasada: true };
      }

      if (inicio > fin) {
        formGroup.get('fechaFinConvenio')?.setErrors({ fechaFinMenor: true });
        return { fechaFinMenor: true };
      }

      const errorInicio = formGroup.get('fechaInicioConvenio')?.errors;
      if (errorInicio && (errorInicio['fechaPasada'] || errorInicio['fechaFinMenor'])) {
        delete errorInicio['fechaPasada'];
        delete errorInicio['fechaFinMenor'];
        formGroup.get('fechaInicioConvenio')?.setErrors(
          Object.keys(errorInicio).length > 0 ? errorInicio : null
        );
      }

      const errorFin = formGroup.get('fechaFinConvenio')?.errors;
      if (errorFin && (errorFin['fechaPasada'] || errorFin['fechaFinMenor'])) {
        delete errorFin['fechaPasada'];
        delete errorFin['fechaFinMenor'];
        formGroup.get('fechaFinConvenio')?.setErrors(
          Object.keys(errorFin).length > 0 ? errorFin : null
        );
      }

      return null;
    };
  }

  private marcarCamposInvalidos(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
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

  obtenerNombreTipoComercio(tipo: string): string {
    const tipoEncontrado = this.tiposComercio.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  obtenerNombrePeriodo(periodo: string): string {
    const periodoEncontrado = this.periodosCorte.find(p => p.value === periodo);
    return periodoEncontrado ? periodoEncontrado.label : periodo;
  }
}