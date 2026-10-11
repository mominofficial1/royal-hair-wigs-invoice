'use client';

import React from 'react';
import Image from 'next/image';
import { InvoiceData, CURRENCIES } from '@/types/invoice';

interface InvoicePreviewProps {
  invoice: InvoiceData;
  scale?: number;
}

export default function InvoicePreview({ invoice, scale = 1 }: InvoicePreviewProps) {
  const currentCurrency = CURRENCIES.find((c) => c.code === invoice.paymentCurrency) || CURRENCIES[0];
  const sym = currentCurrency.symbol;

  const formatPrice = (val: number) => {
    return `${val.toLocaleString(undefined, {
      minimumFractionDigits: currentCurrency.decimals > 0 ? (val % 1 !== 0 ? 2 : 0) : 0,
      maximumFractionDigits: currentCurrency.decimals,
    })}${sym}`;
  };

  return (
    <div className="w-full flex justify-center overflow-x-auto py-2">
      {/* A4 Paper Container */}
      <div
        id="invoice-a4-document"
        className="invoice-a4-page bg-white text-black relative shadow-xl border border-slate-300 w-full max-w-[794px] min-h-[1050px] p-8 sm:p-12 md:p-14 font-sans select-text flex flex-col justify-between"
        style={{
          boxSizing: 'border-box',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Subtle Watermark in Center Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <div className="relative w-[480px] h-[340px] opacity-[0.06] select-none">
            <Image
              src="/logo.png"
              alt="Watermark"
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Top Header Section */}
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4">
            {/* Top Left: Logo & Company Description */}
            <div className="flex flex-col items-start max-w-[50%]">
              <div className="relative w-36 h-24 mb-1">
                <Image
                  src={invoice.companyLogoUrl || '/logo.png'}
                  alt={invoice.companyName || 'Royal Hair Wigs'}
                  fill
                  unoptimized
                  className="object-contain object-left"
                  priority
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-black leading-tight mt-1">
                {invoice.companyName || 'Royal Hair Wigs'}
              </h2>
              <p className="text-xs text-black font-normal mt-0.5 leading-snug">
                {invoice.businessDescription || 'Processed Hair & Wig Manufacturer'}
              </p>
              {invoice.companyAddress && (
                <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                  {invoice.companyAddress}
                </p>
              )}
              {invoice.companyPhone && (
                <p className="text-[11px] text-slate-700 leading-snug">
                  Phone: {invoice.companyPhone}
                </p>
              )}
            </div>

            {/* Top Right: INVOICE Title, Date, Invoice #, and Customer To */}
            <div className="text-right flex flex-col items-end max-w-[50%]">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-500 tracking-wider uppercase leading-none">
                INVOICE
              </h1>

              <div className="mt-4 space-y-1 text-sm font-medium text-black">
                <div>
                  <span className="font-semibold">Date:</span> {invoice.invoiceDate || '—'}
                </div>
                <div>
                  <span className="font-semibold">INVOICE #</span> {invoice.invoiceNumber || '—'}
                </div>
              </div>

              {/* Customer Box */}
              <div className="mt-5 flex items-start gap-4 text-sm text-black text-left">
                <span className="font-bold text-sm min-w-[24px]">To</span>
                <div className="space-y-0.5">
                  <div className="font-medium">
                    <span className="font-semibold">Name:</span> {invoice.customerName || '—'}
                  </div>
                  {invoice.customerCompany && (
                    <div className="text-xs text-slate-800">{invoice.customerCompany}</div>
                  )}
                  {invoice.customerAddress && (
                    <div className="text-xs text-slate-700 whitespace-pre-line leading-tight">
                      {invoice.customerAddress}
                    </div>
                  )}
                  {invoice.customerPhone && (
                    <div className="text-xs text-slate-700">Phone: {invoice.customerPhone}</div>
                  )}
                  {invoice.customerEmail && (
                    <div className="text-xs text-slate-700">Email: {invoice.customerEmail}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Meta Table (From | Title | Payment Currency | Due Date) */}
          <div className="mt-8">
            <table className="w-full border-collapse border border-black text-xs sm:text-sm text-center">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black py-1.5 px-3 font-semibold text-black w-1/4">
                    From
                  </th>
                  <th className="border-r border-black py-1.5 px-3 font-semibold text-black w-1/4">
                    Tittle
                  </th>
                  <th className="border-r border-black py-1.5 px-3 font-semibold text-black w-1/4">
                    Payment Currency
                  </th>
                  <th className="py-1.5 px-3 font-semibold text-black w-1/4">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black py-2 px-3 text-black font-medium">
                    {invoice.senderName || 'Md Boshirul Islam'}
                  </td>
                  <td className="border-r border-black py-2 px-3 text-black font-medium">
                    {invoice.senderTitle || 'Managing Director'}
                  </td>
                  <td className="border-r border-black py-2 px-3 text-black font-medium uppercase">
                    {invoice.paymentCurrency || 'USD'}
                  </td>
                  <td className="py-2 px-3 text-black font-medium">
                    {invoice.dueDate || invoice.paymentTerms || 'Within 20 days'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Main Product Table */}
          <div className="mt-6">
            <table className="w-full border-collapse border border-black text-xs sm:text-sm text-center">
              <thead>
                <tr className="border-b border-black">
                  {invoice.columns
                    .filter((c) => c.visible)
                    .map((col, idx, arr) => (
                      <th
                        key={col.id}
                        className={`py-2 px-2 font-semibold text-black ${
                          idx !== arr.length - 1 ? 'border-r border-black' : ''
                        } ${col.key === 'name' ? 'w-[28%]' : ''}`}
                      >
                        {col.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={invoice.columns.filter((c) => c.visible).length}
                      className="py-6 text-slate-400 italic"
                    >
                      No product rows added. Click &quot;Add Product Row&quot; in the editor.
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const visibleCols = invoice.columns.filter((c) => c.visible);

                    return (
                      <tr key={item.id} className="border-b border-black last:border-b-0">
                        {visibleCols.map((col, idx) => {
                          const isLast = idx === visibleCols.length - 1;
                          const cellClass = `py-2.5 px-2 text-black font-normal ${
                            !isLast ? 'border-r border-black' : ''
                          }`;

                          switch (col.key) {
                            case 'name':
                              return (
                                <td key={col.id} className={`${cellClass} font-medium`}>
                                  {item.name || '—'}
                                </td>
                              );
                            case 'hairColour':
                              return <td key={col.id} className={cellClass}>{item.hairColour || '—'}</td>;
                            case 'baseSize':
                              return <td key={col.id} className={cellClass}>{item.baseSize || '—'}</td>;
                            case 'quantity':
                              return (
                                <td key={col.id} className={cellClass}>
                                  {item.quantity} {item.unitLabel || 'pcs'}
                                </td>
                              );
                            case 'unitPrice':
                              return <td key={col.id} className={cellClass}>{formatPrice(item.unitPrice)}</td>;
                            case 'totalPrice':
                              return <td key={col.id} className={`${cellClass} font-semibold`}>{formatPrice(lineTotal)}</td>;
                            default:
                              return (
                                <td key={col.id} className={cellClass}>
                                  {item.customFields?.[col.key] || '—'}
                                </td>
                              );
                          }
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Right-Aligned Cost Summary Table */}
          <div className="mt-4 flex justify-end">
            <div className="w-full sm:w-[48%] md:w-[45%]">
              <table className="w-full border-collapse border border-black text-xs sm:text-sm">
                <tbody>
                  {/* Product Subtotal */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black py-2 px-3 font-semibold text-black w-3/5 text-left">
                      Product Cost
                    </td>
                    <td className="py-2 px-3 font-semibold text-black text-center w-2/5">
                      {formatPrice(invoice.subtotal)}
                    </td>
                  </tr>

                  {/* Shipping Cost */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black py-2 px-3 font-semibold text-black text-left">
                      Shippinng Cost
                    </td>
                    <td className="py-2 px-3 font-semibold text-black text-center">
                      {formatPrice(invoice.shippingCost)}
                    </td>
                  </tr>

                  {/* Extra Charges */}
                  {invoice.extraCharges &&
                    invoice.extraCharges.map((extra) => (
                      <tr key={extra.id} className="border-b border-black">
                        <td className="border-r border-black py-2 px-3 font-semibold text-black text-left">
                          {extra.title || 'Additional Charge'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-black text-center">
                          {formatPrice(extra.amount)}
                        </td>
                      </tr>
                    ))}

                  {/* Grand Total */}
                  <tr className="bg-slate-50/40">
                    <td className="border-r border-black py-2 px-3 font-bold text-black text-left">
                      Total Cost
                    </td>
                    <td className="py-2 px-3 font-bold text-black text-center">
                      {formatPrice(invoice.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Footer / Notes */}
        <div className="relative z-10 pt-12 mt-auto">
          {invoice.customerNotes && (
            <div className="text-xs text-slate-700 italic mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-900 not-italic">Notes:</span> {invoice.customerNotes}
            </div>
          )}
          <div className="text-center text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            <span>Thank you for your business. For any questions regarding this invoice, please contact {invoice.companyName || 'Royal Hair Wigs'}.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
