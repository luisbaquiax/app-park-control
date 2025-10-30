import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { IncidenciaTicketService } from '../../../services/empresa/incidenciaTicket.service';
import { 
  IncidenciasSucursalResponse,
  IncidenciasSucursalDTO,
  ResolverIncidenciaRequest,
  ApiResponse,
} from '../../../models/empresa/incidenciaTicket.model';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-company-incident',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule, MatTooltip],
  templateUrl: './incident-resolve.html',
  styleUrl: './incident-resolve.scss'
})
export class IncidentResolve implements OnInit {
  
  // Formulario
  resolucionForm: FormGroup;
  
  // Estados de carga
  isLoadingIncidencias = false;
  isSavingResolucion = false;
  
  // Datos
  sucursalesIncidencias: IncidenciasSucursalResponse[] = [];
  todasLasIncidencias: Array<IncidenciasSucursalDTO & { sucursalInfo: IncidenciasSucursalResponse }> = [];
  
  // Modales
  mostrarModalDetalles = false;
  mostrarModalResolucion = false;
  incidenciaSeleccionada: IncidenciasSucursalDTO | null = null;
  sucursalSeleccionada: IncidenciasSucursalResponse | null = null;
  
  // Usuario
  idUsuario: number = 0;
  
  // Columnas de tabla
  displayedColumns: string[] = ['sucursal', 'folio', 'vehiculo', 'tipo', 'descripcion', 'fecha', 'estado', 'acciones'];

  // Tipos de incidencia
  tiposIncidencia = [
    { value: 'DAÑO_VEHICULO', label: 'Daño al Vehículo' },
    { value: 'ROBO', label: 'Robo' },
    { value: 'ACCIDENTE', label: 'Accidente' },
    { value: 'VANDALISMO', label: 'Vandalismo' },
    { value: 'OTRO', label: 'Otro' }
  ];

  tiposEvidencia = [
    { value: 'FOTOGRAFIA', label: 'Fotografía' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'DOCUMENTO', label: 'Documento' },
    { value: 'OTRO', label: 'Otro' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private incidenciaTicketService: IncidenciaTicketService
  ) {
    this.resolucionForm = this.crearResolucionForm();
  }

  ngOnInit(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuario = idUsuarioStr ? parseInt(idUsuarioStr) : 0;
    
    if (this.idUsuario > 0) {
      this.cargarIncidencias();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario', 'error');
    }
  }

  // ==================== FORMULARIO ====================
  
  crearResolucionForm(): FormGroup {
    return this.formBuilder.group({
      observacionesResolucion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // ==================== CARGAR DATOS ====================
  
  cargarIncidencias(): void {
    this.isLoadingIncidencias = true;
    
    this.incidenciaTicketService.obtenerIncidenciasEmpresa(this.idUsuario).subscribe({
      next: (response: IncidenciasSucursalResponse[]) => {
        this.isLoadingIncidencias = false;
        this.sucursalesIncidencias = response;
        
        // Aplanar incidencias para mostrar en tabla
        this.todasLasIncidencias = [];
        response.forEach(sucursal => {
          sucursal.incidenciasSucursalDTOList.forEach(incidencia => {
            this.todasLasIncidencias.push({
              ...incidencia,
              sucursalInfo: sucursal
            });
          });
        });
      },
      error: (error: any) => {
        this.isLoadingIncidencias = false;
        const mensajeError = error.error?.message || 'Error al cargar las incidencias';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  // ==================== RESOLVER INCIDENCIA ====================
  
  abrirModalResolucion(incidencia: IncidenciasSucursalDTO & { sucursalInfo: IncidenciasSucursalResponse }): void {
    if (incidencia.incidencias.resuelto) {
      this.mostrarMensaje('Esta incidencia ya fue resuelta', 'warning');
      return;
    }
    
    this.incidenciaSeleccionada = incidencia;
    this.sucursalSeleccionada = incidencia.sucursalInfo;
    this.mostrarModalResolucion = true;
  }

  resolverIncidencia(): void {
    if (this.resolucionForm.valid && this.incidenciaSeleccionada) {
      this.isSavingResolucion = true;

      const resolucionData: ResolverIncidenciaRequest = {
        idIncidencia: this.incidenciaSeleccionada.incidencias.idIncidencia,
        idUsuarioResuelve: this.idUsuario,
        observacionesResolucion: this.resolucionForm.value.observacionesResolucion.trim()
      };

      this.incidenciaTicketService.resolverIncidencia(resolucionData).subscribe({
        next: (response: ApiResponse) => {
          this.isSavingResolucion = false;
          this.mostrarMensaje(response.message || 'Incidencia resuelta exitosamente', 'success');
          this.cerrarModalResolucion();
          this.cargarIncidencias();
        },
        error: (error: any) => {
          this.isSavingResolucion = false;
          const mensajeError = error.error?.message || 'Error al resolver la incidencia';
          this.mostrarMensaje(mensajeError, 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos(this.resolucionForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  // ==================== MODALES ====================
  
  verDetalles(incidencia: IncidenciasSucursalDTO & { sucursalInfo: IncidenciasSucursalResponse }): void {
    this.incidenciaSeleccionada = incidencia;
    this.sucursalSeleccionada = incidencia.sucursalInfo;
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
    this.incidenciaSeleccionada = null;
    this.sucursalSeleccionada = null;
  }

  cerrarModalResolucion(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    
    this.mostrarModalResolucion = false;
    this.incidenciaSeleccionada = null;
    this.sucursalSeleccionada = null;
    this.resolucionForm.reset();
  }

  // ==================== UTILIDADES ====================
  
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
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
  }

  esVideo(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['mp4', 'avi', 'mov', 'wmv'].includes(extension);
  }

  esPdf(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return extension === 'pdf';
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

  abrirODescargarArchivo(url: string, nombreArchivo: string, event: Event): void {
    event.preventDefault();
    
    if (this.esPdf(nombreArchivo) || this.esDocumento(nombreArchivo) || 
        this.esHojaCalculo(nombreArchivo) || this.esComprimido(nombreArchivo)) {
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
    return this.esPdf(nombreArchivo) || 
           this.esDocumento(nombreArchivo) || 
           this.esHojaCalculo(nombreArchivo) || 
           this.esComprimido(nombreArchivo);
  }

  obtenerTextoBoton(nombreArchivo: string): string {
    return this.debeDescargar(nombreArchivo) ? 'Descargar' : 'Ver Original';
  }

  obtenerIconoBoton(nombreArchivo: string): string {
    return this.debeDescargar(nombreArchivo) ? 'download' : 'open_in_new';
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