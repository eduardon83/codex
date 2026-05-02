import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/components/ToastNotification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import foliumLogo from '@/assets/folium-logo.svg';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, updatePassword } = useAuth();
  const { showToast } = useAppToast();
  const { currentTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);

  const logo = isFoliumDarkTheme(currentTheme.id) ? foliumLogoGold : foliumLogo;

  useEffect(() => {
    const timer = window.setTimeout(() => setCheckingLink(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(error.message);
      showToast(t('auth.updatePasswordError'));
      return;
    }

    setMessage(t('auth.passwordUpdated'));
    showToast(t('auth.passwordUpdated'));
    window.setTimeout(() => navigate('/', { replace: true }), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Codex" className="w-60 min-w-[240px]" />
          <h1 className="mt-4 text-center font-serif text-2xl text-foreground">
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        {!checkingLink && !session ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">{t('auth.resetLinkInvalid')}</p>
            <Button type="button" className="w-full h-11" onClick={() => navigate('/', { replace: true })}>
              {t('auth.backToSignIn')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder={t('auth.newPassword')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="bg-background border-border h-11 text-sm"
              required
              minLength={6}
            />
            <Input
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="bg-background border-border h-11 text-sm"
              required
              minLength={6}
            />

            {error && <p className="text-destructive text-sm">{error}</p>}
            {message && <p className="text-accent text-sm">{message}</p>}

            <Button type="submit" className="w-full h-11" disabled={loading || checkingLink}>
              {loading || checkingLink ? '...' : t('auth.updatePassword')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
