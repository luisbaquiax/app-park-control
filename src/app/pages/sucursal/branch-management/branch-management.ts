import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { GestionarSucursalService } from '../../../services/sucursal/gestionSucursal.service';
import { 
  SucursalDetalleResponse, 
  SucursalUpdateRequest, 
  TarifaSucursalCreateRequest, 
  TarifaSucursalResponse, 
  TarifaSucursalUpdateRequest,
  ApiResponse 
} from '../../../models/sucursal/gestionSucursal.model';
import { departamentosMunicipios, Departamento, Municipio } from '../../../models/extras/ubicacion.model';
import { MatChip } from '@angular/material/chips';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [...COMMON_IMPORTS,
    MatTableModule,
    MatChip,
    MatTabGroup,
    MatTab
  ],
  templateUrl: './branch-management.html',
  styleUrl: './branch-management.scss'
})
export class BranchManagement implements OnInit {
  sucursalForm: FormGroup;
  tarifaForm: FormGroup;
  
  isLoadingSucursal = false;
  isLoadingTarifas = false;
  isSavingSucursal = false;
  isSavingTarifa = false;

  // Control fecha
  fechaMinima: string = '';
  
  // Datos de la sucursal
  sucursalActual: SucursalDetalleResponse | null = null;
  idUsuario: number = 0;
  
  // Tarifas
  tarifas: TarifaSucursalResponse[] = [];
  tarifaEditando: TarifaSucursalResponse | null = null;
  modoEdicion = false;
  
  // Ubicación
  departamentos: Departamento[] = [];
  municipiosFiltrados: Municipio[] = [];
  
  // Columnas para tabla de tarifas
  displayedColumns: string[] = ['precio', 'moneda', 'vigenciaInicio', 'vigenciaFin', 'estado', 'acciones'];

  // Estados disponibles
  estadosSucursal = ['ACTIVA', 'INACTIVA', 'MANTENIMIENTO'];
  estadosTarifa = ['VIGENTE', 'PROGRAMADO', 'HISTORICO'];
  monedas = ['GTQ', 'USD'];

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private gestionarSucursalService: GestionarSucursalService) {
    this.fechaMinima = this.obtenerFechaActual();
    this.sucursalForm = this.crearSucursalForm();
    this.tarifaForm = this.crearTarifaForm();
    this.cargarDepartamentos();
  }

  ngOnInit(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuario = idUsuarioStr ? parseInt(idUsuarioStr) : 0;
    
    if (this.idUsuario > 0) {
      this.cargarDatosSucursal();
      this.cargarTarifas();
    } else {
      this.mostrarMensaje('No se encontró el ID de usuario', 'error');
    }
  }

  crearSucursalForm(): FormGroup {
    return this.formBuilder.group({
      idSucursal: [''],
      nombreSucursal: ['', [Validators.required, Validators.minLength(3)]],
      direccionCompletaSucursal: ['', [Validators.required, Validators.minLength(10)]],
      departamentoSucursal: ['', [Validators.required]],
      ciudadSucursal: ['', [Validators.required]],
      horaApertura: ['', [Validators.required]],
      horaCierre: ['', [Validators.required]],
      capacidad2Ruedas: ['', [Validators.required, Validators.min(1)]],
      capacidad4Ruedas: ['', [Validators.required, Validators.min(1)]],
      latitud: ['', [Validators.required]],
      longitud: ['', [Validators.required]],
      telefonoContactoSucursal: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      correoContactoSucursal: ['', [Validators.email]],
      estadoSucursal: ['ACTIVA', [Validators.required]]
    });
  }

  crearTarifaForm(): FormGroup {
    const form = this.formBuilder.group({
      idTarifaSucursal: [''],
      precioPorHora: ['', [Validators.required, Validators.min(0)]],
      moneda: ['GTQ', [Validators.required]],
      fechaVigenciaInicio: ['', [Validators.required]],
      fechaVigenciaFin: ['', [Validators.required]],
      estado: ['VIGENTE', [Validators.required]],
      esTarifaBase: [false]
    });

    form.setValidators(this.validadorFechas());

    form.get('fechaVigenciaInicio')?.valueChanges.subscribe(() => {
      form.get('fechaVigenciaFin')?.updateValueAndValidity({ emitEvent: false });
    });

    return form;
  }

  cargarDepartamentos(): void {
    this.departamentos = Object.keys(departamentosMunicipios) as Departamento[];
  }

  onDepartamentoChange(): void {
    const departamentoSeleccionado = this.sucursalForm.get('departamentoSucursal')?.value;
    
    if (departamentoSeleccionado) {
      this.municipiosFiltrados = departamentosMunicipios[departamentoSeleccionado] || [];
      
      if (!this.sucursalActual) {
        this.sucursalForm.get('ciudadSucursal')?.reset();
      }
      this.sucursalForm.get('ciudadSucursal')?.enable();
    } else {
      this.municipiosFiltrados = [];
      this.sucursalForm.get('ciudadSucursal')?.disable();
    }
  }

  cargarDatosSucursal(): void {
    this.isLoadingSucursal = true;
    this.gestionarSucursalService.obtenerMiSucursal(this.idUsuario).subscribe({
      next: (response: SucursalDetalleResponse) => {
        this.isLoadingSucursal = false;
        this.sucursalActual = response;
        this.cargarFormularioSucursal(response);
      },
      error: (error: any) => {
        this.isLoadingSucursal = false;
        const mensajeError = error.error?.message || 'Error al cargar los datos de la sucursal';
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  cargarFormularioSucursal(sucursal: SucursalDetalleResponse): void {
    this.municipiosFiltrados = departamentosMunicipios[sucursal.departamentoSucursal as Departamento] || [];
    
    this.sucursalForm.patchValue({
      idSucursal: sucursal.idSucursal,
      nombreSucursal: sucursal.nombreSucursal,
      direccionCompletaSucursal: sucursal.direccionCompletaSucursal,
      departamentoSucursal: sucursal.departamentoSucursal,
      ciudadSucursal: sucursal.ciudadSucursal,
      horaApertura: sucursal.horaApertura,
      horaCierre: sucursal.horaCierre,
      capacidad2Ruedas: sucursal.capacidad2Ruedas,
      capacidad4Ruedas: sucursal.capacidad4Ruedas,
      latitud: sucursal.latitud,
      longitud: sucursal.longitud,
      telefonoContactoSucursal: sucursal.telefonoContactoSucursal,
      correoContactoSucursal: sucursal.correoContactoSucursal,
      estadoSucursal: sucursal.estadoSucursal
    });
  }

  guardarSucursal(): void {
    if (this.sucursalForm.valid) {
      this.isSavingSucursal = true;
      
      const sucursalData: SucursalUpdateRequest = {
        idSucursal: this.sucursalForm.value.idSucursal,
        nombreSucursal: this.sucursalForm.value.nombreSucursal.trim(),
        direccionCompletaSucursal: this.sucursalForm.value.direccionCompletaSucursal.trim(),
        ciudadSucursal: this.sucursalForm.value.ciudadSucursal,
        departamentoSucursal: this.sucursalForm.value.departamentoSucursal,
        horaApertura: this.sucursalForm.value.horaApertura,
        horaCierre: this.sucursalForm.value.horaCierre,
        capacidad2Ruedas: Number(this.sucursalForm.value.capacidad2Ruedas),
        capacidad4Ruedas: Number(this.sucursalForm.value.capacidad4Ruedas),
        latitud: Number(this.sucursalForm.value.latitud),
        longitud: Number(this.sucursalForm.value.longitud),
        telefonoContactoSucursal: this.sucursalForm.value.telefonoContactoSucursal.trim(),
        correoContactoSucursal: this.sucursalForm.value.correoContactoSucursal?.trim() || null,
        estadoSucursal: this.sucursalForm.value.estadoSucursal
      };

      this.gestionarSucursalService.editarMiSucursal(sucursalData).subscribe({
        next: (response: ApiResponse) => {
          this.isSavingSucursal = false;
          this.mostrarMensaje(response.message || 'Sucursal actualizada exitosamente', 'success');
          this.cargarDatosSucursal();
        },
        error: (error: any) => {
          this.isSavingSucursal = false;
          this.mostrarMensaje('Error al actualizar la sucursal', 'error');
        }
      });
    } else {
      this.marcarCamposInvalidos(this.sucursalForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  cargarTarifas(): void {
    this.isLoadingTarifas = true;
    this.gestionarSucursalService.obtenerTarifasSucursal(this.idUsuario).subscribe({
      next: (response: TarifaSucursalResponse[]) => {
        this.isLoadingTarifas = false;
        this.tarifas = response;
      },
      error: (error: any) => {
        this.isLoadingTarifas = false;
        this.mostrarMensaje('Error al cargar las tarifas', 'error');
      }
    });
  }

  guardarTarifa(): void {
    if (this.tarifaForm.valid) {
      this.isSavingTarifa = true;

      if (this.modoEdicion && this.tarifaEditando) {
        const tarifaData: TarifaSucursalUpdateRequest = {
          idUsuarioSucursal: this.idUsuario,
          idTarifaSucursal: this.tarifaForm.value.idTarifaSucursal,
          precioPorHora: Number(this.tarifaForm.value.precioPorHora),
          moneda: this.tarifaForm.value.moneda,
          fechaVigenciaInicio: this.formatearFecha(this.tarifaForm.value.fechaVigenciaInicio),
          fechaVigenciaFin: this.formatearFecha(this.tarifaForm.value.fechaVigenciaFin),
          estado: this.tarifaForm.value.estado
        };

        this.gestionarSucursalService.editarTarifaSucursal(tarifaData).subscribe({
          next: (response: ApiResponse) => {
            this.isSavingTarifa = false;
            this.mostrarMensaje(response.message || 'Tarifa actualizada exitosamente', 'success');
            this.cancelarEdicionTarifa();
            this.cargarTarifas();
          },
          error: (error: any) => {
            this.isSavingTarifa = false;
            this.mostrarMensaje('Error al actualizar la tarifa', 'error');
          }
        });
      } else {
        const tarifaData: TarifaSucursalCreateRequest = {
          idUsuarioSucursal: this.idUsuario,
          precioPorHora: this.tarifaForm.value.precioPorHora.toString(),
          moneda: this.tarifaForm.value.moneda,
          fechaVigenciaInicio: this.formatearFecha(this.tarifaForm.value.fechaVigenciaInicio),
          fechaVigenciaFin: this.formatearFecha(this.tarifaForm.value.fechaVigenciaFin),
          esTarifaBase: this.tarifaForm.value.esTarifaBase || false
        };

        this.gestionarSucursalService.crearTarifaSucursal(tarifaData).subscribe({
          next: (response: ApiResponse) => {
            this.isSavingTarifa = false;
            this.mostrarMensaje(response.message || 'Tarifa creada exitosamente', 'success');
            this.limpiarFormularioTarifa();
            this.cargarTarifas();
          },
          error: (error: any) => {
            this.isSavingTarifa = false;
            this.mostrarMensaje('Error al crear la tarifa', 'error');
          }
        });
      }
    } else {
      this.marcarCamposInvalidos(this.tarifaForm);
      this.mostrarMensaje('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  editarTarifa(tarifa: TarifaSucursalResponse): void {
    this.modoEdicion = true;
    this.tarifaEditando = tarifa;
    
    this.tarifaForm.patchValue({
      idTarifaSucursal: tarifa.idTarifaSucursal,
      precioPorHora: tarifa.precioPorHora,
      moneda: tarifa.moneda,
      fechaVigenciaInicio: new Date(tarifa.fechaVigenciaInicio),
      fechaVigenciaFin: new Date(tarifa.fechaVigenciaFin),
      estado: tarifa.estado
    });
  }

  cancelarEdicionTarifa(): void {
    this.modoEdicion = false;
    this.tarifaEditando = null;
    this.limpiarFormularioTarifa();
  }

  limpiarFormularioTarifa(): void {
    this.tarifaForm.reset({
      moneda: 'GTQ',
      estado: 'VIGENTE',
      esTarifaBase: false
    });

    this.tarifaForm.clearValidators();
    this.tarifaForm.setValidators(this.validadorFechas());
    
    Object.keys(this.tarifaForm.controls).forEach(key => {
      const control = this.tarifaForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    
    let dateObj: Date;
    
    if (fecha instanceof Date) {
      dateObj = fecha;
    } 
    else if (typeof fecha === 'string') {
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fecha;
      }
      dateObj = new Date(fecha);
    } 
    else {
      return fecha.toString();
    }
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private marcarCamposInvalidos(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
