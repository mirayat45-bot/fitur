UPLOAD FIX v2 — Login kosong neon tanpa teks

File yang harus di-replace ke root GitHub repo Plenos-web/jir:
1. style.css
2. login.js

PENTING:
- Jangan upload sebagai folder baru.
- Replace file lama dengan nama yang sama persis.
- Commit changes.
- Setelah commit, buka live preview lalu tekan Ctrl + F5 / hard refresh.
- Jika di HP, hapus cache browser / buka mode incognito.

Perubahan:
- style.css: layout login full screen, card kosong neon RGB, responsif.
- login.js: memaksa area #pg-login dikosongkan saat halaman dibuka, jadi teks/form/logo/tombol lama hilang.

Catatan:
- Ini bukan rewrite project.
- File lama lain tidak disentuh.
- Dashboard/app utama tidak ikut diubah.
