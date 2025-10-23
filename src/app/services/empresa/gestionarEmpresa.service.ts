import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import {
  InformacionEmpresaResponse 
} from "../../models/empresa/gestionarEmpresa.model";

@Injectable({ providedIn: 'root' })
export class GestionarEmpresaService {

  private readonly DIRECCION_API = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  obtenerEmpresas(): Observable<InformacionEmpresaResponse[]> {
    return this.http.get<InformacionEmpresaResponse[]>(`${this.DIRECCION_API}/companies-managment/all`);
  }

  obtenerEmpresaPorID(idUsuario: number): Observable<InformacionEmpresaResponse[]> {
    return this.http.get<InformacionEmpresaResponse[]>(`${this.DIRECCION_API}/companies-managment/get-by-user-company/${idUsuario}`);
  }
}