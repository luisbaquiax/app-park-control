import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ReporteSucursalOcupacionResponse, ReporteFacturacionSucursalResponse, ReporteSuscripcionrResponse, DetalleSucursalesIncidenciasResponse, EmpresasFlotillaResponse, SucursalConCortesResponse, ComercioAfiliadoResponse } from '../../models/empresa/reportes.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/empresa/reportes`;
    
    constructor(private http: HttpClient) {}

    /* Métodos GET */
    getReporteOcupacionSucursal(idUsuarioEmpresa: number): Observable<ReporteSucursalOcupacionResponse[]> {
        return this.http.get<ReporteSucursalOcupacionResponse[]>(`${this.DIRECCION_API}/ocupacion/${idUsuarioEmpresa}`);
    }

    getReporteFacturacionSucursal(idUsuarioEmpresa: number): Observable<ReporteFacturacionSucursalResponse[]> {
        return this.http.get<ReporteFacturacionSucursalResponse[]>(`${this.DIRECCION_API}/facturacion/${idUsuarioEmpresa}`);
    }

    getReporteSuscripciones(idUsuarioEmpresa: number): Observable<ReporteSuscripcionrResponse[]> {
        return this.http.get<ReporteSuscripcionrResponse[]>(`${this.DIRECCION_API}/suscripciones/${idUsuarioEmpresa}`);
    }

    getReporteIncidenciasSucursal(idUsuarioEmpresa: number): Observable<DetalleSucursalesIncidenciasResponse> {
        return this.http.get<DetalleSucursalesIncidenciasResponse>(`${this.DIRECCION_API}/incidencias/${idUsuarioEmpresa}`);
    }

    getReporteFlotillaVehiculos(idUsuarioEmpresa: number): Observable<EmpresasFlotillaResponse> {
        return this.http.get<EmpresasFlotillaResponse>(`${this.DIRECCION_API}/flotas-empresariales/${idUsuarioEmpresa}`);
    }

    getReporteCorteCajaSucursal(idUsuarioEmpresa: number): Observable<SucursalConCortesResponse[]> {
        return this.http.get<SucursalConCortesResponse[]>(`${this.DIRECCION_API}/cortes-caja/${idUsuarioEmpresa}`);
    }

    getReporteComerciosAfiliados(idUsuarioEmpresa: number): Observable<ComercioAfiliadoResponse[]> {
        return this.http.get<ComercioAfiliadoResponse[]>(`${this.DIRECCION_API}/comercios-afiliados/${idUsuarioEmpresa}`);
    }
}
