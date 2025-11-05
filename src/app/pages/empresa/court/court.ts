import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { CorteService } from '../../../services/empresa/corte.service';
import {
  CortesResponse,
  CorteCaja,
  DetallePago,
  TransaccionTicket
} from '../../../models/empresa/corte.model';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-court',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTabsModule],
  templateUrl: './court.html',
  styleUrl: './court.scss'
})
export class Court implements OnInit {

  // Estados de carga
  isLoadingCortes = false;
  isLoadingPagos = false;
  isLoadingTransacciones = false;
  isUpdatingPeriodo = false;

  // Datos
  cortesCaja: CorteCaja[] = [];
  detallesPagos: DetallePago[] = [];
  transaccionesTickets: TransaccionTicket[] = [];

  // Modales
  mostrarModalDetallesCorte = false;
  mostrarModalConfirmacion = false;
  corteSeleccionado: CorteCaja | null = null;

  // Usuario empresa
  idUsuarioEmpresa: number = 0;

  // Tab seleccionado
  tabSeleccionado = 0;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private corteService: CorteService
  ) {}

  ngOnInit(): void {
    const idEmpresaStr = sessionStorage.getItem('idUsuario');
    this.idUsuarioEmpresa = idEmpresaStr ? parseInt(idEmpresaStr) : 0;

    if (this.idUsuarioEmpresa > 0) {
      this.cargarCortes();
      this.cargarDetallesPagos();
      this.cargarTransaccionesTickets();
    } else {
      this.mostrarMensaje('No se encontró el ID de empresa', 'error');
    }
  }

  cargarCortes(): void {
    this.isLoadingCortes = true;

    this.corteService.obtenerDetalleCorte(this.idUsuarioEmpresa).subscribe({
      next: (response: CortesResponse) => {
        this.isLoadingCortes = false;
        this.cortesCaja = response.cortesDeCaja;
      },
      error: (error: any) => {
        this.isLoadingCortes = false;
        const mensajeError = error.error?.message || 'Error al cargar los cortes de caja';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarDetallesPagos(): void {
    this.isLoadingPagos = true;

    this.corteService.obtenerDetallePagos(this.idUsuarioEmpresa).subscribe({
      next: (response: DetallePago[]) => {
        this.isLoadingPagos = false;
        this.detallesPagos = response;
      },
      error: (error: any) => {
        this.isLoadingPagos = false;
        const mensajeError = error.error?.message || 'Error al cargar los detalles de pagos';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarTransaccionesTickets(): void {
    this.isLoadingTransacciones = true;

    this.corteService.obtenerTransaccionesTickets(this.idUsuarioEmpresa).subscribe({
      next: (response: TransaccionTicket[]) => {
        this.isLoadingTransacciones = false;
        this.transaccionesTickets = response || [];
      },
      error: (error: any) => {
        this.isLoadingTransacciones = false;
        const mensajeError = error.error?.message || 'Error al cargar las transacciones de tickets';
        this.mostrarMensaje(mensajeError, 'error');
        this.transaccionesTickets = [];
      }
    });
  }

  verDetallesCorte(corte: CorteCaja): void {
    this.corteSeleccionado = corte;
    this.mostrarModalDetallesCorte = true;
  }

  cerrarModalDetallesCorte(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalDetallesCorte = false;
    this.corteSeleccionado = null;
  }

  abrirModalConfirmacion(): void {
    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }

    this.mostrarModalConfirmacion = false;
  }

  actualizarPeriodoCorte(): void {
    this.isUpdatingPeriodo = true;

    this.corteService.actualizarPeriodoCorte(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isUpdatingPeriodo = false;
        this.mostrarMensaje(response.message || 'Periodo de corte actualizado exitosamente', 'success');
        this.cerrarModalConfirmacion();
        this.cargarCortes();
        this.cargarDetallesPagos();
        this.cargarTransaccionesTickets();
      },
      error: (error) => {
        this.isUpdatingPeriodo = false;
        const mensajeError = error.error?.message || 'Error al actualizar el periodo de corte';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
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

  formatearMoneda(valor: string | number): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(numero);
  }

  formatearHoras(horas: string): string {
    const numero = parseFloat(horas);
    return `${numero.toFixed(2)} hrs`;
  }

  obtenerEstadoInfo(estado: string): { text: string; class: string; icon: string } {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return { text: 'Pendiente', class: 'chip-pendiente', icon: 'schedule' };
      case 'PAGADO':
        return { text: 'Pagado', class: 'chip-pagado', icon: 'check_circle' };
      case 'FACTURADO':
        return { text: 'Facturado', class: 'chip-facturado', icon: 'receipt' };
      case 'COMPLETADO':
        return { text: 'Completado', class: 'chip-completado', icon: 'done_all' };
      case 'EXITOSO':
        return { text: 'Exitoso', class: 'chip-exitoso', icon: 'check_circle' };
      case 'FALLIDO':
        return { text: 'Fallido', class: 'chip-fallido', icon: 'error' };
      case 'CANCELADO':
        return { text: 'Cancelado', class: 'chip-cancelado', icon: 'cancel' };
      default:
        return { text: estado, class: 'chip-pendiente', icon: 'help' };
    }
  }

  obtenerClaseEstadoBanner(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE':
        return 'estado-banner-pendiente';
      case 'PAGADO':
      case 'EXITOSO':
        return 'estado-banner-pagado';
      case 'FACTURADO':
        return 'estado-banner-facturado';
      case 'COMPLETADO':
        return 'estado-banner-completado';
      case 'FALLIDO':
      case 'CANCELADO':
        return 'estado-banner-fallido';
      default:
        return 'estado-banner-pendiente';
    }
  }

  contarCortesPorEstado(estado: string): number {
    if (!this.cortesCaja) return 0;
    return this.cortesCaja.filter(c => c.estado.toUpperCase() === estado.toUpperCase()).length;
  }

  contarPagosPorEstado(estado: string): number {
    if (!this.detallesPagos) return 0;
    return this.detallesPagos.filter(p => p.estadoPago.toUpperCase() === estado.toUpperCase()).length;
  }

  contarTransaccionesPorEstado(estado: string): number {
    if (!this.transaccionesTickets || this.transaccionesTickets.length === 0) return 0;
    return this.transaccionesTickets.filter(t => t.estado.toUpperCase() === estado.toUpperCase()).length;
  }

  calcularTotalPagos(): number {
    if (!this.detallesPagos) return 0;
    return this.detallesPagos.reduce((total, pago) => {
      const monto = typeof pago.montoPagado === 'string' ? parseFloat(pago.montoPagado) : pago.montoPagado;
      return total + monto;
    }, 0);
  }

  calcularTotalCortes(): number {
    if (!this.cortesCaja) return 0;
    return this.cortesCaja.reduce((total, corte) => {
      const monto = typeof corte.totalNeto === 'string' ? parseFloat(corte.totalNeto) : corte.totalNeto;
      return total + monto;
    }, 0);
  }

  calcularTotalTransacciones(): number {
    if (!this.transaccionesTickets || this.transaccionesTickets.length === 0) return 0;
    return this.transaccionesTickets.reduce((total, transaccion) => {
      const monto = typeof transaccion.total === 'string' ? parseFloat(transaccion.total) : transaccion.total;
      return total + monto;
    }, 0);
  }

  obtenerMetodoPagoIcono(metodo: string): string {
    const metodoUpper = metodo.toUpperCase();
    switch (metodoUpper) {
      case 'TARJETA':
        return 'credit_card';
      case 'EFECTIVO':
        return 'payments';
      case 'TRANSFERENCIA':
        return 'account_balance';
      case 'PAYPAL':
        return 'account_balance_wallet';
      default:
        return 'payment';
    }
  }

  obtenerTipoCobroIcono(tipo: string): string {
    const tipoUpper = tipo.toUpperCase();
    switch (tipoUpper) {
      case 'HORA':
      case 'HORAS':
        return 'schedule';
      case 'DIA':
      case 'DIAS':
        return 'today';
      case 'FRACCION':
        return 'timer';
      default:
        return 'payments';
    }
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