console.log("1. ADIM BAŞARILI: ui.js dosyası sisteme bağlandı!");

const UI = {
    dom: {
        status: document.getElementById('status'),
        runBtn: document.getElementById('run-btn'),
        resultsCard: document.getElementById('results-summary-card'),
        metricBoxes: document.getElementById('metric-boxes'),
        metricItems: document.getElementById('metric-items'),
        metricTime: document.getElementById('metric-time')
    },

    verileriTopla: function() {
        return {
            box: {
                name: "Standart_Koli", 
                width: parseFloat(document.getElementById('boxW').value) || 50,
                length: parseFloat(document.getElementById('boxL').value) || 50,
                height: parseFloat(document.getElementById('boxH').value) || 50,
                max_weight: parseFloat(document.getElementById('boxM').value) || 20
            },
            item: {
                id: "Urun_1", 
                width: parseFloat(document.getElementById('itemW').value) || 10,
                length: parseFloat(document.getElementById('itemL').value) || 15,
                height: parseFloat(document.getElementById('itemH').value) || 10,
                weight: parseFloat(document.getElementById('itemWeight').value) || 2,
                is_fragile: document.getElementById('itemFragile').checked 
            }
        };
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

    sonuclariCiz: function(kutuBoyutlari, pythonSonuclari) {
        const ffdResult = pythonSonuclari.FFD; 
        
        if (ffdResult && ffdResult.summary) {
            this.dom.metricBoxes.innerText = ffdResult.summary.box_count;
            this.dom.metricItems.innerText = ffdResult.summary.total_items_packed || 1; 
            this.dom.metricTime.innerText = ffdResult.summary.execution_time_ms;
            this.dom.resultsCard.style.display = 'block'; 
        }

        let sahneVerileri = [];

        let disKoli = {
            type: 'mesh3d',
            x: [0, 0, kutuBoyutlari.width, kutuBoyutlari.width, 0, 0, kutuBoyutlari.width, kutuBoyutlari.width],
            y: [0, kutuBoyutlari.length, kutuBoyutlari.length, 0, 0, kutuBoyutlari.length, kutuBoyutlari.length, 0],
            z: [0, 0, 0, 0, kutuBoyutlari.height, kutuBoyutlari.height, kutuBoyutlari.height, kutuBoyutlari.height],
            i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2], j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3], k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
            opacity: 0.1, color: '#aaaaaa', hoverinfo: 'skip' 
        };
        sahneVerileri.push(disKoli);

        if (ffdResult && ffdResult.boxes && ffdResult.boxes.length > 0) {
            const packedItems = ffdResult.boxes[0].packed_items;

            packedItems.forEach((placedItem) => {
                let posX = placedItem.x !== undefined ? placedItem.x : (placedItem.position ? placedItem.position.x : 0);
                let posY = placedItem.y !== undefined ? placedItem.y : (placedItem.position ? placedItem.position.y : 0);
                let posZ = placedItem.z !== undefined ? placedItem.z : (placedItem.position ? placedItem.position.z : 0);

                let dimW = placedItem.w !== undefined ? placedItem.w : (placedItem.dimension ? placedItem.dimension.w : (placedItem.width || 10));
                let dimL = placedItem.l !== undefined ? placedItem.l : (placedItem.dimension ? placedItem.dimension.l : (placedItem.length || 15));
                let dimH = placedItem.h !== undefined ? placedItem.h : (placedItem.dimension ? placedItem.dimension.h : (placedItem.height || 10));

                let urunKutusu = {
                    type: 'mesh3d',
                    x: [posX, posX, posX + dimW, posX + dimW, posX, posX, posX + dimW, posX + dimW],
                    y: [posY, posY + dimL, posY + dimL, posY, posY, posY + dimL, posY + dimL, posY],
                    z: [posZ, posZ, posZ, posZ, posZ + dimH, posZ + dimH, posZ + dimH, posZ + dimH],
                    i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2], j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3], k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
                    opacity: 0.8,
                    color: placedItem.is_fragile || placedItem.fragile ? '#e74c3c' : '#3498db',
                    name: placedItem.id || 'Ürün'
                };
                sahneVerileri.push(urunKutusu);
            });
        }

        let cameraAyarlari = {
            title: 'Koli İçi Gerçek Yerleşim Planı (3D)',
            scene: {
                xaxis: { title: 'X (cm)', range: [0, kutuBoyutlari.width] },
                yaxis: { title: 'Y (cm)', range: [0, kutuBoyutlari.length] },
                zaxis: { title: 'Z (cm)', range: [0, kutuBoyutlari.height] },
                aspectmode: "manual", 
                aspectratio: { x: 1, y: kutuBoyutlari.length/kutuBoyutlari.width, z: kutuBoyutlari.height/kutuBoyutlari.width }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 }
        };

        Plotly.newPlot('cizim-alani', sahneVerileri, cameraAyarlari);
    }
};