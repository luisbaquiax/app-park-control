import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuscripcionService } from '../../../services/cliente/suscripcion.service';
import { 
  CompraSuscripcionRequest, 
  RenovacionSuscripcionRequest,
  SuscripcionResponse,
  EmpresaSuscripcion,
  SuscripcionActivaResponse,
  SuscripcionCliente,
  VehiculoResponse,
  Suscripcion,
  ResponseSuscripcion
} from '../../../models/cliente/sucursal.model';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss'
})
export class Subscription implements OnInit {
  // Control de estados
  isLoading = false;
  isLoadingSuscripciones = false;
  isLoadingActivas = false;
  isLoadingVehiculos = false;
  
  // Datos
  empresasSuscripciones: EmpresaSuscripcion[] = [];
  suscripcionesActivas: SuscripcionCliente[] = [];
  vehiculos: VehiculoResponse[] = [];
  
  // ID del cliente
  idCliente: number;
  
  // Modales
  mostrarModalCompra = false;
  mostrarModalRenovacion = false;
  
  // Suscripción y empresa seleccionadas
  suscripcionSeleccionada: Suscripcion | null = null;
  empresaSeleccionada: EmpresaSuscripcion | null = null;
  suscripcionActivaSeleccionada: SuscripcionCliente | null = null;
  
  // Formularios
  compraForm: FormGroup;
  renovacionForm: FormGroup;
  
  // Opciones de formulario
  periodos = [
    { value: 'MENSUAL', label: 'Mensual' },
    { value: 'ANUAL', label: 'Anual' }
  ];
  
  metodosPago = [
    { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
    { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
    { value: 'TRANSFERENCIA_BANCARIA', label: 'Transferencia Bancaria' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'OTRO', label: 'Otro' }
  ];

  constructor(private fb: FormBuilder, private suscripcionService: SuscripcionService, private snackBar: MatSnackBar) {
    this.idCliente = Number(sessionStorage.getItem('idUsuario')) || 0;
    this.compraForm = this.fb.group({
      idVehiculo: [null, Validators.required],
      periodoContratado: [null, Validators.required],
      metodoPago: [null, Validators.required]
    });
    this.renovacionForm = this.fb.group({
      nuevoPeriodoContratado: [null, Validators.required],
      metodoPago: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarSuscripcionesEmpresas();
    this.cargarSuscripcionesActivas();
    this.cargarVehiculos();
  }

  cargarSuscripcionesEmpresas(): void {
    this.isLoadingSuscripciones = true;
    this.suscripcionService.obtenerSuscripcionesEmpresas().subscribe({
      next: (response: SuscripcionResponse) => {
        this.empresasSuscripciones = response.empresasSuscripciones;
        this.isLoadingSuscripciones = false;
      },
      error: (error) => {
        console.error('Error al cargar suscripciones:', error);
        this.isLoadingSuscripciones = false;
      }
    });
  }
  
  cargarSuscripcionesActivas(): void {
    this.isLoadingActivas = true;
    this.suscripcionService.obtenerSuscripcionesActivasCliente(this.idCliente).subscribe({
      next: (response: SuscripcionActivaResponse) => {
        this.suscripcionesActivas = response.suscripcionCliente;
        this.isLoadingActivas = false;
      },
      error: (error) => {
        console.error('Error al cargar suscripciones activas:', error);
        this.isLoadingActivas = false;
      }
    });
  }
  
  cargarVehiculos(): void {
    this.isLoadingVehiculos = true;
    this.suscripcionService.obtenerVehiculos(this.idCliente).subscribe({
      next: (vehiculos: VehiculoResponse[]) => {
        this.vehiculos = vehiculos;
        this.isLoadingVehiculos = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.isLoadingVehiculos = false;
      }
    });
  }

  abrirModalCompra(suscripcion: Suscripcion, empresa: EmpresaSuscripcion): void {
    this.suscripcionSeleccionada = suscripcion;
    this.empresaSeleccionada = empresa;
    this.mostrarModalCompra = true;
    
    this.compraForm.patchValue({
      idVehiculo: null,
      periodoContratado: null,
      metodoPago: null
    });
    this.compraForm.markAsPristine();
    this.compraForm.markAsUntouched();
  }
  
  cerrarModalCompra(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModalCompra = false;
    this.suscripcionSeleccionada = null;
    this.empresaSeleccionada = null;
    this.compraForm.reset();
  }
  
  comprarSuscripcion(): void {
    if (this.compraForm.invalid || !this.suscripcionSeleccionada || !this.empresaSeleccionada) {
      this.compraForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.compraForm.value;
    const numeroTransaccion = this.generarNumeroTransaccion();
    
    const request: CompraSuscripcionRequest = {
      idCliente: this.idCliente,
      idVehiculo: formValue.idVehiculo,
      idEmpresa: this.empresaSeleccionada.idEmpresa,
      idTipoPlanSuscripcion: this.suscripcionSeleccionada.id,
      periodoContratado: formValue.periodoContratado,
      metodoPago: formValue.metodoPago,
      numeroTransaccion: numeroTransaccion
    };

    this.isLoading = true;
    this.suscripcionService.comprarSuscripcion(request).subscribe({
      next: (response: ResponseSuscripcion) => {
        this.isLoading = false;
        this.mostrarMensaje(response.message, 'success');
        this.cerrarModalCompra();
        this.cargarSuscripcionesActivas();
      },
      error: (error) => {
        const mensajeError = error.error?.message || 'Error al comprar suscripción';
        this.mostrarMensaje(mensajeError, 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModalRenovacion(suscripcion: SuscripcionCliente): void {
    this.suscripcionActivaSeleccionada = suscripcion;
    this.mostrarModalRenovacion = true;
    this.renovacionForm.reset();
  }
  
  cerrarModalRenovacion(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModalRenovacion = false;
    this.suscripcionActivaSeleccionada = null;
    this.renovacionForm.reset();
  }
  
  renovarSuscripcion(): void {
    if (this.renovacionForm.invalid || !this.suscripcionActivaSeleccionada) {
      this.renovacionForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.renovacionForm.value;
    const numeroTransaccion = this.generarNumeroTransaccion();
    
    const request: RenovacionSuscripcionRequest = {
      idSuscripcion: this.suscripcionActivaSeleccionada.idSuscripcion,
      nuevoPeriodoContratado: formValue.nuevoPeriodoContratado,
      metodoPago: formValue.metodoPago,
      numeroTransaccion: numeroTransaccion
    };
    
    this.isLoading = true;
    this.suscripcionService.renovarSuscripcion(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cerrarModalRenovacion();
        this.cargarSuscripcionesActivas();
        this.mostrarMensaje(response.message, 'success');
      },
      error: (error) => {
        const mensajeError = error.error?.message || 'Error al renovar suscripción';
        this.mostrarMensaje(mensajeError, 'error');
        this.isLoading = false;
      }
    });
  }

  generarNumeroTransaccion(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TRX-${timestamp}-${random}`;
  }
  
  estaProximoAVencer(fechaFin: string): boolean {
    const fechaFinDate = new Date(fechaFin);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaFinDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes > 0;
  }
  
  diasRestantes(fechaFin: string): number {
    const fechaFinDate = new Date(fechaFin);
    const hoy = new Date();
    return Math.ceil((fechaFinDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
  
  formatearFechaLegible(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-GT', { 
      style: 'currency', 
      currency: 'GTQ' 
    }).format(precio);
  }
  
  getEstadoColor(estado: string): string {
    switch(estado.toUpperCase()) {
      case 'ACTIVA':
      case 'ACTIVO':
        return 'chip-activo';
      case 'INACTIVA':
      case 'INACTIVO':
        return 'chip-inactivo';
      case 'PENDIENTE':
        return 'chip-pendiente';
      case 'VENCIDA':
        return 'chip-vencida';
      default:
        return '';
    }
  }
  
  getIconoVehiculo(tipo: string): string {
    return tipo === 'DOS_RUEDAS' ? 'two_wheeler' : 'directions_car';
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
