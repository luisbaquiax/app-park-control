import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_IMPORTS } from '../../../shared/common-imports';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { ReporteService } from '../../../services/empresa/reportes.service';
import { 
  ReporteSucursalOcupacionResponse,
  ReporteFacturacionSucursalResponse,
  ReporteSuscripcionrResponse,
  DetalleSucursalesIncidenciasResponse,
  EmpresasFlotillaResponse,
  SucursalConCortesResponse,
  ComercioAfiliadoResponse,
  DetalleCorteCaja
} from '../../../models/empresa/reportes.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [...COMMON_IMPORTS, MatTabsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports implements OnInit {
  
  // ViewChild referencias
  @ViewChild('reporteOcupacion') reporteOcupacion?: ElementRef;
  @ViewChild('reporteFacturacion') reporteFacturacion?: ElementRef;
  @ViewChild('reporteSuscripciones') reporteSuscripciones?: ElementRef;
  @ViewChild('reporteIncidencias') reporteIncidencias?: ElementRef;
  @ViewChild('reporteFlotilla') reporteFlotilla?: ElementRef;
  @ViewChild('reporteCortes') reporteCortes?: ElementRef;
  @ViewChild('reporteComercios') reporteComercios?: ElementRef;

  // Datos de reportes (arrays)
  reporteOcupacionData: ReporteSucursalOcupacionResponse[] = [];
  reporteFacturacionData: ReporteFacturacionSucursalResponse[] = [];
  reporteSuscripcionesData: ReporteSuscripcionrResponse[] = [];
  reporteIncidenciasData: DetalleSucursalesIncidenciasResponse | null = null;
  reporteFlotillaData: EmpresasFlotillaResponse | null = null;
  reporteCortesData: SucursalConCortesResponse[] = [];
  reporteComerciosData: ComercioAfiliadoResponse[] = [];

  // Loading states
  isLoadingOcupacion = false;
  isLoadingFacturacion = false;
  isLoadingSuscripciones = false;
  isLoadingIncidencias = false;
  isLoadingFlotilla = false;
  isLoadingCortes = false;
  isLoadingComercios = false;

  // Variables
  fechaActual: string = new Date().toISOString();
  tabSeleccionado = 0;
  idUsuarioEmpresa: number;

  constructor(
    private reportesService: ReporteService,
    private snackBar: MatSnackBar
  ) {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.idUsuarioEmpresa = idUsuarioStr ? parseInt(idUsuarioStr) : 0;
  }

  ngOnInit(): void {
    this.cargarReporteOcupacion();
  }

  // ==========================================
  // MÉTODOS DE CAMBIO DE TAB
  // ==========================================

  onTabChange(index: number): void {
    this.tabSeleccionado = index;
    
    switch (index) {
      case 0:
        if (this.reporteOcupacionData.length === 0) this.cargarReporteOcupacion();
        break;
      case 1:
        if (this.reporteFacturacionData.length === 0) this.cargarReporteFacturacion();
        break;
      case 2:
        if (this.reporteSuscripcionesData.length === 0) this.cargarReporteSuscripciones();
        break;
      case 3:
        if (!this.reporteIncidenciasData) this.cargarReporteIncidencias();
        break;
      case 4:
        if (!this.reporteFlotillaData) this.cargarReporteFlotilla();
        break;
      case 5:
        if (this.reporteCortesData.length === 0) this.cargarReporteCortes();
        break;
      case 6:
        if (this.reporteComerciosData.length === 0) this.cargarReporteComercios();
        break;
    }
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================

  cargarReporteOcupacion(): void {
    this.isLoadingOcupacion = true;
    this.reportesService.getReporteOcupacionSucursal(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingOcupacion = false;
        this.reporteOcupacionData = response;
      },
      error: (error) => {
        this.isLoadingOcupacion = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de ocupación', 'error');
      }
    });
  }

  cargarReporteFacturacion(): void {
    if (this.reporteFacturacionData.length > 0) return;
    
    this.isLoadingFacturacion = true;
    this.reportesService.getReporteFacturacionSucursal(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingFacturacion = false;
        this.reporteFacturacionData = response;
      },
      error: (error) => {
        this.isLoadingFacturacion = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de facturación', 'error');
      }
    });
  }

  cargarReporteSuscripciones(): void {
    if (this.reporteSuscripcionesData.length > 0) return;
    
    this.isLoadingSuscripciones = true;
    this.reportesService.getReporteSuscripciones(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingSuscripciones = false;
        this.reporteSuscripcionesData = response;
      },
      error: (error) => {
        this.isLoadingSuscripciones = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de suscripciones', 'error');
      }
    });
  }

  cargarReporteIncidencias(): void {
    if (this.reporteIncidenciasData) return;
    
    this.isLoadingIncidencias = true;
    this.reportesService.getReporteIncidenciasSucursal(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingIncidencias = false;
        this.reporteIncidenciasData = response;
      },
      error: (error) => {
        this.isLoadingIncidencias = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de incidencias', 'error');
      }
    });
  }

  cargarReporteFlotilla(): void {
    if (this.reporteFlotillaData) return;
    
    this.isLoadingFlotilla = true;
    this.reportesService.getReporteFlotillaVehiculos(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingFlotilla = false;
        this.reporteFlotillaData = response;
      },
      error: (error) => {
        this.isLoadingFlotilla = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de flotilla', 'error');
      }
    });
  }

  cargarReporteCortes(): void {
    if (this.reporteCortesData.length > 0) return;
    
    this.isLoadingCortes = true;
    this.reportesService.getReporteCorteCajaSucursal(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingCortes = false;
        this.reporteCortesData = response;
      },
      error: (error) => {
        this.isLoadingCortes = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de cortes', 'error');
      }
    });
  }

  cargarReporteComercios(): void {
    if (this.reporteComerciosData.length > 0) return;
    
    this.isLoadingComercios = true;
    this.reportesService.getReporteComerciosAfiliados(this.idUsuarioEmpresa).subscribe({
      next: (response) => {
        this.isLoadingComercios = false;
        this.reporteComerciosData = response;
      },
      error: (error) => {
        this.isLoadingComercios = false;
        this.mostrarMensaje(error.error?.message || 'Error al cargar reporte de comercios', 'error');
      }
    });
  }

  // ==========================================
  // MÉTODOS DE DESCARGA - IMAGEN
  // ==========================================

  descargarComoImagen(tipoReporte: string): void {
    let element: HTMLElement | null = null;

    switch (tipoReporte) {
      case 'ocupacion':
        element = this.reporteOcupacion?.nativeElement;
        break;
      case 'facturacion':
        element = this.reporteFacturacion?.nativeElement;
        break;
      case 'suscripciones':
        element = this.reporteSuscripciones?.nativeElement;
        break;
      case 'incidencias':
        element = this.reporteIncidencias?.nativeElement;
        break;
      case 'flotilla':
        element = this.reporteFlotilla?.nativeElement;
        break;
      case 'cortes':
        element = this.reporteCortes?.nativeElement;
        break;
      case 'comercios':
        element = this.reporteComercios?.nativeElement;
        break;
    }

    if (!element) return;

    html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `reporte-${tipoReporte}-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      this.mostrarMensaje('Imagen descargada exitosamente', 'success');
    });
  }

  // ==========================================
  // MÉTODOS DE DESCARGA - PDF
  // ==========================================

  descargarComoPDF(tipoReporte: string): void {
    switch (tipoReporte) {
      case 'ocupacion':
        this.generarPDFOcupacion();
        break;
      case 'facturacion':
        this.generarPDFFacturacion();
        break;
      case 'suscripciones':
        this.generarPDFSuscripciones();
        break;
      case 'incidencias':
        this.generarPDFIncidencias();
        break;
      case 'flotilla':
        this.generarPDFFlotilla();
        break;
      case 'cortes':
        this.generarPDFCortes();
        break;
      case 'comercios':
        this.generarPDFComercios();
        break;
    }
  }

  private generarPDFOcupacion(): void {
    if (this.reporteOcupacionData.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE OCUPACIÓN', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteOcupacionData.forEach((sucursal, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Información de sucursal
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(sucursal.nombreSucursal, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`${sucursal.direccionCompleta}, ${sucursal.ciudad}`, 20, yPos);
      yPos += 6;
      doc.text(`Capacidad: 2R=${sucursal.capacidad2Ruedas} | 4R=${sucursal.capacidad4Ruedas}`, 20, yPos);
      yPos += 10;

      if (sucursal.detallesOcupacion) {
        const data = [
          ['Tipo', 'Ocupados', 'Capacidad', 'Porcentaje'],
          [
            'Dos Ruedas',
            sucursal.detallesOcupacion.ocupacion2R.toString(),
            sucursal.detallesOcupacion.capacidad2R.toString(),
            `${sucursal.detallesOcupacion.porcentajeOcupacion2R}%`
          ],
          [
            'Cuatro Ruedas',
            sucursal.detallesOcupacion.ocupacion4R.toString(),
            sucursal.detallesOcupacion.capacidad4R.toString(),
            `${sucursal.detallesOcupacion.porcentajeOcupacion4R}%`
          ]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [data[0]],
          body: data.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setTextColor(231, 76, 60);
        doc.text('Sin datos de ocupación', 20, yPos);
        yPos += 15;
      }
    });

    doc.save(`reporte-ocupacion-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFFacturacion(): void {
    if (this.reporteFacturacionData.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE FACTURACIÓN', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteFacturacionData.forEach((sucursal, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(sucursal.nombreSucursal, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Total Transacciones: ${sucursal.detallesFacturacion.length}`, 20, yPos);
      yPos += 10;

      if (sucursal.detallesFacturacion.length > 0) {
        const transaccionesData = sucursal.detallesFacturacion.map(t => [
          t.idTransaccion.toString(),
          t.nombreCliente,
          t.tipoCobro,
          t.horasCobradas.toString(),
          this.formatearMoneda(t.total)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['ID', 'Cliente', 'Tipo', 'Horas', 'Total']],
          body: transaccionesData,
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-facturacion-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFSuscripciones(): void {
    if (this.reporteSuscripcionesData.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE SUSCRIPCIONES', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteSuscripcionesData.forEach((plan, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(`${plan.nombrePlan} (${plan.codigoPlan})`, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Precio: ${this.formatearMoneda(plan.precioPlan)} | Estado: ${plan.estadoPlan}`, 20, yPos);
      yPos += 6;
      doc.text(`Suscriptores: ${plan.detallesSuscriptores.length}`, 20, yPos);
      yPos += 10;

      if (plan.detallesSuscriptores.length > 0) {
        const suscriptoresData = plan.detallesSuscriptores.map(s => [
          s.nombreSuscriptor,
          s.placaVehiculo,
          `${s.horasUtilizadasMes}/${s.horasMensualesIncluidas}`,
          s.estadoSuscripcion
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Suscriptor', 'Placa', 'Horas', 'Estado']],
          body: suscriptoresData,
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-suscripciones-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFIncidencias(): void {
    if (!this.reporteIncidenciasData) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE INCIDENCIAS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteIncidenciasData.detalleSucursalesIncidenciasDTO.forEach((sucursal, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(sucursal.nombreSucursal, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Total Incidencias: ${sucursal.incidenciasSucursalDTOList.length}`, 20, yPos);
      yPos += 10;

      if (sucursal.incidenciasSucursalDTOList.length > 0) {
        const incidenciasData = sucursal.incidenciasSucursalDTOList.map(inc => [
          inc.folioNumerico,
          inc.placaVehiculo,
          inc.incidencias.tipoIncidencia,
          inc.incidencias.resuelto ? 'Resuelto' : 'Pendiente'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Folio', 'Placa', 'Tipo', 'Estado']],
          body: incidenciasData,
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-incidencias-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFFlotilla(): void {
    if (!this.reporteFlotillaData) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE FLOTILLA', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteFlotillaData.empresasFlotilla.forEach((empresa, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(empresa.nombreEmpresa, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`NIT: ${empresa.nit} | Planes: ${empresa.planesCorporativos.length}`, 20, yPos);
      yPos += 10;

      if (empresa.planesCorporativos.length > 0) {
        const planesData = empresa.planesCorporativos.map(p => [
          p.nombrePlanCorporativo,
          p.numeroPlacasContratadas.toString(),
          this.formatearMoneda(p.precioPlanCorporativo),
          p.estado
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Plan', 'Placas', 'Precio', 'Estado']],
          body: planesData,
          theme: 'grid',
          headStyles: { fillColor: [155, 89, 182] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-flotilla-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFCortes(): void {
    if (this.reporteCortesData.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE CORTES DE CAJA', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteCortesData.forEach((sucursal, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(sucursal.nombreSucursal, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Total Cortes: ${sucursal.cortesDeCajas.length}`, 20, yPos);
      yPos += 10;

      if (sucursal.cortesDeCajas.length > 0) {
        const cortesData = sucursal.cortesDeCajas.map(c => [
          c.idCorteCaja.toString(),
          c.periodo,
          `${c.totalHorasComercio} hrs`,
          this.formatearMoneda(c.totalNeto),
          c.estado
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['ID', 'Periodo', 'Horas', 'Total', 'Estado']],
          body: cortesData,
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-cortes-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  private generarPDFComercios(): void {
    if (this.reporteComerciosData.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('REPORTE DE COMERCIOS AFILIADOS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generado: ${this.formatearFechaLegible(this.fechaActual)}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    this.reporteComerciosData.forEach((comercio, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(comercio.nombreComercial, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`NIT: ${comercio.nit} | Tipo: ${comercio.tipoComercio} | Estado: ${comercio.estado}`, 20, yPos);
      yPos += 6;
      doc.text(`Correo: ${comercio.correoContacto}`, 20, yPos);
      yPos += 10;

      if (comercio.detallesConvenioComercio.length > 0) {
        const conveniosData = comercio.detallesConvenioComercio.map(c => [
          c.idConvenioComercio.toString(),
          c.nombreSucursal,
          `${c.horasGratisMaximo} hrs`,
          this.formatearMoneda(c.tarifaPorHora),
          c.estado
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['ID', 'Sucursal', 'Horas Gratis', 'Tarifa/Hora', 'Estado']],
          body: conveniosData,
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      if (comercio.detallesCorteCaja.length > 0) {
        const liquidacionesData = comercio.detallesCorteCaja.map(l => [
          l.idLiquidacion.toString(),
          `${l.totalHorasOtorgadas} hrs`,
          this.formatearMoneda(l.montoTotal),
          l.estado
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['ID', 'Horas', 'Monto', 'Estado']],
          body: liquidacionesData,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113] },
          margin: { left: 20, right: 20 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    doc.save(`reporte-comercios-${new Date().getTime()}.pdf`);
    this.mostrarMensaje('PDF descargado exitosamente', 'success');
  }

  // ==========================================
  // MÉTODOS DE DESCARGA - EXCEL
  // ==========================================

  descargarComoExcel(tipoReporte: string): void {
    switch (tipoReporte) {
      case 'ocupacion':
        this.generarExcelOcupacion();
        break;
      case 'facturacion':
        this.generarExcelFacturacion();
        break;
      case 'suscripciones':
        this.generarExcelSuscripciones();
        break;
      case 'incidencias':
        this.generarExcelIncidencias();
        break;
      case 'flotilla':
        this.generarExcelFlotilla();
        break;
      case 'cortes':
        this.generarExcelCortes();
        break;
      case 'comercios':
        this.generarExcelComercios();
        break;
    }
  }

  private generarExcelOcupacion(): void {
    if (this.reporteOcupacionData.length === 0) return;

    const wb = XLSX.utils.book_new();

    this.reporteOcupacionData.forEach((sucursal, index) => {
      const wsData = [
        ['REPORTE DE OCUPACIÓN'],
        [],
        ['Información de Sucursal'],
        ['Nombre', sucursal.nombreSucursal],
        ['Dirección', sucursal.direccionCompleta],
        ['Ciudad', sucursal.ciudad],
        ['Departamento', sucursal.departamento],
        ['Horario', `${sucursal.horaApertura} - ${sucursal.horaCierre}`],
        ['Capacidad 2 Ruedas', sucursal.capacidad2Ruedas],
        ['Capacidad 4 Ruedas', sucursal.capacidad4Ruedas],
        []
      ];

      if (sucursal.detallesOcupacion) {
        wsData.push(
          ['Ocupación Actual'],
          ['Fecha/Hora', this.formatearFechaLegible(sucursal.detallesOcupacion.fechaHora)],
          ['Ocupación 2 Ruedas', `${sucursal.detallesOcupacion.ocupacion2R} / ${sucursal.detallesOcupacion.capacidad2R}`],
          ['Porcentaje 2 Ruedas', `${sucursal.detallesOcupacion.porcentajeOcupacion2R}%`],
          ['Ocupación 4 Ruedas', `${sucursal.detallesOcupacion.ocupacion4R} / ${sucursal.detallesOcupacion.capacidad4R}`],
          ['Porcentaje 4 Ruedas', `${sucursal.detallesOcupacion.porcentajeOcupacion4R}%`]
        );
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const nombreHoja = sucursal.nombreSucursal.substring(0, 30);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });

    XLSX.writeFile(wb, `reporte-ocupacion-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelFacturacion(): void {
    if (this.reporteFacturacionData.length === 0) return;

    const wb = XLSX.utils.book_new();

    this.reporteFacturacionData.forEach((sucursal, index) => {
      const wsDataInfo = [
        ['REPORTE DE FACTURACIÓN'],
        [],
        ['Sucursal', sucursal.nombreSucursal],
        ['Dirección', sucursal.direccionCompleta],
        ['Ciudad', sucursal.ciudad],
        ['Departamento', sucursal.departamento],
        []
      ];

      const wsInfo = XLSX.utils.aoa_to_sheet(wsDataInfo);
      XLSX.utils.book_append_sheet(wb, wsInfo, `Info-${index + 1}`);

      if (sucursal.detallesFacturacion.length > 0) {
        const transacciones = sucursal.detallesFacturacion.map(t => ({
          'ID Transacción': t.idTransaccion,
          'ID Ticket': t.idTicket,
          'Cliente': t.nombreCliente,
          'Tipo Cobro': t.tipoCobro,
          'Horas Cobradas': t.horasCobradas,
          'Horas Gratis': t.horasGratisComercio,
          'Tarifa': t.tarifaAplicada,
          'Subtotal': t.subtotal,
          'Descuento': t.descuento,
          'Total': t.total,
          'Método Pago': t.metodoPago,
          'Nº Transacción': t.numeroTransaccion,
          'Estado': t.estado,
          'Fecha': this.formatearFechaLegible(t.fechaTransaccion)
        }));

        const wsTransacciones = XLSX.utils.json_to_sheet(transacciones);
        const nombreHoja = sucursal.nombreSucursal.substring(0, 28);
        XLSX.utils.book_append_sheet(wb, wsTransacciones, nombreHoja);
      }
    });

    XLSX.writeFile(wb, `reporte-facturacion-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelSuscripciones(): void {
    if (this.reporteSuscripcionesData.length === 0) return;

    const wb = XLSX.utils.book_new();

    this.reporteSuscripcionesData.forEach((plan, index) => {
      const wsDataPlan = [
        ['REPORTE DE SUSCRIPCIONES'],
        [],
        ['Información del Plan'],
        ['ID', plan.idTipoPlan],
        ['Nombre', plan.nombrePlan],
        ['Código', plan.codigoPlan],
        ['Descripción', plan.descripcion],
        ['Precio', plan.precioPlan],
        ['Horas/Día', plan.horasDia],
        ['Horas/Mes', plan.horasMensuales],
        ['Días Aplicables', plan.diasAplicables],
        ['Cobertura Horaria', plan.coberturaHoraria],
        ['Estado', plan.estadoPlan],
        []
      ];

      const wsPlan = XLSX.utils.aoa_to_sheet(wsDataPlan);
      XLSX.utils.book_append_sheet(wb, wsPlan, `Plan-${index + 1}`);

      if (plan.detallesSuscriptores.length > 0) {
        const suscriptores = plan.detallesSuscriptores.map(s => ({
          'ID Suscripción': s.idSuscripcion,
          'Suscriptor': s.nombreSuscriptor,
          'Placa': s.placaVehiculo,
          'Monto Tarifa': s.montoTarifaReferenciada,
          'Horas Incluidas': s.horasMensualesIncluidas,
          'Horas Utilizadas Mes': s.horasUtilizadasMes,
          'Total Horas Utilizadas': s.totalHorasUtilizadas,
          'Excedente Pagado': s.totalExcedentePagado,
          'Fecha Inicio': this.formatearFechaParaMostrar(s.fechaInicioSuscripcion),
          'Fecha Fin': this.formatearFechaParaMostrar(s.fechaFinSuscripcion),
          'Estado': s.estadoSuscripcion
        }));

        const wsSuscriptores = XLSX.utils.json_to_sheet(suscriptores);
        const nombreHoja = `${plan.nombrePlan.substring(0, 25)}`;
        XLSX.utils.book_append_sheet(wb, wsSuscriptores, nombreHoja);
      }
    });

    XLSX.writeFile(wb, `reporte-suscripciones-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelIncidencias(): void {
    if (!this.reporteIncidenciasData) return;

    const wb = XLSX.utils.book_new();

    this.reporteIncidenciasData.detalleSucursalesIncidenciasDTO.forEach((sucursal, index) => {
      const incidencias = sucursal.incidenciasSucursalDTOList.map(inc => ({
        'Folio': inc.folioNumerico,
        'ID Ticket': inc.idTicket,
        'Tipo Cliente': inc.tipoCliente,
        'Estado Ticket': inc.estadoTicket,
        'Placa': inc.placaVehiculo,
        'Modelo': inc.modeloVehiculo,
        'Color': inc.colorVehiculo,
        'Propietario': inc.nombrePropietario,
        'Teléfono': inc.telefonoPropietario,
        'Tipo Incidencia': inc.incidencias.tipoIncidencia,
        'Descripción': inc.incidencias.descripcion,
        'Fecha Incidencia': this.formatearFechaLegible(inc.incidencias.fechaIncidencia),
        'Resuelto': inc.incidencias.resuelto ? 'Sí' : 'No',
        'Fecha Resolución': inc.incidencias.fechaResolucion ? this.formatearFechaLegible(inc.incidencias.fechaResolucion) : 'N/A',
        'Observaciones': inc.incidencias.observacionesResolucion || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(incidencias);
      const nombreHoja = sucursal.nombreSucursal.substring(0, 30);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });

    XLSX.writeFile(wb, `reporte-incidencias-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelFlotilla(): void {
    if (!this.reporteFlotillaData) return;

    const wb = XLSX.utils.book_new();

    const empresas = this.reporteFlotillaData.empresasFlotilla.map(e => ({
      'ID': e.idEmpresaFlotilla,
      'Empresa': e.nombreEmpresa,
      'Razón Social': e.razonSocial,
      'NIT': e.nit,
      'Teléfono': e.telefono,
      'Correo': e.correoContacto,
      'Dirección': e.direccion,
      'Estado': e.estado,
      'Fecha Registro': this.formatearFechaParaMostrar(e.fechaRegistro),
      'Total Planes': e.planesCorporativos.length
    }));

    const wsEmpresas = XLSX.utils.json_to_sheet(empresas);
    XLSX.utils.book_append_sheet(wb, wsEmpresas, 'Empresas');

    this.reporteFlotillaData.empresasFlotilla.forEach((empresa, index) => {
      const planes = empresa.planesCorporativos.map(p => ({
        'ID Plan': p.idPlanCorporativo,
        'Nombre': p.nombrePlanCorporativo,
        'Placas Contratadas': p.numeroPlacasContratadas,
        'Vehículos Activos': this.contarVehiculosActivos(p.suscripcionesVehiculos),
        'Tipo Plan': p.tipoPlan,
        'Descuento': `${p.descuentoCorporativoAdicional}%`,
        'Precio': p.precioPlanCorporativo,
        'Estado': p.estado,
        'Fecha Inicio': this.formatearFechaParaMostrar(p.fechaInicio),
        'Fecha Fin': this.formatearFechaParaMostrar(p.fechaFin),
        'Creado Por': p.creadoPor
      }));

      const ws = XLSX.utils.json_to_sheet(planes);
      const nombreHoja = `${empresa.nombreEmpresa.substring(0, 25)}`;
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });

    XLSX.writeFile(wb, `reporte-flotilla-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelCortes(): void {
    if (this.reporteCortesData.length === 0) return;

    const wb = XLSX.utils.book_new();

    this.reporteCortesData.forEach((sucursal, index) => {
      const wsDataInfo = [
        ['REPORTE DE CORTES DE CAJA'],
        [],
        ['Sucursal', sucursal.nombreSucursal],
        ['Dirección', sucursal.direccionCompleta],
        ['Ciudad', sucursal.ciudad],
        ['Departamento', sucursal.departamento],
        []
      ];

      const wsInfo = XLSX.utils.aoa_to_sheet(wsDataInfo);
      XLSX.utils.book_append_sheet(wb, wsInfo, `Info-${index + 1}`);

      if (sucursal.cortesDeCajas.length > 0) {
        const cortes = sucursal.cortesDeCajas.map(c => ({
          'ID Corte': c.idCorteCaja,
          'Periodo': c.periodo,
          'Fecha Inicio': this.formatearFechaParaMostrar(c.fechaInicio),
          'Fecha Fin': this.formatearFechaParaMostrar(c.fechaFin),
          'Total Horas Comercio': c.totalHorasComercio,
          'Total Liquidación': c.totalLiquidacionComercios,
          'Total Neto': c.totalNeto,
          'Generado Por': c.generadoPorNombreUsuario,
          'Fecha Generación': this.formatearFechaLegible(c.fechaGeneracion),
          'Estado': c.estado
        }));

        const wsCortes = XLSX.utils.json_to_sheet(cortes);
        const nombreHoja = sucursal.nombreSucursal.substring(0, 28);
        XLSX.utils.book_append_sheet(wb, wsCortes, nombreHoja);
      }
    });

    XLSX.writeFile(wb, `reporte-cortes-caja-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }

  private generarExcelComercios(): void {
    if (this.reporteComerciosData.length === 0) return;

    const wb = XLSX.utils.book_new();

    this.reporteComerciosData.forEach((comercio, index) => {
      const wsDataInfo: (string | number)[][] = [
        ['COMERCIO AFILIADO'],
        [],
        ['Nombre Comercial', comercio.nombreComercial],
        ['Razón Social', comercio.razonSocial],
        ['NIT', comercio.nit],
        ['Tipo Comercio', comercio.tipoComercio],
        ['Correo', comercio.correoContacto],
        ['Estado', comercio.estado],
        []
      ];

      if (comercio.detallesConvenioComercio.length > 0) {
        wsDataInfo.push(['CONVENIOS']);
        const convenios = comercio.detallesConvenioComercio.map(c => [
          `${c.idConvenioComercio}`,
          c.nombreSucursal,
          `${c.horasGratisMaximo}`,
          `${c.tarifaPorHora}`,
          c.periodoCorte,
          c.estado
        ]);
        wsDataInfo.push(['ID', 'Sucursal', 'Horas Gratis', 'Tarifa', 'Periodo', 'Estado']);
        convenios.forEach(c => wsDataInfo.push(c));
        wsDataInfo.push([]);
      }

      if (comercio.detallesCorteCaja.length > 0) {
        wsDataInfo.push(['LIQUIDACIONES']);
        const liquidaciones = comercio.detallesCorteCaja.map(l => [
          `${l.idLiquidacion}`,
          `${l.totalHorasOtorgadas}`,
          `${l.tarifaPorHora}`,
          `${l.montoTotal}`,
          l.estado
        ]);
        wsDataInfo.push(['ID', 'Horas', 'Tarifa', 'Monto', 'Estado']);
        liquidaciones.forEach(l => wsDataInfo.push(l));
      }

      const ws = XLSX.utils.aoa_to_sheet(wsDataInfo.map(row => row.map(String)));
      const nombreHoja = comercio.nombreComercial.substring(0, 30);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });

    XLSX.writeFile(wb, `reporte-comercios-${new Date().getTime()}.xlsx`);
    this.mostrarMensaje('Excel descargado exitosamente', 'success');
  }


  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  formatearFechaParaMostrar(fecha: string | null): string {
    if (!fecha) return 'No definida';

    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return fecha.split('T')[0];
      }

      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  formatearFechaLegible(fecha: string | null): string {
    if (!fecha) return 'No definida';

    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return fecha.split('T')[0];
      }

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return fechaObj.toLocaleDateString('es-GT', opciones);
    } catch (error) {
      return fecha.split('T')[0];
    }
  }

  formatearMoneda(valor: string | number): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(numero);
  }

  obtenerEstadoInfo(estado: string | null | undefined): { text: string; class: string; icon: string } {
    if (!estado) {
      return { text: 'N/A', class: 'chip-pendiente', icon: 'help' };
    }
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'ACTIVA':
      case 'ACTIVO':
      case 'VIGENTE':
        return { text: 'Activo', class: 'chip-activo', icon: 'check_circle' };
      case 'INACTIVA':
      case 'INACTIVO':
      case 'HISTORICO':
        return { text: 'Inactivo', class: 'chip-inactivo', icon: 'cancel' };
      case 'PENDIENTE':
      case 'PRELIMINAR':
        return { text: 'Pendiente', class: 'chip-pendiente', icon: 'schedule' };
      case 'COMPLETADO':
      case 'CERRADO':
        return { text: 'Completado', class: 'chip-completado', icon: 'done_all' };
      case 'EXITOSO':
        return { text: 'Exitoso', class: 'chip-exitoso', icon: 'check_circle' };
      case 'FALLIDO':
        return { text: 'Fallido', class: 'chip-fallido', icon: 'error' };
      default:
        return { text: estado, class: 'chip-pendiente', icon: 'help' };
    }
  }

  contarVehiculosActivos(suscripciones: any[]): number {
    if (!suscripciones) return 0;
    return suscripciones.filter(s => s.estado === 'ACTIVA').length;
  }

  calcularTotalHoras(liquidaciones: DetalleCorteCaja[]): string {
    if (!liquidaciones || liquidaciones.length === 0) return '0.00';
    
    const total = liquidaciones.reduce((sum, liquidacion) => {
      return sum + parseFloat(liquidacion.totalHorasOtorgadas || '0');
    }, 0);
    
    return total.toFixed(2);
  }

  calcularTotalMonto(liquidaciones: DetalleCorteCaja[]): number {
    if (!liquidaciones || liquidaciones.length === 0) return 0;
    
    return liquidaciones.reduce((sum, liquidacion) => {
      return sum + parseFloat(liquidacion.montoTotal || '0');
    }, 0);
  }

  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [tipo],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}