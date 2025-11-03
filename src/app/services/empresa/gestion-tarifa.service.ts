import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Tarifa } from '../../models/tarifa/tarifa';
import { Observable } from 'rxjs';
import { MessageSuccess } from '../../models/extras/messages_success';

@Injectable({
  providedIn: 'root',
})
export class GestionTarifaService {
  private URL_API = `${environment.apiUrl}/api/empresa/tarifa`;
  constructor(private http: HttpClient) {}

  public createTarifa(idUsuario: number, tarifaData: Tarifa): Observable<Tarifa> {
    return this.http.post<Tarifa>(`${this.URL_API}/create/${idUsuario}`, tarifaData);
  }

  public updateTarifa(idUsuario: number, tarifaData: Tarifa): Observable<Tarifa> {
    return this.http.put<Tarifa>(`${this.URL_API}/update/${idUsuario}`, tarifaData);
  }

  public getTarifaByStatus(estado: string, idUsuario: number): Observable<Tarifa> {
    return this.http.get<Tarifa>(`${this.URL_API}/get-by-status/${estado}/${idUsuario}`);
  }


  public activarTarifa(idTarifa: number, idUsuario: number): Observable<MessageSuccess> {
    return this.http.put<MessageSuccess>(`${this.URL_API}/activar/${idTarifa}/${idUsuario}`, {});
  }

  public desactivarTarifa(idTarifa: number, idUsuario: number): Observable<MessageSuccess> {
    return this.http.put<MessageSuccess>(`${this.URL_API}/desactivar/${idTarifa}/${idUsuario}`, {});
  }

  public getTarifasByEmpresa(idUsuario: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.URL_API}/get-by-empresa/${idUsuario}`);
  }
}
