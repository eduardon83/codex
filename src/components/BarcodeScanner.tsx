import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

/**
 * Live barcode scanner using device camera.
 * Reads EAN-13 / EAN-8 / UPC barcodes (the formats used on book ISBN barcodes).
 */
export default function BarcodeScanner({ open, onClose, onDetected }: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    const reader = new BrowserMultiFormatReader(hints);

    let cancelled = false;

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        // Prefer rear-facing camera if available
        const rear = devices.find((d) => /back|rear|environment/i.test(d.label));
        const deviceId = rear?.deviceId || devices[0]?.deviceId;
        if (!deviceId) {
          setError(t('scanner.noCamera', 'No camera available on this device.'));
          return;
        }
        if (cancelled) return;
        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, _err, ctrl) => {
            if (result) {
              const text = result.getText();
              ctrl.stop();
              onDetected(text);
            }
          }
        );
        controlsRef.current = controls;
      } catch (e: any) {
        console.error('[BarcodeScanner]', e);
        setError(e?.message || t('scanner.error', 'Could not start the camera.'));
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, onDetected, t]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-2xl">
            {t('scanner.title', 'Scan ISBN barcode')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-16 border-2 border-primary/70 rounded pointer-events-none" />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground text-center">
            {t('scanner.hint', 'Point the camera at the barcode on the back of the book.')}
          </p>
          <Button variant="outline" onClick={onClose} className="w-full">
            {t('profile.cancel', 'Cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
