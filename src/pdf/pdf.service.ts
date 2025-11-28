import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateReceiptPdf(receipt: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // -----------------------------------------------------
        // HEADER
        // -----------------------------------------------------
        doc
          .fontSize(26)
          .font('Helvetica-Bold')
          .text('ORDER RECEIPT', { align: 'center' })
          .moveDown(1);

        doc
          .font('Helvetica')
          .fontSize(12)
          .text(`Order ID: ${receipt.orderId}`)
          .text(`Date: ${new Date(receipt.timestamp).toLocaleString()}`)
          .text(`Store: ${receipt.store.name}`)
          .text(`Customer Email: ${receipt.user.email}`)
          .moveDown(2);

        // -----------------------------------------------------
        // ITEMS TABLE
        // -----------------------------------------------------
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('Items Purchased', { underline: true })
          .moveDown(1);

        const tableTop = doc.y;

        this.drawTableRow(doc, tableTop, {
          name: 'Product',
          qty: 'Qty',
          price: 'Price',
          total: 'Total',
        });

        this.drawLine(doc, tableTop + 20);

        let currentY = tableTop + 30;

        doc.font('Helvetica').fontSize(12);

        receipt.items.forEach((item: any) => {
          this.drawTableRow(doc, currentY, {
            name: item.name,
            qty: item.quantity.toString(),
            price: `PKR ${item.price}`,
            total: `PKR ${item.lineTotal}`,
          });

          currentY += 25;
          this.drawLine(doc, currentY - 5);
        });

        doc.moveDown(2);

        // -----------------------------------------------------
        // TOTALS
        // -----------------------------------------------------
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .text('Summary', { underline: true })
          .moveDown(1);

        this.drawKeyValue(doc, 'Subtotal:', `PKR ${receipt.subtotal}`);
        this.drawKeyValue(
          doc,
          `Discount (${receipt.discountPercentage}):`,
          `- PKR ${receipt.discount}`,
        );
        this.drawKeyValue(doc, 'Net Payable:', `PKR ${receipt.netPayable}`, true);

        // Footer
        doc.moveDown(2);
        doc
          .fontSize(10)
          .fillColor('gray')
          .text('Thank you for your purchase!', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private drawLine(doc: PDFKit.PDFDocument, y: number) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(40, y)
      .lineTo(555, y)
      .stroke();
  }

  private drawTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    row: { name: string; qty: string; price: string; total: string },
  ) {
    const nameX = 40;
    const qtyX = 300;
    const priceX = 370;
    const totalX = 460;

    doc
      .font('Helvetica')
      .fontSize(12)
      .text(row.name, nameX, y)
      .text(row.qty, qtyX, y)
      .text(row.price, priceX, y)
      .text(row.total, totalX, y);
  }

  private drawKeyValue(
    doc: PDFKit.PDFDocument,
    key: string,
    value: string,
    bold: boolean = false,
  ) {
    const keyX = 350;
    const valueX = 460;

    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');

    doc.text(key, keyX, doc.y);
    doc.text(value, valueX, doc.y);
    doc.moveDown(1);
  }
}
