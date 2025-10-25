import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionarPlanesService } from '../../../services/empresa/gestionarPlanes.service';
import { CrearPlanRequest, EditarPlanRequest, PlanesRequest } from '../../../models/empresa/gestionarPlanes.model';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChip } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionarEmpresaService } from '../../../services/empresa/gestionarEmpresa.service';
import { InformacionEmpresaResponse } from '../../../models/empresa/gestionarEmpresa.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [...COMMON_IMPORTS,
    MatTableModule,
    MatButtonModule,
    MatTabGroup,
    MatTab,
    MatChip
  ],
  templateUrl: './plan-management.html',
  styleUrl: './plan-management.scss'
})
export class PlanManagement implements OnInit {
  // Control de estados
  planes: PlanesRequest[] = [];
  planForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isLoadingPlanes = false;
  mostrarModalConfirmacion = false;
  mostrarModalDetalles = false;
  selectedPlan: PlanesRequest | null = null;
  selectedTabIndex = 0;
  
  // IDs del sistema
  idUsuario = Number(sessionStorage.getItem('idUsuario'));
  idEmpresa = Number(sessionStorage.getItem('idEmpresa'));
  
  // Información de la empresa
  informacionEmpresa: InformacionEmpresaResponse | null = null;
  
  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigoPlan',
    'nombrePlan', 
    'precioPlan', 
    'horasMensuales', 
    'vigencia', 
    'estado', 
    'acciones'
  ];

  // Opciones de tipos de plan
  tiposPlan = [
    { value: 'FULL_ACCESS', label: 'Full Access' },
    { value: 'WORKWEEK', label: 'Workweek' },
    { value: 'OFFICE_LIGHT', label: 'Office Light' },
    { value: 'DIARIO_FLEXIBLE', label: 'Diario Flexible' },
    { value: 'NOCTURNO', label: 'Nocturno' }
  ];

  // Opciones de días
  diasSemana = [
    { value: 'L', label: 'Lunes' },
    { value: 'M', label: 'Martes' },
    { value: 'Mi', label: 'Miércoles' },
    { value: 'J', label: 'Jueves' },
    { value: 'V', label: 'Viernes' },
    { value: 'S', label: 'Sábado' },
    { value: 'D', label: 'Domingo' }
  ];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private gestionarEmpresaService: GestionarEmpresaService, private gestionarPlanesService: GestionarPlanesService) {
    this.planForm = this.fb.group({
      nombrePlan: ['', Validators.required],
      codigoPlan: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioPlan: ['', [Validators.required, Validators.min(0)]],
      horasMensuales: ['', [Validators.required, Validators.min(1)]],
      diasAplicables: [[], Validators.required],
      coberturaHoraria: ['', Validators.required],
      descuentoMensual: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      descuentoAnualAdicional: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaVigenciaInicio: ['', Validators.required],
      fechaVigenciaFin: ['', Validators.required]
    }, { 
      validators: this.validadorFechas() 
    });
  }

  ngOnInit(): void {
    this.cargarPlanes();
  }
  
  private validadorFechas() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control as FormGroup;
      const fechaInicio = formGroup.get('fechaVigenciaInicio')?.value;
      const fechaFin = formGroup.get('fechaVigenciaFin')?.value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (inicio < hoy) {
        formGroup.get('fechaVigenciaInicio')?.setErrors({ 
          fechaPasada: true 
        });
        return { fechaPasada: true };
      }

      if (fin < hoy) {
        formGroup.get('fechaVigenciaFin')?.setErrors({ 
          fechaPasada: true 
        });
        return { fechaPasada: true };
      }

      if (inicio > fin) {
        formGroup.get('fechaVigenciaFin')?.setErrors({ 
          fechaFinMenor: true 
        });
        return { fechaFinMenor: true };
      }

      const errorInicio = formGroup.get('fechaVigenciaInicio')?.errors;
      if (errorInicio && (errorInicio['fechaPasada'] || errorInicio['fechaFinMenor'])) {
        delete errorInicio['fechaPasada'];
        delete errorInicio['fechaFinMenor'];
        formGroup.get('fechaVigenciaInicio')?.setErrors(
          Object.keys(errorInicio).length > 0 ? errorInicio : null
        );
      }

      const errorFin = formGroup.get('fechaVigenciaFin')?.errors;
      if (errorFin && (errorFin['fechaPasada'] || errorFin['fechaFinMenor'])) {
        delete errorFin['fechaPasada'];
        delete errorFin['fechaFinMenor'];
        formGroup.get('fechaVigenciaFin')?.setErrors(
          Object.keys(errorFin).length > 0 ? errorFin : null
        );
      }

      return null;
    };
  }

  private cargarPlanes(): void {    
    this.isLoadingPlanes = true;

    this.gestionarPlanesService.obtenerPlanesVigentes(this.idUsuario).subscribe({
      next: (planes) => {
        this.planes = planes;
        this.isLoadingPlanes = false;
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
        this.mostrarMensaje('Error al cargar los planes', 'error');
        this.isLoadingPlanes = false;
      }
    });
  }

  private convertirDiasAArray(dias: string): string[] {
    if (!dias) return [];
    return dias.split('-').filter(d => d.length > 0);
  }

  private convertirArrayADias(dias: string[]): string {
    if (!dias || dias.length === 0) return '';
    return dias.join('-');
  }

  obtenerNombresDias(dias: string): string {
    const diasArray = this.convertirDiasAArray(dias);
    return diasArray.map(d => {
      const dia = this.diasSemana.find(ds => ds.value === d);
      return dia ? dia.label : d;
    }).join(', ');
  }
  
  enviarFormulario(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.mostrarModalConfirmacion = true;
    } else {
      this.crearPlan();
    }
  }

  crearPlan(): void {
    const formValue = this.planForm.value;
    
    const fechaInicio = formValue.fechaVigenciaInicio instanceof Date 
      ? formValue.fechaVigenciaInicio.toISOString().split('T')[0]
      : formValue.fechaVigenciaInicio;
    
    const fechaFin = formValue.fechaVigenciaFin instanceof Date
      ? formValue.fechaVigenciaFin.toISOString().split('T')[0]
      : formValue.fechaVigenciaFin;

    const request: CrearPlanRequest = {
      idEmpresa: this.idEmpresa,
      nombrePlan: formValue.nombrePlan,
      codigoPlan: formValue.codigoPlan,
      descripcion: formValue.descripcion,
      precioPlan: formValue.precioPlan.toString(),
      horasMensuales: formValue.horasMensuales,
      diasAplicables: this.convertirArrayADias(formValue.diasAplicables),
      coberturaHoraria: formValue.coberturaHoraria,
      descuentoMensual: formValue.descuentoMensual,
      descuentoAnualAdicional: formValue.descuentoAnualAdicional,
      fechaVigenciaInicio: fechaInicio,
      fechaVigenciaFin: fechaFin,
      idUsuarioCreacion: this.idUsuario
    };

    this.isLoading = true;
    this.gestionarPlanesService.crearPlan(request).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message, 'success');
        this.isLoading = false;
        this.limpiarFormulario();
        this.cargarPlanes();
      },
      error: (error) => {
        const mensajeError = error?.error?.message || 'Error inesperado en el servidor';
        this.mostrarMensaje(mensajeError, 'error');
        this.isLoading = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.planForm.reset({
      descuentoMensual: 0,
      descuentoAnualAdicional: 0,
      diasAplicables: []
    });
    this.planForm.markAsUntouched();
    this.isEditMode = false;
    this.selectedPlan = null;
  }
  
  prepararEdicion(plan: PlanesRequest): void {
    this.selectedPlan = plan;
    this.isEditMode = true;
    
    this.planForm.patchValue({
      nombrePlan: plan.nombrePlan,
      codigoPlan: plan.codigoPlan,
      descripcion: plan.descripcion,
      precioPlan: plan.precioPlan,
      horasMensuales: plan.horasMensuales,
      diasAplicables: this.convertirDiasAArray(plan.diasAplicables),
      coberturaHoraria: plan.coberturaHoraria,
      descuentoMensual: plan.configuracionDescuento.descuentoMensual,
      descuentoAnualAdicional: plan.configuracionDescuento.descuentoAnualAdicional,
      fechaVigenciaInicio: new Date(plan.configuracionDescuento.fechaVigenciaInicio),
      fechaVigenciaFin: new Date(plan.configuracionDescuento.fechaVigenciaFin)
    });

    this.selectedTabIndex = 0;
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.selectedTabIndex = 1;
  }

  cerrarModalConfirmacion(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModalConfirmacion = false;
  }

  confirmarYEditarPlan(): void {
    this.cerrarModalConfirmacion();
    this.editarPlan();
  }

  editarPlan(): void {
    if (!this.selectedPlan) return;

    const formValue = this.planForm.value;
    
    const fechaInicio = formValue.fechaVigenciaInicio instanceof Date 
      ? formValue.fechaVigenciaInicio.toISOString().split('T')[0]
      : formValue.fechaVigenciaInicio;
    
    const fechaFin = formValue.fechaVigenciaFin instanceof Date
      ? formValue.fechaVigenciaFin.toISOString().split('T')[0]
      : formValue.fechaVigenciaFin;

    const request: EditarPlanRequest = {
      idTipoPlan: this.selectedPlan.id,
      idEmpresa: this.idEmpresa,
      nombrePlan: formValue.nombrePlan,
      codigoPlan: formValue.codigoPlan,
      descripcion: formValue.descripcion,
      precioPlan: formValue.precioPlan,
      horasMensuales: formValue.horasMensuales,
      diasAplicables: this.convertirArrayADias(formValue.diasAplicables),
      coberturaHoraria: formValue.coberturaHoraria,
      descuentoMensual: formValue.descuentoMensual,
      descuentoAnualAdicional: formValue.descuentoAnualAdicional,
      fechaVigenciaInicio: fechaInicio,
      fechaVigenciaFin: fechaFin,
      idUsuarioCreacion: this.idUsuario
    };

    this.isLoading = true;
    this.gestionarPlanesService.editarPlan(request).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message, 'success');
        this.isLoading = false;
        this.limpiarFormulario();
        this.cargarPlanes();
        this.selectedTabIndex = 1;
      },
      error: (error) => {
        this.mostrarMensaje('Error al actualizar el plan', 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModalDetalles(plan: PlanesRequest): void {
    this.selectedPlan = plan;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarModalDetalles = false;
    this.selectedPlan = null;
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

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-GT', { 
      style: 'currency', 
      currency: 'GTQ' 
    }).format(precio);
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
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