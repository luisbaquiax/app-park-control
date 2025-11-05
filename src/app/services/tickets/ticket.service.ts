import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { TicketRequest } from '../../models/tickets/ticketRequest';
import { Observable } from 'rxjs';
import { CheckTicket } from '../../models/tickets/checkTicket';
import { CobroResultado } from '../../models/tickets/cobroResultado';
import { TicketResponse } from '../../models/tickets/ticketResponse';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private URL_API = `${environment.apiUrl}/api/tickets`;

  constructor(private http: HttpClient) {}

  public createTicket(ticketRequest: TicketRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(`${this.URL_API}/create`, ticketRequest);
  }

  public closeTicket(checkTicket: CheckTicket): Observable<CobroResultado> {
    return this.http.post<CobroResultado>(`${this.URL_API}/close`, checkTicket);
  }

  public getTicketsByCliente(idUsuario: number): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(
      `${this.URL_API}/client/get-tickets-by-cliente/${idUsuario}`
    );
  }
}
