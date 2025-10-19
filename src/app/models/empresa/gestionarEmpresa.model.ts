// =========================================
// INTERFACES PARA INFORMACIÓN DE LA EMPRESA
// =========================================

export interface InformacionEmpresaResponse {
    idEmpresa: number,
    idUsuarioEmpresa: number,
    nombreComercial: string,
    razonSocial: string,
    nit: string,
    direccionFiscal: string,
    telefonoPrincipal: number,
    correoPrincipal: string,
    estado: string,
    fechaRegistro: string
}