# **PackMaster Pro: 3D Bin Packing Optimization Engine**

PackMaster Pro, e-ticaret lojistik süreçlerinde ve akıllı depolama sistemlerinde karşılaşılan **3D Bin Packing Problem (3D-BPP)** yani Üç Boyutlu Kutu Paketleme Problemini çözmek için geliştirilmiş yüksek performanslı bir optimizasyon yazılımıdır.

Yazılım, karmaşık matematiksel sınırları (hacim limitleri, maksimum ağırlık toleransları, ürün kırılganlık sıralamaları) analiz eder. Geleneksel yaklaşımların aksine, ağır optimizasyon hesaplamalarını merkezi bir sunucu yerine doğrudan istemci tarafında (client-side) sıfır gecikmeyle koşturmak üzere **WebAssembly (Wasm)** mimarisini kullanır.

## **🛠️ Teknoloji Yığını (Technology Stack)**

Sistem, tamamen sunucusuz (serverless) çalışacak şekilde birbirine entegre edilmiş iki ana katmandan oluşmaktadır:

### **1\. İstemci Arayüzü & Grafik Katmanı (Frontend Sandbox)**

* **HTML5 & CSS3:** Modern, responsive kart tasarımları, CSS değişkenleri (:root) ile yönetilen tema yapısı ve medya sorguları (@media) ile sağlanan esnek cihaz uyumluluğu.  
* **JavaScript (ES6+):** Çift katmanlı yazılım tasarımı ile modülerleştirilmiş veri yönetimi:  
  * ui.js: Kullanıcı girdilerinin dinamik havuzda (In-memory array) biriktirilmesi, koli/ürün listelerinin yönetimi ve çizim tetikleyicileri.  
  * main.js: Pyodide sanal dosya sistemi işlemleri ve Python motoru ile JSON tabanlı veri köprüsü.  
* **Plotly.js (v2.27.0):** Hesaplanan ![][image1] koordinat verilerini ve koli sınırlarını tarayıcı üzerinde 3 boyutlu etkileşimli (mesh3d) grafikler halinde çizen görselleştirme kütüphanesi.  
* **FontAwesome (v6.5.1):** Kullanıcı deneyimini güçlendiren vektörel ikon seti.

### **2\. Optimizasyon & Matematik Motoru (Python Core via Wasm)**

* **WebAssembly (Pyodide v0.25.0):** Tarayıcı içinde sanal bir Python 3 çalışma ortamı kuran Wasm derleyicisi.  
* **NumPy & Pandas:** Pyodide sanal ortamına dinamik olarak yüklenen, matris hesaplamaları ve veri dizilimi yönetiminde kullanılan matematik kütüphaneleri.  
* **3D Split-Space Sezgisel Algoritması:** Her ürün yerleştiğinde kalan boş koli hacmini ![][image2] ve ![][image3] eksenlerinde 3 yeni alt bölmeye (Split-Space) ayıran gelişmiş koordinat hesaplama modeli.  
* **Meta-Sezgisel Optimizasyon Algoritmaları:**  
  1. **First-Fit Decreasing (FFD):** Geometrik hacim sıralı deterministik temel çizgi modeli.  
  2. **Grey Wolf Optimizer (GWO):** Gri kurtların av kuşatma hiyerarşisine dayalı popülasyon tarayıcı model.  
  3. **Whale Optimization Algorithm (WOA):** Kambur balinaların sarmal kabarcık ağıyla avlanma mekanizması.  
  4. **Harris Hawks Optimization (HHO):** İşbirlikçi sürpriz baskın ve ani manevra taktikleri tabanlı arama modeli.  
  5. **Salp Swarm Algorithm (SSA):** Doğrusal olmayan kısıtları çözmek için salp zinciri dinamiği modeli.

## **🏗️ Matematiksel Model & Kısıt Yapısı**

Python motoru (core/models.py ve core/algorithms.py), girilen tüm koli ve ürünleri şu kısıtlar altında işler:

* **Atama Kısıtı:** Her ![][image4] ürünü sadece tek bir ![][image5] kolisine atanabilir:  
  ![][image6]  
* **Taşıma Kapasitesi Kısıtı:** Bir koliye atanan ürünlerin toplam kütlesi, o kolinin taşıma sınırını aşamaz:  
  ![][image7]  
* **Geometrik Çakışmama Kısıtı:** Koli içindeki hiçbir ürünün hacimsel sınırları bir diğeriyle çakışamaz ve dış duvarlardan taşamaz:  
  ![][image8]  
* **Kırılganlık Kısıtı:** Kırılgan ürünlerin tabanda kalıp ezilmesini önlemek amacıyla, bu ürünler dikey yerleşim hiyerarşisinde üst katmanlara (![][image3] ekseninde yukarılara) yerleştirilir.

## **📂 Dosya ve Dizin Yapısı**

Projenin WebAssembly çalışma ortamı tarafından düzgünce okunabilmesi için dosya ağacının şu yapıda kalması zorunludur:

packmaster/  
│  
├── core/                       \# Optimizasyon ve Matematik Motoru (Python)  
│   ├── \_\_init\_\_.py  
│   ├── models.py               \# Nesne yönelimli fiziksel veri modelleri (Item, Box)  
│   ├── dataset.py              \# Sentetik zor senaryo test veri jeneratörü  
│   ├── algorithms.py           \# 3D Split-Space yerleşim ve 5 farklı arama modeli  
│   └── metrics.py              \# JavaScript-Python köprüsü ve metrik çıkarıcı  
│  
└── web/                        \# Kullanıcı Etkileşim Katmanı (Frontend)  
    ├── index.html              \# Ana arayüz giriş dosyası  
    ├── css/  
    │   └── style.css           \# Responsive arayüz tasarım dosyası  
    └── js/  
        ├── ui.js               \# Dinamik form/liste yönetimi ve Plotly.js 3D çizim kodları  
        └── main.js             \# Pyodide yükleyicisi ve JSON veri transferi

## **💻 Projeyi Lokal Bilgisayarda Ayağa Kaldırma**

Tarayıcıların yerel dosya sistemlerindeki WebAssembly kaynaklarına erişimini sınırlayan güvenlik önlemleri (CORS politikası) nedeniyle, index.html dosyası çift tıklanarak doğrudan açılamaz. Proje mutlaka bir yerel web sunucu üzerinden çalıştırılmalıdır.

1. Bilgisayarınızda terminali (veya komut satırını) açın.  
2. Projenin ana dizinine (packmaster/ klasörünün içine) gidin:  
   cd path/to/packmaster

3. Python'ın hafif yerel sunucusunu 8000 portunda başlatın:  
   python \-m http.server 8000

4. Tarayıcınızı açın ve şu adrese gidin:  
   http://localhost:8000/web/

5. Konsol loglarını izlemek için tarayıcıda **F12** tuşuna basarak Geliştirici Araçları penceresini açın.

## **🔗 JavaScript ve Python Arasındaki Veri Köprüsü (Data Bridge)**

main.js dosyası, kullanıcı verilerini Python motoruna fırlatırken ve oradan gelen 3D koordinatları yakalarken şu akışı takip eder:

### **1\. Verilerin Python Motoruna Gönderilmesi**

JavaScript tarafında formlardan dinamik olarak toplanan diziler JSON formatına çevrilerek Pyodide global hafızasına enjekte edilir:

const boxTypes \= \[  
    { name: "Kucuk\_Koli", width: 30, length: 30, height: 30, max\_weight: 15 },  
    { name: "Orta\_Koli", width: 50, length: 50, height: 50, max\_weight: 30 }  
\];

const itemsList \= \[  
    { id: "Urun\_1", width: 20, length: 15, height: 10, weight: 2.5, is\_fragile: false },  
    { id: "Urun\_2", width: 12, length: 30, height: 15, weight: 4.2, is\_fragile: true }  
\];

pyodide.globals.set("js\_boxes", JSON.stringify(boxTypes));  
pyodide.globals.set("js\_items", JSON.stringify(itemsList));

### **2\. Hesaplanan Koordinatların Alınması ve İşlenmesi**

Python motoru her algoritma için koli nesnelerini ve içlerindeki ürünlerin yerleşim haritasını JSON olarak geri döndürür. JavaScript bu veriyi ayrıştırarak görselleştirme katmanına iletir:

const jsonResultString \= await pyodide.runPythonAsync(\`  
    from core.metrics import run\_dynamic\_packing  
    run\_dynamic\_packing(js\_boxes, js\_items)  
\`);

const finalResults \= JSON.parse(jsonResultString);  
// Örnek olarak FFD algoritmasının 1\. kolisindeki ürünlerin X, Y, Z koordinatlarına erişim:  
console.log(finalResults\["FFD"\].boxes\[0\].packed\_items);


[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAYAAADhVZELAAADNElEQVR4Xu1XTWgTQRROSAVFUSqG2PxN/g4WfyEgtDdBwSqiVEHBiyCIoPQgqCge7MGrQhEsUoM99dAechFFe1IPhYDQa8GLiB6LQoQKTf0+8gaGl63ZdFeosB987O57b76ZfTPzdjYWixAhQoR/hEwmkzXG1MDnilfpx/U2+MLaC4XCNK6jWscL+Xx+UuvCNubGFIvFw7DVHf8kbIfcGL/A2C6JRh384kXEbNXtOpDNZncj8CwaXIPgGrjCRMB+kH7cD8P/VnyPcH8unU7v0TpegOYZxF9Hu29sj/srVteCWvDdB1vgD/B0KpXa7sb4QalU2oW2C+AvJpYJwvUCadqTyvGv6nZdIQ2ZlCFrk87eoZNxN7YXoP2EaA9qHxDHwO/AN88J0k6/gEYVGk1obHPtsA2Dy0wI3uGi6/MFNHwqg/8KFo0s6Wq1ukXH9gI7ixj4G49BL2K7GNfWK7gloDMLHnPteB7k+zDpeIy7Pt+AwJBprxQm5lYYCbHAwO5Cr8kZtTYk4yjpxm0E5XI5B+0pJt/amGgkawn9PQv0DpxFzqYkpeV2EhS5XO4AdTHQh3zG9QieP6mwUCAfjwb7C5QQCxYomxTtCwJZ4tRtSEIWwfM6Lihkq85LX7Pa3zNYiCD0AavlpYgWdUwQQO+76D7AY0L7g4Krgvp4j/fgXmvnVjLeRb47jBQ9Weqs2Dd1TBBAr0m6dSUsSEJ4jlpShTsOe407wLH5AxqOOmJ9eJ4BF8KsK7JKGkhKv/YFRAIvfY/6qIsV12HaX9GPvLr2rsAgjxtV9NDJSdhavLr2AOCMMSkT2hEQ9pxD7WXtlGTN4bZP+zrA5YYG42jwG6zpKu0UxhVJTEcNgG9KYriP/7Y8E4g5Bf7sZevwF0D0112x8K2a9mn4BjhgKZP62siZS7frAIJGpDOXr7r411wNAi94wrSP5i2eQzz8/UY+jR4c0fEayWRyB7XBz+CA9iNReQ9dzZmYn1USNtDxZa+khAFJ7JzxSMpmBvf0E9Yl7QgD/BJiK0xzO2vfpgWSsR+sr7fngwIr5HGXerW5wF98DHhfbKM/Wz5QqVR2aluECBEiRPgP8QfsowvlSvzDcAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAaCAYAAADMp76xAAACLUlEQVR4Xu2WP0gcQRTGPTQQSSEnwsH929urFJMoHAS0NuAfQuQsFNIIgliEFIFEEAstLFIFJIWISlLZ2giidmkODgLXWospg4KFKc78Hs7A+HLB29uLXMJ+8JiZ933z7dvZmblra4sQ4T9CKpVKe563Q2yqmBOe9h2xbfO5XO4LbVH71EI2m93QvuTeuBrf9wfI7Tn8BrmnruYW0ul0N0W8RDjPhGviSook/0R4+sPwh4Zboz+ZTCZ7tE8t4PkC/QLzzmQ+/VnrayFecEtEFf4D7UQikXjkav4Ip+Ahm8vn812MjzBbdbVBwPx1492nORDjxd7DHWviTjDpkzE+JXzPfKZCofBAa4PAvHSJwg5Y4U6bJzdFVNgCnquvG0we8m5WWIp+24xiLSh2Eb9L2oLN8dVOKPaZqwsEeXtZBVNwVVZGaxpFJpN5LL4UuSJj2kHGw0oWHBjN2II1Fwb4PjS+ZVNsRWsCA6NpjL6yyp+Nua81YYDfd+O7zLBd84Ehby0HwHy+H8RrrQkD/C4l3H3cMDAqOqe1g/EuUWrmPjarW6bguOYCAYMRjL65ObbHqHdzmY+6+RCImYLXNVEX5LqSHwMMfhI7+vpyDsmVKfq3PQe3ZTRy+mc076AdzThx0dB2YOKYfZAT+3fw166HgIc/J39OVOWercHH4crax8SY1t8bePirWgW3KuS/wEc5B5poSVBoP7HXzNvkr0H+BnLYeunGNBchQoR/GL8Awbyp14HoHNEAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAABE0lEQVR4XmNgGAUYQF5eXhKIe4F4LhBfkJOTe4SOgeJ30fXBACNQwXyggvfoEkCxOUD8H4j3ycjICKHLgwFQQhqo4LqsrKwfsrixsTErSLOCgsItRUVFeWQ5FAC03QWocBVIA0wMxAZqbCCoGQSAmkuAOAhJCOSlMpDtQFeZIIkTBkBNwUD8F4i/ArE3ujxBANT0C2pAMLocQQD0qxlIM9DfCUAuI0gMGpBWwIDmRFWNBqCa34P8zgDVDAJAvjEQ71BSUuJHUo4AoBAGhTQowIB4Fro8UO4S0AAbdHE4ACo4BNOMHI0gAEo4QPHTQAMEkcXhAOQsqOYzQIM05CHJWRKoURVIVwHxK1BaQNc3CkYB1QAAxmJE+lsfLYAAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAcCAYAAACtQ6WLAAAAuElEQVR4XmNgGARATk5OEEgxooszGBsbs8rLy/8HYk90OQZpaWlhoMRzINZElwMDBQUFDnQxgoAZZCy6IIOMjIwK0J7TQPxaUVFRHi4BdLoLEPcDmYxA+9KBOAIuCXK2rKysKVA3J1DRDiBfES4JA0AFOkCJ9wzYAgBoXANQ8h+6OIOSkhI/UOIEEF8HmqAMpAPhkkC7bIACv4F4EhCXojgKKOkLFPwPpZdj+BcUbEAJSRTBUcDAAABaGCDyvh54igAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAA30lEQVR4XmNgGMLA2NiYVUZGRghdHAUoKyuLycvLnwPin+hyKEBRUVEdqOglEF9HlyMdiIqK8khLSwsDmYzocnCgoKAwAWjdBSB+CMTblZSU+NHVgH0JlMwBMhnl5OR8gez/QI3p6OoYgBLRIBooyQFkbwXir0ANxujq4AAYdtJARQ+A+DRQoSC6PBwAJW2Ain4D6fkM+DwEVFCO030wQIq1LkBF/4i2FhYCKACYAGSBElZAJjM0WD4B41ofXR0o/F7DJIH0T6Cp04HCLOjqQAqDgXgWEE8CcpnR5YclAACIFTMyX75jFwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>