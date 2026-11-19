
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LpjData = {
  id_lpj: number;
  judul: string;
  isi: string;
};

export default function EditLpjPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [lpj, setLpj] = useState<LpjData | null>(null);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLpj() {
      try {
        const res = await fetch(`/api/lpj/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data LPJ.");
        }

        if (!data.permissions?.canEdit) {
          throw new Error("Kamu tidak memiliki izin untuk mengedit LPJ ini.");
        }

        setLpj(data.lpj);
        setJudul(data.lpj.judul);
        setIsi(data.lpj.isi);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLpj();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!judul.trim() || !isi.trim()) {
      setError("Judul dan isi LPJ wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/lpj/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          isi,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui LPJ.");
      }

      alert("LPJ berhasil diperbarui dan diajukan kembali!");
      router.push(`/dashboard/pengurus/lpj/detail/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Memuat data LPJ...
      </div>
    );
  }

  if (error && !lpj) {
    return (
      <div className="p-6">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!lpj) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <button
          onClick={() => router.back()}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold text-navy">
          Edit Laporan Pertanggungjawaban
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Perbaiki informasi LPJ apabila terdapat kesalahan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Judul LPJ
          </label>

          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Masukkan judul LPJ"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Isi Laporan LPJ
          </label>

          <p className="mb-3 text-xs text-slate-500">
            Kamu dapat memperbaiki seluruh bagian laporan, mulai dari
            informasi kegiatan hingga evaluasi dan rekomendasi.
          </p>

          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            required
            rows={22}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
            placeholder="Masukkan isi laporan LPJ..."
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/pengurus/lpj/detail/${id}`)
            }
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
