import React, { useState, useEffect } from 'react';
import { SwapProposal, ClothingItem } from '../types';
import { useSwap } from '../context/SwapContext';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Calendar,
  MapPin,
  QrCode,
  FileCheck,
  Smartphone,
  Eye
} from 'lucide-react';

interface PaymentVerificationModalProps {
  swap: SwapProposal | null;
  onClose: () => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({ swap, onClose }) => {
  const { 
    currentUser, 
    allStudents, 
    items, 
    submitMpesaPayment, 
    verifyMpesaPayment, 
    scheduleExchange, 
    confirmHandover 
  } = useSwap();

  const [mpesaCode, setMpesaCode] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isZoomingScreenshot, setIsZoomingScreenshot] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Exchange scheduling state
  const [exchangeDate, setExchangeDate] = useState('2026-10-31');
  const [meetupTime, setMeetupTime] = useState('2:30 PM (between classes)');
  const [meetupLocation, setMeetupLocation] = useState('');

  // 15-minute Binance P2P countdown timer simulation
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 45);

  useEffect(() => {
    if (swap?.exchangeDate) setExchangeDate(swap.exchangeDate);
    if (swap?.meetupTime) setMeetupTime(swap.meetupTime);
    if (swap?.meetupLocation) setMeetupLocation(swap.meetupLocation);
    else if (swap) {
      setMeetupLocation(swap.meetupLocation || 'Taifa Hall Foyer & Quad');
    }
  }, [swap]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!swap) return null;

  const isProposer = swap.proposerId === currentUser.id;
  const peerId = isProposer ? swap.receiverId : swap.proposerId;
  const peer = allStudents.find(s => s.id === peerId);

  // In UniThreads swap terms, the proposer usually sends the cash topup or security payment
  const isPayer = isProposer;
  const isPayee = !isProposer;

  const offeredItem = items.find(i => i.id === swap.offeredItemId);
  const requestedItem = items.find(i => i.id === swap.requestedItemId);
  const paymentAmount = swap.paymentAmount || swap.cashAmount || 400;

  const recipientPhone = swap.mpesaRecipientPhone || peer?.mpesaNumber || peer?.phoneNumber || '0722 839 201';
  const recipientName = swap.mpesaRecipientName || peer?.name || 'Peer Swapper';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setScreenshotPreview(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaCode.trim() || !screenshotPreview) return;

    submitMpesaPayment(swap.id, {
      mpesaCode: mpesaCode.trim().toUpperCase(),
      screenshotUrl: screenshotPreview,
      amount: paymentAmount
    });
  };

  const handleConfirmVerification = () => {
    verifyMpesaPayment(swap.id);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleExchange(swap.id, {
      exchangeDate,
      meetupTime,
      meetupLocation
    });
  };

  const handleHandover = () => {
    confirmHandover(swap.id, isProposer);
  };

  const isPaymentSent = swap.paymentStatus === 'payment_sent' || swap.paymentStatus === 'payment_verified';
  const isPaymentVerified = swap.paymentStatus === 'payment_verified';
  const myHandoverDone = isProposer ? swap.handoverConfirmedByProposer : swap.handoverConfirmedByReceiver;
  const peerHandoverDone = isProposer ? swap.handoverConfirmedByReceiver : swap.handoverConfirmedByProposer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#151519] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-4 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Binance P2P Style Top Bar */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">
              P2P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  M-Pesa P2P Escrow &amp; Payment Verification
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Binance Mode
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Order #{swap.id.replace('swap-', 'UNI-')} • Secure Campus Settlement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Binance Status Bar */}
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-900 dark:text-amber-300">
              {isPaymentVerified 
                ? 'Payment Confirmed & Locked in Escrow'
                : isPaymentSent
                ? 'Proof Submitted • Awaiting Seller Verification'
                : 'Pending Buyer M-Pesa Payment'}
            </span>
          </div>

          {!isPaymentVerified && (
            <div className="font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Exchange Order Summary */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Payment Amount:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                KSh {paymentAmount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-neutral-400">Offered Item:</span>
                <p className="font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                  {offeredItem?.title || 'Garment / Jewelry'}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Requested Item:</span>
                <p className="font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                  {requestedItem?.title || 'Garment / Bag'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: SELLER'S M-PESA RECIPIENT DETAILS */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Seller M-Pesa Payment Details
              </span>
              <span className="text-[10px] font-mono bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Safaricom Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Account Name</span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {recipientName}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{peer?.campus}</p>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">M-Pesa Number</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono font-black text-neutral-900 dark:text-white">
                    {recipientPhone}
                  </span>
                  <button
                    onClick={() => handleCopy(recipientPhone)}
                    className="p-1 text-neutral-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Copy Phone Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedCode && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROOF UPLOAD OR VERIFICATION VIEWER */}
          {!isPaymentSent ? (
            /* Buyer Flow: Upload Screenshot & Enter Code */
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-4">
                <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-rose-500" />
                  Step 2: Upload M-Pesa SMS Confirmation Proof
                </h3>

                {/* File picker & Camera capture */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-600 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-white dark:bg-neutral-900">
                    <Upload className="w-5 h-5 text-neutral-400" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Upload Screenshot
                    </span>
                <span className="text-[10px] text-neutral-400">PNG or JPG required</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-600 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-white dark:bg-neutral-900">
                    <Camera className="w-5 h-5 text-rose-500" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Snap Photo of SMS
                    </span>
                    <span className="text-[10px] text-neutral-400">Direct camera capture</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {screenshotPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 max-h-48 bg-black/5 flex items-center justify-center">
                    <img
                      src={screenshotPreview}
                      alt="M-Pesa Screenshot"
                      className="object-contain max-h-48"
                     referrerPolicy="no-referrer"/>
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      Screenshot Loaded
                    </div>
                  </div>
                )}

                {/* M-Pesa Transaction Code Input */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Enter Safaricom M-Pesa Transaction Code:
                  </label>
                  <input
                    type="text"
                    value={mpesaCode}
                    onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SJD82LK190"
                    maxLength={12}
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-sm uppercase tracking-wider text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    10-digit alphanumeric code from your Safaricom confirmation SMS.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!mpesaCode.trim() || !screenshotPreview}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                  mpesaCode.trim() && screenshotPreview
                    ? 'bg-amber-500 hover:bg-amber-600 text-black font-extrabold active:scale-95'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Transferred, Notify Seller ({recipientName.split(' ')[0]})
              </button>
            </form>
          ) : (
            /* Seller / Both: View Verified or Pending Verification Proof */
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    M-Pesa Payment Proof Submitted
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                    Code: {swap.mpesaTransactionCode || 'SJD82LK190'}
                  </span>
                </div>

                {/* Screenshot Viewer */}
                {swap.mpesaScreenshot && (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-950 p-2 text-center group cursor-pointer"
                       onClick={() => setIsZoomingScreenshot(true)}>
                    <img
                      src={swap.mpesaScreenshot}
                      alt="M-Pesa Verification Screenshot"
                      className="mx-auto object-cover max-h-48 rounded-lg"
                     referrerPolicy="no-referrer"/>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                      <Eye className="w-4 h-4" />
                      Click to Zoom Screenshot
                    </div>
                  </div>
                )}

                {/* Binance Warning Callout for Seller */}
                {!isPaymentVerified && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-1 text-[11px] text-amber-900 dark:text-amber-200">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Binance P2P Security Warning:
                    </div>
                    <p>
                      Check your Safaricom M-Pesa balance on your phone to confirm you received the KSh {paymentAmount.toLocaleString()} before releasing the item. Fraudulent SMS messages can be faked.
                    </p>
                  </div>
                )}

                {/* Seller Action Button */}
                {!isPaymentVerified && isPayee && (
                  <button
                    onClick={handleConfirmVerification}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Payment Received &amp; Verified (Release Item for Exchange)
                  </button>
                )}

                {isPaymentVerified && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Payment has been 100% verified and locked! Proceed to the scheduled physical exchange.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: EXCHANGE DATE & CAMPUS MEETUP SCHEDULER */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                Date of Exchange &amp; Campus Handover
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Code: {swap.meetupVerificationCode || 'UNIPASS-9281'}
              </span>
            </div>

            <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Exchange Date
                </label>
                <input
                  type="date"
                  value={exchangeDate}
                  onChange={e => setExchangeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Meetup Time
                </label>
                <input
                  type="text"
                  value={meetupTime}
                  onChange={e => setMeetupTime(e.target.value)}
                  placeholder="e.g. 2:30 PM (after lecture)"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Safe Campus Meetup Spot
                </label>
                <input
                  type="text"
                  value={meetupLocation}
                  onChange={e => setMeetupLocation(e.target.value)}
                  placeholder="e.g. Jomo Kenyatta Memorial Library Front Steps"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 matte-glass-btn text-xs font-bold text-neutral-900 dark:text-white rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Update Exchange Date &amp; Spot
                </button>
              </div>
            </form>

            {/* Handover Verification Confirmation */}
            {isPaymentVerified && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Your Handover Status:</span>
                  <span className={`font-bold ${myHandoverDone ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {myHandoverDone ? '✓ Confirmed by You' : 'Pending In-Person Meetup'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Peer Handover Status:</span>
                  <span className={`font-bold ${peerHandoverDone ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    {peerHandoverDone ? '✓ Confirmed by Peer' : 'Pending Peer Confirmation'}
                  </span>
                </div>

                <button
                  onClick={handleHandover}
                  disabled={myHandoverDone}
                  className={`w-full py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    myHandoverDone
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default'
                      : 'matte-glass-btn-primary text-white shadow-sm'
                  }`}
                >
                  {myHandoverDone ? 'Handover Confirmed • Waiting for Peer' : 'I Have Received / Handed Over the Item'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-[#111114] border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 matte-glass-btn text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Zoomed Screenshot Lightbox */}
      {isZoomingScreenshot && swap.mpesaScreenshot && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomingScreenshot(false)}
        >
          <div className="relative max-w-xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={swap.mpesaScreenshot}
              alt="M-Pesa Screenshot Zoomed"
              className="w-full h-auto object-contain"
             referrerPolicy="no-referrer"/>
            <button
              onClick={() => setIsZoomingScreenshot(false)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
