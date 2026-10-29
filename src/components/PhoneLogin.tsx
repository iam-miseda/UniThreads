import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole, MessageSquareText, Smartphone } from 'lucide-react';

interface PhoneLoginProps {
  onAuthenticated: () => void;
}

export const PhoneLogin: React.FC<PhoneLoginProps> = ({ onAuthenticated }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send the code.');
      setPhone(data.phone);
      setCodeSent(true);
      setNotice(`A sign-in code was sent to ${data.phone}. It expires in five minutes.`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not send the code.'); }
    finally { setBusy(false); }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, email, code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Code verification failed.');
      onAuthenticated();
    } catch (err) { setError(err instanceof Error ? err.message : 'Code verification failed.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0e0e11] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-7 sm:p-9 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
          {codeSent ? <MessageSquareText className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
        </div>
        <p className="text-[11px] uppercase tracking-[.18em] font-bold text-rose-600 dark:text-rose-400">Uni Threads · Secure sign in</p>
        <h1 className="text-2xl font-extrabold mt-2">{codeSent ? 'Enter your SMS code' : 'Sign in to Uni Threads'}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{codeSent ? `We sent a one-time code to ${phone}. Your email is linked to this sign-in.` : 'Add your email and phone number. We’ll verify your sign-in by SMS.'}</p>
        {!codeSent ? (
          <form onSubmit={requestCode} className="mt-7 space-y-4">
            <label className="block text-xs font-bold">Email address
              <input autoComplete="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </label>
            <label className="block text-xs font-bold">Kenyan mobile number
              <input autoComplete="tel" inputMode="tel" type="tel" required value={phone} onChange={event => setPhone(event.target.value)} placeholder="0712 345 678" className="mt-2 w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </label>
            <button disabled={busy || !email.trim() || !phone.trim()} className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-sm disabled:opacity-50">{busy ? 'Sending code…' : 'Send sign-in code'}</button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-7 space-y-4">
            <label className="block text-xs font-bold">Six-digit code
              <input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="mt-2 w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-center font-mono text-xl tracking-[.4em] focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </label>
            <button disabled={busy || code.length !== 6} className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-sm disabled:opacity-50">{busy ? 'Verifying…' : 'Verify and continue'}</button>
            <button type="button" onClick={() => { setCodeSent(false); setCode(''); setError(''); setNotice(''); }} className="w-full py-2 text-xs font-semibold text-neutral-500 flex items-center justify-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Change phone number</button>
          </form>
        )}
        {error && <p role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">{error}</p>}
        {notice && <p role="status" className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs">{notice}</p>}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[10px] text-neutral-400"><LockKeyhole className="w-3.5 h-3.5" /> Your verification code is private and expires in five minutes.</div>
      </section>
    </main>
  );
};
