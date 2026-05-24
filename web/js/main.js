let pyodide;

async function initPyodide() {
    const statusDiv = document.getElementById('status');
    const runBtn = document.getElementById('run-btn');

    try {
        pyodide = await loadPyodide();
        await pyodide.loadPackage(["numpy", "pandas"]);
        
        pyodide.FS.mkdir('core');
        pyodide.FS.writeFile('core/__init__.py', '');
        pyodide.FS.writeFile('core/models.py', await (await fetch('../core/models.py')).text());
        pyodide.FS.writeFile('core/algorithms.py', await (await fetch('../core/algorithms.py')).text());
        pyodide.FS.writeFile('core/metrics.py', await (await fetch('../core/metrics.py')).text());

        statusDiv.innerText = "Sistem Hazır! Form verilerini gönderebilirsiniz.";
        
        if (runBtn) {
            runBtn.disabled = false;
            // Test butonuna basıldığında simülasyonu çalıştırır
            runBtn.addEventListener('click', handleFormSubmitSimulation);
        }

    } catch (error) {
        statusDiv.innerText = "Yükleme hatası. Konsolu kontrol edin.";
        console.error(error);
    }
}

/**
 * DEĞİŞECEĞİNİZ VE GERÇEK FORMA BAĞLAYACAĞINIZ ANA FONKSİYON BURASI!
 * ui.js içinden bu fonksiyonu çağırarak formdaki koli ve ürün dizileri paslanacak
 */
async function calculatePacking(boxTypesArray, itemsArray) {
    try {
        // JavaScript dizilerini JSON string'e çevirip Python hafızasına atıyoruz
        const boxesJson = JSON.stringify(boxTypesArray);
        const itemsJson = JSON.stringify(itemsArray);

        pyodide.globals.set("js_boxes", boxesJson);
        pyodide.globals.set("js_items", itemsJson);

        // Python motorunu tetikliyoruz
        const jsonResultString = await pyodide.runPythonAsync(`
            from core.metrics import run_dynamic_packing
            run_dynamic_packing(js_boxes, js_items)
        `);

        // Python'dan gelen 3D koordinat haritasını JavaScript objesi olarak döndürüyoruz
        return JSON.parse(jsonResultString);

    } catch (error) {
        console.error("Optimizasyon motoru hesaplama hatası:", error);
        throw error;
    }
}

/**
 * Bu fonksiyon sadece şu an arayüz olmadan sistemi test edebilmeniz için yalandan (mock) veri üretip yukarıdaki ana fonksiyonu tetikler.
 */
async function handleFormSubmitSimulation() {
    const outputPre = document.getElementById('output');
    if (outputPre) outputPre.innerText = "Dinamik veriler optimizasyon motoruna gönderildi...";

    // --- BURASI MOCK VERİDİR ( ui.js yazınca buraya gerek kalmayacak) ---
    const mockFormBoxTypes = [
        { name: "Kucuk_Koli", width: 30, length: 30, height: 30, max_weight: 15 },
        { name: "Orta_Koli", width: 50, length: 50, height: 50, max_weight: 30 },
        { name: "Buyuk_Koli", width: 80, length: 80, height: 80, max_weight: 50 }
    ];

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
    // -------------------------------------------------------------------------

    try {
        // Yukarıda ayırdığımız ana fonksiyonu çağırıyoruz
        const finalResults = await calculatePacking(mockFormBoxTypes, mockFormItems);
        console.log("Algoritmalardan Gelen Detaylı Koordinat Haritası:", finalResults);

        if (outputPre) {
            let output = "=== FORM BAŞARIYLA ÇÖZÜLDÜ (ÇOKLU KOLİ SİSTEMİ) ===\n\n";
            Object.keys(finalResults).forEach(algo => {
                output += `[${algo} Algoritması]:\n`;
                output += `  -> Toplam Açılan Koli: ${finalResults[algo].summary.box_count} adet\n`;
                output += `  -> Süre: ${finalResults[algo].summary.execution_time_ms} ms\n`;
                
                finalResults[algo].boxes.forEach(box => {
                    output += `    * Koli ID ${box.box_id} (${box.box_type_name} - ${box.width}x${box.length}x${box.height}): ${box.packed_items.length} ürün yerleşti.\n`;
                });
                output += "\n";
            });
            outputPre.innerText = output;
        }

    } catch (error) {
        if (outputPre) outputPre.innerText = "Hata oluştu: " + error;
    }
}

initPyodide();