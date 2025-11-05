// ===========================================
// INTERFACES PARA ACTUALIZAR PERIODO DE CORTE
// ===========================================

export interface ActualizarPeriodoResponse {
    message: string;
}

// ==============================
// INTERFACES PARA CORTES DE CAJA
// ==============================

export interface CortesResponse {
    cortesDeCaja: CorteCaja[];
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

// =================================
// INTERFACES PARA DETALLES DE PAGOS
// =================================

export interface DetallePago {
    idHistorialPago: number;
    idSuscripcion: number;
    nombreCliente: string;
    fechaPago: string;
    montoPagado: string;
    metodoPago: string;
    numeroTransaccion: string;
    estadoPago: string;
    motivoPago: string;
}

// ========================================
// INTERFACES PARA TRANSACCIONES DE TICKETS
// ========================================

export interface TransaccionTicketResponse { 
    transacciones: TransaccionTicket[];
}

export interface TransaccionTicket {
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
