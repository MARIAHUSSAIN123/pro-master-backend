// Spec 3.9 — "Data exports (CSV/Excel/PDF)".
//
// CSV export already existed (see dashboardController). These two
// helpers add Excel and PDF without pulling in extra npm packages
// (exceljs / pdfkit), since network access isn't guaranteed at every
// deployment step:
//
//  - toExcelXML(): builds a SpreadsheetML 2003 (.xls) document — a
//    plain-XML format Microsoft Excel, Google Sheets, and LibreOffice
//    all open natively. No zip/compression needed.
//  - buildPdfReport(): builds a genuinely valid PDF byte-for-byte by
//    hand (Helvetica text objects, xref table, trailer) — no library.
//
// If a design tool (charts, styling, merged cells) is ever needed,
// swap these for the `exceljs` / `pdfkit` npm packages instead — but
// for tabular reports these are complete and dependency-free.

const escapeXML = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Build a SpreadsheetML 2003 document (opens as a real spreadsheet in
 * Excel/Sheets/LibreOffice — not just a renamed CSV).
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @param {string} sheetName
 * @returns {string} XML content — serve with .xls extension.
 */
export const toExcelXML = (headers, rows, sheetName = "Sheet1") => {
  const cellXML = (value) => {
    const isNumber = typeof value === "number" && Number.isFinite(value);
    return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXML(
      value
    )}</Data></Cell>`;
  };

  const headerRow = `<Row>${headers
    .map(
      (h) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(
          h
        )}</Data></Cell>`
    )
    .join("")}</Row>`;

  const dataRows = rows
    .map((row) => `<Row>${row.map(cellXML).join("")}</Row>`)
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#DCE6F1" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXML(sheetName)}">
  <Table>
   ${headerRow}
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
};

// ---------------------------------------------------------------
// Minimal PDF generation (no dependency)
// ---------------------------------------------------------------

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const PAGE_WIDTH = 792; // US Letter landscape-ish width, points
const PAGE_HEIGHT = 612;
const MARGIN = 40;
const ROW_HEIGHT = 16;
const ROWS_PER_PAGE = Math.floor((PAGE_HEIGHT - MARGIN * 2 - 60) / ROW_HEIGHT);

const buildPageContent = (title, headers, rowsChunk, colWidths, pageNum, totalPages) => {
  let y = PAGE_HEIGHT - MARGIN;
  const lines = [];

  lines.push("BT", "/F2 14 Tf", `${MARGIN} ${y} Td`, `(${escapePdfText(title)}) Tj`, "ET");
  y -= 20;
  lines.push(
    "BT",
    "/F1 8 Tf",
    `${MARGIN} ${y} Td`,
    `(Page ${pageNum} of ${totalPages} — generated ${new Date().toISOString().split("T")[0]}) Tj`,
    "ET"
  );
  y -= 20;

  // Header row
  let x = MARGIN;
  lines.push("BT", "/F2 9 Tf");
  headers.forEach((h, i) => {
    lines.push(`${x} ${y} Td (${escapePdfText(h)}) Tj`, `-${x} -${y} Td`);
    x += colWidths[i];
  });
  lines.push("ET");
  y -= ROW_HEIGHT;

  // A thin rule under the header
  lines.push(`${MARGIN} ${y + 6} m ${PAGE_WIDTH - MARGIN} ${y + 6} l S`);

  rowsChunk.forEach((row) => {
    x = MARGIN;
    lines.push("BT", "/F1 8 Tf");
    row.forEach((cell, i) => {
      const text = String(cell ?? "");
      const maxChars = Math.max(4, Math.floor(colWidths[i] / 4.6));
      const truncated = text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
      lines.push(`${x} ${y} Td (${escapePdfText(truncated)}) Tj`, `-${x} -${y} Td`);
      x += colWidths[i];
    });
    lines.push("ET");
    y -= ROW_HEIGHT;
  });

  return lines.join("\n");
};

/**
 * Build a genuinely valid, multi-page PDF (Buffer) from a flat table —
 * good for a simple invoice list / booking report handed to a manager
 * or accountant. For a per-invoice styled document, keep using the
 * docx/pdf skill's richer tooling — this is for tabular exports.
 */
export const buildPdfReport = ({ title, headers, rows, colWidths }) => {
  const widths =
    colWidths ||
    headers.map(() => Math.floor((PAGE_WIDTH - MARGIN * 2) / headers.length));

  const pages = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    pages.push(rows.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  const objects = [];
  // 1: Catalog, 2: Pages — filled in after we know page object numbers
  objects.push(null); // placeholder index 0 (objects are 1-indexed)
  objects.push(""); // obj 1 catalog placeholder
  objects.push(""); // obj 2 pages placeholder

  const fontRegularObjNum = 3;
  const fontBoldObjNum = 4;
  objects.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`
  );
  objects.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`
  );

  const pageObjNums = [];
  const contentObjNums = [];
  let nextObjNum = 5;

  pages.forEach((chunk, idx) => {
    const pageObjNum = nextObjNum++;
    const contentObjNum = nextObjNum++;
    pageObjNums.push(pageObjNum);
    contentObjNums.push(contentObjNum);

    const content = buildPageContent(title, headers, chunk, widths, idx + 1, pages.length);
    objects[pageObjNum] = `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontRegularObjNum} 0 R /F2 ${fontBoldObjNum} 0 R >> >> /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentObjNum} 0 R >>`;
    objects[contentObjNum] = { stream: content };
  });

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Kids [${pageObjNums
    .map((n) => `${n} 0 R`)
    .join(" ")}] /Count ${pageObjNums.length} >>`;

  // Serialize
  let pdf = "%PDF-1.4\n";
  const offsets = [0]; // obj 0 is free, offset 0

  for (let num = 1; num < objects.length; num++) {
    offsets[num] = Buffer.byteLength(pdf, "latin1");
    const obj = objects[num];
    if (obj && typeof obj === "object" && "stream" in obj) {
      const streamBody = obj.stream;
      pdf += `${num} 0 obj\n<< /Length ${Buffer.byteLength(streamBody, "latin1")} >>\nstream\n${streamBody}\nendstream\nendobj\n`;
    } else {
      pdf += `${num} 0 obj\n${obj}\nendobj\n`;
    }
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  const totalObjects = objects.length; // includes obj 0
  pdf += `xref\n0 ${totalObjects}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let num = 1; num < totalObjects; num++) {
    pdf += `${offsets[num].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
};
