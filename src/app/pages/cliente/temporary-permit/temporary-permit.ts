import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { SuscripcionService } from '../../../services/cliente/suscripcion.service';
import {
  PermisoTemporalResponse,
  SucursalPermiso,
  SuscripcionCliente
} from '../../../models/cliente/placaTemporal.model';

@Component({
  selector: 'app-temporary-permit',
  standalone: true,
  imports: [...COMMON_IMPORTS],
  templateUrl: './temporary-permit.html',
  styleUrl: './temporary-permit.scss'
})
export class TemporaryPermit implements OnInit {

  // Estados de carga
  isLoadingPermisos = false;

  // Datos
  permisos: PermisoTemporalResponse[] = [];

  // Modales
  mostrarModalDetalles = false;
  permisoSeleccionado: PermisoTemporalResponse | null = null;

  // Usuario
  idCliente: number = 0;

  constructor(
    private snackBar: MatSnackBar,
    private suscripcionService: SuscripcionService
  ) {}

  ngOnInit(): void {
    const idClienteStr = sessionStorage.getItem('idUsuario');
    this.idCliente = idClienteStr ? parseInt(idClienteStr) : 0;

    if (this.idCliente > 0) {
      this.cargarPermisos();
    } else {
      this.mostrarMensaje('No se encontró el ID de cliente', 'error');
    }
  }

  // ==================== CARGAR DATOS ====================

  cargarPermisos(): void {
    this.isLoadingPermisos = true;

    this.suscripcionService.obtenerPermisosTemporales(this.idCliente).subscribe({
      next: (response: PermisoTemporalResponse[]) => {
        this.isLoadingPermisos = false;
        this.permisos = response;
      },
      error: (error: any) => {
        this.isLoadingPermisos = false;
        const mensajeError = error.error?.message || 'Error al cargar los permisos temporales';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  // ==================== MODALES ====================

  verDetalles(permiso: PermisoTemporalResponse): void {
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

  // ==================== UTILIDADES ====================

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
    return this.permisos.filter(p => p.estado.toUpperCase() === estado.toUpperCase()).length;
  }

  estaAprobadoOActivo(estado: string): boolean {
    const estadoUpper = estado.toUpperCase();
    return estadoUpper === 'ACTIVO' || estadoUpper === 'EXPIRADO' || estadoUpper === 'AGOTADO' || estadoUpper === 'REVOCADO';
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