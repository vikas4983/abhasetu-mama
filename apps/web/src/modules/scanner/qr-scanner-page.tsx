"use client";

import { Html5Qrcode } from "html5-qrcode";
import { Camera, QrCode, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function QrScannerPage() {
  const [status, setStatus] = useState("Camera is idle. Use Open Camera to request permission and start scanning.");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  async function startScanner() {
    const readerId = "qr-reader-next";
    setStatus("Requesting camera permission...");
    try {
      scannerRef.current = new Html5Qrcode(readerId);
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          setStatus(classifyQrPayload(decodedText));
          await scannerRef.current?.stop();
        },
        () => undefined
      );
    } catch (error) {
      setStatus(`Camera permission or scanner error: ${String(error)}. Use HTTPS or localhost for camera access.`);
    }
  }

  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">QR Scanner</p>
        <h1 className="mt-2 text-4xl font-extrabold">Scan ABDM QR, Facility QR, ABHA QR, prescriptions, and registration codes</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div id="qr-reader-next" className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-2xl border border-border bg-bg-card">
          <div className="scan-line" />
          <QrCode className="h-24 w-24 text-accent-teal" />
        </div>
        <Card>
          <h2 className="text-xl font-extrabold">Scanner Status</h2>
          <p className="mt-2 text-text-secondary">{status}</p>
          <ul className="my-5 grid gap-2 pl-5 text-text-secondary">
            <li>ABHA QR and returning patient flow classification.</li>
            <li>Facility QR Scan-and-Share registration architecture.</li>
            <li>Retry handling, permission errors, and mobile camera support.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button onClick={startScanner}><Camera className="h-4 w-4" />Open Camera</Button>
            <Button variant="secondary" onClick={startScanner}><RefreshCw className="h-4 w-4" />Retry</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function classifyQrPayload(payload: string) {
  if (/abha|phr|healthid/i.test(payload)) return "ABHA QR detected. Returning patient verification flow can continue.";
  if (/facility|hfr|hip|scan.*share/i.test(payload)) return "Facility QR detected. Scan-and-share registration flow can continue.";
  return "Healthcare QR decoded. Payload captured for validation.";
}
