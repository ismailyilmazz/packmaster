import numpy as np
from core.models import Item

def generate_hard_dataset(seed=42):
    """
    Birbiriyle alakasız boyut ve ağırlıklara sahip, gerçekçi kısıtlar içeren 
    150 adet heterojen üründen oluşan test veri setini üretir.
    """
    # Her algo eşit yarışsın diye seed
    np.random.seed(seed)
    items = []
    
    for i in range(1, 151):
        # Ürünlere rastgele özellikler 
        is_fragile = bool(np.random.rand() < 0.20)
        width = int(np.random.randint(10, 50))
        length = int(np.random.randint(15, 70))
        height = int(np.random.randint(5, 40)) 
        weight = round(float(np.random.uniform(0.5, 18.0)), 2)
        
        items.append(Item(f"ITEM_{i}", width, length, height, weight, is_fragile))
        
    return items

def get_dataset_as_dicts(seed=42):
    """Pyodide (JS) tarafına verileri kolayca JSON olarak paslamak için yardımcı fonksiyon"""
    items = generate_hard_dataset(seed)
    return [item.to_dict() for item in items]

if __name__ == "__main__":
    test_items = generate_hard_dataset()
    print(f" -> Başarıyla {len(test_items)} adet zor senaryo ürünü üretildi.")
    print(f" -> Örnek Ürün ({test_items[0].item_id}): {test_items[0].width}x{test_items[0].length}x{test_items[0].height} cm | Ağırlık: {test_items[0].weight}kg | Kırılgan mı?: {test_items[0].is_fragile}")