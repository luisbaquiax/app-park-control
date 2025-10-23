import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";
import { CrearPlanRequest, PlanesRequest, EditarPlanRequest, Response } from "../../models/empresa/gestionarPlanes.model";

@Injectable({ providedIn: 'root' })
export class GestionarPlanesService {
    
    private readonly DIRECCION_API = `${environment.apiUrl}/api/empresas/planes-suscripcion`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    crearPlan(data: CrearPlanRequest): Observable<Response> {
        return this.http.post<Response>(`${this.DIRECCION_API}/planes`, data);
    }
    
    /* Métodos GET */
    obtenerPlanesVigentes(idUsuario: number): Observable<PlanesRequest[]> {
        return this.http.get<PlanesRequest[]>(`${this.DIRECCION_API}/planes/${idUsuario}`);
    }

    /* Métodos UPDATE */
    editarPlan(data: EditarPlanRequest): Observable<Response> {
        return this.http.put<Response>(`${this.DIRECCION_API}/planes`, data);
    }

    /* Métodos DELETE */
}