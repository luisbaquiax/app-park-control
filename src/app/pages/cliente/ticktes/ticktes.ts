import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';
import { MatMenuTrigger } from '@angular/material/menu';

import jsPDF from 'jspdf';
import { TicketResponse } from '../../../models/tickets/ticketResponse';
import { TicketService } from '../../../services/tickets/ticket.service';

@Component({
  selector: 'app-ticktes',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule],
  templateUrl: './ticktes.html',
  styleUrl: './ticktes.scss',
})
export class Ticktes implements OnInit {
  isLoadingTickets = false;

  tickets: TicketResponse[] = [];

  // id del cliente
  idUsuario = Number(sessionStorage.getItem('idUsuario'));
  constructor(private snackBar: MatSnackBar, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.setTickets();
  }

  setTickets(): void {
    this.isLoadingTickets = true;
    console.log(this.idUsuario);
    this.ticketService.getTicketsByCliente(this.idUsuario).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoadingTickets = false;
      },
      error: (error) => {
        this.isLoadingTickets = false;
        this.showMessage('Error al cargar los tickets', 'error-snackbar');
      },
    });
  }

  cratePDFTicket(ticket: TicketResponse): void {
    const doc = new jsPDF();
    doc.text(`Ticket: ${ticket.folioNumerico}`, 10, 10);
    doc.text(`Vehículo: ${ticket.placa}`, 10, 20);
    doc.text(`Fecha y hora de entrada: ${ticket.fechaHoraEntrada}`, 10, 30);
    doc.text(`Fecha de creación: ${ticket.fechaCreacion}`, 10, 40);
    doc.addImage(ticket.codigoQr, 'PNG', 10, 50, 60, 60);
    doc.save(`ticket-${ticket.folioNumerico}.pdf`);
  }

  showMessage(message: string, type: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [type],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
