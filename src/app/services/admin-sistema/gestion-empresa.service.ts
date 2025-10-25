import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaResponse } from '../../models/admin/EmpresaResponse';
import { EmpresaRegister } from '../../models/admin/EmpresaRegister';

@Injectable({
  providedIn: 'root',
})
export class GestionEmpresaService {
  private URL_API = `${environment.apiUrl}/api/admin/companies-managment`;
  constructor(private http: HttpClient) {}

  public create(registerEmpresa: EmpresaRegister): Observable<EmpresaResponse> {
    return this.http.post<EmpresaResponse>(`${this.URL_API}/create`, registerEmpresa);
  }

  public update(registerEmpresa: EmpresaRegister, id: number): Observable<EmpresaResponse> {
    return this.http.put<EmpresaResponse>(`${this.URL_API}/update/${id}`, registerEmpresa);
  }

  public getAll(): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.URL_API}/all`);
  }

  public getComapniesByUser(idUser: number): Observable<EmpresaResponse[]> {
    return this.http.get<EmpresaResponse[]>(`${this.URL_API}/get-by-user-company/${idUser}`);
  }
}
