import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { IncidenciaTicketService } from '../../../services/sucursal/incidenciaTicket.service';
import { 
  InformacionIncidencia, 
  TicketResponse, 
  ApiResponse,
  Incidencia
} from '../../../models/sucursal/incidenciaTicket.model';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-incident-ticket',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule],
  templateUrl: './incident-ticket.html',
  styleUrl: './incident-ticket.scss'
})
export class IncidentTicket implements OnInit {
[x: string]: any;
  
  // Formulario
  incidenciaForm: FormGroup;
  
  // Estados de carga
  isLoadingTickets = false;
  isSavingIncidencia = false;
  
  // Datos
  tickets: TicketResponse[] = [];
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  
  // Modal
  mostrarModalDetalles = false;
  incidenciaSeleccionada: Incidencia | null = null;
  ticketSeleccionado: TicketResponse | null = null;
  
  // Usuario
  idUsuario: number = 0;
  
  // Columnas de tabla
  displayedColumns: string[] = ['folio', 'vehiculo', 'propietario', 'tipo', 'descripcion', 'fecha', 'resuelto', 'acciones'];

  // Opciones
  tiposIncidencia = [
    { value: 'COMPROBANTE_PERDIDO', label: 'COMPROBANTE PERDIDO' },
    { value: 'FRAUDE', label: 'FRAUDE' },
    { value: 'VEHICULO_NO_RETIRADO', label: 'VEHÍCULO NO RETIRADO' },
    { value: 'OTRO', label: 'OTRO' }
  ];

  tiposEvidencia = [
    { value: 'FOTO_VEHICULO', label: 'FOTOGRAFÍA DEL VEHÍCULO' },
    { value: 'DOCUMENTO', label: 'DOCUMENTO' },
    { value: 'VIDEO', label: 'VIDEO' },
    { value: 'OTRO', label: 'OTRO' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private incidenciaTicketService: IncidenciaTicketService
  ) {
    this.incidenciaForm = this.crearIncidenciaForm();
  }

  ngOnInit(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuario = idUsuarioStr ? parseInt(idUsuarioStr) : 0;
    
    if (this.idUsuario > 0) {
      this.cargarTickets();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario', 'error');
    }
  }

  crearIncidenciaForm(): FormGroup {
    return this.formBuilder.group({
      idTicket: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]],
      tipoIncidencia: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipoEvidencia: ['', [Validators.required]],
      descripcionEvidencia: ['', [Validators.required, Validators.minLength(5)]],
      archivo: ['', [Validators.required]]
    });
  }

  cargarTickets(): void {
    this.isLoadingTickets = true;
    
    this.incidenciaTicketService.obtenerTicketsSucursal(this.idUsuario).subscribe({
      next: (response: TicketResponse[]) => {
        this.isLoadingTickets = false;
        this.tickets = response;
      },
      error: (error: any) => {
        this.isLoadingTickets = false;
        const mensajeError = error.error?.message || 'Error al cargar los tickets';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirODescargarArchivo(url: string, nombreArchivo: string, event: Event): void {
    event.preventDefault();
    window.open(url, '_blank');
  }

  onArchivoSeleccionado(event: any): void {
    const archivo = event.target.files[0];
    
    if (archivo) {
      if (archivo.size > 10485760) {
        this.mostrarMensaje('El archivo no debe superar los 10MB', 'warning');
        this.limpiarArchivo();
        return;
      }

      const tiposPermitidos = [
        // Imágenes
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        // Videos
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime', 'video/x-msvideo',
        // Documentos
        'application/pdf', 
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/plain', // .txt
        // Otros
        'application/zip',
        'application/x-rar-compressed'
      ];
      
      if (!tiposPermitidos.includes(archivo.type)) {
        this.mostrarMensaje('Tipo de archivo no permitido. Consulte los formatos permitidos.', 'warning');
        this.limpiarArchivo();
        return;
      }

      this.archivoSeleccionado = archivo;
      this.nombreArchivo = archivo.name;
      this.incidenciaForm.get('archivo')?.setValue(archivo.name);
    }
  }

  esDocumento(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['doc', 'docx', 'txt'].includes(extension);
  }

  esHojaCalculo(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['xls', 'xlsx'].includes(extension);
  }

  esComprimido(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['zip', 'rar'].includes(extension);
  }

  obtenerIconoTipoArchivo(nombreArchivo: string): string {
    if (this.esImagen(nombreArchivo)) return 'image';
    if (this.esVideo(nombreArchivo)) return 'videocam';
    if (this.esPdf(nombreArchivo)) return 'picture_as_pdf';
    if (this.esDocumento(nombreArchivo)) return 'description';
    if (this.esHojaCalculo(nombreArchivo)) return 'table_chart';
    if (this.esComprimido(nombreArchivo)) return 'folder_zip';
    return 'insert_drive_file';
  }

  obtenerNombreTipoArchivo(nombreArchivo: string): string {
    if (this.esImagen(nombreArchivo)) return 'Imagen';
    if (this.esVideo(nombreArchivo)) return 'Video';
    if (this.esPdf(nombreArchivo)) return 'PDF';
    if (this.esDocumento(nombreArchivo)) return 'Documento';
    if (this.esHojaCalculo(nombreArchivo)) return 'Hoja de Cálculo';
    if (this.esComprimido(nombreArchivo)) return 'Archivo Comprimido';
    return 'Archivo';
}

  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.incidenciaForm.get('archivo')?.setValue('');
    
    // Limpiar el input file
    const fileInput = document.getElementById('archivo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  abrirSelectorArchivo(): void {
    const fileInput = document.getElementById('archivo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  guardarIncidencia(): void {
    if (this.incidenciaForm.valid && this.archivoSeleccionado) {
      this.isSavingIncidencia = true;

      const incidenciaData: InformacionIncidencia = {
        idTicket: Number(this.incidenciaForm.value.idTicket),
        tipoIncidencia: this.incidenciaForm.value.tipoIncidencia,
        descripcion: this.incidenciaForm.value.descripcion.trim(),
        tipoEvidencia: this.incidenciaForm.value.tipoEvidencia,
        descripcionEvidencia: this.incidenciaForm.value.descripcionEvidencia.trim()
      };

      this.incidenciaTicketService.crearIncidenciaTicket(incidenciaData, this.archivoSeleccionado).subscribe({
        next: (response: ApiResponse) => {
          this.isSavingIncidencia = false;
          this.mostrarMensaje(response.message || 'Incidencia creada exitosamente', 'success');
          this.limpiarFormulario();
          this.cargarTickets();
        },
        error: (error: any) => {
          this.isSavingIncidencia = false;
          const mensajeError = error.error?.message || 'Error al crear la incidencia';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      if (!this.archivoSeleccionado) {
        this.mostrarMensaje('Debe seleccionar un archivo de evidencia', 'warning');
      } else {
        this.marcarCamposInvalidos(this.incidenciaForm);
        this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
      }
    }
  }

  limpiarFormulario(): void {
    this.incidenciaForm.reset();
    this.limpiarArchivo();
    
    Object.keys(this.incidenciaForm.controls).forEach(key => {
      const control = this.incidenciaForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  verDetalles(ticket: TicketResponse): void {
    this.ticketSeleccionado = ticket;
    this.incidenciaSeleccionada = ticket.incidencias;
    this.mostrarModalDetalles = true;
  }

  cerrarModal(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalDetalles = false;
    this.incidenciaSeleccionada = null;
    this.ticketSeleccionado = null;
  }

  obtenerNombreTipoIncidencia(tipo: string): string {
    const tipoEncontrado = this.tiposIncidencia.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  obtenerNombreTipoEvidencia(tipo: string): string {
    const tipoEncontrado = this.tiposEvidencia.find(t => t.value === tipo);
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
    if (!fecha) return '';
    
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
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
  }

  esVideo(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['mp4', 'avi', 'mov'].includes(extension);
  }

  esPdf(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return extension === 'pdf';
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