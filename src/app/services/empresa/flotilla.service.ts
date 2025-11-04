import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Respuesta,
  EmpresaFlotilla,
  FlotillaDetalleResponse,
  VehiculoFlotilla,
  NuevoPlanCorporativoRequest,
  SuscribirVehiculoRequest,
  NuevaFlotillaRequest
} from '../../models/empresa/flotilla.model';

@Injectable({
  providedIn: 'root'
})
export class FlotillaService {
    private baseUrl = 'http://localhost:8081/api/empresa/flotilla';

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    crearEmpresaFlotilla(data: NuevaFlotillaRequest): Observable<Respuesta> {
        const url = `${this.baseUrl}/nueva-empresa-flotilla`;
        return this.http.post<Respuesta>(url, data);
    }

    crearPlanCorporativo(data: NuevoPlanCorporativoRequest): Observable<Respuesta> {
        const url = `${this.baseUrl}/nuevo-plan-corporativo`;
        return this.http.post<Respuesta>(url, data);
    }

    desactivarPlanCorporativo(idPlanCorporativo: number): Observable<Respuesta> {
        const url = `${this.baseUrl}/desactivar-plan-corporativo/${idPlanCorporativo}`;
        return this.http.post<Respuesta>(url, {});
    }

    activarPlanCorporativo(idPlanCorporativo: number): Observable<Respuesta> {
        const url = `${this.baseUrl}/activar-plan-corporativo/${idPlanCorporativo}`;
        return this.http.post<Respuesta>(url, {});
    }

    suscribirVehiculo(data: SuscribirVehiculoRequest): Observable<Respuesta> {
        const url = `${this.baseUrl}/suscribir-vehiculo`;
        return this.http.post<Respuesta>(url, data);
    }

    cancelarSuscripcionVehiculo(idSuscripcionFlotilla: number): Observable<Respuesta> {
        const url = `${this.baseUrl}/cancelar-suscripcion-vehiculo/${idSuscripcionFlotilla}`;
        return this.http.post<Respuesta>(url, {});
    }

    /* Métodos GET */
    getEmpresasFlotillaDetalle(idUsuarioEmpresa: number): Observable<FlotillaDetalleResponse> {
        const url = `${this.baseUrl}/detalle/${idUsuarioEmpresa}`;
        return this.http.get<FlotillaDetalleResponse>(url);
    }

    getVehiculosFlotilla(): Observable<VehiculoFlotilla[]> {
        const url = `${this.baseUrl}/vehiculos`;
        return this.http.get<VehiculoFlotilla[]>(url);
    }
}
