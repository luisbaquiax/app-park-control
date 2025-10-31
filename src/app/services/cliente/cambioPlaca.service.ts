import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { CambioPlacaRequest, CambioPlacaResponse } from "../../models/cliente/cambioPlaca.model";
import { ApiResponse } from "../../models/cliente/cambioPlaca.model";

@Injectable({providedIn: 'root'})
export class CambioPlacaService {
    
    private readonly DIRECCION_API = `${environment.apiUrl}/api/cliente`;

    constructor(private http: HttpClient) {}

    
    /* Métodos POST */
    crearCambioPlaca(data: CambioPlacaRequest, archivo: File): Observable<ApiResponse> {
        const formData = new FormData();

        formData.append('data', JSON.stringify(data));
        formData.append('file', archivo);
        
        return this.http.post<ApiResponse>(`${this.DIRECCION_API}/cambio-placa/solicitar`, formData);
    }

    /* Métodos GET */
    obtenerSolicitudesCambioPlaca(idUsuarioCliente: number): Observable<CambioPlacaResponse[]> {
        return this.http.get<CambioPlacaResponse[]>(`${this.DIRECCION_API}/cambio-placa/solicitudes/${idUsuarioCliente}`);
    }

    /* Métodos UPDATE */

    /* Métodos DELETE */
}
