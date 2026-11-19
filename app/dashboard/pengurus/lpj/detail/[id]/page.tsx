
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LpjDetail = {
  id_lpj: number;
  judul: string;
  isi: string;
  status: string;
  catatan: string | null;
  diajukanPada: string;
  pembuat: { nama: string };
  reviewer: { nama: string } | null;
};

const statusStyle: Record<string, string> = {
  DIAJUKAN: "bg-gray-100 text-gray-700",
  DIREVIEW: "bg-blue-100 text-blue-700",
  DISAHKAN: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
};

const statusName: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DIREVIEW: "Direview",
  DISAHKAN: "Disahkan",
  DITOLAK: "Ditolak",
};

export default function DetailLpjPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lpj, setLpj] = useState<LpjDetail | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function loadDetail() {
    try {
      const res = await fetch(`/api/lpj/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengambil detail LPJ.");
        return;
      }

      setLpj(data.lpj);
      setCanEdit(data.permissions?.canEdit ?? false);
      setCanReview(data.permissions?.canReview ?? false);
      setCatatan(data.lpj.catatan || "");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  async function review(status: string) {
    if (!lpj) return;

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`/api/lpj/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Review LPJ gagal.");
        return;
      }

      await loadDetail();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Memuat detail LPJ...</div>;
  }

  if (!lpj) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">{error || "LPJ tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  const finalStatus =
    lpj.status === "DISAHKAN" || lpj.status === "DITOLAK";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
      <div>
        <button
          onClick={() => router.push("/dashboard/pengurus/lpj")}
          className="mb-4 text-sm font-medium text-gray-500 hover:text-blue-600"
        >
          ← Kembali ke Daftar LPJ
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy">
              Detail Laporan Pertanggungjawaban
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Periksa informasi dan isi laporan kegiatan.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusStyle[lpj.status] || statusStyle.DIAJUKAN
            }`}
          >
            {statusName[lpj.status] || lpj.status}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{lpj.judul}</h2>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-gray-400">Dibuat oleh</p>
            <p className="font-medium text-gray-700">{lpj.pembuat.nama}</p>
          </div>

          <div>
            <p className="text-gray-400">Tanggal pengajuan</p>
            <p className="font-medium text-gray-700">
              {new Date(lpj.diajukanPada).toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Reviewer</p>
            <p className="font-medium text-gray-700">
              {lpj.reviewer?.nama || "Belum direview"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-bold text-gray-800">Isi Laporan LPJ</h3>

        <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 font-mono text-sm leading-7 text-gray-700">
          {lpj.isi}
        </pre>
      </div>

      {lpj.catatan && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="mb-2 font-bold text-blue-800">Catatan Review</h3>
          <p className="whitespace-pre-wrap text-sm text-blue-700">
            {lpj.catatan}
          </p>
        </div>
      )}

      {canEdit && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-800">Perbaikan Laporan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Kamu masih dapat memperbaiki LPJ ini selama belum disahkan.
          </p>

          <button
            onClick={() => router.push(`/dashboard/pengurus/lpj/edit/${id}`)}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Edit LPJ
          </button>
        </div>
      )}

      {canReview && !finalStatus && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-800">Review LPJ</h3>

          <label className="mt-4 block text-sm font-medium text-gray-700">
            Catatan Review
          </label>

          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
            placeholder="Tuliskan catatan atau masukan untuk pembuat LPJ..."
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={processing}
              onClick={() => review("DIREVIEW")}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Tandai Direview
            </button>

            <button
              disabled={processing}
              onClick={() => review("DISAHKAN")}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Sahkan LPJ
            </button>

            <button
              disabled={processing}
              onClick={() => review("DITOLAK")}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Tolak LPJ
            </button>
          </div>
        </div>
      )}

      {finalStatus && (
        <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
          LPJ ini sudah memiliki status final dan tidak dapat direview kembali.
        </div>
      )}

      {error && !canReview && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
