import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { ApiResponse, InformacionIncidencia, TicketResponse } from "../../models/sucursal/incidenciaTicket.model";

@Injectable({ providedIn: 'root' })
export class IncidenciaTicketService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/sucursal`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    crearIncidenciaTicket(informacion: InformacionIncidencia, archivo: File): Observable<ApiResponse> {
        const formData = new FormData();

        formData.append('data', JSON.stringify(informacion));
        formData.append('file', archivo);
        
        return this.http.post<ApiResponse>(`${this.DIRECCION_API}/incidencias/nueva-incidencia`, formData);
    }

    /* Métodos GET */
    obtenerTicketsSucursal(idUsuarioSucursal: number): Observable<TicketResponse[]> {
        return this.http.get<TicketResponse[]>(`${this.DIRECCION_API}/incidencias/ver-incidencias/${idUsuarioSucursal}`);
    }

    /* Métodos UPDATE */

    /* Métodos DELETE */
}