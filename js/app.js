// --- BAGIAN 1: PERSIAPAN VARIABEL ---
console.log("Memuat materi: " + judulWeb);
console.log(materiFiqih);

const inputCari = document.getElementById('input-cari');
const container = document.getElementById("app-container");
const menuContainer = document.getElementById('menu-navigasi');

/// js/app.js

function renderMateri(data) {
    // 1. Bersihkan area kerja
    container.innerHTML = "";
    menuContainer.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<h3 style='text-align:center; color:gray;'>Materi tidak ditemukan 😢</h3>";
        return;
    }

    // --- TAHAP 1: KUMPULKAN HTML (JANGAN DITEMPEL DULU) ---
    let semuaKartuHtml = ""; // Wadah raksasa buat nyimpen semua kode HTML

    data.forEach(function(item){
        // Masukkan string HTML ke wadah (Gak pake innerHTML dulu!)
        semuaKartuHtml += `
            <br><div id="materi-${item.id}" class="paket-fiqih">
                <div class="kartu">
                    <h2>${item.judul}</h2>
                    <div class="konten-materi">${item.isi}</div>
                </div>
                <div class="pengembangan">
                    <div id="list-catatan-${item.id}" class="area-catatan"></div>
                    <div class="input-wrapper">
                        <input type="text" id="input-${item.id}" placeholder="Tulis pengembangan...">
                        <button onclick="TambahanCatatan(${item.id})">Simpan</button>
                    </div>
                </div>
            </div><br>
        `;

        // Sidebar aman pake appendChild, jadi boleh langsung
        const linkMenu = document.createElement('a');
        linkMenu.innerText = item.judul;
        linkMenu.href = `#materi-${item.id}`;
        menuContainer.appendChild(linkMenu);
    });

    // --- TAHAP 2: BANGUN RUMAH SERENTAK (SEKALI SAJA) ---
    // Di sini kita tempel semua kartu sekaligus. Cuma sekali bongkar pasang.
    container.innerHTML = semuaKartuHtml;

    // --- TAHAP 3: SEBAR SATPAM (EVENT LISTENER) ---
    // Karena rumahnya sudah berdiri kokoh dan gak akan dibongkar lagi,
    // sekarang aman buat naruh Satpam/Data Storage.
    data.forEach(function(item){
        muatDariStorage(item.id); 
    });
    // A. Siapkan Settingan CCTV
    const opsiCCTV = {
        root: null, // Memantau layar browser
        rootMargin: '-20% 0px -60% 0px', // AREA FOKUS (Penting!)
        // Artinya: Anggap elemen "aktif" kalau dia ada di tengah-tengah layar
        // (Abaikan 20% layar atas dan 60% layar bawah)
        threshold: 0
    };

    // B. Bikin Logika CCTV
    const mataMata = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            // Jika kartu masuk ke area fokus
            if (entry.isIntersecting) {
                
                const idKartu = entry.target.id; // misal: "materi-1"
                
                // 1. Matikan semua lampu dulu
                document.querySelectorAll('.sidebar a').forEach(function(link){
                    link.classList.remove('menu-aktif');
                });

                // 2. Nyalakan lampu yang sesuai
                // Kita cari link yang href-nya sesuai
                const linkTarget = document.querySelector(`.sidebar a[href="#${idKartu}"]`);
                
                if (linkTarget) {
                    // 1. Nyalakan Lampu
                    linkTarget.classList.add('menu-aktif');

                    // 2. LOGIKA SCROLL PINTAR 🧠
                    // Cek: Apakah link ini adalah "Anak Sulung" (Link paling atas di daftar)?
                    // menuContainer.firstElementChild adalah elemen <a> pertama di dalam <nav>
                    if (linkTarget === menuContainer.firstElementChild) {
                        
                        // KASUS KHUSUS BAB PERTAMA:
                        // Jangan scroll ke link-nya, tapi scroll SIDEBAR-NYA mentok ke 0 (Paling Atas)
                        // Biar Logo dan Search Box kelihatan lagi.
                        document.querySelector('.sidebar').scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });

                    } else {
                        // KASUS BAB LAINNYA (NORMAL):
                        // Fokus ke link-nya saja
                        linkTarget.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest', // Vertikal: Geser secukupnya
                            inline: 'center'  // Horizontal (HP): Taruh tengah
                        });
                    }
                }
            }
        });
    }, opsiCCTV);

    // C. Perintahkan CCTV memantau semua kartu yang baru dibuat
    document.querySelectorAll('.paket-fiqih').forEach(function(kartu) {
        mataMata.observe(kartu);
    });
}

// --- JALANKAN PERTAMA KALI (LOAD AWAL) ---
// Panggil fungsi sakti dengan membawa SEMUA data
renderMateri(materiFiqih); 


// --- FITUR SEARCH (EVENT LISTENER) ---
inputCari.addEventListener('input', function() {
    const kataKunci = inputCari.value.toLowerCase(); // Ubah ke huruf kecil semua biar pencarian gak sensitif (case-insensitive)

    // FILTER: Saring data
    const dataDisaring = materiFiqih.filter(function(item) {
        const judulKecil = item.judul.toLowerCase();
        const isiKecil = item.isi.toLowerCase();
        
        // Kembalikan item kalau Judul ATAU Isi mengandung kata kunci
        return judulKecil.includes(kataKunci) || isiKecil.includes(kataKunci);
    });

    // PANGGIL FUNGSI SAKTI LAGI (Cuma bawa data hasil saringan)
    renderMateri(dataDisaring);
});


// --- BAGIAN 3: FUNGSI-FUNGSI PENDUKUNG (Gak ada perubahan) ---

function TambahanCatatan(idMateri) {
    const inputElement = document.getElementById(`input-${idMateri}`);
    const teksBaru = inputElement.value;

    if (teksBaru === "") {
        alert("Gak oleh kosong!");
        return;
    }
    renderSatuCatatan(idMateri, teksBaru);
    simpanKeStorage(idMateri, teksBaru);
    inputElement.value = "";
}

function renderSatuCatatan(idCatatan, teks) {
    const areaCatatan = document.getElementById(`list-catatan-${idCatatan}`);

    const divBaru = document.createElement('div');
    divBaru.className = 'catatan-user';

    const teksBaru = document.createElement('span');
    teksBaru.innerText = "📝 " + teks;

    const tombolHapus = document.createElement('button');
    tombolHapus.innerText = 'Hapus';
    tombolHapus.className = "btn-hapus-kecil";

    tombolHapus.addEventListener('click', function(){
        const yakin = confirm("Yakin mau meng-hapus?");
        if (yakin){
            divBaru.remove();
            hapusDariStorage(idCatatan, teks);
        }
    });
    divBaru.appendChild(teksBaru);
    divBaru.appendChild(tombolHapus);
    areaCatatan.appendChild(divBaru)
}

function simpanKeStorage(idSimpan, teks) {
    const key = `catatan-fiqih-${idSimpan}`;
    let dataLama = localStorage.getItem(key);
    let listCatatan = dataLama ? JSON.parse(dataLama) : [];
    listCatatan.push(teks);
    localStorage.setItem(key, JSON.stringify(listCatatan));
}

function muatDariStorage(idKeluarkan) {
    const key = `catatan-fiqih-${idKeluarkan}`;
    const dataTersimpan = localStorage.getItem(key);

    if (dataTersimpan) {
        const listCatatan = JSON.parse(dataTersimpan);
        listCatatan.forEach(function(teks){
            renderSatuCatatan(idKeluarkan, teks);
        });
    }
}

function hapusDariStorage(idHapus, teksMauDihapus) {
    const key = `catatan-fiqih-${idHapus}`;
    const dataLama = localStorage.getItem(key);
    const listCatatan = dataLama ? JSON.parse(dataLama) : [];
    const dataBaru = listCatatan.filter(function(item){
        return item !== teksMauDihapus;
    });
    localStorage.setItem(key, JSON.stringify(dataBaru));
    console.log(`Berhasil menghapus: ${teksMauDihapus}`);
}