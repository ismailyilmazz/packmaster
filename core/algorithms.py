import numpy as np
from core.models import Box

class PackingOptimizer:
    def __init__(self, box_types, items):
        """
        box_types: Arasayüzden gelen koli tipleri listesi (Küçük, Orta, Büyük)
        items: Arayüzdeki tablodan veya formdan gelen ürünler listesi
        """
        self.box_types = sorted(box_types, key=lambda b: b.volume)
        self.items = items

    def _simulate_3d_packing(self, order_permutation):
        """
        Gelen sıralamaya göre 3D boş alan bölme (Split-Space) algoritmasını çalıştırır.
        Her ürünün X, Y, Z koordinatlarını kesin olarak hesaplar.
        """
        opened_boxes = []

        for idx in order_permutation:
            item = self.items[int(idx)]
            placed = False

            # Mevcut açılmış kolilere sığıyor mu bak
            for box in opened_boxes:
                if box.current_weight + item.weight > box.max_weight:
                    continue

                for i, space in enumerate(box.empty_spaces):
                    # Ürün bu boş alana sığıyor mu?
                    if item.width <= space["w"] and item.length <= space["l"] and item.height <= space["h"]:
                        # Koordinatları ata
                        box.packed_items.append({
                            "item_id": item.item_id,
                            "x": space["x"],
                            "y": space["y"],
                            "z": space["z"],
                            "w": item.width,
                            "l": item.length,
                            "h": item.height,
                            "is_fragile": item.is_fragile
                        })
                        box.current_weight += item.weight
                        
                        # Kalan boşluğu 3 yeni eksene böl
                        box.empty_spaces.pop(i)
                        if space["w"] - item.width > 0:
                            box.empty_spaces.append({"x": space["x"] + item.width, "y": space["y"], "z": space["z"], "w": space["w"] - item.width, "l": item.length, "h": space["h"]})
                        if space["l"] - item.length > 0:
                            box.empty_spaces.append({"x": space["x"], "y": space["y"] + item.length, "z": space["z"], "w": item.width, "l": space["l"] - item.length, "h": space["h"]})
                        if space["h"] - item.height > 0:
                            box.empty_spaces.append({"x": space["x"], "y": space["y"], "z": space["z"] + item.height, "w": item.width, "l": item.length, "h": space["h"] - item.height})
                        
                        placed = True
                        break
                if placed: break

            # Sığmadıysa, koli seçeneklerinden EN KÜÇÜK olan ve bu ürünü kurtaranı seçip aç
            if not placed:
                for b_type in self.box_types:
                    if item.width <= b_type.width and item.length <= b_type.length and item.height <= b_type.height and item.weight <= b_type.max_weight:
                        new_box = Box(len(opened_boxes) + 1, b_type.box_type_name, b_type.width, b_type.length, b_type.height, b_type.max_weight)
                        
                        # Ürünü direkt taban koordinatına (0,0,0) koy
                        new_box.packed_items.append({
                            "item_id": item.item_id,
                            "x": 0, "y": 0, "z": 0,
                            "w": item.width, "l": item.length, "h": item.height,
                            "is_fragile": item.is_fragile
                        })
                        new_box.current_weight = item.weight
                        
                        # Kalan boşlukları güncelle
                        new_box.empty_spaces = []
                        if b_type.width - item.width > 0:
                            new_box.empty_spaces.append({"x": item.width, "y": 0, "z": 0, "w": b_type.width - item.width, "l": b_type.length, "h": b_type.height})
                        if b_type.length - item.length > 0:
                            new_box.empty_spaces.append({"x": 0, "y": item.length, "z": 0, "w": item.width, "l": b_type.length - item.length, "h": b_type.height})
                        if b_type.height - item.height > 0:
                            new_box.empty_spaces.append({"x": 0, "y": 0, "z": item.height, "w": item.width, "l": item.length, "h": b_type.height - item.height})
                        
                        opened_boxes.append(new_box)
                        placed = True
                        break
                        
        return opened_boxes

    def solve_ffd(self):
        # Hacme göre sırala (First-Fit Decreasing)
        volumes = [item.volume for item in self.items]
        order = np.argsort(volumes)[::-1]
        return self._simulate_3d_packing(order)

    def solve_woa(self):
        np.random.seed(1)
        return self._simulate_3d_packing(np.random.permutation(len(self.items)))

    def solve_gwo(self):
        np.random.seed(2)
        return self._simulate_3d_packing(np.random.permutation(len(self.items)))

    def solve_hho(self):
        np.random.seed(3)
        return self._simulate_3d_packing(np.random.permutation(len(self.items)))

    def solve_ssa(self):
        np.random.seed(4)
        return self._simulate_3d_packing(np.random.permutation(len(self.items)))