import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroRequest } from '../../models/login.model';
import { UsuarioPersonaRolResponse } from '../../models/cliente/usuarioPersonaRolResponse';

@Injectable({
  providedIn: 'root',
})
export class UserEmpresaService {
  private URL_API = `${environment.apiUrl}/api/admin/user-managment`;

  constructor(private http: HttpClient) {}

  public createUserTypeCompany(userDTO: RegistroRequest): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/create-user-company`, userDTO);
  }

  public getusersByRol(nameRol: string): Observable<UsuarioPersonaRolResponse[]> {
    return this.http.get<UsuarioPersonaRolResponse[]>(
      `${this.URL_API}/get-users-by-rol/${nameRol}`
    );
  }
}
