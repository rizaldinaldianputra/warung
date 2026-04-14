import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './utils';

export const generateInvoicePDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Navy color (#0f172a)
  doc.text('WARUNG CO', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Pasar Baru No. 5, Sidoarjo', 20, 27);
  doc.text('Telp: 0812-3456-7890', 20, 32);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Order ID: ${order.id}`, pageWidth - 20, 27, { align: 'right' });
  doc.text(`Date: ${formatDate(order.createdAt || order.created_at)}`, pageWidth - 20, 32, { align: 'right' });
  
  // horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 40, pageWidth - 20, 40);
  
  // Billing Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('BILL TO:', 20, 50);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customer.name, 20, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer.phone || '', 20, 61);
  doc.text(order.customer.address || '', 20, 66, { maxWidth: 80 });
  
  // Payment Status
  doc.setTextColor(100);
  doc.text('STATUS:', pageWidth - 80, 50);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.status, pageWidth - 80, 56);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment: Cash on Delivery', pageWidth - 80, 61);
  
  // Items Table
  autoTable(doc, {
    startY: 80,
    head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Subtotal']],
    body: order.items.map((item: any) => [
      item.product.name,
      item.product.sku,
      item.quantity,
      formatCurrency(item.unit_price),
      formatCurrency(item.subtotal),
    ]),
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Totals
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 70, finalY + 10);
  doc.text(formatCurrency(order.total_amount), pageWidth - 20, finalY + 10, { align: 'right' });
  
  doc.text('Tax (0%):', pageWidth - 70, finalY + 17);
  doc.text('Rp 0', pageWidth - 20, finalY + 17, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - 70, finalY + 27);
  doc.text(formatCurrency(order.total_amount), pageWidth - 20, finalY + 27, { align: 'right' });
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for shopping at Warung CO!', pageWidth / 2, 280, { align: 'center' });
  
  doc.save(`Invoice-${order.id}.pdf`);
};

export const generateSuratJalanPDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('WARUNG CO', 20, 20);
  
  doc.setFontSize(18);
  doc.text('SURAT JALAN', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`No. Dokumen: SJ-${order.id.substring(0, 8)}`, pageWidth - 20, 27, { align: 'right' });
  doc.text(`Tanggal: ${formatDate(new Date())}`, pageWidth - 20, 32, { align: 'right' });
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.line(20, 40, pageWidth - 20, 40);
  
  // Delivery Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('PENGIRIM:', 20, 50);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Warung CO - Gudang Pusat', 20, 56);
  doc.setFont('helvetica', 'normal');
  doc.text('Pasar Baru No. 5, Sidoarjo', 20, 61);
  
  doc.setTextColor(100);
  doc.text('PENERIMA (TUJUAN):', pageWidth / 2, 50);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customer.name, pageWidth / 2, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer.phone || '', pageWidth / 2, 61);
  doc.text(order.customer.address || '', pageWidth / 2, 66, { maxWidth: 80 });
  
  // Items Table (No Prices for Surat Jalan)
  autoTable(doc, {
    startY: 85,
    head: [['No', 'Nama Barang', 'SKU', 'Jumlah', 'Satuan', 'Keterangan']],
    body: order.items.map((item: any, i: number) => [
      i + 1,
      item.product.name,
      item.product.sku,
      item.quantity,
      item.product.unit || 'pcs',
      ''
    ]),
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], lineWidth: 0.1, lineColor: [200] },
    bodyStyles: { lineWidth: 0.1, lineColor: [226, 232, 240] },
    margin: { left: 20, right: 20 },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Signature Area
  const sigY = finalY + 40;
  doc.setFontSize(10);
  doc.text('Diterima Oleh,', 30, sigY);
  doc.line(20, sigY + 25, 60, sigY + 25);
  doc.text('(_________________)', 22, sigY + 30);
  
  doc.text('Kurir Pengirim,', pageWidth / 2, sigY, { align: 'center' });
  doc.line(pageWidth / 2 - 20, sigY + 25, pageWidth / 2 + 20, sigY + 25);
  doc.text('(_________________)', pageWidth / 2, sigY + 30, { align: 'center' });
  
  doc.text('Hormat Kami,', pageWidth - 50, sigY);
  doc.line(pageWidth - 60, sigY + 25, pageWidth - 20, sigY + 25);
  doc.text('Admin Warung CO', pageWidth - 55, sigY + 30);
  
  // Save
  doc.save(`Surat-Jalan-${order.id}.pdf`);
};
