import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environments";
import {
    RegistroRequest,
    RegistroResponse,
    LoginRequest,
    LoginResponse,
    Verificar2FARequest,
    Verificar2FAResponse,
    RecuperarContraseniaRequest,
    RecuperarContraseniaResponse,
    VerificarCodigoRecuperacionRequest,
    VerificarCodigoRecuperacionResponse,
    ResetearContraseniaRequest,
    ResetearContraseniaResponse,
    Cambiar2FAResponse,
    PrimerInicioContraseniaRequest,
    PrimerInicioContraseniaResponse
} from "../models/login.model";

@Injectable({providedIn: 'root'})
export class LoginService {

    private readonly DIRECCION_API = `${environment.apiUrl}/api/login`;

    constructor(private http: HttpClient) {}

    /* Métodos POST */
    registrarCliente(data: RegistroRequest): Observable<RegistroResponse> {
        return this.http.post<RegistroResponse>(`${this.DIRECCION_API}/registro`, data);
    }

    iniciarSesion(data: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.DIRECCION_API, data);
    }

    verificar2FA(data: Verificar2FARequest): Observable<Verificar2FAResponse> {
        return this.http.post<Verificar2FAResponse>(`${this.DIRECCION_API}/verificar-2fa`, data);
    }

    recuperarContrasenia(data: RecuperarContraseniaRequest): Observable<RecuperarContraseniaResponse> {
        return this.http.post<RecuperarContraseniaResponse>(`${this.DIRECCION_API}/recuperar-contrasenia`, data);
    }

    verificarCodigoRecuperacion(data: VerificarCodigoRecuperacionRequest): Observable<VerificarCodigoRecuperacionResponse> {
        return this.http.post<VerificarCodigoRecuperacionResponse>(`${this.DIRECCION_API}/verificar-codigo-recuperacion`, data);
    }

    resetearContrasenia(data: ResetearContraseniaRequest): Observable<ResetearContraseniaResponse> {
        return this.http.post<ResetearContraseniaResponse>(`${this.DIRECCION_API}/resetear-contrasenia`, data);
    }

    /* Métodos GET */
    
    /* Métodos UPDATE */
    cambiar2FA(idUsuario: number): Observable<Cambiar2FAResponse> {
        return this.http.put<Cambiar2FAResponse>(`${this.DIRECCION_API}/cambiar-2fa/${idUsuario}`, {});
    }

    primerInicioContrasenia(data: PrimerInicioContraseniaRequest): Observable<PrimerInicioContraseniaResponse> {
        return this.http.put<PrimerInicioContraseniaResponse>(`${this.DIRECCION_API}/primer-inicio-contrasenia`, data);
    }
    
    /* Métodos DELETE */
    
}