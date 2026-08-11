"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button } from "@/components/dashboard/ui";

function ScanProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sedang memproses absensi... Mohon tunggu.");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token absensi tidak ditemukan. Silakan scan QR Code yang valid.");
      return;
    }

    async function processCheckin() {
      try {
        const res = await fetch("/api/event/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Kehadiran Anda berhasil dicatat!");
          if (data.registrasi && data.registrasi.event) {
            setEventTitle(data.registrasi.event.judul);
          } else {
            setEventTitle("Event OSIS");
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Gagal melakukan absensi.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Terjadi kesalahan koneksi ke server.");
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
            <p className="mt-3 text-[13px] font-bold text-emerald-600">Poin Keaktifan +5</p>
            <div className="mt-6">
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Kembali ke Dashboard
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
            <p className="mt-2 text-[14px] text-red-600 font-medium px-4">{message}</p>
            <p className="mt-4 text-[12.5px] text-inkFaint px-4">
              Pastikan Anda memindai QR Code terbaru di layar Panitia. Screenshot atau foto lama tidak akan berlaku.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push("/dashboard")} className="w-full" variant="secondary">
                Kembali ke Dashboard
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
