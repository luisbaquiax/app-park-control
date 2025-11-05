// ==================================================================
// INTERFACES PARA REPORTE OCUPACIÓN POR SUCURSAL Y TIPO DE VEHÍCULOS
// ==================================================================

export interface ReporteSucursalOcupacionArrayResponse {
    sucursales: ReporteSucursalOcupacionResponse[];
}

export interface ReporteSucursalOcupacionResponse {
    idSucursal: number;
    nombreSucursal: string;
    direccionCompleta: string;
    ciudad: string;
    departamento: string;
    horaApertura: string;
    horaCierre: string;
    capacidad2Ruedas: number;
    capacidad4Ruedas: number;
    detallesOcupacion: DetallesOcupacion;
}

export interface DetallesOcupacion {
    fechaHora: string;
    ocupacion2R: number;
    capacidad2R: number;
    ocupacion4R: number;
    capacidad4R: number;
    porcentajeOcupacion2R: string;
    porcentajeOcupacion4R: string;
}

// ================================================
// INTERFACES PARA REPORTE FACTURACIÓN POR SUCURSAL
// ================================================

export interface ReporteFacturacionSucursalArrayResponse {
    sucursales: ReporteFacturacionSucursalResponse[];
}

export interface ReporteFacturacionSucursalResponse {
    idSucursal: number;
    nombreSucursal: string;
    direccionCompleta: string;
    ciudad: string;
    departamento: string;
    horaApertura: string;
    horaCierre: string;
    capacidad2Ruedas: number;
    capacidad4Ruedas: number;
    detallesFacturacion: DetallesFacturacion[];
}

export interface DetallesFacturacion {
    idTransaccion: number;
    idTicket: number;
    nombreCliente: string;
    tipoCobro: string;
    horasCobradas: string;
    horasGratisComercio: string;
    tarifaAplicada: string;
    subtotal: string;
    descuento: string;
    total: string;
    metodoPago: string;
    numeroTransaccion: string;
    estado: string;
    fechaTransaccion: string;
}

// ============================================================
// INTERFACES PARA REPORTE DE SUSCRIPCIONES ACTIVAS E INACTIVAS
// ============================================================

export interface ReporteSuscripcionArrayResponse {
    planes: ReporteSuscripcionrResponse[];
}

export interface ReporteSuscripcionrResponse {
  idTipoPlan: number;
  nombrePlan: string;
  codigoPlan: string;
  descripcion: string;
  precioPlan: number;
  horasDia: number;
  horasMensuales: number;
  diasAplicables: string;
  coberturaHoraria: string;
  ordenBeneficio: number;
  estadoPlan: string;
  fechaCreacion: string;
  configuracionDescuento: ConfiguracionDescuento;
  detallesSuscriptores: DetalleSuscriptor[];
}

export interface ConfiguracionDescuento {
  idConfiguracionDescuento: number;
  descuentoMensual: number;
  descuentoAnualAdicional: number;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estadoConfiguracion: string;
  idUsuarioCreacion: number | null;
  fechaCreacionDescuento: string;
}

export interface DetalleSuscriptor {
  idSuscripcion: number;
  nombreSuscriptor: string;
  placaVehiculo: string;
  montoTarifaReferenciada: number;
  horasMensualesIncluidas: number;
  horasUtilizadasMes: number;
  fechaInicioSuscripcion: string;
  fechaFinSuscripcion: string;
  totalHorasUtilizadas: number;
  totalExcedentePagado: number;
  estadoSuscripcion: string;
}

// ===================================================
// INTERFACES PARA REPORTE DE ENCIDENCIAS POR SUCURSAL
// ===================================================

export interface DetalleSucursalesIncidenciasResponse {
  detalleSucursalesIncidenciasDTO: SucursalIncidencias[];
}

export interface SucursalIncidencias {
  idSucursal: number;
  nombreSucursal: string;
  direccionSucursal: string;
  telefonoSucursal: string;
  incidenciasSucursalDTOList: IncidenciaSucursalDTO[];
}

export interface IncidenciaSucursalDTO {
  idTicket: number;
  folioNumerico: string;
  tipoCliente: string;
  estadoTicket: string;
  placaVehiculo: string;
  modeloVehiculo: string;
  colorVehiculo: string;
  nombrePropietario: string;
  telefonoPropietario: string;
  incidencias: Incidencia;
}

export interface Incidencia {
  idIncidencia: number;
  tipoIncidencia: string;
  descripcion: string;
  fechaIncidencia: string;
  resuelto: boolean;
  fechaResolucion: string | null;
  resueltoPor: number | null;
  observacionesResolucion: string | null;
  evidencias: EvidenciaIncidencia[];
}


export interface EvidenciaIncidencia {
  idEvidenciaIncidencia: number;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlEvidencia: string;
  descripcion: string;
  fechaCarga: string;
}

// ============================================
// INTERFACES PARA REPORTE DE EMPRESAS FLOTILLA
// ============================================

export interface EmpresasFlotillaResponse {
  empresasFlotilla: EmpresaFlotilla[];
}

export interface EmpresaFlotilla {
  idEmpresaFlotilla: number;
  nombreEmpresa: string;
  razonSocial: string;
  nit: string;
  telefono: string;
  correoContacto: string;
  direccion: string;
  estado: string;
  fechaRegistro: string;
  planesCorporativos: PlanCorporativo[];
}

export interface PlanCorporativo {
  idPlanCorporativo: number;
  nombrePlanCorporativo: string;
  numeroPlacasContratadas: number;
  tipoPlan: string;
  descuentoCorporativoAdicional: number;
  precioPlanCorporativo: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  creadoPor: string;
  fechaCreacion: string;
  suscripcionesVehiculos: SuscripcionVehiculoFlotilla[];
}

export interface SuscripcionVehiculoFlotilla {
  idSuscripcionFlotilla: number;
  placaVehiculo: string;
  fechaAsignacion: string;
  estado: string;
}

// ========================================
// INTERFACES PARA REPORTE DE CORTE DE CAJA
// ========================================

export interface SucursalConCortesArrayResponse {
    sucursales: SucursalConCortesResponse[];
}

export interface SucursalConCortesResponse {
  idSucursal: number;
  nombreSucursal: string;
  direccionCompleta: string;
  ciudad: string;
  departamento: string;
  horaApertura: string;
  horaCierre: string;
  capacidad2Ruedas: number;
  capacidad4Ruedas: number;
  cortesDeCajas: CorteCaja[];
  detallesDeIngresosPorTarifasYExcedentes: DetalleIngresoTarifaExcedente[];
}

export interface CorteCaja {
  idCorteCaja: number;
  sucursalNombre: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  totalHorasComercio: string;
  totalLiquidacionComercios: string;
  totalNeto: string;
  generadoPorNombreUsuario: string;
  fechaGeneracion: string;
  estado: string;
  detallesComercios: DetalleComercio[];
}

export interface DetalleIngresoTarifaExcedente {
  idTransaccion: number;
  idTicket: number;
  nombreCliente: string;
  tipoCobro: string;
  horasCobradas: string;
  horasGratisComercio: string;
  tarifaAplicada: string;
  subtotal: string;
  descuento: string;
  total: string;
  metodoPago: string;
  numeroTransaccion: string;
  estado: string;
  fechaTransaccion: string;
}

export interface DetalleComercio {
  idLiquidacion: number;
  comercioNombre: string;
  totalHorasOtorgadas: string;
  tarifaPorHora: string;
  montoTotal: string;
  estado: string;
  fechaFacturacion: string | null;
  fechaPago: string | null;
  observaciones: string;
}

//===============================================
// INTERFACES PARA REPORTE DE COMERCIOS AFILIADOS
//===============================================

export interface ComercioAfiliadoArrayResponse {
    comercios: ComercioAfiliadoResponse[];
}

export interface ComercioAfiliadoResponse {
  idComercioAfiliado: number;
  nombreComercial: string;
  razonSocial: string;
  nit: string;
  tipoComercio: string;
  correoContacto: string;
  estado: string;
  detallesConvenioComercio: DetalleConvenioComercio[];
  detallesCorteCaja: DetalleCorteCaja[];
  clientesBeneficiados: ClienteBeneficiado[];
}

export interface DetalleConvenioComercio {
  idConvenioComercio: number;
  nombreSucursal: string;
  horasGratisMaximo: string;
  periodoCorte: string;
  tarifaPorHora: string;
  fechaInicioConvenio: string;
  fechaFinConvenio: string;
  estado: string;
  fechaCreacion: string;
}

export interface DetalleCorteCaja {
  idLiquidacion: number;
  comercioNombre: string;
  totalHorasOtorgadas: string;
  tarifaPorHora: string; 
  montoTotal: string;
  estado: string;
  fechaFacturacion: string | null;
  fechaPago: string | null;
  observaciones: string;
}

export interface ClienteBeneficiado {
  idCliente: number;
  nombreCliente: string;
  horasGratisOtorgadas: string;
  sucursalNombre: string;
  fechaBeneficio: string;
}
