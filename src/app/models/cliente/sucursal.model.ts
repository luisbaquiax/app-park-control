// ================================================
// INTERFACES LA COMPRA Y RENOVACIÓN DE SUSCRIPCIÓN
// ================================================

export interface CompraSuscripcionRequest {
    idCliente: number;
    idVehiculo: number;
    idEmpresa: number;
    idTipoPlanSuscripcion: number;
    periodoContratado: 'ANUAL' | 'MENSUAL';
    metodoPago: 'OTRO' | 'PAYPAL' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA_BANCARIA';
    numeroTransaccion: string;
}

export interface RenovacionSuscripcionRequest {
    idSuscripcion: number;
    nuevoPeriodoContratado: 'ANUAL' | 'MENSUAL';
    metodoPago: 'OTRO' | 'PAYPAL' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA_BANCARIA';
    numeroTransaccion: string;
}

export interface ResponseSuscripcion {
    message: string;
    status: string;
}

// ====================================
// INTERFACES LOS VEHICULOS DEL CLIENTE
// ====================================

export interface VehiculoResponse {
    idVehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
    tipoVehiculo: 'CUATRO_RUEDAS' | 'DOS_RUEDAS';
}

// ===========================================================
// INTERFACES PARA MOSTRAR TODAS LAS SUSCRIPCIONES POR EMPRESA
// ===========================================================

export interface SuscripcionResponse {
  empresasSuscripciones: EmpresaSuscripcion[];
}

export interface EmpresaSuscripcion {
  idEmpresa: number;
  nombreComercial: string;
  nit: string;
  razonSocial: string;
  telefonoContacto: string;
  direccionFiscal: string;
  sucursales: Sucursal[];
  suscripciones: Suscripcion[];
}

export interface Sucursal {
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
  usuario: string | null;
}

export interface Suscripcion {
  id: number;
  idEmpresa: number;
  nombrePlan: 'FULL_ACCESS' | 'WORKWEEK' | 'OFFICE_LIGHT' | 'DIARIO_FLEXIBLE' | 'NOCTURNO';
  codigoPlan: string;
  descripcion: string;
  precioPlan: number;
  horasDia: number;
  horasMensuales: number;
  diasAplicables: string;
  coberturaHoraria: string;
  ordenBeneficio: number;
  activo: string;
  fechaCreacion: string;
  configuracionDescuento: ConfiguracionDescuento;
}

export interface ConfiguracionDescuento {
  idConfiguracionDescuento: number;
  descuentoMensual: number;
  descuentoAnualAdicional: number;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estadoConfiguracion: string;
  idUsuarioCreacion: number;
  fechaCreacionDescuento: string;
}

// =========================================================
// INTERFACES PARA LAS SUSCRIPCIONES ACTIVAS DE LOS CLIENTES
// =========================================================

export interface SuscripcionActivaResponse {
  idCliente: number;
  nombreCliente: string;
  suscripcionCliente: SuscripcionCliente[];
}

export interface SuscripcionCliente {
  idSuscripcion: number;
  periodoContratado: string;
  descuentoAplicado: number;
  precioPlan: number;
  horasMensualesIncluidas: number;
  horasConsumidas: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCompra: string;
  estadoSuscripcion: string;
  tarifaBaseReferencia: number;
  vehiculoClienteDTO: VehiculoClienteDTO;
  tipoPlanSuscripcionDTO: TipoPlanSuscripcionDTO;
  sucursalesDisponibles: SucursalDisponible[];
}

export interface VehiculoClienteDTO {
  idVehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipoVehiculo: 'DOS_RUEDAS' | 'CUATRO_RUEDAS'
}

export interface TipoPlanSuscripcionDTO {
  id: number;
  idEmpresa: number;
  nombrePlan: 'FULL_ACCESS' | 'WORKWEEK' | 'OFFICE_LIGHT' | 'DIARIO_FLEXIBLE' | 'NOCTURNO';
  codigoPlan: string;
  descripcion: string;
  precioPlan: number;
  horasDia: number;
  horasMensuales: number;
  diasAplicables: string;
  coberturaHoraria: string;
  ordenBeneficio: number;
  activo: string;
  fechaCreacion: string;
  configuracionDescuento: ConfiguracionDescuento;
}

export interface ConfiguracionDescuento {
  idConfiguracionDescuento: number;
  descuentoMensual: number;
  descuentoAnualAdicional: number;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estadoConfiguracion: string;
  idUsuarioCreacion: number;
  fechaCreacionDescuento: string;
}

export interface SucursalDisponible {
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
  usuario: string | null;
}

// ==========================================
// INTERFACES PARA SOLICITAR PERMISO TEMPORAL
// ==========================================

export interface SolicitarPermisoTemporalRequest {
  idSuscripcion: number,
  placaTemporal: string
  tipoVehiculoPermitido: 'DOS_RUEDAS' | 'CUATRO_RUEDAS',
  motivo: string
}
