import { jsPDF } from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  discountPercent: number | null;
  discountDays: number | null;
  seller: {
    name: string;
    email: string;
    businessId: string | null;
    address: string | null;
    iban: string | null;
  };
  buyer: {
    name: string;
    email: string | null;
    address: string | null;
  };
}

const fmt = (n: number) =>
  n.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export function generateInvoicePdf(data: InvoiceData): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const L = 20;   // vasen marginaali
  const R = 190;  // oikea reuna
  let y = 20;

  // ── Otsikko ──────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LASKU', R, y, { align: 'right' });

  // ── Myyjän tiedot (vasen yläkulma) ───────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.seller.name, L, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (data.seller.address) {
    doc.text(data.seller.address, L, y);
    y += 5;
  }
  doc.text(data.seller.email, L, y);
  y += 5;
  if (data.seller.businessId) {
    doc.text(`Y-tunnus: ${data.seller.businessId}`, L, y);
    y += 5;
  }
  if (data.seller.iban) {
    doc.text(`Tilinumero: ${data.seller.iban}`, L, y);
    y += 5;
  }

  // ── Laskun numero ja päivämäärät (oikea yläkulma) ────────────────────────
  let metaY = 26;
  doc.setFontSize(10);
  doc.text(`Laskun numero:`, 120, metaY);
  doc.setFont('helvetica', 'bold');
  doc.text(data.invoiceNumber, R, metaY, { align: 'right' });
  metaY += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`Laskutuspäivä:`, 120, metaY);
  doc.text(data.issueDate, R, metaY, { align: 'right' });
  metaY += 6;

  doc.text(`Eräpäivä:`, 120, metaY);
  doc.setFont('helvetica', 'bold');
  doc.text(data.dueDate, R, metaY, { align: 'right' });

  // ── Viivain ───────────────────────────────────────────────────────────────
  y = Math.max(y, metaY) + 10;
  doc.setDrawColor(180, 180, 180);
  doc.line(L, y, R, y);
  y += 8;

  // ── Ostajan tiedot ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('LASKUTETAAN', L, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(data.buyer.name, L, y);
  y += 5;
  if (data.buyer.address) {
    doc.text(data.buyer.address, L, y);
    y += 5;
  }
  if (data.buyer.email) {
    doc.text(data.buyer.email, L, y);
    y += 5;
  }

  // ── Summataulu ────────────────────────────────────────────────────────────
  y += 20;
  doc.setDrawColor(180, 180, 180);
  doc.line(L, y, R, y);
  y += 7;

  const col1 = L;
  const col2 = R;

  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.text(label, col1, y);
    doc.text(value, col2, y, { align: 'right' });
    y += 6;
  };

  row('Veroton hinta (alv 0 %)', fmt(data.subtotal));
  row(`ALV ${data.vatRate} %`, fmt(data.vatAmount));

  if (data.discountPercent && data.discountDays) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(
      `Käteisalennus ${data.discountPercent} % jos maksetaan ${data.discountDays} pv kuluessa`,
      col1,
      y
    );
    y += 5;
  }

  doc.setDrawColor(180, 180, 180);
  doc.line(L, y, R, y);
  y += 6;

  row('Yhteensä', fmt(data.totalAmount), true);

  // ── Alatunniste ───────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Kiitos tilauksesta!', L, 280);

  // Palautetaan PDF bufferina
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
