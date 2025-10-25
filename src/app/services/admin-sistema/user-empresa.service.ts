import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioEmpresa } from '../../models/admin/UsuarioEmpresa';
import { RegistroRequest } from '../../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class UserEmpresaService {
  private URL_API = `${environment.apiUrl}/api/admin/user-managment`;

  constructor(private http: HttpClient) {}

  public createUserTypeCompany(userDTO: RegistroRequest): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/create-user-company`, userDTO);
  }

  public getusersByRol(nameRol: string): Observable<UsuarioEmpresa[]> {
    return this.http.get<UsuarioEmpresa[]>(`${this.URL_API}/get-users-by-rol/${nameRol}`);
  }
}
