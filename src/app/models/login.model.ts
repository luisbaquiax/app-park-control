// ========================================
// INTERFACES PARA REGISTRO
// ========================================

export interface RegistroRequest {
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
}

export interface RegistroResponse {
    message: string;
    status: string;
}

// ========================================
// INTERFACES PARA LOGIN
// ========================================

export interface LoginRequest {
    nombreUsuario: string;
    contrasenia: string;
}

export interface LoginResponse {
    autenticacion: {
        autenticacion: boolean;
        debeCambiarContrasenia: boolean;
    };
    credenciales: {
        mensaje: string;
        idUsuario: number;
        rol: number | null;
        nombreRol: string | null;
        nombreUsuario: string | null;
        token: string | null;
    };
}

// ========================================
// INTERFACES PARA VERIFICACIÓN 2FA
// ========================================

export interface Verificar2FARequest {
    token: string;
    codigoVerificacion: string;
}

export interface Verificar2FAResponse {
    idUsuario: number;
    nombreRol: string;
    mensaje: string;
    nombreUsuario: string;
    rol: number;
}

// ========================================
// INTERFACES PARA RECUPERACIÓN DE CONTRASEÑA
// ========================================

export interface RecuperarContraseniaRequest {
    correo: string;
}

export interface RecuperarContraseniaResponse {
    mensaje: string;
    user: number;
    token: string;
}

// ========================================
// INTERFACES PARA VERIFICACIÓN CÓDIGO RECUPERACIÓN
// ========================================

export interface VerificarCodigoRecuperacionRequest {
    token: string;
    codigoVerificacion: string;
}

export interface VerificarCodigoRecuperacionResponse {
    idUsuario: number;
    mensaje: string;
    nombreUsuario: string;
    token: string;
}

// ========================================
// INTERFACES PARA RESETEAR CONTRASEÑA
// ========================================

export interface ResetearContraseniaRequest {
    idUsuario: number;
    token: string;
    nuevaContrasenia: string;
}

export interface ResetearContraseniaResponse {
    message: string;
    status: string;
}

// ========================================
// INTERFACES PARA CAMBIAR 2FA
// ========================================

export interface Cambiar2FAResponse {
    message: string;
    status: string;
}

// ========================================
// INTERFACES PARA PRIMER INICIO CONTRASEÑA
// ========================================

export interface PrimerInicioContraseniaRequest {
    idUsuario: number;
    nuevaContrasenia: string;
}

export interface PrimerInicioContraseniaResponse {
    message: string;
    status: string;
}
