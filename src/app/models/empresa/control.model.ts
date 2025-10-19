// ========================================================
// INTERFACES PARA OBTENER INFORMACION SUCURSAL + ENCARGADO
// ========================================================

export interface UsuarioDTO {
  direccionCompleta: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dpi: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  contraseniaHash: string | null;
  dobleFactorHabilitado: boolean;
  estado: string;
}

export interface SucursalDTO {
  idSucursal: number;
  nombre: string;
  direccionCompleta: string;
  ciudad: string;
  departamento: string;
  horaApertura: string;
  horaCierre: string;
  capacidad2Ruedas: number;
  capacidad4Ruedas: number;
  estado: string;
  usuario: UsuarioDTO;
}

// ==========================================
// INTERFACES PARA CREAR SUCURSAL + ENCARGADO
// ==========================================

export interface SucursalResponse {
  sucursalDTO: SucursalDTO;
}

export interface CrearSucursalRequest {
  direccionCompleta: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dpi: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  contraseniaHash: string;
  idEmpresa: number;
  nombreSucursal: string;
  direccionCompletaSucursal: string;
  ciudadSucursal: string;
  departamentoSucursal: string;
  horaApertura: string;
  horaCierre: string;
  capacidad2Ruedas: number;
  capacidad4Ruedas: number;
  latitud: number;
  longitud: number;
  telefonoContactoSucursal: string;
  correoContactoSucursal: string;
}

export interface CrearSucursalResponse {
  message: string;
  status: string;
}