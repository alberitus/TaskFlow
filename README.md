# TaskFlow 🗂️

Aplikasi **Kanban Board** modern dengan fitur drag & drop, dark mode, autentikasi Google, kolaborasi realtime, dan manajemen task lengkap.

---

## ✨ Fitur

### 📋 Task Management
- **Klik task** untuk buka Task Detail Modal
- **Edit judul** task langsung di modal
- **Deskripsi/Notes** per task
- **Due Date** dengan indikator overdue & due soon
- **Sub-task / Checklist** dengan progress bar
- **Assign task** ke member workspace
- **Priority** — High, Medium, Low dengan badge warna
- **Hapus task** dari dalam modal

### 🗂️ Board Management
- **Drag & Drop** — task dan board bisa dipindah bebas
- **Tambah board** baru dengan nama dan warna custom
- **Hapus board** (kecuali 3 board default)
- **Reorder board** via drag handle
- **Batasan urutan** — To Do tidak bisa melewati In Progress, In Progress tidak bisa melewati Done
- **Custom warna** — pilih dari 8 preset atau color picker bebas

### 👥 Kolaborasi
- **Login Google** — data tersimpan otomatis di Firebase
- **Realtime sync** — semua perubahan langsung terlihat semua member
- **Buat Workspace** — dapat kode unik 6 digit
- **Gabung Workspace** — masukkan kode dari rekan tim
- **Assign task ke member** workspace

### 🎨 UI/UX
- **Dark Mode** — toggle light/dark kapan saja
- **Mode Tamu** — bisa dipakai tanpa login (data tidak tersimpan)
- **Custom dropdown** priority bergaya Select2
- **Avatar inisial** dari nama akun Google
- **Responsive** — support mobile

---

## 🛣️ Roadmap (Planned)

Fitur-fitur berikut sedang direncanakan untuk pengembangan ke depan:

### 🗂️ Board Management
| Fitur | Status |
|-------|--------|
| Rename kolom | 🔜 Planned |
| Archive task yang sudah done | 🔜 Planned |
| Filter task by priority / assignee | 🔜 Planned |
| Search task | 🔜 Planned |
| Sort task (by priority, by date) | 🔜 Planned |

### 👥 Kolaborasi
| Fitur | Status |
|-------|--------|
| Notifikasi realtime saat ada perubahan | 🔜 Planned |
| Lihat siapa saja yang sedang online di workspace | 🔜 Planned |
| Activity log / history perubahan | 🔜 Planned |
| Comment/diskusi per task | 🔜 Planned |
| Mention anggota dengan @nama | 🔜 Planned |

### 🎨 UI/UX
| Fitur | Status |
|-------|--------|
| Animasi transisi lebih smooth | 🔜 Planned |
| Board scroll horizontal kalau kolom banyak | 🔜 Planned |
| Keyboard shortcut (N untuk new task, dll) | 🔜 Planned |
| Responsive mobile yang lebih baik | 🔜 Planned |
| Drag task langsung ke kolom lain dengan snap | 🔜 Planned |

### 📊 Data & Produktivitas
| Fitur | Status |
|-------|--------|
| Statistik progress (task done, in progress, dll) | 🔜 Planned |
| Export board ke PDF atau CSV | 🔜 Planned |
| Deadline tracking dengan visual progress bar | 🔜 Planned |
| Recurring task (berulang tiap minggu/bulan) | 🔜 Planned |

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| React + Vite | Frontend framework |
| @dnd-kit | Drag & drop |
| Firebase Auth | Login dengan Google |
| Firestore | Database realtime |
| Bootstrap Icons | Icon library |

---

## 🚀 Cara Menjalankan

### 1. Masuk ke folder project

```bash
cd todo-list
```

### 2. Install dependencies

```bash
npm install
```

### 3. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

---

## 📁 Struktur Folder

```
src/
├── components/
│   ├── Board.jsx             # Container utama drag & drop
│   ├── Column.jsx            # Kolom/board individual
│   ├── TaskCard.jsx          # Card task dengan preview info
│   ├── TaskDetailModal.jsx   # Modal detail task (edit, subtask, assignee, dll)
│   ├── AddTaskForm.jsx       # Form tambah task dengan custom dropdown
│   ├── SortableColumn.jsx    # Wrapper drag kolom
│   └── WorkspacePanel.jsx    # Panel kolaborasi workspace
├── hooks/
│   ├── useAuth.js            # Logic autentikasi Google
│   ├── useTasks.js           # Logic task & kolom + Firestore sync
│   └── useWorkspace.js       # Logic buat & gabung workspace
├── data/
│   └── initialData.js        # Data awal kolom & task
├── firebase.js               # Konfigurasi Firebase
├── App.jsx                   # Root component
└── App.css                   # Global styles
```

---

## 🔥 Konfigurasi Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication → Google**
3. Buat **Firestore Database** (test mode → region asia-southeast1)
4. Copy konfigurasi ke `src/firebase.js`

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /workspaces/{workspaceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members', 'memberNames'])
      );
      allow delete: if request.auth != null && resource.data.ownerId == request.auth.uid;

      match /columns/{colId} {
        allow read, write: if request.auth != null &&
          get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.members[request.auth.uid] == true;
      }

      match /tasks/{taskId} {
        allow read, write: if request.auth != null &&
          get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.members[request.auth.uid] == true;
      }
    }
  }
}
```

---

## 👥 Cara Kolaborasi Realtime

1. Login dengan akun Google
2. Klik **+ Buat Workspace** → isi nama workspace
3. Bagikan **kode 6 digit** yang muncul ke rekan tim
4. Rekan tim login → klik **Gabung dengan Kode** → masukkan kode
5. Semua perubahan **sync realtime** ke seluruh member ✅
6. Di dalam workspace, bisa **assign task** ke member manapun

---

## 📝 Cara Pakai Task Detail

1. Klik task card manapun untuk buka modal
2. Edit judul langsung di bagian atas modal
3. Tambah deskripsi/notes di kolom kiri
4. Tambah subtask dengan checklist dan progress bar
5. Set due date — otomatis muncul warning kalau overdue atau hampir deadline
6. Assign ke member workspace (kolom kanan)
7. Ubah priority dengan dropdown custom
8. Hapus task via tombol merah di bawah

---

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run preview  # Preview hasil build
```

---

## 📄 Lisensi

Bebas digunakan dan dimodifikasi.