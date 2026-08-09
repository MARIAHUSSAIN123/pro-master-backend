// Client requirement: booking confirmation email includes the quote
// as a PDF; a second email includes the invoice as a PDF (with case
// number, invoice number, order details, total incl. tax).
//
// Builds real, valid single-page PDFs by hand (same technique as
// utils/exportFormats.js -> buildPdfReport) instead of pulling in
// pdfkit/puppeteer, since network access isn't guaranteed at every
// deployment step. If richer layout (logos, multi-column) is ever
// needed, swap this for pdfkit — the {to, subject, html, attachments}
// shape in sendEmail.js already supports Buffer attachments either way.

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 50;

const escapePdfText = (str) =>
  String(str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const buildContentStream = (lines) => {
  let y = PAGE_HEIGHT - MARGIN;
  let stream = "";

  lines.forEach((line) => {
    const size = line.size || 11;
    const font = line.bold ? "/F2" : "/F1";
    stream += `BT ${font} ${size} Tf ${MARGIN} ${y} Td (${escapePdfText(
      line.text
    )}) Tj ET\n`;
    y -= line.gap || size + 6;
  });

  return stream;
};

// lines: [{ text, size?, bold?, gap? }] — rendered top to bottom.
export const buildSimplePdf = (lines) => {
  const content = buildContentStream(lines);

  // Object numbers: 1 Catalog, 2 Pages, 3 Page, 4 Font (regular),
  // 5 Font (bold), 6 Content stream.
  const objects = [
    null,
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 6 0 R >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
    { stream: content },
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let num = 1; num < objects.length; num++) {
    offsets[num] = Buffer.byteLength(pdf, "latin1");
    const obj = objects[num];

    if (obj && typeof obj === "object" && "stream" in obj) {
      const body = obj.stream;
      pdf += `${num} 0 obj\n<< /Length ${Buffer.byteLength(
        body,
        "latin1"
      )} >>\nstream\n${body}\nendstream\nendobj\n`;
    } else {
      pdf += `${num} 0 obj\n${obj}\nendobj\n`;
    }
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  const total = objects.length;
  pdf += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let num = 1; num < total; num++) {
    pdf += `${offsets[num].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
};

// ======================================
// Quote PDF
// ======================================
export const buildQuotePdf = (quote, customer) => {
  const lines = [
    { text: "Pro Master Cleaning & Maintenance", bold: true, size: 16, gap: 26 },
    { text: `Quote ${quote.quoteNumber}`, bold: true, size: 13, gap: 22 },
    { text: `Date: ${new Date(quote.createdAt).toLocaleDateString()}`, gap: 16 },
    { text: `Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, gap: 26 },
    { text: "Bill To:", bold: true, gap: 16 },
    { text: customer.fullName, gap: 14 },
    { text: customer.email, gap: 14 },
    { text: customer.phone, gap: 26 },
    { text: "Services:", bold: true, gap: 18 },
  ];

  quote.items.forEach((item) => {
    lines.push({
      text: `${item.serviceName}   x${item.quantity}   $${item.lineTotal.toFixed(2)}`,
      gap: 16,
    });
  });

  lines.push(
    { text: " ", gap: 10 },
    { text: `Subtotal: $${quote.subtotal.toFixed(2)}`, gap: 14 },
    { text: `Tax: $${quote.tax.toFixed(2)}`, gap: 14 },
    { text: `Discount: -$${quote.discount.toFixed(2)}`, gap: 14 },
    { text: `Total: $${quote.totalAmount.toFixed(2)}`, bold: true, size: 13, gap: 20 }
  );

  return buildSimplePdf(lines);
};

// ======================================
// Invoice PDF
// caseNumber = the Booking's bookingNumber (client's "case number
// that will be assigned" to the customer's order).
// ======================================
export const buildInvoicePdf = (invoice, booking, customer) => {
  const lines = [
    { text: "Pro Master Cleaning & Maintenance", bold: true, size: 16, gap: 26 },
    { text: `Invoice ${invoice.invoiceNumber}`, bold: true, size: 13, gap: 20 },
    { text: `Case Number: ${booking.bookingNumber}`, bold: true, gap: 22 },
    { text: `Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, gap: 26 },
    { text: "Bill To:", bold: true, gap: 16 },
    { text: customer.fullName, gap: 14 },
    { text: customer.email, gap: 14 },
    { text: customer.phone, gap: 26 },
    { text: "Order Details:", bold: true, gap: 18 },
    { text: `Service date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "-"} ${booking.bookingTime || ""}`, gap: 16 },
    { text: `Address: ${booking.address || "-"}`, gap: 26 },
    { text: `Subtotal: $${invoice.subtotal.toFixed(2)}`, gap: 14 },
    { text: `Tax: $${invoice.tax.toFixed(2)}`, gap: 14 },
    { text: `Discount: -$${invoice.discount.toFixed(2)}`, gap: 14 },
    { text: `Total (incl. tax): $${invoice.totalAmount.toFixed(2)}`, bold: true, size: 13, gap: 20 },
    { text: `Payment status: ${invoice.paymentStatus}`, gap: 14 },
  ];

  return buildSimplePdf(lines);
};