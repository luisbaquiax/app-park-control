import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { Observable, retryWhen } from "rxjs";
import { CompraSuscripcionRequest, RenovacionSuscripcionRequest, ResponseSuscripcion, SuscripcionActivaResponse, SuscripcionResponse, VehiculoResponse } from "../../models/cliente/sucursal.model";

@Injectable({providedIn: 'root'})
export class SuscripcionService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/cliente`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    comprarSuscripcion(data: CompraSuscripcionRequest): Observable<ResponseSuscripcion> {
        return this.http.post<ResponseSuscripcion>(`${this.DIRECCION_API}/suscripciones/nueva-suscripcion`, data);
    }

    renovarSuscripcion(data: RenovacionSuscripcionRequest): Observable<ResponseSuscripcion> {
        return this.http.post<ResponseSuscripcion>(`${this.DIRECCION_API}/suscripciones/renovar-suscripcion`, data);
    }

    /* Métodos GET */
    obtenerSuscripcionesEmpresas(): Observable<SuscripcionResponse> {
        return this.http.get<SuscripcionResponse>(`${this.DIRECCION_API}/suscripciones/planes`);
    }

    obtenerSuscripcionesActivasCliente(idCliente: number): Observable<SuscripcionActivaResponse> {
        return this.http.get<SuscripcionActivaResponse>(`${this.DIRECCION_API}/suscripciones/planes/${idCliente}`);
    }
    
    obtenerVehiculos(idCliente: number): Observable<VehiculoResponse[]> {
        return this.http.get<VehiculoResponse[]>(`${this.DIRECCION_API}/suscripciones/vehiculos/${idCliente}`);
    }
}