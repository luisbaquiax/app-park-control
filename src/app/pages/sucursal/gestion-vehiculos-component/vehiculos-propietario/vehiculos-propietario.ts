import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../../shared/common-imports';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { UserEmpresaService } from '../../../../services/admin-sistema/user-empresa.service';
import { VehiculoResponse } from '../../../../models/vehiculo/vehiculoResponse';
import { VehiculosPropietario } from '../../../../models/vehiculo/vehiculosPropietarios';
import { VehiculoService } from '../../../../services/sucursal/vehiculo-service.service';
import { UsuarioPersonaRolResponse } from '../../../../models/cliente/usuarioPersonaRolResponse';

@Component({
  selector: 'app-vehiculos-propietario',
  standalone: true,
  imports: [COMMON_IMPORTS, MatTableModule],
  templateUrl: './vehiculos-propietario.html',
  styleUrl: './vehiculos-propietario.scss',
})
export class VehiculosPropietarioComponent implements OnInit {
  clientes: UsuarioPersonaRolResponse[] = [];
  vehiculos: VehiculosPropietario[] = [];

  //usuario logeado
  idUsuario = Number(sessionStorage.getItem('idUsuario'));
  constructor(
    private snackBar: MatSnackBar,
    private userService: UserEmpresaService,
    private vehicleService: VehiculoService
  ) {}
  ngOnInit() {
    this.setVehiculos();
  }

  setVehiculos() {
    this.vehicleService.getAllByClient().subscribe({
      next: (vehiculos: VehiculosPropietario[]) => {
        this.vehiculos = vehiculos;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
}
