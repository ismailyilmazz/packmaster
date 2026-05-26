console.log("1. ADIM BAŞARILI: ui.js dosyası sisteme bağlandı!");

const UI = {
    lists: {
        boxes: [],
        items: []
    },
    
    pythonRawResults: null,
    currentSelectedAlgo: "FFD",
    currentSelectedBoxIdx: 0,

    dom: {
        status: document.getElementById('status'),
        runBtn: document.getElementById('run-btn'),
        resultsCard: document.getElementById('results-summary-card'),
        metricBoxes: document.getElementById('metric-boxes'),
        metricItems: document.getElementById('metric-items'),
        metricTime: document.getElementById('metric-time'),
        boxesList: document.getElementById('added-boxes-list'),
        itemsList: document.getElementById('added-items-list'),
        koliSeciciAlan: document.getElementById('koli-secici-alan'),
        boxDropdown: document.getElementById('box-select-dropdown'),
        algoDropdown: document.getElementById('algo-select-dropdown')
    },

    init: function() {
        document.getElementById('add-box-btn').addEventListener('click', () => this.koliEkle());
        document.getElementById('add-item-btn').addEventListener('click', () => this.urunEkle());
        
        // Algoritma değiştirildiğinde 
        if (this.dom.algoDropdown) {
            this.dom.algoDropdown.addEventListener('change', (e) => this.secilenAlgoritmayiDegistir(e.target.value));
        }
        
        // Koli değiştirildiğinde
        this.dom.boxDropdown.addEventListener('change', (e) => {
            this.currentSelectedBoxIdx = parseInt(e.target.value);
            this.ekraniCiz();
        });

        this.koliEkle();
        this.urunEkle();
    },

    koliEkle: function() {
        const name = document.getElementById('boxName').value || "Standart_Koli";
        const w = parseFloat(document.getElementById('boxW').value) || 50;
        const l = parseFloat(document.getElementById('boxL').value) || 50;
        const h = parseFloat(document.getElementById('boxH').value) || 50;
        const m = parseFloat(document.getElementById('boxM').value) || 20;

        this.lists.boxes.push({ name, width: w, length: l, height: h, max_weight: m });
        this.listeleriArayuzdeCiz();
    },

    urunEkle: function() {
        const id = `Urun_${this.lists.items.length + 1}`;
        const w = parseFloat(document.getElementById('itemW').value) || 10;
        const l = parseFloat(document.getElementById('itemL').value) || 15;
        const h = parseFloat(document.getElementById('itemH').value) || 10;
        const weight = parseFloat(document.getElementById('itemWeight').value) || 2;
        const is_fragile = document.getElementById('itemFragile').checked;

        this.lists.items.push({ id, width: w, length: l, height: h, weight, is_fragile });
        this.listeleriArayuzdeCiz();
    },

    koliSil: function(index) {
        this.lists.boxes.splice(index, 1);
        this.listeleriArayuzdeCiz();
    },

    urunSil: function(index) {
        this.lists.items.splice(index, 1);
        this.listeleriArayuzdeCiz();
    },

    listeleriArayuzdeCiz: function() {
        this.dom.boxesList.innerHTML = this.lists.boxes.map((b, idx) => `
            <div class="list-badge">
                <span>${b.name} (${b.width}x${b.length}x${b.height})</span>
                <i class="fas fa-times-circle" onclick="UI.koliSil(${idx})"></i>
            </div>
        `).join('');

        this.dom.itemsList.innerHTML = this.lists.items.map((i, idx) => `
            <div class="list-badge">
                <span style="${i.is_fragile ? 'color:#c0392b;font-weight:bold;' : ''}">${i.id} (${i.width}x${i.length}x${i.height})</span>
                <i class="fas fa-times-circle" onclick="UI.urunSil(${idx})"></i>
            </div>
        `).join('');
    },

    verileriTopla: function() {
        return { boxes: this.lists.boxes, items: this.lists.items };
    },

    durumuGuncelle: function(type, message) {
        this.dom.status.className = ''; 
        let icon = '';
        if (type === 'loading') {
            this.dom.status.classList.add('loading');
            icon = '<i class="fas fa-spinner"></i>';
            this.dom.runBtn.disabled = true;
        } else if (type === 'success') {
            this.dom.status.classList.add('success');
            icon = '<i class="fas fa-check-circle"></i>';
            this.dom.runBtn.disabled = false;
        } else if (type === 'error') {
            this.dom.status.classList.add('error');
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            this.dom.runBtn.disabled = false;
        }
        this.dom.status.innerHTML = `${icon} <span>${message}</span>`;
    },

    // Python hesaplaması bitince gelen ham datayı buraya kaydediyoruz
    sonuclariHazirla: function(pythonSonuclari) {
        this.pythonRawResults = pythonSonuclari;
        this.currentSelectedBoxIdx = 0; // Her hesaplamada ilk koliye sıfırla
        this.ekraniCiz();
    },

    secilenAlgoritmayiDegistir: function(algoName) {
        this.currentSelectedAlgo = algoName;
        this.currentSelectedBoxIdx = 0; // Algoritma değişince ilk koliye sıfırla
        this.ekraniCiz();
    },

    ekraniCiz: function() {
        if (!this.pythonRawResults) return;

        const algoResult = this.pythonRawResults[this.currentSelectedAlgo];
        if (!algoResult || !algoResult.boxes) return;

        this.dom.resultsCard.querySelector('.card-header').innerHTML = `<i class="fas fa-chart-line"></i> Hesaplama Özeti (${this.currentSelectedAlgo} Algoritması)`;
        this.dom.metricBoxes.innerText = algoResult.summary.box_count;
        this.dom.metricItems.innerText = this.lists.items.length; 
        this.dom.metricTime.innerText = algoResult.summary.execution_time_ms;
        this.dom.resultsCard.style.display = 'block';


        this.dom.boxDropdown.innerHTML = algoResult.boxes.map((box, index) => `
            <option value="${index}" ${index === this.currentSelectedBoxIdx ? 'selected' : ''}>Koli ${box.box_id} (${box.box_type_name} - ${box.width}x${box.length}x${box.height}) -> ${box.packed_items.length} Ürün</option>
        `).join('');
        this.dom.koliSeciciAlan.style.display = 'block';

        const secilenKoli = algoResult.boxes[this.currentSelectedBoxIdx];
        if (!secilenKoli) return;

        let sahneVerileri = [];

        let disKoli = {
            type: 'mesh3d',
            x: [0, 0, secilenKoli.width, secilenKoli.width, 0, 0, secilenKoli.width, secilenKoli.width],
            y: [0, secilenKoli.length, secilenKoli.length, 0, 0, secilenKoli.length, secilenKoli.length, 0],
            z: [0, 0, 0, 0, secilenKoli.height, secilenKoli.height, secilenKoli.height, secilenKoli.height],
            i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2], j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3], k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
            opacity: 0.05, color: '#2c3e50', hoverinfo: 'skip'
        };
        sahneVerileri.push(disKoli);

        secilenKoli.packed_items.forEach((placedItem) => {
            let posX = placedItem.x || 0;
            let posY = placedItem.y || 0;
            let posZ = placedItem.z || 0;
            let dimW = placedItem.w || 10;
            let dimL = placedItem.l || 15;
            let dimH = placedItem.h || 10;

            let urunKutusu = {
                type: 'mesh3d',
                x: [posX, posX, posX + dimW, posX + dimW, posX, posX, posX + dimW, posX + dimW],
                y: [posY, posY + dimL, posY + dimL, posY, posY, posY + dimL, posY + dimL, posY],
                z: [posZ, posZ, posZ, posZ, posZ + dimH, posZ + dimH, posZ + dimH, posZ + dimH],
                i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2], j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3], k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
                opacity: 0.85,
                color: placedItem.is_fragile ? '#e74c3c' : '#3498db',
                name: `${placedItem.item_id} (${dimW}x${dimL}x${dimH})`
            };
            sahneVerileri.push(urunKutusu);
        });

        let cameraAyarlari = {
            scene: {
                xaxis: { title: 'X (cm)', range: [0, secilenKoli.width] },
                yaxis: { title: 'Y (cm)', range: [0, secilenKoli.length] },
                zaxis: { title: 'Z (cm)', range: [0, secilenKoli.height] },
                aspectmode: "manual", 
                aspectratio: { x: 1, y: secilenKoli.length/secilenKoli.width, z: secilenKoli.height/secilenKoli.width }
            },
            margin: { l: 0, r: 0, b: 0, t: 10 }
        };

        Plotly.newPlot('cizim-alani', sahneVerileri, cameraAyarlari);
    }
};

UI.init();