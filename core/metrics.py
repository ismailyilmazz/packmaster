import time
import json
from core.models import Box, Item
from core.algorithms import PackingOptimizer

def run_dynamic_packing(box_types_json, items_json):
    """
    Arayüzdeki formlardan gelen dinamik JSON verilerini çözer,
    5 algoritmayı yarıştırır ve detaylı koordinat sonuçlarını JS'e döner.
    """
    # 1. Gelen JSON verilerini Python objelerine map ettik
    raw_boxes = json.loads(box_types_json)
    raw_items = json.loads(items_json)
    
    box_types = [
        Box(0, b["name"], b["width"], b["length"], b["height"], b["max_weight"])
        for b in raw_boxes
    ]
    
    items = [
        Item(i["id"], i["width"], i["length"], i["height"], i["weight"], i.get("is_fragile", False))
        for i in raw_items
    ]
    
    optimizer = PackingOptimizer(box_types, items)
    
    algorithms = {
        "FFD": optimizer.solve_ffd,
        "WOA": optimizer.solve_woa,
        "GWO": optimizer.solve_gwo,
        "HHO": optimizer.solve_hho,
        "SSA": optimizer.solve_ssa
    }
    
    final_response = {}
    
    # Her algoritmayı dinamik veriyle yarıştır
    for name, algo_func in algorithms.items():
        start_time = time.perf_counter()
        packed_boxes = algo_func()
        end_time = time.perf_counter()
        
    
        total_used_boxes = len(packed_boxes)
        execution_time_ms = round((end_time - start_time) * 1000, 2)
        
        # JSON çıktısı 
        boxes_list = [box.to_dict() for box in packed_boxes]
        
        final_response[name] = {
            "summary": {
                "box_count": total_used_boxes,
                "execution_time_ms": execution_time_ms
            },
            "boxes": boxes_list  # Koordinatlar
        }
        
    return json.dumps(final_response)