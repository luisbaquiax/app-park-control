import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
//Models and Services
import { UserEmpresaService } from '../../../services/admin-sistema/user-empresa.service';
import { EmpresaResponse } from '../../../models/admin/EmpresaResponse';
import { GestionEmpresaService } from '../../../services/admin-sistema/gestion-empresa.service';
import { EmpresaRegister } from '../../../models/admin/EmpresaRegister';
import { UsuarioEmpresa } from '../../../models/admin/UsuarioEmpresa';
import { LoginService } from '../../../services/login.service';
import { RegistroRequest } from '../../../models/login.model';
import { Departamento, departamentosMunicipios, Municipio } from '../../../models/extras/ubicacion.model';

//models and services

@Component({
  selector: 'app-gestion-empresas-component',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule, MatTabGroup, MatTab],
  templateUrl: './gestion-empresas-component.html',
  styleUrl: './gestion-empresas-component.scss',
})
export class GestionEmpresasComponent implements OnInit {
  companyForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  isLoadingEmpresas = false;

  isEditing = false;
  companySelected!: EmpresaResponse;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  // Empresas disponibles
  empresas: EmpresaResponse[] = [];
  // usuarios de tipo empresa
  empresasUsuarios: UsuarioEmpresa[] = [];

  // Datos Recuperados
  idUsuario = Number(sessionStorage.getItem('idUsuario'));

  displayedColumns: string[] = [
    'nombreComercial',
    'nit',
    'razonSocial',
    'direccionFiscal',
    'telefonoPrincipal',
    'correoPrincipal',
    'estado',
    'acciones',
  ];

  // regiseter user
  userForm: FormGroup;

  departamentos: Departamento[] = [];
  municipiosFiltrados: Municipio[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private empresService: GestionEmpresaService,
    private userService: UserEmpresaService
  ) {
    this.companyForm = this.createFormCompany();
    this.userForm = this.craeteFormUser();
  }
  ngOnInit(): void {
    this.setCompanies();
    this.setUsers();
    this.setDepartaments();
  }

  setCompanies() {
    this.empresService.getAll().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.isLoadingEmpresas = true;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  setUsers() {
    this.userService.getusersByRol('EMPRESA').subscribe({
      next: (users: UsuarioEmpresa[]) => {
        console.log(users);
        this.empresasUsuarios = users;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  setDepartaments(): void {
    this.departamentos = Object.keys(departamentosMunicipios) as Departamento[];
  }

  createFormCompany() {
    return this.fb.group({
      idUsuarioEmpresa: [null, Validators.required],
      nombreComercial: [null, Validators.required],
      razonSocial: [null, Validators.required],
      nit: [
        null,
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      direccionFiscal: [null],
      telefonoPrincipal: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      correoPrincipal: [null, [Validators.required, Validators.email]],
    });
  }

  craeteFormUser() {
    return this.fb.group({
      // Información Personal
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', [Validators.required]],
      dpi: [
        '',
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]{13}$'),
        ],
      ],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],

      // Información de Dirección
      pais: ['Guatemala', [Validators.required]],
      departamento: ['', [Validators.required]],
      ciudad: ['', [Validators.required]], // Esto es el municipio
      codigoPostal: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      direccionCompleta: ['', [Validators.required, Validators.minLength(10)]],

      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      contraseniaHash: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  sendForm() {
    if (this.companyForm.invalid) {
      this.showMessage('Por favor, complete todos los campos', 'error');
      return;
    }

    if (this.isEditing) {
      this.updateCompany();
    } else {
      this.saveCompany();
    }
  }

  sendFormUser() {
    if (this.userForm.invalid) {
      this.showMessage('Por favor, complete todos los campos', 'error');
      return;
    }
    let user: RegistroRequest = {
      nombre: this.userForm.value.nombre.trim(),
      apellido: this.userForm.value.apellido.trim(),
      fechaNacimiento: this.formatearFecha(this.userForm.value.fechaNacimiento),
      dpi: this.userForm.value.dpi.trim(),
      correo: this.userForm.value.correo.trim().toLowerCase(),
      telefono: this.userForm.value.telefono.trim(),
      direccionCompleta: this.userForm.value.direccionCompleta.trim(),
      ciudad: this.userForm.value.ciudad,
      pais: this.userForm.value.pais,
      codigoPostal: this.userForm.value.codigoPostal.trim(),
      nombreUsuario: this.userForm.value.nombreUsuario.trim(),
      contraseniaHash: this.userForm.value.contraseniaHash,
    };
    this.userService.createUserTypeCompany(user).subscribe({
      next: (response: any) => {
        this.showMessage(response.message, 'success');
        this.userForm.reset();
        this.tabGroup.selectedIndex = 1;
        this.setUsers();
      },
      error: (error) => {
        console.log(error);
        if(error.status == 500){
          this.showMessage(`No se puedo crear el usuario, intente nuevamente.`, 'error');
        } else {
          this.showMessage(error.error.message, 'error');
        }
      },
    });
  }

  editCompany(empresa: EmpresaResponse) {
    this.isEditing = true;
    this.companySelected = empresa;
    this.companyForm.patchValue({
      idUsuarioEmpresa: empresa.idUsuarioEmpresa,
      nombreComercial: empresa.nombreComercial,
      razonSocial: empresa.razonSocial,
      nit: empresa.nit,
      direccionFiscal: empresa.direccionFiscal,
      telefonoPrincipal: empresa.telefonoPrincipal,
      correoPrincipal: empresa.correoPrincipal,
    });
    this.tabGroup.selectedIndex = 0;
  }

  saveCompany() {
    this.isLoading = true;
    let empresa: EmpresaRegister = {
      nombreComercial: this.companyForm.value.nombreComercial,
      razonSocial: this.companyForm.value.razonSocial,
      nit: this.companyForm.value.nit,
      direccionFiscal: this.companyForm.value.direccionFiscal,
      telefonoPrincipal: this.companyForm.value.telefonoPrincipal,
      correoPrincipal: this.companyForm.value.correoPrincipal,
      estado: 'ACTIVA',
      idUsuario: this.idUsuario,
    };
    this.empresService.create(empresa).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Empresa creada exitosamente', 'success');
        this.setCompanies();
        this.clearForm();
        this.tabGroup.selectedIndex = 1;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.log(error.error);
        if (error.status > 400 && error.status < 500) {
          this.showMessage(error.error.message, 'error');
        } else {
          this.showMessage('Error al crear la empresa, intente nuevamente', 'error');
        }
      },
    });
  }

  updateCompany() {
    this.isLoading = true;
    let empresa: EmpresaRegister = {
      idUsuario: this.companySelected.idUsuarioEmpresa,
      nombreComercial: this.companyForm.value.nombreComercial,
      razonSocial: this.companyForm.value.razonSocial,
      nit: this.companyForm.value.nit,
      direccionFiscal: this.companyForm.value.direccionFiscal,
      telefonoPrincipal: this.companyForm.value.telefonoPrincipal,
      correoPrincipal: this.companyForm.value.correoPrincipal,
      estado: 'ACTIVA',
    };
    this.empresService.update(empresa, this.companySelected.idEmpresa).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showMessage('Empresa actualizada exitosamente', 'success');
        this.setCompanies();
        this.clearForm();
        this.tabGroup.selectedIndex = 1;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.log(error.error);
        if (error.status > 400 && error.status < 500) {
          this.showMessage(error.error.message, 'error');
        } else {
          this.showMessage('Error al actualizar la empresa, intente nuevamente', 'error');
        }
      },
    });
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';

    if (fecha instanceof Date) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    if (typeof fecha === 'string') {
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    return fecha.toString();
  }

  onDepartamentoChange(): void {
    const departamentoSeleccionado = this.userForm.get('departamento')?.value;

    if (departamentoSeleccionado) {
      this.municipiosFiltrados = departamentosMunicipios[departamentoSeleccionado] || [];
      this.userForm.get('ciudad')?.reset();
      this.userForm.get('ciudad')?.enable();
    } else {
      this.municipiosFiltrados = [];
      this.userForm.get('ciudad')?.disable();
    }
  }

  clearForm() {
    this.companyForm.reset();
    this.companyForm.markAsPristine();
    this.companyForm.markAsUntouched();
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
