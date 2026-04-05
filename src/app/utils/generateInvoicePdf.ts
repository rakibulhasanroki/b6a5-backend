import PDFDocument from "pdfkit";

interface InvoiceData {
  invoiceId: string;
  userName: string;
  eventTitle: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
}

export const generateInvoicePdf = async (
  data: InvoiceData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "center" });

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Planora Event Platform", { align: "center" });

    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(11).text("Invoice Info");

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Invoice ID: ${data.invoiceId}`)
      .text(`Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`)
      .text(`Transaction ID: ${data.transactionId || "N/A"}`);

    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(11).text("Customer");

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Name: ${data.userName || "N/A"}`);

    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(11).text("Event Details");

    doc.font("Helvetica").fontSize(10).text(`Event: ${data.eventTitle}`);

    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    const startX = 50;
    const amountX = 450;

    doc.font("Helvetica-Bold").fontSize(11).text("Payment Summary");

    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Description", startX);
    doc.text("Amount", amountX, doc.y, { align: "right" });

    doc
      .moveTo(startX, doc.y + 5)
      .lineTo(545, doc.y + 5)
      .stroke();

    doc.moveDown(0.8);

    doc.font("Helvetica").fontSize(10);
    doc.text("Event Fee", startX);
    doc.text(`${data.amount.toFixed(2)} BDT`, amountX, doc.y, {
      align: "right",
    });

    doc.moveDown(0.8);

    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Total", startX);
    doc.text(`${data.amount.toFixed(2)} BDT`, amountX, doc.y, {
      align: "right",
    });

    doc.moveDown(1.5);

    doc.moveTo(startX, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(1);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "This is an automatically generated invoice for your event booking.",
        { align: "center" },
      );

    doc.moveDown(0.3);

    doc.text("Payment processed securely via Stripe.", {
      align: "center",
    });

    doc.end();
  });
};
