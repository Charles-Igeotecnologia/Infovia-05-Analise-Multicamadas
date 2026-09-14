import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "official-package.json"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

COLORS = [
    "#b9443f", "#c47a2c", "#4267ac", "#7651a8", "#278266", "#ad5b86",
    "#187c9b", "#7e6734", "#d06036", "#4a783d", "#5e4a8f", "#253341",
]

SOURCES = {
    "unidades_conservacao": "ICMBio/MMA - dados geoespaciais e CNUC",
    "assentamentos_incra": "INCRA - Acervo Fundiario",
    "imoveis_sigef": "INCRA/SIGEF",
    "terras_indigenas": "FUNAI - geoprocessamento e mapas",
    "florestas_publicas": "Servico Florestal Brasileiro - CNFP",
    "hidrografia_ana": "ANA/SNIRH - Base Hidrografica Ottocodificada",
    "imoveis_car": "SICAR/CAR",
    "territorios_quilombolas": "INCRA - territorios quilombolas",
    "embargos_ibama": "IBAMA/PAMGIA - areas embargadas",
    "processos_minerarios_anm": "ANM/SIGMINE",
    "patrimonio_arqueologico": "IPHAN - patrimonio arqueologico",
    "pontos_criticos": "Derivado da analise multicamadas",
}


def font(size, bold=False):
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


F10 = font(10)
F11 = font(11)
F12 = font(12)
F14 = font(14, True)
F18 = font(18, True)
F24 = font(24, True)


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def flatten_coords(geometry):
    if not geometry:
        return []
    typ = geometry.get("type")
    coords = geometry.get("coordinates", [])
    if typ == "Point":
        return [coords[:2]]
    if typ == "MultiPoint" or typ == "LineString":
        return [c[:2] for c in coords]
    if typ == "MultiLineString" or typ == "Polygon":
        return [c[:2] for part in coords for c in part]
    if typ == "MultiPolygon":
        return [c[:2] for poly in coords for part in poly for c in part]
    return []


def all_bounds(layers):
    xs, ys = [], []
    for collection in layers.values():
        for feature in collection.get("features", []):
            for x, y in flatten_coords(feature.get("geometry")):
                if math.isfinite(x) and math.isfinite(y):
                    xs.append(x)
                    ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def geometry_kind(collection):
    types = {f.get("geometry", {}).get("type", "") for f in collection.get("features", [])}
    types.discard("")
    if not types:
        return "sem geometria"
    if all("Polygon" in t for t in types):
        return "poligonal"
    if all("Line" in t for t in types):
        return "linear"
    if all("Point" in t for t in types):
        return "pontual"
    return "mista"


def draw_wrapped(draw, text, xy, max_width, line_height, fill, font_obj):
    x, y = xy
    words = str(text).split()
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font_obj) <= max_width:
            line = trial
        else:
            draw.text((x, y), line, fill=fill, font=font_obj)
            y += line_height
            line = word
    if line:
        draw.text((x, y), line, fill=fill, font=font_obj)
        y += line_height
    return y


def project_factory(bounds, rect):
    minx, miny, maxx, maxy = bounds
    left, top, right, bottom = rect
    src_w = maxx - minx or 1
    src_h = maxy - miny or 1
    dst_w = right - left
    dst_h = bottom - top
    scale = min(dst_w / src_w, dst_h / src_h)
    ox = left + (dst_w - src_w * scale) / 2
    oy = top + (dst_h - src_h * scale) / 2

    def project(coord):
        x, y = coord[:2]
        return ox + (x - minx) * scale, bottom - (y - miny) * scale - (dst_h - src_h * scale) / 2

    return project


def draw_geometry(draw, geometry, project, color, kind, width=2):
    typ = geometry.get("type")
    coords = geometry.get("coordinates", [])
    outline = hex_to_rgb(color)
    fill = outline + (42,)

    def line(points, w=width):
        pts = [project(p) for p in points if len(p) >= 2]
        if len(pts) >= 2:
            draw.line(pts, fill=outline, width=w, joint="curve")

    def poly(rings):
        if not rings:
            return
        pts = [project(p) for p in rings[0] if len(p) >= 2]
        if len(pts) >= 3:
            draw.polygon(pts, fill=fill, outline=outline)

    def point(p):
        x, y = project(p)
        r = 3 if kind != "eixo" else 4
        draw.ellipse((x - r, y - r, x + r, y + r), fill=outline, outline=(255, 255, 255), width=1)

    if typ == "Point":
        point(coords)
    elif typ == "MultiPoint":
        for p in coords:
            point(p)
    elif typ == "LineString":
        line(coords, 4 if kind == "eixo" else width)
    elif typ == "MultiLineString":
        for part in coords:
            line(part)
    elif typ == "Polygon":
        poly(coords)
    elif typ == "MultiPolygon":
        for part in coords:
            poly(part)


def generate_map(package):
    w, h = 1754, 1240
    img = Image.new("RGB", (w, h), "white")
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle((0, 0, w, 86), fill=(18, 63, 50, 255))
    draw.text((42, 18), "INSTITUTO EVEREST", fill=(171, 212, 197), font=F12)
    draw.text((42, 38), "Infovia 05 - Analise Multicamadas", fill="white", font=F24)

    map_rect = (42, 112, 1328, 1092)
    draw.rectangle(map_rect, fill=(244, 248, 246, 255), outline=(216, 225, 221, 255), width=2)
    project = project_factory(all_bounds(package["layers"]), map_rect)

    for i, item in enumerate(package["summary"]):
        layer_id = item["camada"]
        collection = package["layers"].get(layer_id)
        if not collection:
            continue
        color = COLORS[i % len(COLORS)]
        kind = "eixo" if layer_id == "infovia_05" else geometry_kind(collection)
        # Draw dense polygon layers before lines/points to keep the axis visible.
        for feature in collection.get("features", []):
            draw_geometry(draw, feature.get("geometry") or {}, project, color, kind, width=2)

    draw.rectangle((1360, 112, 1712, 1092), fill=(255, 255, 255, 245), outline=(216, 225, 221, 255), width=2)
    draw.text((1380, 132), "Legenda", fill=(20, 33, 29), font=F18)
    y = 170
    for i, item in enumerate(package["summary"]):
        color = hex_to_rgb(COLORS[i % len(COLORS)])
        draw.rounded_rectangle((1382, y + 4, 1408, y + 16), radius=4, fill=color + (255,))
        y = draw_wrapped(draw, item["rotulo"], (1418, y), 270, 15, (20, 33, 29), F11)
        y += 4
        if y > 1030:
            break

    draw.text((42, 1110), "Mapa visual para apoio a analise territorial. Base vetorial local do pacote oficial carregado no painel.", fill=(101, 117, 111), font=F11)
    path = OUT / "mapa_visual_infovia05.pdf"
    img.save(path, "PDF", resolution=150.0)
    return path


def new_page():
    img = Image.new("RGB", (1240, 1754), "white")
    return img, ImageDraw.Draw(img)


def generate_report(package):
    pages = []
    img, draw = new_page()
    y = 60
    draw.text((70, y), "Instituto Everest - Infovia 05", fill=(20, 33, 29), font=F24)
    y += 36
    draw.text((70, y), "Relatorio de diagnostico multicamadas", fill=(101, 117, 111), font=F14)
    y += 44

    total_hits = sum(item.get("intersecoes_eixo", 0) for item in package["summary"] if item["camada"] != "infovia_05")
    affected = sum(1 for item in package["summary"] if item["camada"] != "infovia_05" and item.get("intersecoes_eixo", 0) > 0)
    axis_len = "79,48 km"
    kpis = [("EXTENSAO", axis_len), ("CRITERIO", "Intersecao direta"), ("INTERFERENCIAS", str(total_hits)), ("CAMADAS AFETADAS", str(affected))]
    x = 70
    for label, value in kpis:
        draw.rounded_rectangle((x, y, x + 260, y + 92), radius=8, outline=(216, 225, 221), fill=(247, 250, 248))
        draw.text((x + 16, y + 15), label, fill=(101, 117, 111), font=F10)
        draw.text((x + 16, y + 42), value, fill=(20, 33, 29), font=F18)
        x += 275
    y += 132

    draw.text((70, y), "Diagnostico", fill=(20, 33, 29), font=F18)
    y += 32
    headers = ["Camada", "Feicoes", "Interferencias", "Status"]
    widths = [560, 130, 150, 220]
    x0 = 70
    row_h = 30
    draw.rectangle((x0, y, x0 + sum(widths), y + row_h), fill=(242, 246, 244), outline=(216, 225, 221))
    x = x0
    for header, width in zip(headers, widths):
        draw.text((x + 8, y + 8), header, fill=(49, 95, 80), font=F11)
        x += width
    y += row_h
    for item in package["summary"]:
        if item["camada"] == "infovia_05":
            continue
        if y > 1580:
            pages.append(img)
            img, draw = new_page()
            y = 60
        hits = item.get("intersecoes_eixo", 0)
        status = "Requer verificacao" if hits else "Sem sobreposicao"
        values = [item["rotulo"], str(item.get("feicoes_20km", 0)), str(hits), status]
        draw.rectangle((x0, y, x0 + sum(widths), y + row_h), outline=(216, 225, 221), fill="white")
        x = x0
        for value, width in zip(values, widths):
            draw.text((x + 8, y + 8), value, fill=(20, 33, 29), font=F10)
            x += width
        y += row_h

    y += 38
    if y > 1500:
        pages.append(img)
        img, draw = new_page()
        y = 60
    draw.text((70, y), "Fontes dos dados", fill=(20, 33, 29), font=F18)
    y += 32
    for item in package["summary"]:
        if item["camada"] == "infovia_05":
            continue
        if y > 1610:
            pages.append(img)
            img, draw = new_page()
            y = 60
        draw.text((70, y), item["rotulo"], fill=(20, 33, 29), font=F11)
        draw.text((430, y), SOURCES.get(item["camada"], "Base local"), fill=(49, 95, 80), font=F11)
        y += 24

    y += 32
    draw.rounded_rectangle((70, y, 1170, y + 72), radius=8, outline=(216, 225, 221), fill=(242, 246, 244))
    draw.text((90, y + 18), "Triagem cartografica. A conclusao juridica ou fundiaria exige base atualizada, metadados,", fill=(20, 33, 29), font=F11)
    draw.text((90, y + 38), "documento dominial e consulta ao orgao competente.", fill=(20, 33, 29), font=F11)
    pages.append(img)

    path = OUT / "relatorio_diagnostico_infovia05.pdf"
    pages[0].save(path, "PDF", resolution=150.0, save_all=True, append_images=pages[1:])
    return path


def main():
    package = json.loads(DATA.read_text(encoding="utf-8"))
    map_pdf = generate_map(package)
    report_pdf = generate_report(package)
    print(map_pdf)
    print(report_pdf)


if __name__ == "__main__":
    main()
