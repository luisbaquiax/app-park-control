// =============================
// INTERFACES PARA CAMBIAR PLACA
// =============================

export interface CambioPlacaRequest {
    idCliente: number;
    idSuscripcion: number;
    idVehiculoActual: number;
    placaNueva: string;
    motivo: 'VENTA' | 'ROBO' | 'SINIESTRO' | 'OTRO';
    descripcionMotivo: string;
    tipoDocumento: 'DENUNCIA' | 'TRASPASO' | 'TARJETA_CIRCULACION' | 'IDENTIFICACION' | 'OTRO';
    descripcionEvidencia: string;
}

export interface ApiResponse {
    message: string;
    status: string;
}

// =======================================
// INTERFACES PARA MOSTRAR CAMBIO DE PLACA
// =======================================

export interface CambioPlacaResponse {
    idSolicitudCambio: number;
    placaNueva: string;
    motivo: string;
    descripcionMotivo: string;
    fechaSolicitud: string;
    estado: string;
    fechaRevision: string | null;
    observacionesRevision: string | null;
    fechaEfectiva: string | null;
    vehiculoActual: Vehiculo;
    vehiculoNuevo: Vehiculo;
    evidenciaCambioPlaca: EvidenciaCambioPlaca;
    suscripcionCliente: SuscripcionCliente;
}

export interface Vehiculo {
    idVehiculo: number;
    placa: string; 
    marca: string;
    modelo: string;
    color: string;
    tipoVehiculo: string;
}

export interface EvidenciaCambioPlaca {
    idEvidencia: number;
    tipoDocumento: string;
    nombreArchivo: string;
    urlDocumento: string;
    descripcion: string;
    fechaCarga: string;
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
    vehiculoClienteDTO: any;
    tipoPlanSuscripcionDTO: TipoPlanSuscripcionDTO;
    sucursalesDisponibles: SucursalDisponible[];
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
    usuario: any;
}
