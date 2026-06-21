import base64

with open("public/assets/logos/mobile_hand_transparent.png", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%">
  <image href="data:image/png;base64,{encoded}" x="0" y="0" width="160" height="160" />
</svg>'''

with open("public/assets/logos/mobile_login.svg", "w") as f:
    f.write(svg_content)
print("SVG converted successfully.")
