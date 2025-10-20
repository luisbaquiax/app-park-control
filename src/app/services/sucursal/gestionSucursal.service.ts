import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { 
  SucursalDetalleResponse, 
  SucursalUpdateRequest, 
  TarifaSucursalCreateRequest, 
  TarifaSucursalResponse, 
  TarifaSucursalUpdateRequest,
  ApiResponse 
} from "../../models/sucursal/gestionSucursal.model";

@Injectable({ providedIn: 'root' })
export class GestionarSucursalService {

  private readonly DIRECCION_API = `${environment.apiUrl}/api/sucursal`;

  constructor(private http: HttpClient) {}

  /* Métodos POST */
  crearTarifaSucursal(tarifa: TarifaSucursalCreateRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.DIRECCION_API}/mi-sucursal/tarifas`, tarifa);
  }

  /* Método GET */
  obtenerMiSucursal(idUsuario: number): Observable<SucursalDetalleResponse> {
    return this.http.get<SucursalDetalleResponse>(`${this.DIRECCION_API}/mi-sucursal/${idUsuario}`);
  }

  obtenerTarifasSucursal(idUsuario: number): Observable<TarifaSucursalResponse[]> {
    return this.http.get<TarifaSucursalResponse[]>(`${this.DIRECCION_API}/mi-sucursal/tarifas/${idUsuario}`);
  }

  /* Método UPDATE */
  editarMiSucursal(sucursal: SucursalUpdateRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.DIRECCION_API}/mi-sucursal`, sucursal);
  }

  editarTarifaSucursal(tarifa: TarifaSucursalUpdateRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.DIRECCION_API}/mi-sucursal/tarifas`, tarifa);
  }

  /* Método DELETE */
}