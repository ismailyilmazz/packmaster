class Item:
    def __init__(self, item_id, width, length, height, weight, is_fragile=False):
        self.item_id = item_id
        self.width = width        # x boyutu (cm)
        self.length = length      # y boyutu (cm)
        self.height = height      # z boyutu (cm)
        self.weight = weight      # (kg)
        self.is_fragile = is_fragile
        self.volume = width * length * height

    def to_dict(self):
        return self.__dict__

class Box:
    def __init__(self, box_id, box_type_name, width, length, height, max_weight):
        self.box_id = box_id
        self.box_type_name = box_type_name
        self.width = width
        self.length = length
        self.height = height
        self.max_weight = max_weight
        self.volume = width * length * height
        
        self.packed_items = []    # İçindekiler: {"item_id", "x", "y", "z", "w", "l", "h"}
        self.current_weight = 0
        
        # Arkadaşının 3D/2D çizim yapabilmesi için boş alan takibi (x, y, z, w, l, h)
        self.empty_spaces = [{"x": 0, "y": 0, "z": 0, "w": width, "l": length, "h": height}]

    def to_dict(self):
        return {
            "box_id": self.box_id,
            "box_type_name": self.box_type_name,
            "width": self.width,
            "length": self.length,
            "height": self.height,
            "max_weight": self.max_weight,
            "current_weight": round(self.current_weight, 2),
            "packed_items": self.packed_items
        }