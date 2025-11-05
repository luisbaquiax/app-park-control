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
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
//models and services
import { TicketService } from '../../../services/tickets/ticket.service';
import { VehiculoService } from '../../../services/sucursal/vehiculo-service.service';
import { VehiculoResponse } from '../../../models/vehiculo/vehiculoResponse';
import { TicketResponse } from '../../../models/tickets/ticketResponse';
import { TicketRequest } from '../../../models/tickets/ticketRequest';
// PDF generation
import jsPDF from 'jspdf';
// Error types
import { TYPE_ERRORS_API } from '../../../models/extras/type_erros';
import { CheckTicket } from '../../../models/tickets/checkTicket';
import { CobroResultado } from '../../../models/tickets/cobroResultado';

@Component({
  selector: 'app-management-ticket',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTableModule],
  templateUrl: './management-ticket.html',
  styleUrl: './management-ticket.scss',
})
export class ManagementTicket implements OnInit {
  isLoadingTickets = false;

  generatingTicket = false;

  formTicket!: FormGroup;
  formPlaca!: FormGroup;
  formFolio!: FormGroup;
  formQr!: FormGroup;

  validating = false;
  scanning = false;
  qrReader?: BrowserQRCodeReader;
  controls?: IScannerControls;
  qrResult?: string;

  metodosPago: string[] = ['Efectivo', 'Tarjeta', 'App móvil'];

  vehiculos: VehiculoResponse[] = [];

  idUsuario = Number(sessionStorage.getItem('idUsuario'));

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ticketService: TicketService,
    private vehiculoService: VehiculoService
  ) {}

  ngOnInit(): void {
    this.setVehicles();
    this.formTicket = this.craeteFormTicket();
    this.formPlaca = this.fb.group({
      placa: ['', Validators.required],
      metodoPago: ['', Validators.required],
    });

    this.formFolio = this.fb.group({
      folioNumerico: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9-]+$')]],
      metodoPago: ['', Validators.required],
    });

    this.formQr = this.fb.group({
      codigoQr: ['', Validators.required],
      metodoPago: ['', Validators.required],
    });
  }

  setVehicles(): void {
    this.vehiculoService.getAll().subscribe({
      next: (vehicles: VehiculoResponse[]) => {
        this.vehiculos = vehicles;
      },
      error: (error) => {
        this.showMessage('Error al cargar los vehículos', 'error-snackbar');
      },
    });
  }

  async startScan() {
    try {
      this.scanning = true;
      this.qrReader = new BrowserQRCodeReader();
      const videoElement = document.getElementById('video') as HTMLVideoElement;

      this.controls = await this.qrReader.decodeFromVideoDevice(
        undefined, // use default camera
        videoElement,
        (result, error, controls) => {
          if (result) {
            this.qrResult = result.getText();
            console.log('QR Code detected:', this.qrResult);
            let ticket: CheckTicket = {
              codigoQr: '',
              idUsuario: this.idUsuario,
              placa: '',
              folio: this.qrResult,
              metodoPago: 'Efectivo',
            };
            this.validateTicket(ticket);
            this.formQr.patchValue({ codigoQr: this.qrResult });
            controls.stop();
            this.scanning = false;
            this.validarPorQr();
          }
        }
      );
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      this.scanning = false;
    }
  }

  stopScan() {
    this.controls?.stop();
    this.scanning = false;
  }

  validateTicket(ticket: CheckTicket): void {
    this.validating = true;
    this.ticketService.closeTicket(ticket).subscribe({
      next: (response: CobroResultado) => {
        this.showMessage('Ticket válido', 'success');
        this.validating = false;
        this.generarComprobante(response);
      },
      error: (error) => {
        this.validating = false;
        if (TYPE_ERRORS_API.includes(error.status)) {
          this.showMessage(error.error.message, 'error-snackbar');
        } else {
          this.showMessage('Error al validar el ticket', 'error-snackbar');
        }
      },
    });
  }

  craeteFormTicket(): FormGroup {
    return this.fb.group({
      idVehiculo: ['', Validators.required],
    });
  }

  sendFormTicket(): void {
    if (this.formTicket.invalid) {
      this.showMessage('Por favor, complete todos los campos requeridos', 'error-snackbar');
      return;
    }

    this.generatingTicket = true;
    let ticketRequest: TicketRequest = {
      idUsuario: this.idUsuario,
      idVehiculo: this.formTicket.value.idVehiculo,
      tipoCliente: 'ninguna',
      fechaHoraEntrada: '2025-11-02T13:30:00',
    };
    this.ticketService.createTicket(ticketRequest).subscribe({
      next: (ticket: TicketResponse) => {
        this.cratePDFTicket(ticket);
        this.showMessage('Ticket generado correctamente', 'success');
        this.generatingTicket = false;
        this.cancelTicket();
      },
      error: (error) => {
        if (TYPE_ERRORS_API.includes(error.status)) {
          this.showMessage(error.error.message, 'error');
          this.generatingTicket = false;
        } else {
          this.showMessage('Error al generar el ticket', 'error');
          this.generatingTicket = false;
        }
      },
    });
  }

  validarPorPlaca() {
    if (this.formPlaca.invalid) return;
    this.validating = true;
    console.log('Validando por placa', this.formPlaca.value);
    let ticket: CheckTicket = {
      codigoQr: '',
      idUsuario: this.idUsuario,
      placa: this.formPlaca.value.placa,
      folio: '',
      metodoPago: '',
    };
    this.validateTicket(ticket);
    setTimeout(() => (this.validating = false), 1200);
  }

  validarPorFolio() {
    if (this.formFolio.invalid) return;
    this.validating = true;
     let ticket: CheckTicket = {
       codigoQr: '',
       idUsuario: this.idUsuario,
       placa: '',
       folio: this.formFolio.value.folioNumerico,
       metodoPago: '',
     };
     this.validateTicket(ticket);
    setTimeout(() => (this.validating = false), 1200);
  }

  validarPorQr() {
    if (this.formQr.invalid) return;
    this.validating = true;
    console.log('Validando por QR', this.formQr.value);
    setTimeout(() => (this.validating = false), 1200);
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

  generarComprobante(cobro: CobroResultado): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200], // ancho tipo ticket
    });

    let y = 10;
    doc.setFontSize(12);
    doc.text('PARK CONTROL', 40, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.text('Ticket de Cobro', 40, y, { align: 'center' });

    y += 8;
    doc.text('-----------------------------', 40, y, { align: 'center' });

    y += 8;
    doc.text(`Fecha: ${cobro.fecha}`, 10, y);
    y += 5;
    doc.text(`Entrada: ${cobro.horaEntrada}`, 10, y);
    y += 5;
    doc.text(`Salida: ${cobro.horaSalida}`, 10, y);

    y += 8;
    doc.text('-----------------------------', 40, y, { align: 'center' });

    y += 6;
    doc.text(`Horas Cobradas: ${cobro.horasCobradas}`, 10, y);
    y += 5;
    doc.text(`Tarifa: Q${cobro.tarifaAplicada}`, 10, y);
    y += 5;
    doc.text(`Subtotal: Q${cobro.subtotal}`, 10, y);
    y += 5;
    doc.text(`Acreditadas: ${cobro.horasAcreditadas}`, 10, y);

    y += 8;
    doc.setFontSize(12);
    doc.text(`TOTAL: Q${cobro.totalAPagar}`, 40, y, { align: 'center' });
    y += 5;
    doc.text('-----------------------------', 40, y, { align: 'center' });

    y += 8;
    doc.setFontSize(10);
    doc.text('¡Gracias por su visita!', 40, y, { align: 'center' });

    doc.save('ticket.pdf');
  }

  cancelTicket(): void {
    this.formTicket.reset();
    this.formTicket.markAsPristine();
    this.formTicket.markAsUntouched();
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
