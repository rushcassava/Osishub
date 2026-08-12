"use client";

import { useState } from "react";
import EventModule from "@/components/modules/EventModule";
import QrScannerModal from "@/components/QrScannerModal";

export default function AnggotaEventPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fungsi saat QR berhasil di-scan
  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);

    try {
      // Contoh request ke API backend untuk check-in / absensi event
      const res = await fetch("/api/absensi/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: decodedText }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Berhasil melakukan Check-In Absensi!");
        // Kamu bisa trigger refresh data event di sini jika perlu
      } else {
        alert(`Gagal Check-In: ${data.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
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
          onClick={() => setShowScanner(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90 transition"
        >
          📷 Scan QR Check-In
        </button>
      </div>

      {loading && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-xl">
          Memproses data check-in...
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