import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { 
  CrearSucursalRequest, 
  CrearSucursalResponse, 
  SucursalResponse 
} from "../../models/empresa/control.model";

@Injectable({ providedIn: 'root' })
export class ControlSucursalService {

  private readonly DIRECCION_API = `${environment.apiUrl}/api/empresa-sucursal`;

  constructor(private http: HttpClient) {}

  /* Métodos POST */
  crearSucursal(data: CrearSucursalRequest): Observable<CrearSucursalResponse> {
    return this.http.post<CrearSucursalResponse>(`${this.DIRECCION_API}/sucursales`, data);
  }

  /* Métodos GET */
  obtenerSucursalesPorEmpresa(idEmpresa: number): Observable<SucursalResponse[]> {
    return this.http.get<SucursalResponse[]>(`${this.DIRECCION_API}/sucursales/${idEmpresa}`);
  }
}