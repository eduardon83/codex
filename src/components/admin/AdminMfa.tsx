import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, KeyRound } from 'lucide-react';

interface Props {
  onVerified: () => void;
}

export default function AdminMfa({ onVerified }: Props) {
  const [step, setStep] = useState<'loading' | 'enroll' | 'verify'>('loading');
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const totpFactors = data?.totp || [];
    const verifiedFactor = totpFactors.find(f => f.status === 'verified');

    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      setStep('verify');
    } else {
      // Enroll new factor
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Bibliotheca Admin',
      });
      if (error || !enrollData) {
        setError(error?.message || 'Failed to set up 2FA');
        return;
      }
      setQrCode(enrollData.totp.qr_code);
      setFactorId(enrollData.id);
      setStep('enroll');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      setError('Invalid code. Please try again.');
      setCode('');
      setLoading(false);
      return;
    }

    onVerified();
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-['Josefin_Sans']">Setting up security…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-foreground">
            {step === 'enroll' ? 'Set Up Two-Factor Authentication' : 'Two-Factor Authentication'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-['Josefin_Sans']">
            {step === 'enroll'
              ? 'Scan this QR code with Google Authenticator or Authy'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        {step === 'enroll' && qrCode && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCode} alt="QR Code for 2FA setup" className="w-48 h-48" />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="pl-10 text-center text-lg tracking-[0.5em] font-mono h-12"
              autoFocus
            />
          </div>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <Button onClick={handleVerify} className="w-full h-11" disabled={code.length !== 6 || loading}>
            {loading ? '…' : 'Verify'}
          </Button>
        </div>
      </div>
    </div>
  );
}
