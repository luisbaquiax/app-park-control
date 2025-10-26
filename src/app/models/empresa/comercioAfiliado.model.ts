// =========================================
// INTERFACES PARA MOSTRAR COMERCIOS ACTIVOS
// =========================================

export interface ComercioActivoResponse {
    idComercio: number;
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    tipoComercio: 'RESTAURANTE' | 'FERRETERIA' | 'LIBRERIA' | 'PANADERIA' | 'ZAPATERIA';
    telefono: string;
    correoContacto: string;
    estado: string;
    fechaRegistro: string;
}

// ==============================
// INTERFACES PARA CREAR COMERCIO
// ==============================

export interface CrearComercioRequest {
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    tipoComercio: 'RESTAURANTE' | 'FERRETERIA' | 'LIBRERIA' | 'PANADERIA' | 'ZAPATERIA';
    telefono: string;
    correoContacto: string;
}

// ===================================
// INTERFACES PARA ACTUALIZAR COMERCIO
// ===================================

export interface ActualizarComercioRequest {
    idComercio: number;
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    tipoComercio: 'RESTAURANTE' | 'FERRETERIA' | 'LIBRERIA' | 'PANADERIA' | 'ZAPATERIA';
    telefono: string;
    correoContacto: string;
}


// =========================================
// INTERFACES PARA MOSTRAR CONVENIOS ACTIVOS
// =========================================
 
export interface ConvenioResponse {
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
    idUsuarioSucursal: number;
    usuario: UsuarioSucursal;
    convenios: Convenio[];
}

export interface UsuarioSucursal {
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

export interface Convenio {
    idConvenio: number;
    horasGratisMaximo: string;
    periodoCorte: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    tarifaPorHora: string;
    fechaInicioConvenio: string;
    fechaFinConvenio: string;
    estado: string;
    fechaCreacion: string;
    comercioAfiliado: ComercioAfiliado;
}

export interface ComercioAfiliado {
    idComercio: number;
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    tipoComercio: 'RESTAURANTE' | 'FERRETERIA' | 'LIBRERIA' | 'PANADERIA' | 'ZAPATERIA';
    telefono: string;
    correoContacto: string;
    estado: string;
    fechaRegistro: string;
}

// =======================================================
// INTERFACES PARA CREAR NUEVO CONVENIO (SUCURSAL/EMPRESA)
// =======================================================

export interface CrearConvenioRequest {
    idComercio: number;
    idSucursal: number;
    horasGratisMaximo: string;
    periodoCorte: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    fechaInicioConvenio: string;
    fechaFinConvenio: string;
    creadoPor: number;
}

// ===================================
// INTERFACES PARA ACTUALIZAR CONVENIO
// ===================================

export interface ActualizarConvenioResquest {
    idConvenio: number;
    horasGratisMaximo: string;
    periodoCorte: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    fechaInicioConvenio: string;
    fechaFinConvenio: string;
}

// ==========================================
// INTERFACES PARA ACTUALIZAR ESTADO CONVENIO
// ==========================================

export interface ActualizarEstadoConvenioResquest {
    idConvenio: number;
    estado: 'ACTIVO' | 'VENCIDO' | 'INACTIVO';
}

// =======================
// INTERFACES DE RESPUESTA
// =======================

export interface ApiResponse {
    message: string;
    status: string;
}
