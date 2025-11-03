import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { VehiculoRequest } from '../../models/vehiculo/vehiculoRequest';
import { Observable } from 'rxjs';
import { MessageSuccess } from '../../models/extras/messages_success';
import { VehiculoResponse } from '../../models/vehiculo/vehiculoResponse';
import { VehiculosPropietario } from '../../models/vehiculo/vehiculosPropietarios';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private URL_API: string = `${environment.apiUrl}/api/gestion-vehiculos`;
  constructor(private http: HttpClient) {}

  public create(dpi: string, vehiculo: VehiculoRequest): Observable<MessageSuccess> {
    return this.http.post<MessageSuccess>(`${this.URL_API}/create/${dpi}`, vehiculo);
  }

  public update(id: number, vehiculo: VehiculoRequest): Observable<MessageSuccess> {
    return this.http.put<MessageSuccess>(`${this.URL_API}/update/${id}`, vehiculo);
  }

  public changeStatus(status: string, idVehiculo: number): Observable<MessageSuccess> {
    return this.http.put<MessageSuccess>(
      `${this.URL_API}/change-status/${status}/${idVehiculo}`,
      {}
    );
  }

  public getAllByClient(): Observable<VehiculosPropietario[]> {
    return this.http.get<VehiculosPropietario[]>(`${this.URL_API}/get-by-client`);
  }

  public getAll(): Observable<VehiculoResponse[]> {
    return this.http.get<VehiculoResponse[]>(`${this.URL_API}/get-all`);
  }
}
