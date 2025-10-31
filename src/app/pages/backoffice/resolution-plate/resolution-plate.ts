import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { CambioPlacaServiceBackoffice } from '../../../services/backoffice/cambioPlacaBackoffice.service';
import {
  CambioPlacaResponseBackoffice,
  DetalleSolicitudCambioPlacaBackoffice,
  CambioPlacaRequestBackoffice,
  ApiResponseBackoffice,
  SuscripcionClienteBackoffice
} from '../../../models/backoffice/cambioPlacaBackoffice.model';

@Component({
  selector: 'app-plate-change-backoffice',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './resolution-plate.html',
  styleUrl: './resolution-plate.scss'
})
export class ResolutionPlate implements OnInit {

  // Formulario
  resolucionForm: FormGroup;

  // Estados de carga
  isLoadingSolicitudes = false;
  isSavingResolucion = false;

  // Datos
  clientesSolicitudes: CambioPlacaResponseBackoffice[] = [];
  todasLasSolicitudes: Array<DetalleSolicitudCambioPlacaBackoffice & { clienteInfo: CambioPlacaResponseBackoffice }> = [];

  // Modales
  mostrarModalDetalles = false;
  mostrarModalResolucion = false;
  solicitudSeleccionada: (DetalleSolicitudCambioPlacaBackoffice & { clienteInfo: CambioPlacaResponseBackoffice }) | null = null;

  // Usuario
  idUsuarioBackoffice: number = 0;

  // Opciones de selects
  estadosResolucion = [
    { value: 'APROBADA', label: 'Aprobar Solicitud', icon: 'check_circle', color: 'success' },
    { value: 'RECHAZADA', label: 'Rechazar Solicitud', icon: 'cancel', color: 'error' }
  ];

  motivosCambio = [
    { value: 'VENTA', label: 'Venta del Vehículo' },
    { value: 'ROBO', label: 'Robo del Vehículo' },
    { value: 'SINIESTRO', label: 'Siniestro Total' },
    { value: 'OTRO', label: 'Otro Motivo' }
  ];

  tiposDocumento = [
    { value: 'DENUNCIA', label: 'Denuncia Policial' },
    { value: 'TRASPASO', label: 'Traspaso de Propiedad' },
    { value: 'TARJETA_CIRCULACION', label: 'Tarjeta de Circulación' },
    { value: 'IDENTIFICACION', label: 'Documento de Identificación' },
    { value: 'OTRO', label: 'Otro Documento' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private cambioPlacaService: CambioPlacaServiceBackoffice
  ) {
    this.resolucionForm = this.crearResolucionForm();
  }

  ngOnInit(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuarioBackoffice = idUsuarioStr ? parseInt(idUsuarioStr) : 0;

    if (this.idUsuarioBackoffice > 0) {
      this.cargarSolicitudes();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario', 'error');
    }
  }

  crearResolucionForm(): FormGroup {
    return this.formBuilder.group({
      estado: ['', Validators.required],
      observacionesRevision: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  cargarSolicitudes(): void {
    this.isLoadingSolicitudes = true;

    this.cambioPlacaService.obtenerSolicitudesCambioPlacaPendiente(this.idUsuarioBackoffice).subscribe({
      next: (response: CambioPlacaResponseBackoffice[]) => {
        this.isLoadingSolicitudes = false;
        this.clientesSolicitudes = response;

        this.todasLasSolicitudes = [];
        response.forEach(cliente => {
          cliente.detalleSolicitudesCambioPlaca.forEach(solicitud => {
            this.todasLasSolicitudes.push({
              ...solicitud,
              clienteInfo: cliente
            });
          });
        });
      },
      error: (error: any) => {
        this.isLoadingSolicitudes = false;
        const mensajeError = error.error?.message || 'Error al cargar las solicitudes';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirModalResolucion(solicitud: DetalleSolicitudCambioPlacaBackoffice & { clienteInfo: CambioPlacaResponseBackoffice }): void {
    if (solicitud.estado !== 'PENDIENTE') {
      this.mostrarMensaje('Esta solicitud ya fue procesada', 'warning');
      return;
    }

    this.solicitudSeleccionada = solicitud;
    this.mostrarModalResolucion = true;
    this.resolucionForm.reset();
  }

  resolverSolicitud(): void {
    if (this.resolucionForm.valid && this.solicitudSeleccionada) {
      this.isSavingResolucion = true;

      const resolucionData: CambioPlacaRequestBackoffice = {
        idUsuarioBackoffice: this.idUsuarioBackoffice,
        idSolicitudCambio: this.solicitudSeleccionada.idSolicitudCambio,
        estado: this.resolucionForm.value.estado,
        observacionesRevision: this.resolucionForm.value.observacionesRevision.trim()
      };

      this.cambioPlacaService.resolucionSolicitud(resolucionData).subscribe({
        next: (response: ApiResponseBackoffice) => {
          this.isSavingResolucion = false;
          this.mostrarMensaje(response.message || 'Solicitud procesada exitosamente', 'success');
          this.cerrarModalResolucion();
          this.cargarSolicitudes();
        },
        error: (error: any) => {
          this.isSavingResolucion = false;
          const mensajeError = error.error?.message || 'Error al procesar la solicitud';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos(this.resolucionForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  verDetalles(solicitud: DetalleSolicitudCambioPlacaBackoffice & { clienteInfo: CambioPlacaResponseBackoffice }): void {
    this.solicitudSeleccionada = solicitud;
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
    this.solicitudSeleccionada = null;
  }

  cerrarModalResolucion(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalResolucion = false;
    this.solicitudSeleccionada = null;
    this.resolucionForm.reset();
  }

  obtenerNombreMotivo(motivo: string): string {
    const motivoEncontrado = this.motivosCambio.find(m => m.value === motivo);
    return motivoEncontrado ? motivoEncontrado.label : motivo;
  }

  obtenerNombreTipoDocumento(tipo: string): string {
    const tipoEncontrado = this.tiposDocumento.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  obtenerEstadoInfo(estado: string): { text: string; class: string; icon: string } {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return { text: 'Pendiente', class: 'chip-pendiente', icon: 'schedule' };
      case 'APROBADA':
        return { text: 'Aprobada', class: 'chip-aprobada', icon: 'check_circle' };
      case 'RECHAZADA':
        return { text: 'Rechazada', class: 'chip-rechazada', icon: 'cancel' };
      case 'COMPLETADA':
        return { text: 'Completada', class: 'chip-completada', icon: 'verified' };
      default:
        return { text: estado, class: 'chip-pendiente', icon: 'help' };
    }
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
    if (!fecha) return 'No disponible';

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

  obtenerExtensionArchivo(nombreArchivo: string): string {
    const partes = nombreArchivo.split('.');
    return partes[partes.length - 1].toLowerCase();
  }

  esImagen(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
  }

  esPdf(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return extension === 'pdf';
  }

  esDocumento(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['doc', 'docx'].includes(extension);
  }

  abrirODescargarArchivo(url: string, nombreArchivo: string, event: Event): void {
    event.preventDefault();

    if (this.esPdf(nombreArchivo) || this.esDocumento(nombreArchivo)) {
      this.descargarArchivo(url, nombreArchivo);
    } else {
      window.open(url, '_blank');
    }
  }

  private descargarArchivo(url: string, nombreArchivo: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.mostrarMensaje('Descargando archivo...', 'info');
  }

  debeDescargar(nombreArchivo: string): boolean {
    return this.esPdf(nombreArchivo) || this.esDocumento(nombreArchivo);
  }

  obtenerTextoBoton(nombreArchivo: string): string {
    return this.debeDescargar(nombreArchivo) ? 'Descargar' : 'Ver Original';
  }

  obtenerIconoBoton(nombreArchivo: string): string {
    return this.debeDescargar(nombreArchivo) ? 'download' : 'open_in_new';
  }

  calcularPrecioFinal(suscripcion: SuscripcionClienteBackoffice): number {
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

  obtenerClaseEstadoBanner(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return 'estado-banner-pendiente';
      case 'APROBADA':
        return 'estado-banner-aprobada';
      case 'RECHAZADA':
        return 'estado-banner-rechazada';
      case 'COMPLETADA':
        return 'estado-banner-completada';
      default:
        return 'estado-banner-pendiente';
    }
  }

  contarSolicitudesPorEstado(estado: string): number {
    return this.todasLasSolicitudes.filter(s => s.estado.toUpperCase() === estado.toUpperCase()).length;
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
}