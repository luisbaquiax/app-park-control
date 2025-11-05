import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { PermisoTemporalBackofficeModel } from '../../../services/backoffice/permisoTemporalBackoffice.service';
import {
  PermisoTemporalRequest,
  DetalleSolicitudTemporal,
  AceptarPermisoRequest,
  RechazarPermisoRequest,
  RevocarPermisoRequest,
  SuscripcionCliente,
} from '../../../models/backoffice/permisoTemporalBackoffice.model';

interface PermisoAplanado extends DetalleSolicitudTemporal {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  cui: string;
  direccion: string;
}

@Component({
  selector: 'app-temporary-permit-backoffice',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './temporary-permit-backoffice.html',
  styleUrl: './temporary-permit-backoffice.scss'
})
export class TemporaryPermitBackoffice implements OnInit {

  // Estados de carga
  isLoadingPermisos = false;
  isSavingAceptar = false;
  isSavingRechazar = false;
  isSavingRevocar = false;

  // Datos
  permisosOriginales: PermisoTemporalRequest[] = [];
  permisosAplanados: PermisoAplanado[] = [];

  // Modales
  mostrarModalDetalles = false;
  mostrarModalAceptar = false;
  mostrarModalRechazar = false;
  mostrarModalRevocar = false;
  permisoSeleccionado: PermisoAplanado | null = null;

  // Formularios
  aceptarForm!: FormGroup;
  rechazarForm!: FormGroup;
  revocarForm!: FormGroup;

  // Usuario backoffice
  idUsuarioBackoffice: number = 0;

  // Sucursales seleccionadas para aceptar
  sucursalesSeleccionadas: number[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private permisoTemporalBackofficeService: PermisoTemporalBackofficeModel
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    const idBackofficeStr = sessionStorage.getItem('idUsuario');
    this.idUsuarioBackoffice = idBackofficeStr ? parseInt(idBackofficeStr) : 0;

    if (this.idUsuarioBackoffice > 0) {
      this.cargarPermisos();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario backoffice', 'error');
    }
  }

  inicializarFormularios(): void {
    // Formulario para aceptar permiso
    this.aceptarForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      usosMaximos: [null, [Validators.required, Validators.min(1)]],
      observaciones: ['', [Validators.required, Validators.minLength(10)]],
      sucursalesAsignadas: [[]]
    }, { validators: this.validadorFechas() });

    // Formulario para rechazar permiso
    this.rechazarForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Formulario para revocar permiso
    this.revocarForm = this.fb.group({
      observaciones: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  validadorFechas() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control as FormGroup;
      const fechaInicio = formGroup.get('fechaInicio')?.value;
      const fechaFin = formGroup.get('fechaFin')?.value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      // Convertir a Date si es string
      const inicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
      const fin = fechaFin instanceof Date ? fechaFin : new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);

      if (inicio < hoy) {
        formGroup.get('fechaInicio')?.setErrors({ fechaPasada: true });
        return { fechaPasada: true };
      }

      if (fin < hoy) {
        formGroup.get('fechaFin')?.setErrors({ fechaPasada: true });
        return { fechaPasada: true };
      }

      if (inicio > fin) {
        formGroup.get('fechaFin')?.setErrors({ fechaFinMenor: true });
        return { fechaFinMenor: true };
      }

      const errorInicio = formGroup.get('fechaInicio')?.errors;
      if (errorInicio && (errorInicio['fechaPasada'] || errorInicio['fechaFinMenor'])) {
        delete errorInicio['fechaPasada'];
        delete errorInicio['fechaFinMenor'];
        formGroup.get('fechaInicio')?.setErrors(
          Object.keys(errorInicio).length > 0 ? errorInicio : null
        );
      }

      const errorFin = formGroup.get('fechaFin')?.errors;
      if (errorFin && (errorFin['fechaPasada'] || errorFin['fechaFinMenor'])) {
        delete errorFin['fechaPasada'];
        delete errorFin['fechaFinMenor'];
        formGroup.get('fechaFin')?.setErrors(
          Object.keys(errorFin).length > 0 ? errorFin : null
        );
      }

      return null;
    };
  }

  cargarPermisos(): void {
    this.isLoadingPermisos = true;

    this.permisoTemporalBackofficeService.obtenerTodosLosPermisosTemporales(this.idUsuarioBackoffice).subscribe({
      next: (response: PermisoTemporalRequest[]) => {
        this.isLoadingPermisos = false;
        this.permisosOriginales = response;
        this.aplanarPermisos();
      },
      error: (error: any) => {
        this.isLoadingPermisos = false;
        const mensajeError = error.error?.message || 'Error al cargar los permisos temporales';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  aplanarPermisos(): void {
    this.permisosAplanados = [];

    this.permisosOriginales.forEach(permiso => {
      permiso.detalleSolicitudesTemporal.forEach(detalle => {
        this.permisosAplanados.push({
          ...detalle,
          idUsuario: permiso.idUsuario,
          nombreCompleto: permiso.nombreCompleto,
          email: permiso.email,
          telefono: permiso.telefono,
          cui: permiso.cui,
          direccion: permiso.direccion
        });
      });
    });
  }

  verDetalles(permiso: PermisoAplanado): void {
    this.permisoSeleccionado = permiso;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalDetalles = false;
    this.permisoSeleccionado = null;
  }

  abrirModalAceptar(permiso: PermisoAplanado): void {
    this.permisoSeleccionado = permiso;
    this.sucursalesSeleccionadas = [];
    this.aceptarForm.reset();
    this.mostrarModalAceptar = true;
  }

  cerrarModalAceptar(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalAceptar = false;
    this.permisoSeleccionado = null;
    this.sucursalesSeleccionadas = [];
    this.aceptarForm.reset();
  }

  toggleSucursal(idSucursal: number): void {
    const index = this.sucursalesSeleccionadas.indexOf(idSucursal);
    if (index > -1) {
      this.sucursalesSeleccionadas.splice(index, 1);
    } else {
      this.sucursalesSeleccionadas.push(idSucursal);
    }
  }

  esSucursalSeleccionada(idSucursal: number): boolean {
    return this.sucursalesSeleccionadas.includes(idSucursal);
  }

  aceptarPermiso(): void {
    if (this.aceptarForm.invalid) {
      this.aceptarForm.markAllAsTouched();
      this.mostrarMensaje('Por favor complete todos los campos correctamente', 'error');
      return;
    }

    if (this.sucursalesSeleccionadas.length === 0) {
      this.mostrarMensaje('Debe seleccionar al menos una sucursal', 'error');
      return;
    }

    if (!this.permisoSeleccionado) return;

    const sucursalesString = this.sucursalesSeleccionadas.join(',');

    // Obtener las fechas del formulario
    const fechaInicioValue = this.aceptarForm.get('fechaInicio')?.value;
    const fechaFinValue = this.aceptarForm.get('fechaFin')?.value;

    // Formatear las fechas correctamente
    const fechaInicio = this.formatearFechaParaEnvioDate(fechaInicioValue);
    const fechaFin = this.formatearFechaParaEnvioDate(fechaFinValue);

    const data: AceptarPermisoRequest = {
      idSolicitudTemporal: this.permisoSeleccionado.idPermisoTemporal,
      aprobadoPor: this.idUsuarioBackoffice,
      observaciones: this.aceptarForm.get('observaciones')?.value,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usosMaximos: this.aceptarForm.get('usosMaximos')?.value,
      sucursalesAsignadas: sucursalesString
    };

    this.isSavingAceptar = true;

    this.permisoTemporalBackofficeService.aceptarPermisoTemporal(data).subscribe({
      next: (response) => {
        this.isSavingAceptar = false;
        this.mostrarMensaje(response.message || 'Permiso aceptado exitosamente', 'success');
        this.cerrarModalAceptar();
        this.cargarPermisos();
      },
      error: (error) => {
        this.isSavingAceptar = false;
        const mensajeError = error.error?.message || 'Error al aceptar el permiso';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirModalRechazar(permiso: PermisoAplanado): void {
    this.permisoSeleccionado = permiso;
    this.rechazarForm.reset();
    this.mostrarModalRechazar = true;
  }

  cerrarModalRechazar(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalRechazar = false;
    this.permisoSeleccionado = null;
    this.rechazarForm.reset();
  }

  rechazarPermiso(): void {
    if (this.rechazarForm.invalid) {
      this.rechazarForm.markAllAsTouched();
      this.mostrarMensaje('Por favor complete todos los campos correctamente', 'error');
      return;
    }

    if (!this.permisoSeleccionado) return;

    const data: RechazarPermisoRequest = {
      idSolicitudTemporal: this.permisoSeleccionado.idPermisoTemporal,
      aprobadoPor: this.idUsuarioBackoffice,
      observaciones: this.rechazarForm.get('observaciones')?.value
    };

    this.isSavingRechazar = true;

    this.permisoTemporalBackofficeService.rechazarPermisoTemporalPendiente(data).subscribe({
      next: (response) => {
        this.isSavingRechazar = false;
        this.mostrarMensaje(response.message || 'Permiso rechazado exitosamente', 'success');
        this.cerrarModalRechazar();
        this.cargarPermisos();
      },
      error: (error) => {
        this.isSavingRechazar = false;
        const mensajeError = error.error?.message || 'Error al rechazar el permiso';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirModalRevocar(permiso: PermisoAplanado): void {
    this.permisoSeleccionado = permiso;
    this.revocarForm.reset();
    this.mostrarModalRevocar = true;
  }

  cerrarModalRevocar(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalRevocar = false;
    this.permisoSeleccionado = null;
    this.revocarForm.reset();
  }

  revocarPermiso(): void {
    if (this.revocarForm.invalid) {
      this.revocarForm.markAllAsTouched();
      this.mostrarMensaje('Por favor complete todos los campos correctamente', 'error');
      return;
    }

    if (!this.permisoSeleccionado) return;

    const data: RevocarPermisoRequest = {
      idSolicitudTemporal: this.permisoSeleccionado.idPermisoTemporal,
      observaciones: this.revocarForm.get('observaciones')?.value
    };

    this.isSavingRevocar = true;

    this.permisoTemporalBackofficeService.revocarPermisoTermporalActivo(data).subscribe({
      next: (response) => {
        this.isSavingRevocar = false;
        this.mostrarMensaje(response.message || 'Permiso revocado exitosamente', 'success');
        this.cerrarModalRevocar();
        this.cargarPermisos();
      },
      error: (error) => {
        this.isSavingRevocar = false;
        const mensajeError = error.error?.message || 'Error al revocar el permiso';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  obtenerEstadoInfo(estado: string): { text: string; class: string; icon: string } {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return { text: 'Pendiente', class: 'chip-pendiente', icon: 'schedule' };
      case 'ACTIVO':
        return { text: 'Activo', class: 'chip-activo', icon: 'check_circle' };
      case 'RECHAZADO':
        return { text: 'Rechazado', class: 'chip-rechazado', icon: 'cancel' };
      case 'EXPIRADO':
        return { text: 'Expirado', class: 'chip-expirado', icon: 'event_busy' };
      case 'REVOCADO':
        return { text: 'Revocado', class: 'chip-revocado', icon: 'block' };
      case 'AGOTADO':
        return { text: 'Agotado', class: 'chip-agotado', icon: 'do_not_disturb' };
      default:
        return { text: estado, class: 'chip-pendiente', icon: 'help' };
    }
  }

  obtenerClaseEstadoBanner(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return 'estado-banner-pendiente';
      case 'ACTIVO':
        return 'estado-banner-activo';
      case 'RECHAZADO':
        return 'estado-banner-rechazado';
      case 'EXPIRADO':
        return 'estado-banner-expirado';
      case 'REVOCADO':
        return 'estado-banner-revocado';
      case 'AGOTADO':
        return 'estado-banner-agotado';
      default:
        return 'estado-banner-pendiente';
    }
  }

  formatearFechaParaMostrar(fecha: string | null): string {
    if (!fecha) return 'No definida';

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

  formatearFechaLegible(fecha: string | null): string {
    if (!fecha) return 'No definida';

    try {
      const fechaObj = new Date(fecha);

      if (isNaN(fechaObj.getTime())) {
        return fecha.split('T')[0];
      }

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return fechaObj.toLocaleDateString('es-GT', opciones);
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  formatearFechaParaEnvio(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const fechaObj = new Date(fecha);
      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaObj.getDate()).padStart(2, '0');
      
      // Formato: 2025-11-04 (solo fecha, sin hora)
      return `${year}-${month}-${day}`;
    } catch (error) {
      return fecha;
    }
  }

  formatearFechaParaEnvioDate(fecha: Date | string): string {
    if (!fecha) return '';
    
    try {
      // Si es string, convertir a Date
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      
      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaObj.getDate()).padStart(2, '0');
      
      // Formato: 2025-11-04 (solo fecha, sin hora)
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  obtenerFechaMinima(): Date {
    return new Date();
  }

  calcularPrecioFinal(suscripcion: SuscripcionCliente): number {
    const precioBase = suscripcion.precioPlan;
    const descuento = suscripcion.descuentoAplicado;
    return precioBase - (precioBase * (descuento / 100));
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor);
  }

  obtenerIconoTipoVehiculo(tipo: string): string {
    return tipo === 'DOS_RUEDAS' ? 'two_wheeler' : 'directions_car';
  }

  obtenerTextoTipoVehiculo(tipo: string): string {
    return tipo === 'DOS_RUEDAS' ? 'Motocicleta' : 'Automóvil';
  }

  calcularDiasRestantes(fechaFin: string | null): number | null {
    if (!fechaFin) return null;

    try {
      const hoy = new Date();
      const fin = new Date(fechaFin);
      const diff = fin.getTime() - hoy.getTime();
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return dias > 0 ? dias : 0;
    } catch (error) {
      return null;
    }
  }

  calcularPorcentajeUsos(usosRealizados: number, usosMaximos: number | null): number {
    if (!usosMaximos || usosMaximos === 0) return 0;
    return (usosRealizados / usosMaximos) * 100;
  }

  obtenerColorBarraUsos(porcentaje: number): string {
    if (porcentaje < 50) return '#2ecc71';
    if (porcentaje < 80) return '#f39c12';
    return '#e74c3c';
  }

  contarPermisosPorEstado(estado: string): number {
    return this.permisosAplanados.filter(p => p.estado.toUpperCase() === estado.toUpperCase()).length;
  }

  estaAprobadoOActivo(estado: string): boolean {
    const estadoUpper = estado.toUpperCase();
    return estadoUpper === 'ACTIVO' || estadoUpper === 'EXPIRADO' || estadoUpper === 'AGOTADO' || estadoUpper === 'REVOCADO';
  }

  esPendiente(estado: string): boolean {
    return estado.toUpperCase() === 'PENDIENTE';
  }

  esActivo(estado: string): boolean {
    return estado.toUpperCase() === 'ACTIVO';
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