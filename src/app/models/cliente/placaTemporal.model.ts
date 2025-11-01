export interface PermisoTemporalResponse {
  idPermisoTemporal: number;
  placaTemporal: string;
  tipoVehiculoPermitido: 'DOS_RUEDAS' | 'CUATRO_RUEDAS';
  motivo: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  usosMaximos: number | null;
  usosRealizados: number;
  estado: 'PENDIENTE' | 'ACTIVO' | 'RECHAZADO' | 'EXPIRADO' | 'REVOCADO' | 'AGOTADO';
  aprobadoPor: string | null;
  fechaAprobacion: string | null;
  observaciones: string | null;
  sucursalesDisponiblesPermiso: SucursalPermiso[];
  suscripcionCliente: SuscripcionCliente;
}

export interface SucursalPermiso {
  idSucursal: number;
  nombre: string;
  direccionCompleta: string | null;
  ciudad: string | null;
  departamento: string | null;
  horaApertura: string | null;
  horaCierre: string | null;
  capacidad2Ruedas: number | null;
  capacidad4Ruedas: number | null;
  estado: string | null;
  usuario: any | null;
}

export interface SuscripcionCliente {
  idSuscripcion: number;
  periodoContratado: 'MENSUAL' | 'ANUAL';
  descuentoAplicado: number;
  precioPlan: number;
  horasMensualesIncluidas: number;
  horasConsumidas: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCompra: string;
  estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'CANCELADA' | 'SUSPENDIDA';
  tarifaBaseReferencia: number;
  vehiculoClienteDTO: any | null;
  tipoPlanSuscripcionDTO: TipoPlanSuscripcionDTO;
  sucursalesDisponibles: Sucursal[];
}

export interface TipoPlanSuscripcionDTO {
  id: number;
  idEmpresa: number;
  nombrePlan: string;
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
  usuario: any | null;
}
