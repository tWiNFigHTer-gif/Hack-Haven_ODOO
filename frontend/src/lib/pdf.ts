import { Invoice } from './api';

export function downloadInvoicePDF(invoice: Invoice): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download/print the invoice.');
    return;
  }

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E7E0D6;">
        <td style="padding: 12px 8px;">
          <div style="font-weight: 600; color: #1e1b19;">${item.title}</div>
          <div style="font-size: 12px; color: #645d58;">${item.description}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #1e1b19;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #1e1b19;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; color: #645d58;">$${item.tax.toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #1e1b19;">$${item.amount.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber} — Brightloop Sanctuary</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e1b19;
      background: #ffffff;
      padding: 40px;
      margin: 0;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E7E0D6;
      border-radius: 12px;
      padding: 36px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #E7E0D6;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-family: 'Georgia', serif;
      font-size: 26px;
      font-weight: 600;
      color: #1e1b19;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      background: ${invoice.status === 'paid' ? '#D1FAE5' : invoice.status === 'overdue' ? '#FEE2E2' : '#FEF3C7'};
      color: ${invoice.status === 'paid' ? '#059669' : invoice.status === 'overdue' ? '#DC2626' : '#D97706'};
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #FAF7F2;
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #645d58;
    }
    .totals {
      width: 320px;
      margin-left: auto;
      background: #FAF7F2;
      border-radius: 8px;
      padding: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #53443d;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      font-family: 'Georgia', serif;
      font-size: 20px;
      font-weight: 600;
      color: #1e1b19;
      border-top: 1px solid #E7E0D6;
      padding-top: 12px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 36px;
      text-align: center;
      font-size: 12px;
      color: #78716C;
      border-top: 1px solid #E7E0D6;
      padding-top: 16px;
    }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">Brightloop Sanctuary</div>
        <div style="font-size: 12px; color: #78716C; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Private Client Statement</div>
        <h2 style="margin: 16px 0 0 0; font-size: 24px;">${invoice.invoiceNumber}</h2>
      </div>
      <div style="text-align: right;">
        <span class="badge">${invoice.status}</span>
        <div style="font-size: 13px; color: #645d58; margin-top: 8px;">Issue Date: ${invoice.issueDate}</div>
        <div style="font-size: 13px; font-weight: 600; color: #1e1b19;">Due Date: ${invoice.dueDate}</div>
        ${invoice.receiptRef ? `<div style="font-size: 12px; color: #059669; margin-top: 4px;">Receipt: ${invoice.receiptRef}</div>` : ''}
      </div>
    </div>

    <div class="grid">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716C; font-weight: 600;">Billed To</div>
        <div style="font-weight: 600; margin-top: 4px;">${invoice.customer.name}</div>
        <div style="font-size: 12px; color: #9A5B3C;">Client Ref: ${invoice.customer.clientRef}</div>
        <div style="font-size: 13px; color: #53443d; white-space: pre-line; margin-top: 4px;">${invoice.customer.address}</div>
        <div style="font-size: 13px; color: #645d58; margin-top: 4px;">${invoice.customer.email}</div>
      </div>
      <div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716C; font-weight: 600;">Issued By</div>
        <div style="font-weight: 600; margin-top: 4px;">${invoice.issuer.company}</div>
        <div style="font-size: 12px; color: #645d58;">EIN: ${invoice.issuer.ein}</div>
        <div style="font-size: 13px; color: #53443d; white-space: pre-line; margin-top: 4px;">${invoice.issuer.address}</div>
        <div style="font-size: 13px; color: #645d58; margin-top: 4px;">${invoice.issuer.email}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Tax</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>$${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${
        invoice.discount > 0
          ? `
      <div class="total-row" style="color: #059669;">
        <span>${invoice.discountLabel || 'Discount'}</span>
        <span>-$${invoice.discount.toFixed(2)}</span>
      </div>`
          : ''
      }
      <div class="total-row">
        <span>Tax (NY 8.875%)</span>
        <span>$${invoice.tax.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Shipping</span>
        <span>Complimentary</span>
      </div>
      <div class="grand-total">
        <span>Total Due</span>
        <span>$${invoice.totalAmount.toFixed(2)} USD</span>
      </div>
    </div>

    <div class="footer">
      Brightloop Sanctuary Atelier • 256-Bit Encrypted Reconciliation • All Rights Reserved
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

