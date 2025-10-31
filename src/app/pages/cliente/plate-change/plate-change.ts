import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { CambioPlacaService } from '../../../services/cliente/cambioPlaca.service';
import { SuscripcionService } from '../../../services/cliente/suscripcion.service';
import {
  CambioPlacaRequest,
  CambioPlacaResponse,
  ApiResponse,
  SuscripcionCliente
} from '../../../models/cliente/cambioPlaca.model';
import { 
  VehiculoResponse, 
  SuscripcionActivaResponse,
  SuscripcionCliente as SuscripcionClienteActiva 
} from '../../../models/cliente/sucursal.model';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-change-plate',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTabsModule],
  templateUrl: './plate-change.html',
  styleUrl: './plate-change.scss'
})
export class PlateChange implements OnInit {

  // Formulario
  cambioPlacaForm: FormGroup;

  // Estados de carga
  isLoadingSolicitudes = false;
  isSavingSolicitud = false;
  isLoadingVehiculos = false;
  isLoadingSuscripciones = false;

  // Datos
  solicitudes: CambioPlacaResponse[] = [];
  vehiculosDisponibles: VehiculoResponse[] = [];
  suscripcionesActivas: SuscripcionClienteActiva[] = [];

  // Archivo
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  // Modales
  mostrarModalDetalles = false;
  solicitudSeleccionada: CambioPlacaResponse | null = null;

  // Usuario
  idCliente: number = 0;
  idSuscripcion: number = 0;

  // Opciones de selects
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
    private cambioPlacaService: CambioPlacaService,
    private suscripcionService: SuscripcionService
  ) {
    this.cambioPlacaForm = this.crearCambioPlacaForm();
  }

  ngOnInit(): void {
    const idClienteStr = sessionStorage.getItem('idUsuario');
    this.idCliente = idClienteStr ? parseInt(idClienteStr) : 0;

    if (this.idCliente > 0) {
      this.cargarSuscripcionesActivas();
      this.cargarVehiculos();
      this.cargarSolicitudes();
    } else {
      this.mostrarMensaje('No se encontró el ID de cliente', 'error');
    }
  }

  crearCambioPlacaForm(): FormGroup {
    return this.formBuilder.group({
      idSuscripcion: ['', Validators.required],
      idVehiculoActual: ['', Validators.required],
      placaNueva: ['', Validators.required],
      motivo: ['', Validators.required],
      descripcionMotivo: ['', [Validators.required, Validators.minLength(10)]],
      tipoDocumento: ['', Validators.required],
      descripcionEvidencia: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  cargarSuscripcionesActivas(): void {
    this.isLoadingSuscripciones = true;

    this.suscripcionService.obtenerSuscripcionesActivasCliente(this.idCliente).subscribe({
      next: (response: SuscripcionActivaResponse) => {
        this.isLoadingSuscripciones = false;
        this.suscripcionesActivas = response.suscripcionCliente;
        
        if (this.suscripcionesActivas.length === 1) {
          this.idSuscripcion = this.suscripcionesActivas[0].idSuscripcion;
          this.cambioPlacaForm.patchValue({
            idSuscripcion: this.idSuscripcion
          });
        }
      },
      error: (error: any) => {
        this.isLoadingSuscripciones = false;
        const mensajeError = error.error?.message || 'Error al cargar las suscripciones';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarVehiculos(): void {
    this.isLoadingVehiculos = true;

    this.suscripcionService.obtenerVehiculos(this.idCliente).subscribe({
      next: (response: VehiculoResponse[]) => {
        this.isLoadingVehiculos = false;
        this.vehiculosDisponibles = response;
      },
      error: (error: any) => {
        this.isLoadingVehiculos = false;
        const mensajeError = error.error?.message || 'Error al cargar los vehículos';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarSolicitudes(): void {
    this.isLoadingSolicitudes = true;

    this.cambioPlacaService.obtenerSolicitudesCambioPlaca(this.idCliente).subscribe({
      next: (response: CambioPlacaResponse[]) => {
        this.isLoadingSolicitudes = false;
        this.solicitudes = response;
      },
      error: (error: any) => {
        this.isLoadingSolicitudes = false;
        const mensajeError = error.error?.message || 'Error al cargar las solicitudes';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirSelectorArchivo(): void {
    const fileInput = document.getElementById('archivo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onArchivoSeleccionado(event: any): void {
    const archivo = event.target.files[0];

    if (archivo) {
      // Validar tamaño (máximo 10MB)
      if (archivo.size > 10485760) {
        this.mostrarMensaje('El archivo no debe superar los 10MB', 'warning');
        this.limpiarArchivo();
        return;
      }

      // Validar tipo de archivo
      const tiposPermitidos = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!tiposPermitidos.includes(archivo.type)) {
        this.mostrarMensaje('Tipo de archivo no permitido. Solo se permiten imágenes, PDF y documentos Word', 'warning');
        this.limpiarArchivo();
        return;
      }

      this.archivoSeleccionado = archivo;
      this.nombreArchivo = archivo.name;
    }
  }

  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    const fileInput = document.getElementById('archivo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  guardarSolicitud(): void {
    if (this.cambioPlacaForm.valid && this.archivoSeleccionado) {
      this.isSavingSolicitud = true;

      const solicitudData: CambioPlacaRequest = {
        idCliente: this.idCliente,
        idSuscripcion: this.cambioPlacaForm.value.idSuscripcion,
        idVehiculoActual: this.cambioPlacaForm.value.idVehiculoActual,
        placaNueva: this.cambioPlacaForm.value.placaNueva,
        motivo: this.cambioPlacaForm.value.motivo,
        descripcionMotivo: this.cambioPlacaForm.value.descripcionMotivo.trim(),
        tipoDocumento: this.cambioPlacaForm.value.tipoDocumento,
        descripcionEvidencia: this.cambioPlacaForm.value.descripcionEvidencia.trim()
      };

      this.cambioPlacaService.crearCambioPlaca(solicitudData, this.archivoSeleccionado).subscribe({
        next: (response: ApiResponse) => {
          this.isSavingSolicitud = false;
          this.mostrarMensaje(response.message || 'Solicitud creada exitosamente', 'success');
          this.limpiarFormulario();
          this.cargarSolicitudes();
        },
        error: (error: any) => {
          this.isSavingSolicitud = false;
          const mensajeError = error.error?.message || 'Error al crear la solicitud';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos(this.cambioPlacaForm);
      if (!this.archivoSeleccionado) {
        this.mostrarMensaje('Debe seleccionar un archivo', 'warning');
      } else {
        this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
      }
    }
  }

  limpiarFormulario(): void {
    this.cambioPlacaForm.reset();

    if (this.suscripcionesActivas.length === 1) {
      this.cambioPlacaForm.patchValue({
        idSuscripcion: this.suscripcionesActivas[0].idSuscripcion
      });
    }
    this.limpiarArchivo();
  }

  onSuscripcionSeleccionada(event: any): void {
    this.idSuscripcion = event.value;
    const suscripcionSeleccionada = this.suscripcionesActivas.find(s => s.idSuscripcion === this.idSuscripcion);
    
    if (suscripcionSeleccionada) {
      this.cambioPlacaForm.patchValue({
        idVehiculoActual: suscripcionSeleccionada.vehiculoClienteDTO.idVehiculo
      });
    }
  }

  onVehiculoSeleccionado(event: any): void {
    const idVehiculo = event.value;
    const vehiculoSeleccionado = this.vehiculosDisponibles.find(v => v.idVehiculo === idVehiculo);
    
    if (vehiculoSeleccionado) {
      console.log('Vehículo seleccionado:', vehiculoSeleccionado);
    }
  }

  onPlacaNuevaSeleccionada(event: any): void {
    const placa = event.value;
    console.log('Placa nueva seleccionada:', placa);
  }

  obtenerDescripcionSuscripcion(suscripcion: SuscripcionClienteActiva): string {
    return `${suscripcion.tipoPlanSuscripcionDTO.nombrePlan} - ${suscripcion.vehiculoClienteDTO.placa} (${suscripcion.estadoSuscripcion})`;
  }

  verDetalles(solicitud: CambioPlacaResponse): void {
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

  obtenerNombreMotivo(motivo: string): string {
    const motivoEncontrado = this.motivosCambio.find(m => m.value === motivo);
    return motivoEncontrado ? motivoEncontrado.label : motivo;
  }

  obtenerNombreTipoDocumento(tipo: string): string {
    const tipoEncontrado = this.tiposDocumento.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
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

  obtenerIconoTipoArchivo(nombreArchivo: string): string {
    if (this.esImagen(nombreArchivo)) return 'image';
    if (this.esPdf(nombreArchivo)) return 'picture_as_pdf';
    if (this.esDocumento(nombreArchivo)) return 'description';
    return 'insert_drive_file';
  }

  obtenerColorEstado(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return 'chip-pendiente';
      case 'APROBADA':
      case 'COMPLETADA':
        return 'chip-aprobada';
      case 'RECHAZADA':
        return 'chip-rechazada';
      case 'EN_REVISION':
        return 'chip-revision';
      default:
        return 'chip-pendiente';
    }
  }

  obtenerTextoEstado(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'APROBADA':
        return 'Aprobada';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'COMPLETADA':
        return 'Completada';
      case 'EN_REVISION':
        return 'En Revisión';
      default:
        return estado;
    }
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

  contarSolicitudesPorEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado.toUpperCase() === estado.toUpperCase()).length;
  }
}