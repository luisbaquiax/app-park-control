// ====================
// INTERFACES PARA PLAN
// ====================

export interface CrearPlanRequest {
    idEmpresa: number;
    nombrePlan: 'FULL_ACCESS' | 'WORKWEEK' | 'OFFICE_LIGHT' | 'DIARIO_FLEXIBLE' | 'NOCTURNO';
    codigoPlan: string;
    descripcion: string;
    precioPlan: string;
    horasMensuales: number;
    diasAplicables: string;
    coberturaHoraria: string;
    descuentoMensual: number;
    descuentoAnualAdicional: number;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    idUsuarioCreacion: number;
}

// ===========================
// INTERFACES PARA EDITAR PLAN
// ===========================

export interface EditarPlanRequest {
    idTipoPlan: number;
    idEmpresa: number;
    nombrePlan: 'FULL_ACCESS' | 'WORKWEEK' | 'OFFICE_LIGHT' | 'DIARIO_FLEXIBLE' | 'NOCTURNO';
    codigoPlan: string;
    descripcion: string;
    precioPlan: number;
    horasMensuales: number;
    diasAplicables: string;
    coberturaHoraria: string;
    descuentoMensual: number;
    descuentoAnualAdicional: number;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    idUsuarioCreacion: number;
}

// ==============================
// INTERFACES PARA OBTENER PLANES
// ==============================

export interface PlanesRequest {
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
    configuracionDescuento: {
        idConfiguracionDescuento: number;
        descuentoMensual: number;
        descuentoAnualAdicional: number;
        fechaVigenciaInicio: string;
        fechaVigenciaFin: string;
        estadoConfiguracion: string;
        idUsuarioCreacion: number;
        fechaCreacionDescuento: string;
    };
}

// ==============================================
// INTERFACES PARA LAS RESPUESTAS DE LAS ENTRADAS
// ==============================================

export interface Response {
    message: string;
    status: string;
}