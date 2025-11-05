import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatTabsModule } from '@angular/material/tabs';
import { GestionarPlanesService } from '../../../services/empresa/gestionarPlanes.service';
import { FlotillaService } from '../../../services/empresa/flotilla.service';
import {
  EmpresaFlotilla,
  PlanCorporativo,
  VehiculoFlotilla,
  NuevaFlotillaRequest,
  NuevoPlanCorporativoRequest,
  SuscribirVehiculoRequest
} from '../../../models/empresa/flotilla.model';
import { PlanesRequest } from '../../../models/empresa/gestionarPlanes.model';

@Component({
  selector: 'app-fleet-management',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTabsModule],
  templateUrl: './flotilla.html',
  styleUrl: './flotilla.scss'
})
export class Flotilla implements OnInit {

  // Estados de carga
  isLoadingEmpresas = false;
  isLoadingVehiculos = false;
  isLoadingPlanes = false;
  isCreatingEmpresa = false;
  isCreatingPlan = false;
  isSuscribiendo = false;
  isCancelando = false;

  // Datos
  empresasFlotilla: EmpresaFlotilla[] = [];
  vehiculosDisponibles: VehiculoFlotilla[] = [];
  planesVigentes: PlanesRequest[] = [];

  // Formularios
  formEmpresa!: FormGroup;
  formPlanCorporativo!: FormGroup;

  // Modales
  mostrarModalVerMas = false;
  mostrarModalSuscribir = false;
  planSeleccionado: PlanCorporativo | null = null;
  empresaSeleccionada: EmpresaFlotilla | null = null;

  // Usuario empresa
  idUsuarioEmpresa: number = 0;

  // Tab seleccionado
  tabSeleccionado = 0;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private flotillaService: FlotillaService,
    private gestinarPlanes: GestionarPlanesService
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    const idEmpresaStr = sessionStorage.getItem('idUsuario');
    this.idUsuarioEmpresa = idEmpresaStr ? parseInt(idEmpresaStr) : 0;

    if (this.idUsuarioEmpresa > 0) {
      this.cargarPlanesVigentes();
      this.cargarVehiculosDisponibles();
      this.cargarEmpresasFlotilla();
    } else {
      this.mostrarMensaje('No se encontró el ID de empresa', 'error');
    }
  }

  inicializarFormularios(): void {
    // Formulario para crear empresa flotilla
    this.formEmpresa = this.fb.group({
      nombreEmpresa: ['', [Validators.required, Validators.minLength(3)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.pattern(/^[0-9-]+$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]+$/)]],
      correoContacto: ['', [Validators.required, Validators.email]],
      direccion: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Formulario para crear plan corporativo con validador de fechas
    this.formPlanCorporativo = this.fb.group({
      idEmpresaFlotilla: ['', Validators.required],
      idTipoPlan: ['', Validators.required],
      nombrePlanCorporativo: ['', [Validators.required, Validators.minLength(3)]],
      numeroPlacasContratadas: ['', [Validators.required, Validators.min(1)]],
      descuentoCorporativoAdicional: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      precioPlanCorporativo: ['', [Validators.required, Validators.min(0)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    }, { validators: this.validadorFechas() });
  }

  private validadorFechas() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control as FormGroup;
      const fechaInicio = formGroup.get('fechaInicio')?.value;
      const fechaFin = formGroup.get('fechaFin')?.value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (inicio < hoy) {
        formGroup.get('fechaInicio')?.setErrors({ 
          fechaPasada: true 
        });
        return { fechaPasada: true };
      }

      if (fin < hoy) {
        formGroup.get('fechaFin')?.setErrors({ 
          fechaPasada: true 
        });
        return { fechaPasada: true };
      }

      if (inicio > fin) {
        formGroup.get('fechaFin')?.setErrors({ 
          fechaFinMenor: true 
        });
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

  cargarPlanesVigentes(): void {
    this.isLoadingPlanes = true;

    this.gestinarPlanes.obtenerPlanesVigentes(this.idUsuarioEmpresa).subscribe({
      next: (response: PlanesRequest[]) => {
        this.isLoadingPlanes = false;
        // Filtrar por VIGENTE en lugar de 'S'
        this.planesVigentes = response.filter(plan => plan.activo === 'VIGENTE');
        console.log('Planes vigentes cargados:', this.planesVigentes); // Para debug
      },
      error: (error: any) => {
        this.isLoadingPlanes = false;
        const mensajeError = error.error?.message || 'Error al cargar los planes vigentes';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarVehiculosDisponibles(): void {
    this.isLoadingVehiculos = true;

    this.flotillaService.getVehiculosFlotilla().subscribe({
      next: (response: VehiculoFlotilla[]) => {
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

  cargarEmpresasFlotilla(): void {
    this.isLoadingEmpresas = true;

    this.flotillaService.getEmpresasFlotillaDetalle(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingEmpresas = false;
        this.empresasFlotilla = response.empresasFlotilla;
      },
      error: (error: any) => {
        this.isLoadingEmpresas = false;
        const mensajeError = error.error?.message || 'Error al cargar las empresas flotilla';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }
  
  crearEmpresaFlotilla(): void {
    if (this.formEmpresa.invalid) {
      this.formEmpresa.markAllAsTouched();
      this.mostrarMensaje('Por favor complete todos los campos correctamente', 'warning');
      return;
    }

    this.isCreatingEmpresa = true;
    const data: NuevaFlotillaRequest = this.formEmpresa.value;

    this.flotillaService.crearEmpresaFlotilla(data).subscribe({
      next: (response) => {
        this.isCreatingEmpresa = false;
        this.mostrarMensaje(response.message || 'Empresa flotilla creada exitosamente', 'success');
        this.formEmpresa.reset();
        this.cargarEmpresasFlotilla();
      },
      error: (error) => {
        this.isCreatingEmpresa = false;
        const mensajeError = error.error?.message || 'Error al crear la empresa flotilla';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  crearPlanCorporativo(): void {
    if (this.formPlanCorporativo.invalid) {
      this.formPlanCorporativo.markAllAsTouched();
      this.mostrarMensaje('Por favor complete todos los campos correctamente', 'warning');
      return;
    }

    this.isCreatingPlan = true;
    const formData = this.formPlanCorporativo.value;

    const data: NuevoPlanCorporativoRequest = {
      idEmpresaFlotilla: formData.idEmpresaFlotilla,
      idTipoPlan: formData.idTipoPlan,
      nombrePlanCorporativo: formData.nombrePlanCorporativo,
      numeroPlacasContratadas: formData.numeroPlacasContratadas,
      descuentoCorporativoAdicional: formData.descuentoCorporativoAdicional,
      precioPlanCorporativo: formData.precioPlanCorporativo,
      fechaInicio: this.formatearFechaParaEnvio(formData.fechaInicio),
      fechaFin: this.formatearFechaParaEnvio(formData.fechaFin),
      idCreadoPor: this.idUsuarioEmpresa
    };

    console.log('Datos a enviar:', data); // Para debug

    this.flotillaService.crearPlanCorporativo(data).subscribe({
      next: (response) => {
        this.isCreatingPlan = false;
        this.mostrarMensaje(response.message || 'Plan corporativo creado exitosamente', 'success');
        this.formPlanCorporativo.reset();
        this.cargarEmpresasFlotilla();
      },
      error: (error) => {
        this.isCreatingPlan = false;
        const mensajeError = error.error?.message || 'Error al crear el plan corporativo';
        this.mostrarMensaje(mensajeError, 'error');
        console.error('Error completo:', error); // Para debug
      }
    });
  }

  activarPlanCorporativo(idPlanCorporativo: number): void {
    this.flotillaService.activarPlanCorporativo(idPlanCorporativo).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message || 'Plan corporativo activado exitosamente', 'success');
        this.cargarEmpresasFlotilla();
      },
      error: (error) => {
        const mensajeError = error.error?.message || 'Error al activar el plan corporativo';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  desactivarPlanCorporativo(idPlanCorporativo: number): void {
    this.flotillaService.desactivarPlanCorporativo(idPlanCorporativo).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message || 'Plan corporativo desactivado exitosamente', 'success');
        this.cargarEmpresasFlotilla();
      },
      error: (error) => {
        const mensajeError = error.error?.message || 'Error al desactivar el plan corporativo';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  suscribirVehiculo(idVehiculo: number): void {
    if (!this.planSeleccionado) return;

    this.isSuscribiendo = true;
    const data: SuscribirVehiculoRequest = {
      idPlanCorporativo: this.planSeleccionado.idPlanCorporativo,
      idVehiculo: idVehiculo
    };

    this.flotillaService.suscribirVehiculo(data).subscribe({
      next: (response) => {
        this.isSuscribiendo = false;
        this.mostrarMensaje(response.message || 'Vehículo suscrito exitosamente', 'success');
        this.cargarEmpresasFlotilla();
        this.cerrarModalSuscribir();
        this.cerrarModalVerMas();
      },
      error: (error) => {
        this.isSuscribiendo = false;
        const mensajeError = error.error?.message || 'Error al suscribir el vehículo';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cancelarSuscripcionVehiculo(idSuscripcionFlotilla: number): void {
    this.isCancelando = true;

    this.flotillaService.cancelarSuscripcionVehiculo(idSuscripcionFlotilla).subscribe({
      next: (response) => {
        this.isCancelando = false;
        this.mostrarMensaje(response.message || 'Suscripción cancelada exitosamente', 'success');
        this.cargarEmpresasFlotilla();
        this.cerrarModalVerMas();
        
        if (this.planSeleccionado) {
          const empresa = this.empresasFlotilla.find(e => 
            e.planesCorporativos.some(p => p.idPlanCorporativo === this.planSeleccionado?.idPlanCorporativo)
          );
          if (empresa) {
            const plan = empresa.planesCorporativos.find(p => 
              p.idPlanCorporativo === this.planSeleccionado?.idPlanCorporativo
            );
            if (plan) {
              this.planSeleccionado = plan;
            }
          }
        }
      },
      error: (error) => {
        this.isCancelando = false;
        const mensajeError = error.error?.message || 'Error al cancelar la suscripción';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  abrirModalVerMas(plan: PlanCorporativo, empresa: EmpresaFlotilla): void {
    this.planSeleccionado = plan;
    this.empresaSeleccionada = empresa;
    this.mostrarModalVerMas = true;
  }

  cerrarModalVerMas(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    this.mostrarModalVerMas = false;
    this.planSeleccionado = null;
    this.empresaSeleccionada = null;
  }

  abrirModalSuscribir(): void {
    this.mostrarModalSuscribir = true;
  }

  cerrarModalSuscribir(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    this.mostrarModalSuscribir = false;
  }

  obtenerVehiculosNoSuscritos(): VehiculoFlotilla[] {
    if (!this.planSeleccionado) return this.vehiculosDisponibles;

    const idsVehiculosSuscritos = this.planSeleccionado.suscripcionesVehiculos
      .filter(s => s.estado === 'ACTIVA')
      .map(s => {
        const vehiculo = this.vehiculosDisponibles.find(v => v.placa === s.placaVehiculo);
        return vehiculo?.idVehiculo || -1;
      });

    return this.vehiculosDisponibles.filter(v => !idsVehiculosSuscritos.includes(v.idVehiculo));
  }

  obtenerNombrePlan(idTipoPlan: number): string {
    const plan = this.planesVigentes.find(p => p.id === idTipoPlan);
    return plan ? plan.nombrePlan : 'Plan Desconocido';
  }

  obtenerEmpresasActivas(): EmpresaFlotilla[] {
    return this.empresasFlotilla.filter(e => e.estado === 'ACTIVA');
  }

  contarPlanesPorEstado(estado: string): number {
    return this.empresasFlotilla.reduce((total, empresa) => {
      return total + empresa.planesCorporativos.filter(p => p.estado === estado).length;
    }, 0);
  }

  contarVehiculosSuscritos(): number {
    return this.empresasFlotilla.reduce((total, empresa) => {
      return total + empresa.planesCorporativos.reduce((subtotal, plan) => {
        return subtotal + plan.suscripcionesVehiculos.filter(s => s.estado === 'ACTIVA').length;
      }, 0);
    }, 0);
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
        day: 'numeric'
      };

      return fechaObj.toLocaleDateString('es-GT', opciones);
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  formatearFechaParaEnvio(fecha: string | Date): string {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      fechaObj = new Date(fecha);
    } else {
      fechaObj = fecha;
    }
    
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  formatearMoneda(valor: string | number): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(numero);
  }

  obtenerEstadoInfo(estado: string): { text: string; class: string; icon: string } {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'ACTIVA':
      case 'ACTIVO':
        return { text: 'Activo', class: 'chip-activo', icon: 'check_circle' };
      case 'INACTIVA':
      case 'INACTIVO':
        return { text: 'Inactivo', class: 'chip-inactivo', icon: 'cancel' };
      case 'SUSPENDIDA':
      case 'SUSPENDIDO':
        return { text: 'Suspendido', class: 'chip-suspendido', icon: 'pause_circle' };
      default:
        return { text: estado, class: 'chip-pendiente', icon: 'help' };
    }
  }

  obtenerIconoTipoVehiculo(tipo: string): string {
    switch (tipo) {
      case 'DOS_RUEDAS':
        return 'two_wheeler';
      case 'CUATRO_RUEDAS':
        return 'directions_car';
      default:
        return 'commute';
    }
  }

  contarVehiculosActivos(plan: PlanCorporativo): number {
    if (!plan.suscripcionesVehiculos) return 0;
    return plan.suscripcionesVehiculos.filter(s => s.estado === 'ACTIVA').length;
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