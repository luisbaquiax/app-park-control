import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { ActualizarPeriodoResponse, CortesResponse, DetallePago, TransaccionTicket } from "../../models/empresa/corte.model";

@Injectable({ providedIn: 'root' })
export class CorteService {
    private readonly DIRECCION_API = `${environment.apiUrl}/api/empresas`;

    constructor(private http: HttpClient) {}

    /* Métodos GET */
    obtenerDetalleCorte(idUsuarioEmpresa: number): Observable<CortesResponse> {
        return this.http.get<CortesResponse>(`${this.DIRECCION_API}/liquidaciones/detalles-liquidacion/${idUsuarioEmpresa}`);
    }

    obtenerDetallePagos(idUsuarioEmpresa: number): Observable<DetallePago[]> {
        return this.http.get<DetallePago[]>(`${this.DIRECCION_API}/liquidaciones/detalles-pagos-suscripciones/${idUsuarioEmpresa}`);
    }

    obtenerTransaccionesTickets(idUsuarioEmpresa: number): Observable<TransaccionTicket[]> {
        return this.http.get<TransaccionTicket[]>(`${this.DIRECCION_API}/liquidaciones/detalles-transacciones-tickets/${idUsuarioEmpresa}`);
    }

    /* Métodos PUT */
    actualizarPeriodoCorte(idUsuarioEmpresa: number): Observable<ActualizarPeriodoResponse> {
        return this.http.put<ActualizarPeriodoResponse>(`${this.DIRECCION_API}/liquidaciones/actualizar-periodo-corte-caja/${idUsuarioEmpresa}`, null);
    }
}