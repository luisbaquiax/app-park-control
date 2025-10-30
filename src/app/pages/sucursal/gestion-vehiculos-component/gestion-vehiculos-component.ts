import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
//models and services
import { EmpresaResponse } from '../../../models/admin/EmpresaResponse';
import { UsuarioPersonaRolResponse } from '../../../models/cliente/usuarioPersonaRolResponse';
import { UserEmpresaService } from '../../../services/admin-sistema/user-empresa.service';
import { VehiculoService } from '../../../services/sucursal/vehiculo-service.service';
import { VehiculoResponse } from '../../../models/vehiculo/vehiculoResponse';
import { VehiculoRequest } from '../../../models/vehiculo/vehiculoRequest';
import { MessageSuccess } from '../../../models/extras/messages_success';
import { ESTADOS_VEHICULOS } from '../../../models/extras/estadoVehiculo';
import { DialogStatus } from './dialog-status/dialog-status';

@Component({
  selector: 'app-gestion-vehiculos-component',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule, MatTabGroup, MatTab],
  templateUrl: './gestion-vehiculos-component.html',
  styleUrl: './gestion-vehiculos-component.scss',
})
export class GestionVehiculosComponent implements OnInit {
  vehiculoForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  isLoadingCars = false;

  isEditing = false;
  companySelected!: EmpresaResponse;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  // vehicles registereds
  vehicles: VehiculoResponse[] = [];
  estadosVehiculos: string[] = ['TODOS', ...ESTADOS_VEHICULOS];
  vehicleSelected!: VehiculoResponse;
  // usuarios de tipo empresa
  clientes: UsuarioPersonaRolResponse[] = [];

  // Datos Recuperados
  idUsuario = Number(sessionStorage.getItem('idUsuario'));

  //column names
  displayedColumns: string[] = [
    'placa',
    'marca',
    'modelo',
    'color',
    'tipoVehiculo',
    'anio',
    'estadoVehiculo',
    'acciones',
  ];

  //diaglog
  readonly dialog = inject(MatDialog);
  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private userService: UserEmpresaService,
    private vehicleService: VehiculoService
  ) {
    this.vehiculoForm = this.createFormVehicles();
  }
  ngOnInit() {
    this.setClients();
    this.setVehicles();
  }

  setClients() {
    this.userService.getusersByRol('CLIENTE').subscribe({
      next: (users: UsuarioPersonaRolResponse[]) => {
        console.log(users);
        this.clientes = users;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  setVehicles() {
    this.vehicleService.getAll().subscribe({
      next: (vehicles: VehiculoResponse[]) => {
        this.vehicles = vehicles;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  createFormVehicles() {
    return this.fb.group({
      dpi: [null, Validators.required],
      placa: ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: [null, [Validators.required, Validators.min(1900)]],
      color: ['', Validators.required],
      estadoVehiculo: ['ACTIVO', Validators.required],
    });
  }

  sendForm() {
    if (!this.vehiculoForm.valid) {
      this.showMessage('Por favor, complete todos los campos', 'error');
      return;
    }
    if (this.isEditing) {
      this.updateVehicle();
    } else {
      this.saveVehicle();
    }
  }

  saveVehicle() {
    let vehiculoRequest: VehiculoRequest = this.vehiculoForm.value;
    let dpi = this.vehiculoForm.value.dpi;
    this.vehicleService.create(dpi, vehiculoRequest).subscribe({
      next: (response: MessageSuccess) => {
        this.showMessage(response.message, 'success');
        this.clearForm();
        this.setVehicles();
        this.tabGroup.selectedIndex = 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
        if (error.status == 500) {
          this.showMessage(`No se pudo crear el vehiculo, intente nuevamente.`, 'error');
        } else {
          this.showMessage(error.error.message, 'error');
        }
      },
    });
  }

  updateVehicle() {
    let vehiculoRequest: VehiculoRequest = this.vehiculoForm.value;
    this.vehicleService.update(this.vehicleSelected.id, vehiculoRequest).subscribe({
      next: (response: MessageSuccess) => {
        this.showMessage(response.message, 'success');
        this.clearForm();
        this.setVehicles();
        this.tabGroup.selectedIndex = 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
        if (error.status == 500) {
          this.showMessage(`No se pudo actualizar el vehiculo, intente nuevamente.`, 'error');
        } else {
          this.showMessage(error.error.message, 'error');
        }
      },
    });
  }

  changeStatus(vehiculo: VehiculoResponse) {
    this.vehicleSelected = vehiculo;
    const dialogRef = this.dialog.open(DialogStatus, {
      data: this.estadosVehiculos,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.vehicleService.changeStatus(result, this.vehicleSelected.id).subscribe({
          next: (response: MessageSuccess) => {
            this.showMessage(response.message, 'success');
            this.setVehicles();
          },
          error: (error) => {
            console.log(error);
            this.isLoading = false;
            if (error.status == 500) {
              this.showMessage(
                `No se pudo cambiar el estado del vehiculo, intente nuevamente.`,
                'error'
              );
            } else {
              this.showMessage(error.error.message, 'error');
            }
          },
        });
      }
    });
  }

  editVehicle(vehiculo: VehiculoResponse) {
    this.vehicleSelected = vehiculo;
    this.isEditing = true;
    this.tabGroup.selectedIndex = 0;
    this.vehiculoForm.setValue({
      dpi: this.vehicleSelected.idPersona,
      placa: this.vehicleSelected.placa,
      tipoVehiculo: this.vehicleSelected.tipoVehiculo,
      marca: this.vehicleSelected.marca,
      modelo: this.vehicleSelected.modelo,
      anio: this.vehicleSelected.anio,
      color: this.vehicleSelected.color,
      estadoVehiculo: this.vehicleSelected.estado,
    });
  }

  filtrarVehiculoPorEstado(estado: any) {
    if (estado.value == 'TODOS') {
      this.setVehicles();
      return;
    }
    const estadoFiltrar = estado.value.trim().toUpperCase();
    this.vehicleService.getAll().subscribe({
      next: (vehicles: VehiculoResponse[]) => {
        console.log(vehicles);
        this.vehicles = vehicles.filter((vehicle) => vehicle.estado === estadoFiltrar);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  clearForm() {
    this.vehiculoForm.reset();
    this.vehiculoForm.markAsPristine();
    this.vehiculoForm.markAsUntouched();
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
