# TaskFlow 🗂️

Aplikasi **Kanban Board** modern dengan fitur drag & drop, dark mode, autentikasi Google, dan kolaborasi realtime.

---

## ✨ Fitur

- **Drag & Drop** — task dan board bisa dipindah dengan mudah
- **Manajemen Board** — tambah, hapus, dan reorder kolom board
- **Custom Warna Board** — pilih warna dari preset atau color picker bebas
- **Priority Task** — High, Medium, Low dengan badge warna
- **Dark Mode** — toggle light/dark kapan saja
- **Login Google** — data tersimpan otomatis di Firebase
- **Mode Tamu** — bisa dipakai tanpa login (data tidak tersimpan)
- **Realtime Collaboration** — buat atau gabung workspace bersama tim
- **Batasan Urutan Board** — To Do tidak bisa melewati In Progress, In Progress tidak bisa melewati Done

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

### 1. Clone / buka project

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
│   ├── Board.jsx          # Container utama drag & drop
│   ├── Column.jsx         # Kolom/board individual
│   ├── TaskCard.jsx       # Card task
│   ├── AddTaskForm.jsx    # Form tambah task
│   ├── SortableColumn.jsx # Wrapper drag kolom
│   └── WorkspacePanel.jsx # Panel kolaborasi workspace
├── hooks/
│   ├── useAuth.js         # Logic autentikasi Google
│   ├── useTasks.js        # Logic task & kolom + Firestore sync
│   └── useWorkspace.js    # Logic buat & gabung workspace
├── data/
│   └── initialData.js     # Data awal kolom & task
├── firebase.js            # Konfigurasi Firebase
├── App.jsx                # Root component
└── App.css                # Global styles
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

---

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run preview  # Preview hasil build
```

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.