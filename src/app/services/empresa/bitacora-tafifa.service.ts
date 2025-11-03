import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BitacoraTarifa } from '../../models/tarifa/bitacoraTarifa';

@Injectable({
  providedIn: 'root',
})
export class BitacoraTafifaService {
  private URL_API = `${environment.apiUrl}/api/empresa/bitacora-tarifa`;

  constructor(private http: HttpClient) {}

  public getBitacoraByEmpresa(idUsuario: number): Observable<BitacoraTarifa[]> {
    return this.http.get<BitacoraTarifa[]>(`${this.URL_API}/get-by-empresa/${idUsuario}`);
  }
}
