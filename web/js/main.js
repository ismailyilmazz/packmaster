console.log("2. ADIM BAŞARILI: main.js dosyası sisteme bağlandı!");

let pyodide;

async function initPyodide() {
    try {
        pyodide = await loadPyodide();
        await pyodide.loadPackage(["numpy", "pandas"]);
        
        // GitHub Pages uyumluluğu için yollar bağıl yapıldı
        pyodide.FS.mkdir('core');
        pyodide.FS.writeFile('core/__init__.py', '');
        pyodide.FS.writeFile('core/models.py', await (await fetch('../core/models.py')).text());
        pyodide.FS.writeFile('core/algorithms.py', await (await fetch('../core/algorithms.py')).text());
        pyodide.FS.writeFile('core/metrics.py', await (await fetch('../core/metrics.py')).text());

        UI.durumuGuncelle('success', 'Sistem Hazır! Form verilerini gönderebilirsiniz.');
        
        const runBtn = document.getElementById('run-btn');
        if (runBtn) {
            runBtn.addEventListener('click', gercekVerilerleCalistir);
        }
    } catch (error) {
        UI.durumuGuncelle('error', 'Yükleme hatası. Konsolu kontrol edin.');
        console.error(error);
    }
}

async function calculatePacking(boxTypesArray, itemsArray) {
    const boxesJson = JSON.stringify(boxTypesArray);
    const itemsJson = JSON.stringify(itemsArray);

    pyodide.globals.set("js_boxes", boxesJson);
    pyodide.globals.set("js_items", itemsJson);

    const jsonResultString = await pyodide.runPythonAsync(`
        from core.metrics import run_dynamic_packing
        run_dynamic_packing(js_boxes, js_items)
    `);

    return JSON.parse(jsonResultString);
}

async function gercekVerilerleCalistir() {
    const outputPre = document.getElementById('output');
    
    try {
        UI.durumuGuncelle('loading', 'Optimizasyon hesaplanıyor, lütfen bekleyin...');
        if (outputPre) outputPre.innerText = "Python optimizasyon motoru çalışıyor...";

        let formVerileri = UI.verileriTopla();

        if (formVerileri.boxes.length === 0 || formVerileri.items.length === 0) {
            UI.durumuGuncelle('error', 'Lütfen en az 1 koli ve 1 ürün ekleyin!');
            return;
        }

        const finalResults = await calculatePacking(formVerileri.boxes, formVerileri.items);
        console.log("Python'dan Dönen Gerçek Sonuçlar:", finalResults);

        if (outputPre) {
            outputPre.innerText = JSON.stringify(finalResults, null, 2);
        }

        UI.sonuclariHazirla(finalResults);
        UI.durumuGuncelle('success', 'Hesaplama başarıyla tamamlandı!');

    } catch (error) {
        console.error("Çalıştırma Hatası:", error);
        if (outputPre) outputPre.innerText = "Hesaplama sırasında bir hata oluştu: " + error;
        UI.durumuGuncelle('error', 'Bir hata oluştu, konsolu kontrol edin.');
    }
}

initPyodide();