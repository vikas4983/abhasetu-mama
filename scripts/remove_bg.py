import os
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        
        is_bg = False
        if r > 210 and g > 230 and b > 230:
            is_bg = True
        elif r > 240 and g > 240 and b > 240:
            is_bg = True
            
        if is_bg:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print("Background removed successfully.")

if __name__ == "__main__":
    src = "public/assets/logos/mobile_hand.png"
    dst = "public/assets/logos/mobile_hand_transparent.png"
    make_transparent(src, dst)
