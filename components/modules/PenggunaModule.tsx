"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  SelectInput,
  Table,
  TextInput,
  formatTanggal,
} from "@/components/dashboard/ui";

type Peran = "ANGGOTA" | "PERWAKILAN_KELAS" | "PENGURUS" | "PEMBINA";

type PenggunaItem = {
  id_pengguna: number;
  username: string;
  nama: string;
  peran: Peran;
  kelas: string | null;
  jabatan: string | null;
  dibuatPada: string;
  _count?: {
    aspirasi: number;
    registrasi: number;
    absensi: number;
    poin: number;
    transaksi: number;
    prokerDibuat: number;
    arsipDibuat: number;
    lpjDibuat: number;
  };
};

const peranLabel: Record<Peran, string> = {
  ANGGOTA: "Anggota OSIS",
  PERWAKILAN_KELAS: "Perwakilan Kelas",
  PENGURUS: "Pengurus",
  PEMBINA: "Pembina",
};

const peranVariant: Record<Peran, "green" | "blue" | "amber" | "red" | "gray" | "gold" | "navy"> = {
  ANGGOTA: "gray",
  PERWAKILAN_KELAS: "blue",
  PENGURUS: "gold",
  PEMBINA: "navy",
};

export default function PenggunaModule() {
  const [items, setItems] = useState<PenggunaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Modal state buat akun
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [peran, setPeran] = useState<Peran>("ANGGOTA");
  const [kelas, setKelas] = useState("");
  const [jabatan, setJabatan] = useState("");

  // modal reset sandi
  const [resetTarget, setResetTarget] = useState<PenggunaItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  function flash(msg: string, isError = false) {
    if (isError) {
      setError(msg);
      setMessage("");
    } else {
      setMessage(msg);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setMessage("");
    }, 4000);
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pengguna");
      const data = await res.json();
      if (data.pengguna) setItems(data.pengguna);
      if (data.session?.id) setSessionId(data.session.id);
    } catch {
      flash("Gagal memuat data pengguna.", true);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setUsername("");
    setPassword("");
    setNama("");
    setKelas("");
    setJabatan("");
    setPeran("ANGGOTA");
  }

  function openForm() {
    resetForm();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  async function createAkun(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password || !nama.trim() || !peran) {
      flash("Semua field wajib diisi.", true);
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/pengguna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
        nama: nama.trim(),
        peran,
        kelas: kelas.trim() || null,
        jabatan: jabatan.trim() || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      flash(data.message || "Akun berhasil dibuat.");
      closeForm();
      load();
    } else {
      flash(data.error || "Gagal membuat akun.", true);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      flash("Password minimal 6 karakter.", true);
      return;
    }
    const res = await fetch(`/api/pengguna/${resetTarget.id_pengguna}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      flash(data.message || "Password berhasil di-reset.");
      setResetTarget(null);
      setNewPassword("");
    } else {
      flash(data.error || "Gagal reset password.", true);
    }
  }

  async function hapus(u: PenggunaItem) {
    if (!confirm(`Yakin ingin menghapus akun ${u.nama} (${u.username})?`)) return;
    const res = await fetch(`/api/pengguna/${u.id_pengguna}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      flash(data.message || "Akun berhasil dihapus.");
      load();
    } else {
      flash(data.error || "Gagal menghapus akun.", true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notifikasi Flash Global */}
      {(message || error) && (
        <div className={`rounded-lg px-4 py-3 text-[13.5px] font-medium ${error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {error || message}
        </div>
      )}

      {/* ── Header & Tombol Tambah Akun ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-bold text-navy">
            Daftar Pengguna ({items.length})
          </h3>
          <Button onClick={openForm} className="gap-1.5">
            <span className="text-[16px] leading-none">+</span> Tambah Akun
          </Button>
        </div>

        {loading ? (
          <p className="text-[13.5px] text-inkFaint">Memuat data...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada pengguna." />
        ) : (
          <Table head={["Nama", "Username", "Peran", "Kelas / Jabatan", "Dibuat", "Aksi"]}>
            {items.map((u) => (
              <tr key={u.id_pengguna}>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{u.nama}</div>
                  {u.id_pengguna === sessionId && (
                    <div className="text-[11px] font-mono uppercase text-blue">Akun saya</div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[12.5px] text-inkSoft">{u.username}</td>
                <td className="px-4 py-3">
                  <Badge variant={peranVariant[u.peran]}>{peranLabel[u.peran]}</Badge>
                </td>
                <td className="px-4 py-3 text-[13px] text-inkSoft">
                  {u.kelas || u.jabatan || <span className="text-inkFaint">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-inkFaint">{formatTanggal(u.dibuatPada)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1.5 text-[12px]"
                      onClick={() => {
                        setResetTarget(u);
                        setNewPassword("");
                      }}
                    >
                      Reset Sandi
                    </Button>
                    {u.id_pengguna !== sessionId && (
                      <Button variant="danger" className="!px-3 !py-1.5 text-[12px]" onClick={() => hapus(u)}>
                        Hapus
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* ── Modal Form Buat Akun Baru ── */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title="Buat Akun Baru"
        size="lg"
      >
        <form onSubmit={createAkun} className="flex flex-col gap-4">
          <p className="text-[13px] text-inkSoft">
            Tambahkan akun untuk anggota, perwakilan kelas, pengurus, atau pembina — tanpa perlu akses database.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Username"
              placeholder="mis. anggota02"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">
            <TextInput
              label="Nama Lengkap"
              placeholder="mis. Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <SelectInput label="Peran" value={peran} onChange={(e) => setPeran(e.target.value as Peran)}>
              <option value="ANGGOTA">Anggota OSIS</option>
              <option value="PERWAKILAN_KELAS">Perwakilan Kelas</option>
              <option value="PENGURUS">Pengurus</option>
              <option value="PEMBINA">Pembina</option>
            </SelectInput>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Kelas (opsional)"
              placeholder="mis. XI IPA 2"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            />
            <TextInput
              label="Jabatan (opsional)"
              placeholder="mis. Ketua Divisi Acara"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Reset Sandi ── */}
      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Sandi — ${resetTarget?.nama ?? ""}`}
      >
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <p className="text-[13px] text-inkSoft">
            Setel password baru untuk <span className="font-semibold text-ink">{resetTarget?.username}</span>. Password minimal 6 karakter.
          </p>
          <TextInput
            label="Password Baru"
            type="password"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 border-t border-[#E8EAF0] pt-4">
            <Button type="button" variant="secondary" onClick={() => setResetTarget(null)}>
              Batal
            </Button>
            <Button type="submit">Simpan Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}