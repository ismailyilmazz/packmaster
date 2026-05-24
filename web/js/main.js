let pyodide;

async function initPyodide() {
    const statusDiv = document.getElementById('status');
    const runBtn = document.getElementById('run-btn');

    try {
        pyodide = await loadPyodide();
        await pyodide.loadPackage(["numpy", "pandas"]);
        
        // Python kodlarını sanal ortama yüklüyorum
        pyodide.FS.mkdir('core');
        pyodide.FS.writeFile('core/__init__.py', '');
        pyodide.FS.writeFile('core/models.py', await (await fetch('/core/models.py')).text());
        pyodide.FS.writeFile('core/algorithms.py', await (await fetch('/core/algorithms.py')).text());
        pyodide.FS.writeFile('core/metrics.py', await (await fetch('/core/metrics.py')).text());

        statusDiv.innerText = "Sistem Hazır! Form verilerini gönderebilirsiniz.";
        runBtn.disabled = false;
        runBtn.addEventListener('click', handleFormSubmitSimulation);

    } catch (error) {
        statusDiv.innerText = "Yükleme hatası. Konsolu kontrol edin.";
        console.error(error);
    }
}

async function handleFormSubmitSimulation() {
    const outputPre = document.getElementById('output');
    outputPre.innerText = "Dinamik form verileri optimizasyon motoruna gönderildi...";

    // MOCK VERİ YERİNE ARTIK FORMDAN ALACAĞIN YAPIDA VERİ HAZIRLIYORUZ, Ona göre düzenle
    // Depodaki 3 farklı koli tipi (Küçük, Orta, Büyük)
    const mockFormBoxTypes = [
        { name: "Kucuk_Koli", width: 30, length: 30, height: 30, max_weight: 15 },
        { name: "Orta_Koli", width: 50, length: 50, height: 50, max_weight: 30 },
        { name: "Buyuk_Koli", width: 80, length: 80, height: 80, max_weight: 50 }
    ];

    // Form tablosundan gelen örnek 10 adet düzensiz ürün listesi
    const mockFormItems = [];
    for(let i=1; i<=10; i++) {
        mockFormItems.push({
            id: `URUN_${i}`,
            width: Math.floor(Math.random() * 25) + 10,
            length: Math.floor(Math.random() * 35) + 15,
            height: Math.floor(Math.random() * 20) + 5,
            weight: parseFloat((Math.random() * 10 + 1).toFixed(2)),
            is_fragile: Math.random() < 0.2
        });
    }

    try {
        //  JavaScript verilerini JSON string'e çevirip Python'a paslıyoruz
        const boxesJson = JSON.stringify(mockFormBoxTypes);
        const itemsJson = JSON.stringify(mockFormItems);

        pyodide.globals.set("js_boxes", boxesJson);
        pyodide.globals.set("js_items", itemsJson);

        const jsonResultString = await pyodide.runPythonAsync(`
            from core.metrics import run_dynamic_packing
            run_dynamic_packing(js_boxes, js_items)
        `);

        const finalResults = JSON.parse(jsonResultString);
        console.log("Algoritmalardan Gelen Detaylı Koordinat Haritası:", finalResults);

        // Ekranda özet gösterelim
        let output = "=== FORM BAŞARIYLA ÇÖZÜLDÜ (ÇOKLU KOLİ SİSTEMİ) ===\n\n";
        Object.keys(finalResults).forEach(algo => {
            output += `[${algo} Algoritması]:\n`;
            output += `  -> Toplam Açılan Koli: ${finalResults[algo].summary.box_count} adet\n`;
            output += `  -> Süre: ${finalResults[algo].summary.execution_time_ms} ms\n`;
            
            // Kolilerin detaylarını yazan yer
            finalResults[algo].boxes.forEach(box => {
                output += `    * Koli ID ${box.box_id} (${box.box_type_name} - ${box.width}x${box.length}x${box.height}): ${box.packed_items.length} ürün yerleşti.\n`;
            });
            output += "\n";
        });

        outputPre.innerText = output;

    } catch (error) {
        outputPre.innerText = "Hata oluştu: " + error;
        console.error(error);
    }
}

initPyodide();