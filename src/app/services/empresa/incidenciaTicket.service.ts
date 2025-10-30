import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { ApiResponse, IncidenciasSucursalResponse, ResolverIncidenciaRequest } from "../../models/empresa/incidenciaTicket.model";

@Injectable({providedIn: 'root'})
export class IncidenciaTicketService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/empresa`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    resolverIncidencia(data: ResolverIncidenciaRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.DIRECCION_API}/incidencias/resolver-incidencia`, data);
    }

    /* Métodos GET */
    obtenerIncidenciasEmpresa(idUsuarioEmpresa: number): Observable<IncidenciasSucursalResponse[]> {
        return this.http.get<IncidenciasSucursalResponse[]>(`${this.DIRECCION_API}/incidencias/ver-incidencias/${idUsuarioEmpresa}`);
    }

    /* Métodos UPDATE */

    /* Métodos DELETE */
}