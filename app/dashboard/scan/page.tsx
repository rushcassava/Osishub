"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button } from "@/components/dashboard/ui";

function ScanProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sedang memverifikasi QR Code... Mohon tunggu.");
  const [eventTitle, setEventTitle] = useState("");
  const [poinDitambah, setPoinDitambah] = useState(0);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token absensi tidak ditemukan. Silakan scan ulang QR Code dari layar Panitia.");
      return;
    }

    async function processCheckin() {
      try {
        const res = await fetch("/api/event/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        let data: Record<string, unknown> = {};
        try {
          data = await res.json();
        } catch {
          // Gagal parse JSON — kemungkinan server error 500 non-JSON
          setStatus("error");
          setMessage("Server mengembalikan respons yang tidak valid. Coba lagi beberapa saat.");
          setErrorCode(res.status);
          return;
        }

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Kehadiran Anda berhasil dicatat!");
          if (data.event && typeof data.event === "object") {
            const ev = data.event as { judul?: string };
            setEventTitle(ev.judul || "Event OSIS");
          } else {
            setEventTitle("Event OSIS");
          }
          setPoinDitambah(typeof data.poin_ditambah === "number" ? data.poin_ditambah : 5);
        } else {
          setStatus("error");
          setErrorCode(res.status);

          // Gunakan data.error (format dari jsonError()) untuk pesan yang spesifik
          const errMsg = typeof data.error === "string" ? data.error : null;

          if (res.status === 401) {
            setMessage(
              errMsg || "QR Code sudah kedaluwarsa. Minta panitia menampilkan QR Code terbaru."
            );
          } else if (res.status === 409) {
            setMessage(errMsg || "Kamu sudah melakukan check-in untuk event ini sebelumnya.");
          } else if (res.status === 404) {
            setMessage(errMsg || "Event tidak ditemukan. QR Code mungkin sudah tidak berlaku.");
          } else if (res.status === 400) {
            setMessage(errMsg || "QR Code tidak valid. Pastikan memindai dari layar Panitia.");
          } else {
            setMessage(errMsg || "Terjadi kesalahan pada server. Silakan coba lagi.");
          }
        }
      } catch (networkErr) {
        console.error("[Scan] Network error:", networkErr);
        setStatus("error");
        setMessage(
          "Gagal terhubung ke server. Pastikan perangkat Anda terhubung ke internet, lalu coba lagi."
        );
      }
    }

    processCheckin();
  }, [token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent"></div>
            <h2 className="text-[18px] font-bold text-navy">Memproses Absen</h2>
            <p className="mt-2 text-[14px] text-inkSoft">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[32px] text-emerald-600">
              ✓
            </div>
            <h2 className="text-[20px] font-bold text-navy">Check-in Berhasil!</h2>
            <p className="mt-2 text-[14px] text-inkSoft">{message}</p>
            {eventTitle && (
              <div className="mt-4 rounded-lg bg-[#F8F9FC] p-3 font-semibold text-navy text-[14.5px]">
                📌 {eventTitle}
              </div>
            )}
            {poinDitambah > 0 && (
              <p className="mt-3 text-[13px] font-bold text-emerald-600">
                Poin Keaktifan +{poinDitambah}
              </p>
            )}
            <div className="mt-6">
              <Button onClick={() => router.push("/dashboard/anggota/event")} className="w-full">
                Kembali ke Event
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-[32px] text-red-600">
              ✕
            </div>
            <h2 className="text-[20px] font-bold text-navy">Check-in Gagal</h2>
            {errorCode && (
              <p className="mt-1 text-[11px] text-inkFaint">Kode error: {errorCode}</p>
            )}
            <p className="mt-2 text-[14px] text-red-600 font-medium px-4">{message}</p>

            {/* Panduan sesuai kode error */}
            <p className="mt-4 text-[12.5px] text-inkFaint px-4">
              {errorCode === 401
                ? "QR Code aktif hanya 20 detik. Minta panitia me-refresh layar QR Code-nya."
                : errorCode === 409
                ? "Kamu hanya bisa check-in sekali per event."
                : "Pastikan Anda memindai QR Code terbaru langsung dari layar Panitia. Screenshot atau foto lama tidak berlaku."}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => router.push("/dashboard/anggota/event")}
                className="w-full"
                variant="secondary"
              >
                Kembali ke Event
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-[14px] text-inkSoft">Memuat halaman scan...</p>
      </div>
    }>
      <ScanProcessor />
    </Suspense>
  );
}
