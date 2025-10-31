import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { ApiResponseBackoffice, CambioPlacaRequestBackoffice, CambioPlacaResponseBackoffice } from "../../models/backoffice/cambioPlacaBackoffice.model";

@Injectable({providedIn: 'root'})
export class CambioPlacaServiceBackoffice {
    
    private readonly DIRECCION_API = `${environment.apiUrl}/api/backoffice`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    resolucionSolicitud(data: CambioPlacaRequestBackoffice): Observable<ApiResponseBackoffice> {
        return this.http.post<ApiResponseBackoffice>(`${this.DIRECCION_API}/gestion/revisar-solicitud`, data);
    }

    /* Métodos GET */
    obtenerSolicitudesCambioPlacaPendiente(idUsuarioBackoffice: number): Observable<CambioPlacaResponseBackoffice[]> {
        return this.http.get<CambioPlacaResponseBackoffice[]>(`${this.DIRECCION_API}/gestion/detalle-solicitudes/${idUsuarioBackoffice}`);
    }

    /* Métodos UPDATE */

    /* Métodos DELETE */
}