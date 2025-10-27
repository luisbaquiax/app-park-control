export interface Evidencia {
  idEvidenciaIncidencia: number;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlEvidencia: string;
  descripcion: string;
  fechaCarga: string;
}

export interface Incidencia {
  idIncidencia: number;
  tipoIncidencia: string;
  descripcion: string;
  fechaIncidencia: string;
  resuelto: boolean;
  fechaResolucion: string | null;
  resueltoPor: string | null;
  observacionesResolucion: string | null;
  evidencias: Evidencia[];
}

export interface TicketResponse {
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

export interface InformacionIncidencia {
  idTicket: number;
  tipoIncidencia: string;
  descripcion: string;
  tipoEvidencia: string;
  descripcionEvidencia: string;
}

export interface ApiResponse {
    message: string;
    status: string;
}


/*
[
    {
        "idTicket": 1,
        "folioNumerico": "1234567890",
        "tipoCliente": "SIN_SUSCRIPCION",
        "estadoTicket": "ACTIVO",
        "placaVehiculo": "P123ABC",
        "modeloVehiculo": "Corolla",
        "colorVehiculo": "Gris",
        "nombrePropietario": "Rudy",
        "telefonoPropietario": "78451202",
        "incidencias": {
            "idIncidencia": 1,
            "tipoIncidencia": "OTRO",
            "descripcion": "El vehículo sufrió un daño en el parquímetro.",
            "fechaIncidencia": "2025-10-26T12:37:24.706809",
            "resuelto": false,
            "fechaResolucion": null,
            "resueltoPor": null,
            "observacionesResolucion": null,
            "evidencias": [
                {
                    "idEvidenciaIncidencia": 1,
                    "tipoEvidencia": "FOTO_VEHICULO",
                    "nombreArchivo": "Portada-Beatles-1280x720.jpg",
                    "urlEvidencia": "https://parkcontrol-storage.s3.us-east-2.amazonaws.com/uploads/e42c76c2c46c4d03bb45adf4e9ccf86fPortada-Beatles-1280x720.jpg",
                    "descripcion": "Foto del daño en el parquímetro.",
                    "fechaCarga": "2025-10-26T12:37:30.907443"
                },{}
            ]
        }
    }
]
*/