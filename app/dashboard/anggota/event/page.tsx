"use client";

import { useState } from "react";
import EventModule from "@/components/modules/EventModule";
import QrScannerModal from "@/components/QrScannerModal";
import { useRouter } from "next/navigation";

export default function AnggotaEventPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const router = useRouter();

  // Fungsi saat QR berhasil di-scan
  // QR Code berisi URL: {origin}/dashboard/scan?token=<JWT>
  const handleScanSuccess = (decodedText: string) => {
    setShowScanner(false);
    setScanError(null);

    try {
      // Validasi bahwa hasil scan adalah URL yang valid
      const url = new URL(decodedText);

      // Pastikan URL mengarah ke halaman scan yang kita kenali
      if (url.pathname === "/dashboard/scan" && url.searchParams.get("token")) {
        // Redirect ke halaman /dashboard/scan?token=... yang akan memproses check-in
        router.push(`/dashboard/scan?token=${url.searchParams.get("token")}`);
      } else {
        setScanError("QR Code tidak valid. Pastikan memindai QR Code event OSIS yang benar.");
      }
    } catch {
      // Jika bukan URL valid — mungkin format lama (qrData langsung)
      // Coba fallback ke API /api/absen dengan qrData
      handleLegacyQrData(decodedText);
    }
  };

  // Fallback untuk QR lama yang berisi kode langsung (bukan URL)
  const handleLegacyQrData = async (qrData: string) => {
    try {
      const res = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanError(null);
        alert(`✅ Berhasil melakukan Check-In Absensi!\n${data.message || ""}`);
      } else {
        // Gunakan data.error (bukan data.message) sesuai format jsonError()
        setScanError(data.error || "Gagal melakukan Check-In. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setScanError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="mb-1.5 font-display text-[24px] font-bold text-navy">Event &amp; Registrasi</h1>
          <p className="text-[14.5px] text-inkSoft">
            Daftar event OSIS dan lakukan check-in QR.
          </p>
        </div>

        {/* Tombol untuk Membuka Kamera Scanner */}
        <button
          onClick={() => { setShowScanner(true); setScanError(null); }}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90 transition"
        >
          📷 Scan QR Check-In
        </button>
      </div>

      {/* Pesan error jika scan gagal */}
      {scanError && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="font-semibold">Check-In Gagal</p>
            <p className="mt-0.5 text-red-600">{scanError}</p>
          </div>
          <button
            onClick={() => setScanError(null)}
            className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Modul Event Utama */}
      <EventModule mode="anggota" />

      {/* Modal Kamera Scanner */}
      {showScanner && (
        <QrScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}