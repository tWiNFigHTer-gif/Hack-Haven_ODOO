import React, { useState } from 'react';
import { Invoice, PaymentPayload, api } from '../../lib/api';
import { Button } from '../common/Button';
import { downloadInvoicePDF } from '../../lib/pdf';

interface PayNowModalProps {
  isOpen: boolean;
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string) => void;
}

export const PayNowModal: React.FC<PayNowModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onPaymentSuccess,
}) => {
  const [modalState, setModalState] = useState<'checkout' | 'success' | 'error'>('checkout');
  const [paymentTab, setPaymentTab] = useState<'card' | 'bank' | 'upi'>('card');
  const [useNewCard, setUseNewCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptRef, setReceiptRef] = useState<string>('#REC-98214-BT');

  // New card fields
  const [cardholder, setCardholder] = useState('Elena Rostova');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExp, setCardExp] = useState('09/27');
  const [cardCvc, setCardCvc] = useState('429');
  const [upiId, setUpiId] = useState('elena@oksbi');

  if (!isOpen) return null;

  const handlePay = async (simulateError = false) => {
    setIsProcessing(true);

    if (simulateError) {
      setTimeout(() => {
        setIsProcessing(false);
        setModalState('error');
      }, 700);
      return;
    }

    try {
      const payload: PaymentPayload = {
        invoiceId: invoice.id,
        method: paymentTab,
        cardDetails: useNewCard
          ? { cardholder, cardNumber, exp: cardExp, cvc: cardCvc }
          : undefined,
        upiId: paymentTab === 'upi' ? upiId : undefined,
      };

      const result = await api.payments.payInvoice(payload);
      setReceiptRef(result.receiptReference);
      onPaymentSuccess(invoice.id);
      setModalState('success');
    } catch {
      setModalState('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-on-surface/40 backdrop-blur-[4px] flex items-center justify-center p-3 sm:p-6 transition-all">
      <div className="w-full max-w-[580px] bg-surface-card rounded-[14px] shadow-[0_12px_36px_-4px_rgba(28,25,23,0.12)] p-6 sm:p-8 relative z-50 my-auto animate-in fade-in zoom-in-95 duration-200 border border-border-subtle">
        {/* Simulator Bar at the very top of modal for effortless testing */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle/50 text-[11px] text-secondary">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            <span>Remittance Prototype Switcher</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setModalState('checkout')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                modalState === 'checkout'
                  ? 'bg-primary-container text-white font-semibold'
                  : 'hover:bg-surface-container'
              }`}
            >
              1. Form
            </button>
            <button
              type="button"
              onClick={() => setModalState('success')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                modalState === 'success'
                  ? 'bg-status-active-bg text-status-active-text font-semibold'
                  : 'hover:bg-surface-container'
              }`}
            >
              2. Success
            </button>
            <button
              type="button"
              onClick={() => setModalState('error')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                modalState === 'error'
                  ? 'bg-status-overdue-bg text-status-overdue-text font-semibold'
                  : 'hover:bg-surface-container'
              }`}
            >
              3. Error
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STATE 1: CHECKOUT FORM                                   */}
        {/* ========================================================= */}
        {modalState === 'checkout' && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
                    Sanctuary Billing Portal
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mt-0.5">
                  Settle Statement
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="font-semibold text-primary">{invoice.invoiceNumber}</span>
                  <span className="text-border-subtle">•</span>
                  <span className="text-secondary">{invoice.subscriptionName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Amount Summary Box */}
            <div className="mt-5 p-4 rounded-xl bg-surface-container-low border border-border-subtle/50 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-secondary font-medium">
                  Total Amount Due
                </span>
                <div className="text-right">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
                    ${invoice.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-secondary font-semibold uppercase ml-1">USD</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="pt-2 border-t border-border-subtle/70 flex flex-col gap-1.5 text-xs text-secondary">
                <div className="flex justify-between">
                  <span>Gross Statement Subtotal</span>
                  <span className="font-medium text-on-surface">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-status-active-text font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">eco</span>
                      <span>{invoice.discountLabel || 'Solstice Courtesy Benefit'}</span>
                    </span>
                    <span>-${invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>District Municipal & Excise Surcharge (8.875%)</span>
                  <span className="font-medium text-on-surface">${invoice.tax.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Method Segmented Selector */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-on-surface">
                  Select Remittance Method
                </label>
                <span className="text-[11px] text-secondary flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    verified_user
                  </span>
                  <span>Vault Tokenized</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Method 1: Card */}
                <button
                  type="button"
                  onClick={() => setPaymentTab('card')}
                  className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                    paymentTab === 'card'
                      ? 'bg-surface-container-low border-primary-container text-on-surface shadow-xs'
                      : 'bg-surface-card border-border-subtle hover:bg-surface-container-low text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="material-symbols-outlined text-primary text-[19px]">
                      credit_card
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        paymentTab === 'card' ? 'border-primary' : 'border-border-subtle'
                      }`}
                    >
                      {paymentTab === 'card' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-on-surface">Payment Card</div>
                  <div className="text-[10px] text-secondary">Credit / Debit</div>
                </button>

                {/* Method 2: Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentTab('bank')}
                  className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                    paymentTab === 'bank'
                      ? 'bg-surface-container-low border-primary-container text-on-surface shadow-xs'
                      : 'bg-surface-card border-border-subtle hover:bg-surface-container-low text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="material-symbols-outlined text-secondary text-[19px]">
                      account_balance
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        paymentTab === 'bank' ? 'border-primary' : 'border-border-subtle'
                      }`}
                    >
                      {paymentTab === 'bank' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-on-surface">Bank ACH / Wire</div>
                  <div className="text-[10px] text-secondary">1-2 Business Days</div>
                </button>

                {/* Method 3: Instant UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentTab('upi')}
                  className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                    paymentTab === 'upi'
                      ? 'bg-surface-container-low border-primary-container text-on-surface shadow-xs'
                      : 'bg-surface-card border-border-subtle hover:bg-surface-container-low text-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="material-symbols-outlined text-secondary text-[19px]">
                      qr_code_2
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        paymentTab === 'upi' ? 'border-primary' : 'border-border-subtle'
                      }`}
                    >
                      {paymentTab === 'upi' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-on-surface">Instant UPI</div>
                  <div className="text-[10px] text-secondary">VPA or QR Code</div>
                </button>
              </div>

              {/* Dynamic Panel: Card */}
              {paymentTab === 'card' && (
                <div className="space-y-3">
                  {/* Saved Card Option */}
                  <div
                    onClick={() => setUseNewCard(false)}
                    className={`p-3.5 rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                      !useNewCard
                        ? 'bg-surface-container-low/70 border-primary-container'
                        : 'bg-surface-card border-border-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-surface-card shadow-xs flex items-center justify-center px-1 border border-border-subtle font-bold text-[11px] text-on-surface">
                        MC
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">
                            Mastercard •••• 4088
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded bg-status-active-bg text-status-active-text">
                            Default
                          </span>
                        </div>
                        <div className="text-[11px] text-secondary">
                          Elena Rostova • Expires 09/27
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={!useNewCard}
                      onChange={() => setUseNewCard(false)}
                      className="w-4 h-4 text-primary accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Toggle new card */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setUseNewCard(!useNewCard)}
                      className="text-xs text-primary hover:text-accent-hover font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {useNewCard ? 'remove_circle' : 'add_circle'}
                      </span>
                      <span>Or use a different card</span>
                    </button>

                    {useNewCard && (
                      <div className="mt-3 p-3.5 rounded-lg bg-surface-container-low/60 space-y-3 border border-border-subtle/40 text-xs">
                        <div>
                          <label className="block text-secondary mb-1">
                            Cardholder Full Legal Name
                          </label>
                          <input
                            type="text"
                            value={cardholder}
                            onChange={(e) => setCardholder(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-card rounded border border-border-subtle text-on-surface outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-secondary mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4000 1234 5678 9010"
                            className="w-full px-3 py-2 bg-surface-card rounded border border-border-subtle text-on-surface outline-none focus:border-primary font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-secondary mb-1">Expiration Date</label>
                            <input
                              type="text"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-3 py-2 bg-surface-card rounded border border-border-subtle text-on-surface outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-secondary mb-1">Security Code (CVC)</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="•••"
                              className="w-full px-3 py-2 bg-surface-card rounded border border-border-subtle text-on-surface outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Panel: Bank ACH */}
              {paymentTab === 'bank' && (
                <div className="space-y-3 p-4 rounded-lg bg-surface-container-low border border-border-subtle/50 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      account_balance
                    </span>
                    <div>
                      <h4 className="font-semibold text-on-surface">Private Sanctuary Escrow Account</h4>
                      <p className="text-secondary mt-0.5">
                        Remit directly using standard Fedwire or Automated Clearing House (ACH).
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-surface-card rounded font-mono text-xs space-y-1.5 border border-border-subtle/50">
                    <div className="flex justify-between">
                      <span className="text-secondary">Routing (ABA):</span>
                      <span className="font-semibold">021000021</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Account Number:</span>
                      <span className="font-semibold">98214408102</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Beneficiary:</span>
                      <span>Brightloop Sanctuary Atelier Ltd.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Mandatory Reference:</span>
                      <span className="text-primary font-bold">{invoice.invoiceNumber}-ROSTOVA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Panel: UPI */}
              {paymentTab === 'upi' && (
                <div className="space-y-3 p-4 rounded-lg bg-surface-container-low border border-border-subtle/50 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      contactless
                    </span>
                    <div>
                      <h4 className="font-semibold text-on-surface">Unified Payments Interface (UPI)</h4>
                      <p className="text-secondary">Real-time domestic or international settlement</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-secondary mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-card rounded border border-border-subtle text-on-surface font-mono outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settle CTA */}
            <div className="mt-6 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isProcessing}
                onClick={() => handlePay(false)}
                leftIcon={<span className="material-symbols-outlined text-[19px]">lock</span>}
              >
                Pay ${invoice.totalAmount.toFixed(2)} Now
              </Button>

              <div className="mt-3 flex items-center justify-center gap-2 text-center text-secondary text-[11px]">
                <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                <p>256-bit encrypted checkout • Protected under Sanctuary Discretion Agreement</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STATE 2: PAYMENT SUCCESS RECEIPT                         */}
        {/* ========================================================= */}
        {modalState === 'success' && (
          <div className="text-center pt-2 pb-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Green Badge & Check */}
            <div className="mx-auto w-16 h-16 rounded-full bg-status-active-bg flex items-center justify-center mb-4 shadow-sm ring-8 ring-status-active-bg/40 text-status-active-text">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-active-bg text-status-active-text text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              <span>Paid & Authenticated</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              Payment Successful
            </h2>
            <p className="text-sm text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              Statement <span className="font-semibold text-on-surface">{invoice.invoiceNumber}</span> has been settled in full. Your botanical allocation reserve remains active.
            </p>

            {/* Receipt metadata box */}
            <div className="mt-5 p-4 sm:p-5 rounded-xl bg-surface-container-low/70 border border-border-subtle/50 space-y-3 text-xs text-left">
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
                <span className="text-secondary font-medium">Receipt Reference</span>
                <span className="font-mono text-xs font-semibold text-on-surface bg-surface-card px-2 py-0.5 rounded border border-border-subtle">
                  {receiptRef}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
                <span className="text-secondary font-medium">Settlement Timestamp</span>
                <span className="text-on-surface font-medium">Just now • {new Date().toLocaleDateString('en-US')}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
                <span className="text-secondary font-medium">Payment Method</span>
                <div className="flex items-center gap-1.5 text-on-surface font-medium">
                  <span className="font-bold text-[10px] text-primary">MC</span>
                  <span>Mastercard ending in 4088</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-semibold text-on-surface">Total Amount Settled</span>
                  <p className="text-[10px] text-secondary">Includes applicable solstice discounts</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-xl font-bold text-status-active-text">
                    ${invoice.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-secondary uppercase font-semibold ml-1">USD</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => downloadInvoicePDF(invoice)}
                leftIcon={<span className="material-symbols-outlined text-[18px]">download</span>}
              >
                Download Receipt (PDF)
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={onClose}
                leftIcon={
                  <span className="material-symbols-outlined text-[18px]">
                    assignment_turned_in
                  </span>
                }
              >
                Return to Invoices
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STATE 3: PAYMENT ERROR ALERT                             */}
        {/* ========================================================= */}
        {modalState === 'error' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-overdue-text" />
                  <span className="text-[11px] uppercase tracking-wider text-status-overdue-text font-semibold">
                    Payment Discrepancy
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-on-surface mt-0.5">
                  Payment Declined
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Prominent Red Banner */}
            <div className="p-4 rounded-xl bg-status-overdue-bg border border-status-overdue-bg text-status-overdue-text flex items-start gap-3 my-4">
              <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">error</span>
              <div className="text-xs space-y-1">
                <p className="font-semibold leading-snug">
                  Payment authorization failed: Card issuer declined transaction (Error 402 - Do Not Honor).
                </p>
                <p className="opacity-90">
                  Your statement balance remains unsettled (${invoice.totalAmount.toFixed(2)} USD). No funds were deducted from your primary depository.
                </p>
              </div>
            </div>

            {/* Preserved Form Details */}
            <div className="p-4 rounded-xl bg-surface-container-low/60 space-y-2 text-xs border border-border-subtle/40 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Attempted Card:</span>
                <span className="font-medium text-on-surface">Mastercard ending in 4088 (Elena Rostova)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Statement Reference:</span>
                <span className="font-mono text-on-surface">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Declined Amount:</span>
                <span className="font-bold text-status-overdue-text">${invoice.totalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Guidance */}
            <div className="p-3.5 rounded-lg bg-surface-container-low/40 flex items-start gap-2.5 mb-5 text-xs text-secondary border border-border-subtle/30">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                info
              </span>
              <p>
                This rejection typically stems from geographic security rules or daily international limits placed by your issuing institution. You may authorize Brightloop with your bank, re-enter details, or settle using an alternate method.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setModalState('checkout')}
                leftIcon={<span className="material-symbols-outlined text-[18px]">refresh</span>}
              >
                Try Again
              </Button>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentTab('bank');
                    setModalState('checkout');
                  }}
                  className="text-primary hover:text-accent-hover font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>Use Bank ACH / Wire Instead</span>
                </button>
                <a href="#support" className="text-secondary hover:text-on-surface inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  <span>Contact Concierge</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

