import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { ActualizarComercioRequest, ActualizarConvenioResquest, ActualizarEstadoConvenioResquest, ComercioActivoResponse, ConvenioResponse, CrearComercioRequest, CrearConvenioRequest } from "../../models/empresa/comercioAfiliado.model";
import { ApiResponse } from "../../models/sucursal/gestionSucursal.model";

@Injectable({providedIn: 'root'})
export class ComercioAfiliadoService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/empresa`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    crearComercio(data: CrearComercioRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/comercio`, data);
    }

    crearConvenio(data: CrearConvenioRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/convenio-comercio-sucursal`, data);
    }

    /* Métodos GET */
    obtenerComerciosActivos(): Observable<ComercioActivoResponse[]> {
        return this.http.get<ComercioActivoResponse[]>(`${this.DIRECCION_API}/comercio-afiliado/comercio`);
    }

    obtenerConvenicosSucursales(idUsuario: number): Observable<ConvenioResponse[]> {
        return this.http.get<ConvenioResponse[]>(`${this.DIRECCION_API}/comercio-afiliado/comercio/${idUsuario}`);
    }

    /* Métodos PUT */
    actualizarComercio(data: ActualizarComercioRequest): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/comercio`, data);
    }

    actualizarConvenio(data: ActualizarConvenioResquest): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/convenio-comercio-sucursal`, data);
    }

    actualizarEstadoConvenio(data: ActualizarEstadoConvenioResquest): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/estado-convenio`, data);
    }

    /* Métodos DELETE */
    desactivarComercio(idComercio: number): Observable<ApiResponse>{
        return this.http.delete<ApiResponse>(`${this.DIRECCION_API}/comercio-afiliado/comercio/${idComercio}`);
    }
}   