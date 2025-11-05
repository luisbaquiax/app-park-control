import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { AceptarPermisoRequest, PermisoTemporalRequest, RechazarPermisoRequest, Respuesta, RevocarPermisoRequest } from "../../models/backoffice/permisoTemporalBackoffice.model";

@Injectable({providedIn: 'root'})
export class PermisoTemporalBackofficeModel {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/backoffice`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    aceptarPermisoTemporal(data: AceptarPermisoRequest): Observable<Respuesta> {
        return this.http.post<Respuesta>(`${this.DIRECCION_API}/gestion/aceptar-solicitud-temporal`, data);
    }

    revocarPermisoTermporalActivo(data: RevocarPermisoRequest): Observable<Respuesta> {
        return this.http.post<Respuesta>(`${this.DIRECCION_API}/gestion/revocar-temporal`, data);
    }

    rechazarPermisoTemporalPendiente(data: RechazarPermisoRequest): Observable<Respuesta> {
        return this.http.post<Respuesta>(`${this.DIRECCION_API}/gestion/rechazar-solicitud-temporal`, data);
    }  

    /* Métodos GET */
    obtenerTodosLosPermisosTemporales(idUsuarioBackoffice: number): Observable<PermisoTemporalRequest[]>{
        return this.http.get<PermisoTemporalRequest[]>(`${this.DIRECCION_API}/gestion/solicitudes-temporales/${idUsuarioBackoffice}`);
    }

    /* Métodos UPDATE */

    /* Métodos DELETE */
}