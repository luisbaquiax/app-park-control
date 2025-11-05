export interface TicketResponse {
    id: number;
    folioNumerico: string;
    idSucursal: number;
    nombreSucursal: string;
    idVehiculo: number;
    placa: string;
    tipoVehiculo: string;
    idSuscripcion: number | null;
    idPermisoTemporal: number | null;
    tipoCliente: string;
    fechaHoraEntrada: string;
    fechaHoraSalida: string | null;
    duracionMinutos: number | null;
    codigoQr: string;
    enlaceSmsWhatsapp: string;
    estado: string;
    fechaCreacion: string;
}
