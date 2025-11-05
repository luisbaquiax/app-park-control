import { Component, inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';

// servicios y modelos
import { Tarifa } from '../../../models/tarifa/tarifa';
import { BitacoraTarifa } from '../../../models/tarifa/bitacoraTarifa';
import { TYPE_ERRORS_API } from '../../../models/extras/type_erros';
import { GestionTarifaService } from '../../../services/empresa/gestion-tarifa.service';
import { BitacoraTafifaService } from '../../../services/empresa/bitacora-tafifa.service';
import { MessageSuccess } from '../../../models/extras/messages_success';

@Component({
  selector: 'app-gestion-tarifa-global',
  standalone: true,
  imports: [
    ...COMMON_IMPORTS,
    MatTableModule,
    MatTabGroup,
    MatTab,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenu,
    MatSelect,
    MatMenuTrigger
  ],
  templateUrl: './gestion-tarifa-global.html',
  styleUrl: './gestion-tarifa-global.scss',
})
export class GestionTarifaGlobal implements OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  form: FormGroup;
  //tarifa vigente
  tarifaVigente!: Tarifa;

  isEditing: boolean = false;
  isLoading: boolean = false;

  //bitacora de tarifas
  bitacoraTarifa: BitacoraTarifa[] = [];
  isLoadingBitacora: boolean = false;
  historialTarifas: Tarifa[] = [];
  isLoadingHistoryFees: boolean = false;

  rarifaSeleccionada!: Tarifa;
  estados: string[] = ['TODOS', 'VIGENTE', 'PROGRAMADO', 'HISTORICO'];

  // columnas names
  displayedColumns: string[] = [
    'idTarifaBase',
    'accion',
    'precioAnterior',
    'precioNuevo',
    'idUsuarioResponsable',
    'fechaCambio',
    'observaciones',
  ];

  // peed existents
  displayedColumns1: string[] = [
    'idTarifaBase',
    'precioPorHora',
    'moneda',
    'fechaVigenciaInicio',
    'fechaVigenciaFin',
    'estado',
    'acciones',
  ];
  //id usuario empresa
  idUsuario = Number(sessionStorage.getItem('idUsuario'));
  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private tarifaService: GestionTarifaService,
    private bitacoraService: BitacoraTafifaService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.setHisytoryFees();
    this.setTarifaVigente();
    this.loadBitacoraTarifa();
  }

  setTarifaVigente(): void {
    this.tarifaService.getTarifaByStatus('VIGENTE', this.idUsuario).subscribe({
      next: (data: Tarifa) => {
        this.tarifaVigente = data;
      },
      error: (err) => {
        this.showMessage('Error al obtener la tarifa vigente', 'error-snackbar');
      },
    });
  }

  setHisytoryFees(): void {
    this.tarifaService.getTarifasByEmpresa(this.idUsuario).subscribe({
      next: (data: Tarifa[]) => {
        this.historialTarifas = data;
        this.isLoadingHistoryFees = true;
      },
      error: (err) => {
        console.log(err);
        this.showMessage('Error al obtener el historial de tarifas', 'error-snackbar');
      },
    });
  }

  loadBitacoraTarifa(): void {
    this.bitacoraService.getBitacoraByEmpresa(this.idUsuario).subscribe({
      next: (data: BitacoraTarifa[]) => {
        this.bitacoraTarifa = data;
        this.isLoadingBitacora = true;
      },
      error: (err) => {
        console.log(err);
        this.showMessage('Error al obtener la bitácora de tarifas', 'error-snackbar');
      },
    });
  }

  sendForm(): void {
    if (!this.form.valid) {
      this.showMessage('Por favor, complete el formulario correctamente.', 'error');
      return;
    }
    this.isLoading = true;
    if (this.isEditing) {
      this.updatePeed();
    } else {
      this.createPeed();
    }
  }

  createPeed(): void {
    const nuevaTarifa: Tarifa = {
      idTarifaBase: 0,
      idEmpresa: 0,
      precioPorHora: this.form.value.precioPorHora,
      moneda: 'GTQ',
      fechaVigenciaInicio: this.form.value.fechaVigenciaInicio,
      fechaVigenciaFin: this.form.value.fechaVigenciaFin,
      estado: 'VIGENTE',
    };
    this.tarifaService.createTarifa(this.idUsuario, nuevaTarifa).subscribe({
      next: (data: Tarifa) => {
        this.isLoading = false;
        this.showMessage('Tarifa global creada exitosamente.', 'success');
        this.form.reset();
        this.setTarifaVigente();
        this.loadBitacoraTarifa();
        this.setHisytoryFees();
        this.tabGroup.selectedIndex = 1;
      },
      error: (error) => {
        this.isLoading = false;
        if (TYPE_ERRORS_API.includes(error.status)) {
          this.showMessage(error.error.message, 'error');
        } else {
          this.showMessage('Error al crear la tarifa global. Intente nuevamente.', 'error');
        }
      },
    });
  }

  updatePeed(): void {
    const tarifaActualizada: Tarifa = {
      idTarifaBase: this.rarifaSeleccionada.idTarifaBase,
      idEmpresa: this.rarifaSeleccionada.idEmpresa,
      precioPorHora: this.form.value.precioPorHora,
      moneda: this.rarifaSeleccionada.moneda,
      fechaVigenciaInicio: this.rarifaSeleccionada.fechaVigenciaInicio,
      fechaVigenciaFin: this.rarifaSeleccionada.fechaVigenciaFin,
      estado: this.rarifaSeleccionada.estado,
    };
    this.tarifaService.updateTarifa(this.idUsuario, tarifaActualizada).subscribe({
      next: (data: Tarifa) => {
        this.isLoading = false;
        this.showMessage('Tarifa global actualizada exitosamente.', 'success');
        this.form.reset();
        this.isEditing = false;
        this.setTarifaVigente();
        this.loadBitacoraTarifa();
        this.setHisytoryFees();
        this.tabGroup.selectedIndex = 1;
      },
      error: (error) => {
        this.isLoading = false;
        if (TYPE_ERRORS_API.includes(error.status)) {
          this.showMessage(error.error.message, 'error');
        } else {
          this.showMessage('Error al actualizar la tarifa global. Intente nuevamente.', 'error');
        }
      },
    });
  }

  activarTarifa(tarifa: Tarifa): void {
    if (confirm('¿Desea activar esta tarifa?')) {
      this.tarifaService.activarTarifa(tarifa.idTarifaBase, this.idUsuario).subscribe({
        next: (data: MessageSuccess) => {
          this.showMessage(`${data.message}`, 'success');
          this.setTarifaVigente();
          this.loadBitacoraTarifa();
          this.setHisytoryFees();
        },
        error: (error) => {
          if (TYPE_ERRORS_API.includes(error.status)) {
            this.showMessage(error.error.message, 'error');
          } else {
            console.log(error);
            this.showMessage('Error al activar la tarifa. Intente nuevamente.', 'error');
          }
        },
      });
    }
  }

  desactivarTarifa(tarifa: Tarifa): void {
    if (confirm('¿Desea desactivar esta tarifa? Deberá crear una nueva para la tarifa vigente.')) {
      this.tarifaService.desactivarTarifa(tarifa.idTarifaBase, this.idUsuario).subscribe({
        next: (data: MessageSuccess) => {
          this.showMessage(`${data.message}`, 'success');
          this.setTarifaVigente();
          this.loadBitacoraTarifa();
          this.setHisytoryFees();
        },
        error: (error) => {
          if (TYPE_ERRORS_API.includes(error.status)) {
            this.showMessage(error.error.message, 'error');
          } else {
            this.showMessage('Error al desactivar la tarifa. Intente nuevamente.', 'error');
          }
        },
      });
    }
  }

  editarTarifa(tarifa: Tarifa): void {
    this.rarifaSeleccionada = tarifa;
    this.form.patchValue({
      precioPorHora: tarifa.precioPorHora,
      fechaVigenciaInicio: tarifa.fechaVigenciaInicio,
      fechaVigenciaFin: tarifa.fechaVigenciaFin,
    });
    this.isEditing = true;
    this.tabGroup.selectedIndex = 0;
  }

  createForm(): FormGroup {
    return this.fb.group({
      precioPorHora: ['', [Validators.required, Validators.min(0)]],
      fechaVigenciaInicio: ['', [Validators.required]],
      fechaVigenciaFin: ['', [Validators.required]],
    });
  }

  clearForm(): void {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.isEditing = false;
    this.tabGroup.selectedIndex = 1;
  }

  filterPeedByStatus(status: any): void {
    this.isLoadingHistoryFees = false;
    if (status.value === 'TODOS') {
      this.setHisytoryFees();
    } else {
      this.tarifaService.getTarifasByEmpresa(this.idUsuario).subscribe({
        next: (data: Tarifa[]) => {
          this.historialTarifas = data.filter((tarifa) => tarifa.estado === status.value);
          this.isLoadingHistoryFees = true;
        },
        error: (err) => {
          console.log(err);
          this.showMessage('Error al filtrar el historial de tarifas', 'error-snackbar');
        },
      });
    }
  }
  showMessage(message: string, type: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [type],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
