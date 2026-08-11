"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormPanel,
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

  // form buat akun
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAkun(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password || !nama.trim() || !peran) {
      flash("Semua field wajib diisi.", true);
      return;
    }
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
    if (res.ok) {
      flash(data.message || "Akun berhasil dibuat.");
      setUsername("");
      setPassword("");
      setNama("");
      setKelas("");
      setJabatan("");
      setPeran("ANGGOTA");
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
      <FormPanel
        title="Buat Akun Baru"
        subtitle="Tambahkan akun untuk anggota, perwakilan kelas, pengurus, atau pembina — tanpa perlu akses database."
      >
        <form onSubmit={createAkun} className="flex flex-col gap-4">
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
          <div className="flex items-center gap-3">
            <Button type="submit">Buat Akun</Button>
            {message && <span className="text-[13px] font-medium text-green-600">{message}</span>}
            {error && <span className="text-[13px] font-medium text-red-600">{error}</span>}
          </div>
        </form>
      </FormPanel>

      <div>
        <h3 className="mb-3 font-display text-[16px] font-bold text-navy">
          Daftar Pengguna ({items.length})
        </h3>

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

      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Sandi — ${resetTarget?.nama ?? ""}`}
      >
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <p className="text-[13px] text-inkSoft">
            Setel password baru untuk <span className="font-semibold text-ink">{resetTarget?.username}</span>.
            Password minimal 6 karakter.
          </p>
          <TextInput
            label="Password Baru"
            type="password"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
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

