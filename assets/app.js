const state = {
  package: null,
  map: null,
  mainLayer: null,
  corridorLayer: null,
  layerControl: null,
  measureLayer: null,
  measureMode: null,
  measurePoints: [],
  measureDraft: null,
  clickPopup: null,
  datasets: [],
  wmsLayers: [],
  results: [],
  hitFeatures: [],
  analysisCollapsed: false,
  initialized: false
};

const AUTH_PASSWORD = "123";
const AUTH_SESSION_KEY = "everestInfovia05Authenticated";

const colors = [
  "#b9443f", "#c47a2c", "#4267ac", "#7651a8", "#278266", "#ad5b86",
  "#187c9b", "#7e6734", "#d06036", "#4a783d", "#5e4a8f", "#253341"
];

const SOURCE_CATALOG = {
  infovia_05: {
    label: "Arquivo fornecido",
    url: "",
    note: "Eixo principal disponibilizado para a analise."
  },
  unidades_conservacao: {
    label: "ICMBio/MMA - dados geoespaciais e CNUC",
    url: "https://www.gov.br/icmbio/pt-br/dados-icmbio/dados_geoespaciais",
    note: "Unidades de conservacao federais e dados ambientais oficiais."
  },
  assentamentos_incra: {
    label: "INCRA - Acervo Fundiario",
    url: "https://acervofundiario.incra.gov.br/",
    note: "Assentamentos e bases fundiarias disponibilizadas pelo INCRA."
  },
  imoveis_sigef: {
    label: "INCRA/SIGEF",
    url: "https://sigef.incra.gov.br/",
    note: "Imoveis rurais certificados no Sistema de Gestao Fundiaria."
  },
  terras_indigenas: {
    label: "FUNAI - geoprocessamento e mapas",
    url: "https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas",
    note: "Terras indigenas publicadas pela FUNAI."
  },
  florestas_publicas: {
    label: "Serviço Florestal Brasileiro - CNFP",
    url: "https://www.gov.br/florestal/pt-br/assuntos/cadastro-nacional-de-florestas-publicas",
    note: "Cadastro Nacional de Florestas Publicas."
  },
  hidrografia_ana: {
    label: "ANA/SNIRH - Base Hidrografica Ottocodificada",
    url: "https://www.snirh.gov.br/",
    note: "Trechos de drenagem e bases hidrograficas nacionais."
  },
  imoveis_car: {
    label: "SICAR/CAR",
    url: "https://www.car.gov.br/",
    note: "Cadastros ambientais rurais declaratorios."
  },
  territorios_quilombolas: {
    label: "INCRA - territorios quilombolas",
    url: "https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas",
    note: "Informacoes oficiais sobre territorios quilombolas."
  },
  embargos_ibama: {
    label: "IBAMA/PAMGIA - areas embargadas",
    url: "https://pamgia.ibama.gov.br/",
    note: "Areas embargadas e geosservicos ambientais do IBAMA."
  },
  processos_minerarios_anm: {
    label: "ANM/SIGMINE",
    url: "https://dadosabertos.anm.gov.br/SIGMINE/PROCESSOS_MINERARIOS/",
    note: "Processos minerarios publicados pela Agencia Nacional de Mineracao."
  },
  patrimonio_arqueologico: {
    label: "IPHAN - patrimonio arqueologico",
    url: "https://www.gov.br/iphan/pt-br/patrimonio-cultural/patrimonio-arqueologico/cadastro-de-sitios-arqueologicos",
    note: "Cadastro de sitios arqueologicos e patrimonio cultural."
  },
  pontos_criticos: {
    label: "Derivado da analise multicamadas",
    url: "",
    note: "Pontos gerados a partir das intersecoes consolidadas no pacote local."
  }
};

const WMS_CATALOG = [
  {
    id: "funai-tis",
    title: "Terras indigenas - FUNAI",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "tis_poligonais",
    description: "Poligonais nacionais de terras indigenas."
  },
  {
    id: "funai-tis-portarias",
    title: "Terras indigenas com portarias",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "tis_poligonais_portarias",
    description: "Poligonais com portarias e datas de publicacao."
  },
  {
    id: "funai-amazonia",
    title: "TIs da Amazonia Legal",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "tis_amazonia_legal_poligonais",
    description: "Recorte de terras indigenas na Amazonia Legal."
  },
  {
    id: "funai-aldeias",
    title: "Aldeias indigenas",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "aldeias_pontos",
    description: "Pontos de aldeias indigenas publicados pela FUNAI."
  },
  {
    id: "funai-cr",
    title: "Coordenacoes Regionais",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "tis_cr",
    description: "Localizacao das Coordenacoes Regionais da FUNAI."
  },
  {
    id: "funai-ctl",
    title: "Coordenacoes Tecnicas Locais",
    agency: "FUNAI",
    status: "validado",
    url: "https://geoserver.funai.gov.br/geoserver/Funai/wms",
    layers: "tis_ctl",
    description: "Localizacao das Coordenacoes Tecnicas Locais."
  },
  {
    id: "inde-mei-ro",
    title: "MEI em Rondonia - INDE",
    agency: "INDE/MDIC",
    status: "validado",
    url: "https://geoservicos.inde.gov.br/geoserver/ows",
    layers: "MDIC:11MUE250GC_SIR",
    description: "Camada WMS do catalogo INDE para Rondonia."
  }
];

const $ = (id) => document.getElementById(id);

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
}

function unlockApp() {
  document.body.classList.remove("auth-locked");
  $("loginScreen")?.setAttribute("aria-hidden", "true");
}

function normalizePassword(value) {
  return String(value || "").replace(/\s+/g, "");
}

function setupLogin() {
  const form = $("loginForm");
  const input = $("loginPassword");
  const error = $("loginError");
  if (!form || !input) return;

  if (isAuthenticated()) {
    unlockApp();
    startApp();
    return;
  }

  setTimeout(() => input.focus(), 50);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (normalizePassword(input.value) !== AUTH_PASSWORD) {
      if (error) error.textContent = "Senha incorreta. Tente novamente.";
      input.select();
      return;
    }
    sessionStorage.setItem(AUTH_SESSION_KEY, "true");
    if (error) error.textContent = "";
    unlockApp();
    startApp();
  });
}

function startApp() {
  if (state.initialized) return;
  state.initialized = true;
  init().catch((error) => {
    console.error(error);
    $("sourceStatus").textContent = "Falha ao carregar os dados. Abra por um servidor local.";
    $("resultRows").innerHTML = `<tr><td colspan="4">${escapeHtml(error.message)}</td></tr>`;
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: digits });
}

function featureCount(collection) {
  return collection?.features?.length || 0;
}

function axisFeature() {
  return state.package.layers.infovia_05.features[0];
}

function geometryKind(collection) {
  const types = new Set((collection.features || []).map((feature) => feature.geometry?.type).filter(Boolean));
  if (!types.size) return "sem geometria";
  if ([...types].every((type) => type.includes("Polygon"))) return "poligonal";
  if ([...types].every((type) => type.includes("Line"))) return "linear";
  if ([...types].every((type) => type.includes("Point"))) return "pontual";
  return "mista";
}

function styleFor(dataset) {
  if (dataset.id === "pontos_criticos") {
    return {
      color: "#26312b",
      weight: 1.4,
      opacity: .95,
      fillColor: "#f4c430",
      fillOpacity: .95
    };
  }

  return {
    color: dataset.color,
    weight: dataset.id === "infovia_05" ? 5 : 2,
    opacity: dataset.id === "infovia_05" ? .95 : .85,
    fillColor: dataset.color,
    fillOpacity: dataset.kind === "poligonal" ? .16 : .08
  };
}

function popupFor(dataset, feature) {
  const props = Object.entries(feature.properties || {}).slice(0, 12);
  const rows = props.map(([key, value]) => `<b>${escapeHtml(key)}:</b> ${escapeHtml(value)}`).join("<br>");
  const source = dataset.sourceUrl
    ? `<br><b>Fonte:</b> <a href="${escapeHtml(dataset.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(dataset.source)}</a>`
    : `<br><b>Fonte:</b> ${escapeHtml(dataset.source)}`;
  const point = estimatePoint(dataset, feature);
  const coords = point?.geometry?.coordinates;
  const maps = coords
    ? `<br><a href="https://www.google.com/maps?q=${coords[1].toFixed(6)},${coords[0].toFixed(6)}" target="_blank" rel="noopener">Abrir local no Google Maps</a>`
    : "";
  return `<strong>${escapeHtml(dataset.name)}</strong>${rows ? `<br>${rows}` : ""}${source}${maps}`;
}

function popupRows(feature, limit = 12) {
  return Object.entries(feature.properties || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, limit)
    .map(([key, value]) => `<div><b>${escapeHtml(key)}:</b> ${escapeHtml(value)}</div>`)
    .join("");
}

function clickToleranceMeters(latlng) {
  const point = state.map.latLngToContainerPoint(latlng);
  const shifted = L.point(point.x + 12, point.y);
  return state.map.distance(latlng, state.map.containerPointToLatLng(shifted));
}

function pointFeatureDistanceMeters(point, feature) {
  const geometry = feature.geometry;
  if (!geometry) return Infinity;
  const coordinates = geometry.type === "Point" ? [geometry.coordinates] : geometry.coordinates;
  return Math.min(...coordinates.map((coord) => turf.distance(point, turf.point(coord), { units: "meters" })));
}

function featureContainsClick(feature, point, toleranceMeters) {
  const geometry = feature.geometry;
  if (!geometry) return false;

  try {
    if (geometry.type === "Point" || geometry.type === "MultiPoint") {
      return pointFeatureDistanceMeters(point, feature) <= toleranceMeters;
    }
    if (geometry.type === "LineString" || geometry.type === "MultiLineString") {
      return turf.pointToLineDistance(point, feature, { units: "meters" }) <= toleranceMeters;
    }
    if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
      return turf.booleanPointInPolygon(point, feature);
    }
    if (geometry.type === "GeometryCollection") {
      return geometry.geometries.some((item) => featureContainsClick({ ...feature, geometry: item }, point, toleranceMeters));
    }
  } catch (_error) {
    return false;
  }
  return false;
}

function visibleFeatureHits(latlng) {
  const point = turf.point([latlng.lng, latlng.lat]);
  const toleranceMeters = clickToleranceMeters(latlng);
  const hits = [];

  state.datasets
    .filter((dataset) => dataset.visible && state.map.hasLayer(dataset.layer))
    .forEach((dataset) => {
      (dataset.data.features || []).forEach((feature, index) => {
        if (featureContainsClick(feature, point, toleranceMeters)) {
          hits.push({ dataset, feature, index });
        }
      });
    });

  return hits;
}

function identifyPopupHtml(latlng, hits) {
  const mapsUrl = `https://www.google.com/maps?q=${latlng.lat.toFixed(6)},${latlng.lng.toFixed(6)}`;

  if (!hits.length) {
    return `
      <div class="coordinate-popup">
        <strong>Ponto selecionado</strong>
        <span>Lat: ${latlng.lat.toFixed(6)}</span>
        <span>Lng: ${latlng.lng.toFixed(6)}</span>
        <a href="${mapsUrl}" target="_blank" rel="noopener">Abrir no Google Maps</a>
      </div>
    `;
  }

  const grouped = hits.reduce((map, hit) => {
    if (!map.has(hit.dataset.id)) map.set(hit.dataset.id, { dataset: hit.dataset, features: [] });
    map.get(hit.dataset.id).features.push(hit);
    return map;
  }, new Map());

  const groups = [...grouped.values()].map(({ dataset, features }) => {
    const source = dataset.sourceUrl
      ? `<a href="${escapeHtml(dataset.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(dataset.source)}</a>`
      : escapeHtml(dataset.source);
    const featureBlocks = features.slice(0, 5).map(({ feature, index }, featureOrder) => `
      <details class="identify-feature" ${featureOrder === 0 ? "open" : ""}>
        <summary>${escapeHtml(getReference(feature, index))}</summary>
        <div class="identify-attributes">${popupRows(feature) || "<span>Sem atributos tabulares.</span>"}</div>
      </details>
    `).join("");
    const extra = features.length > 5 ? `<div class="identify-extra">+ ${formatNumber(features.length - 5)} feicoes adicionais nesta camada.</div>` : "";
    return `
      <section class="identify-layer">
        <header>
          <strong>${escapeHtml(dataset.name)}</strong>
          <span>${formatNumber(features.length)} ${features.length > 1 ? "feicoes" : "feicao"}</span>
        </header>
        ${featureBlocks}
        ${extra}
        <div class="identify-source"><b>Fonte:</b> ${source}</div>
      </section>
    `;
  }).join("");

  return `
    <div class="identify-popup">
      <div class="identify-head">
        <strong>Camadas identificadas</strong>
        <span>${formatNumber(hits.length)} ${hits.length > 1 ? "feicoes" : "feicao"} em ${formatNumber(grouped.size)} camada${grouped.size > 1 ? "s" : ""}</span>
      </div>
      ${groups}
      <div class="identify-coords">
        Lat: ${latlng.lat.toFixed(6)} | Lng: ${latlng.lng.toFixed(6)}
        <a href="${mapsUrl}" target="_blank" rel="noopener">Abrir no Google Maps</a>
      </div>
    </div>
  `;
}

function createLayer(dataset) {
  return L.geoJSON(dataset.data, {
    pane: dataset.id === "pontos_criticos" ? "criticalPane" : "overlayPane",
    style: () => styleFor(dataset),
    pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {
      pane: dataset.id === "pontos_criticos" ? "criticalPane" : "overlayPane",
      radius: dataset.id === "pontos_criticos" ? 6.5 : 5,
      ...styleFor(dataset)
    }),
    onEachFeature: (feature, layer) => {
      layer.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        if (state.measureMode) {
          addMeasurePoint(event);
          return;
        }
        showIdentifyPopup(event);
      });
    }
  });
}

function addDataset({ id, name, data, source = "Base oficial", removable = false }) {
  const sourceMeta = SOURCE_CATALOG[id] || { label: source, url: "", note: "" };
  const dataset = {
    id,
    name,
    data,
    source: sourceMeta.label || source,
    sourceUrl: sourceMeta.url || "",
    sourceNote: sourceMeta.note || "",
    removable,
    visible: true,
    color: colors[state.datasets.length % colors.length],
    kind: geometryKind(data),
    layer: null
  };

  dataset.layer = createLayer(dataset).addTo(state.map);
  if (dataset.id === "pontos_criticos") dataset.layer.bringToFront();
  state.datasets.push(dataset);
  renderLayerList();
  return dataset;
}

function removeDataset(id) {
  const index = state.datasets.findIndex((dataset) => dataset.id === id);
  if (index < 0) return;
  state.map.removeLayer(state.datasets[index].layer);
  state.datasets.splice(index, 1);
  renderLayerList();
  runAnalysis();
}

function renderLayerList() {
  const container = $("layerList");
  container.innerHTML = "";

  state.datasets
    .filter((dataset) => dataset.id !== "infovia_05")
    .forEach((dataset) => {
      const row = document.createElement("div");
      row.className = "layer-item";
      row.innerHTML = `
        <input type="checkbox" ${dataset.visible ? "checked" : ""} aria-label="Exibir ${escapeHtml(dataset.name)}">
        <div>
          <div class="layer-name" title="${escapeHtml(dataset.name)}">
            <span class="layer-swatch" style="display:inline-block;background:${dataset.color}"></span>
            ${escapeHtml(dataset.name)}
          </div>
          <span class="layer-meta">${formatNumber(featureCount(dataset.data))} feicoes - ${escapeHtml(dataset.kind)}</span>
          <span class="layer-source">
            Fonte: ${dataset.sourceUrl ? `<a href="${escapeHtml(dataset.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(dataset.source)}</a>` : escapeHtml(dataset.source)}
          </span>
        </div>
        ${dataset.removable ? `<button class="layer-remove" aria-label="Remover ${escapeHtml(dataset.name)}">&times;</button>` : "<span></span>"}
      `;

      row.querySelector("input").addEventListener("change", (event) => {
        dataset.visible = event.target.checked;
        if (dataset.visible) dataset.layer.addTo(state.map);
        else state.map.removeLayer(dataset.layer);
      });

      const removeButton = row.querySelector(".layer-remove");
      if (removeButton) removeButton.addEventListener("click", () => removeDataset(dataset.id));

      container.appendChild(row);
    });
}

function renderWmsCatalog() {
  const catalog = $("wmsCatalog");
  const active = $("activeWmsList");
  if (!catalog || !active) return;

  catalog.innerHTML = WMS_CATALOG.map((service) => {
    const isActive = state.wmsLayers.some((item) => item.id === service.id);
    return `
      <article class="wms-card">
        <div>
          <div class="wms-title">${escapeHtml(service.title)}</div>
          <div class="wms-meta">${escapeHtml(service.agency)} - ${escapeHtml(service.layers)}</div>
          <p>${escapeHtml(service.description)}</p>
        </div>
        <button class="button compact" data-wms-id="${escapeHtml(service.id)}" ${isActive ? "disabled" : ""}>${isActive ? "Adicionado" : "Adicionar"}</button>
      </article>
    `;
  }).join("");

  catalog.querySelectorAll("[data-wms-id]").forEach((button) => {
    button.addEventListener("click", () => addWmsService(WMS_CATALOG.find((service) => service.id === button.dataset.wmsId)));
  });

  active.innerHTML = state.wmsLayers.length ? `
    <p class="eyebrow">WMS ativos</p>
    ${state.wmsLayers.map((service) => `
      <div class="active-wms-item">
        <span>${escapeHtml(service.title)}</span>
        <button class="text-button" data-remove-wms="${escapeHtml(service.id)}">Remover</button>
      </div>
    `).join("")}
  ` : "";

  active.querySelectorAll("[data-remove-wms]").forEach((button) => {
    button.addEventListener("click", () => removeWmsService(button.dataset.removeWms));
  });
}

function addWmsService(service) {
  if (!service || state.wmsLayers.some((item) => item.id === service.id)) return;
  const layer = L.tileLayer.wms(service.url, {
    layers: service.layers,
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    opacity: .68,
    attribution: service.agency
  }).addTo(state.map);
  state.wmsLayers.push({ ...service, layer });
  renderWmsCatalog();
}

function removeWmsService(id) {
  const index = state.wmsLayers.findIndex((service) => service.id === id);
  if (index < 0) return;
  state.map.removeLayer(state.wmsLayers[index].layer);
  state.wmsLayers.splice(index, 1);
  renderWmsCatalog();
}

function switchPanelTab(tabName) {
  document.querySelectorAll("[data-panel-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.panelTab === tabName);
  });
  $("layersTab").classList.toggle("active", tabName === "layers");
  $("wmsTab").classList.toggle("active", tabName === "wms");
}

function toggleAnalysisPanel() {
  state.analysisCollapsed = !state.analysisCollapsed;
  $("analysisPanel").classList.toggle("collapsed", state.analysisCollapsed);
  $("toggleAnalysis").textContent = state.analysisCollapsed ? "+" : "_";
  $("toggleAnalysis").setAttribute("aria-label", state.analysisCollapsed ? "Expandir diagnostico" : "Minimizar diagnostico");
}

function toggleProjectSummary() {
  const section = $("projectSummarySection");
  const collapsed = section.classList.toggle("collapsed");
  $("toggleProjectSummary").textContent = collapsed ? "Expandir" : "Recolher";
}

function setMeasureMode(mode) {
  state.measureMode = state.measureMode === mode ? null : mode;
  state.measurePoints = [];
  if (state.measureDraft) {
    state.measureLayer.removeLayer(state.measureDraft);
    state.measureDraft = null;
  }
  document.querySelectorAll(".tool-button").forEach((button) => button.classList.remove("active"));
  if (state.measureMode) $(state.measureMode === "distance" ? "measureDistance" : "measureArea").classList.add("active");
  $("measureStatus").textContent = state.measureMode
    ? "Clique no mapa para adicionar vertices. Clique duas vezes para finalizar."
    : "Clique em uma ferramenta para medir no mapa.";
}

function clearMeasurements() {
  state.measureLayer.clearLayers();
  state.measurePoints = [];
  state.measureDraft = null;
  state.measureMode = null;
  document.querySelectorAll(".tool-button").forEach((button) => button.classList.remove("active"));
  $("measureStatus").textContent = "Medicoes removidas.";
}

function updateMeasurement() {
  if (!state.measureMode || state.measurePoints.length < 1) return;
  if (state.measureDraft) state.measureLayer.removeLayer(state.measureDraft);

  if (state.measureMode === "distance") {
    state.measureDraft = L.polyline(state.measurePoints, { color: "#111827", weight: 3, dashArray: "6 6" }).addTo(state.measureLayer);
    if (state.measurePoints.length > 1) {
      const line = turf.lineString(state.measurePoints.map((latLng) => [latLng.lng, latLng.lat]));
      const km = turf.length(line, { units: "kilometers" });
      $("measureStatus").textContent = `Distancia: ${formatNumber(km, 3)} km`;
    }
    return;
  }

  state.measureDraft = L.polygon(state.measurePoints, { color: "#111827", weight: 2, fillColor: "#35a5a0", fillOpacity: .18 }).addTo(state.measureLayer);
  if (state.measurePoints.length > 2) {
    const coords = state.measurePoints.map((latLng) => [latLng.lng, latLng.lat]);
    coords.push(coords[0]);
    const areaHa = turf.area(turf.polygon([coords])) / 10000;
    $("measureStatus").textContent = `Area: ${formatNumber(areaHa, 2)} ha`;
  }
}

function addMeasurePoint(event) {
  if (!state.measureMode) return;
  state.measurePoints.push(event.latlng);
  L.circleMarker(event.latlng, {
    radius: 4,
    color: "#111827",
    weight: 2,
    fillColor: "#fff",
    fillOpacity: 1
  }).addTo(state.measureLayer);
  updateMeasurement();
}

function finishMeasurement() {
  if (!state.measureMode) return;
  const message = $("measureStatus").textContent;
  state.measurePoints = [];
  state.measureDraft = null;
  state.measureMode = null;
  document.querySelectorAll(".tool-button").forEach((button) => button.classList.remove("active"));
  $("measureStatus").textContent = `${message} - medicao finalizada.`;
}

function showIdentifyPopup(event) {
  if (state.measureMode) return;
  const html = identifyPopupHtml(event.latlng, visibleFeatureHits(event.latlng));
  state.clickPopup = L.popup({
    className: "identify-leaflet-popup",
    maxWidth: 420,
    minWidth: 240,
    autoPanPadding: [18, 18]
  })
    .setLatLng(event.latlng)
    .setContent(html)
    .openOn(state.map);
}

function toggleSidebar() {
  const shell = $("appShell");
  const collapsed = shell.classList.toggle("sidebar-collapsed");
  $("toggleSidebar").textContent = collapsed ? "›" : "‹";
  $("toggleSidebar").setAttribute("aria-label", collapsed ? "Abrir painel lateral" : "Recolher painel lateral");
  setTimeout(() => state.map.invalidateSize(), 230);
}

function parseKml(text) {
  const xml = new DOMParser().parseFromString(text, "text/xml");
  if (xml.querySelector("parsererror")) throw new Error("KML invalido");

  const features = [];
  const parseCoords = (node) => node.textContent
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").slice(0, 2).map(Number))
    .filter((coord) => coord.length === 2 && coord.every(Number.isFinite));

  xml.querySelectorAll("Placemark").forEach((placemark, index) => {
    const props = { nome: placemark.querySelector("name")?.textContent || `Feicao ${index + 1}` };
    placemark.querySelectorAll("SimpleData").forEach((node) => { props[node.getAttribute("name")] = node.textContent; });
    placemark.querySelectorAll("Data").forEach((node) => { props[node.getAttribute("name")] = node.querySelector("value")?.textContent || ""; });

    placemark.querySelectorAll("Polygon").forEach((polygon) => {
      const outer = polygon.querySelector("outerBoundaryIs coordinates");
      if (!outer) return;
      const holes = [...polygon.querySelectorAll("innerBoundaryIs coordinates")].map(parseCoords).filter((ring) => ring.length >= 4);
      const ring = parseCoords(outer);
      if (ring.length >= 4) features.push(turf.polygon([ring, ...holes], props));
    });

    placemark.querySelectorAll("LineString").forEach((line) => {
      const coords = line.querySelector("coordinates");
      if (!coords) return;
      const parsed = parseCoords(coords);
      if (parsed.length >= 2) features.push(turf.lineString(parsed, props));
    });

    placemark.querySelectorAll("Point").forEach((point) => {
      const coords = point.querySelector("coordinates");
      if (!coords) return;
      const parsed = parseCoords(coords);
      if (parsed[0]) features.push(turf.point(parsed[0], props));
    });
  });

  return turf.featureCollection(features);
}

function readGeoFile(file) {
  return file.text().then((text) => {
    if (file.name.toLowerCase().endsWith(".kml")) return parseKml(text);
    const data = JSON.parse(text);
    if (data.type === "Feature") return turf.featureCollection([data]);
    if (data.type === "FeatureCollection") return data;
    throw new Error("GeoJSON invalido");
  });
}

function makeCorridor() {
  const km = Number($("bufferSelect").value);
  if (km <= 0) return axisFeature();
  return turf.buffer(axisFeature(), km, { units: "kilometers" });
}

function estimatePoint(dataset, feature) {
  try {
    if (feature.geometry.type.includes("Point")) return feature;
    const center = turf.center(feature);
    return center;
  } catch (_error) {
    return null;
  }
}

function getReference(feature, index) {
  const props = feature.properties || {};
  return props.referencia || props.nome || props.nomeuc || props.identifica || props.codigo || props.id || `Feicao ${index + 1}`;
}

function runAnalysis() {
  if (!state.package) return;
  if (state.corridorLayer) state.map.removeLayer(state.corridorLayer);

  const corridor = makeCorridor();
  const usingBuffer = Number($("bufferSelect").value) > 0;
  if (usingBuffer) {
    state.corridorLayer = L.geoJSON(corridor, {
      style: { color: "#1f6b55", weight: 1, fillColor: "#35a5a0", fillOpacity: .14, dashArray: "5 6" }
    }).addTo(state.map);
  }

  state.results = [];
  state.hitFeatures = [];

  state.datasets
    .filter((dataset) => dataset.id !== "infovia_05")
    .forEach((dataset) => {
      let hits = 0;
      (dataset.data.features || []).forEach((feature, index) => {
        if (!feature.geometry) return;
        try {
          if (turf.booleanIntersects(corridor, feature)) {
            hits += 1;
            const point = estimatePoint(dataset, feature);
            state.hitFeatures.push(turf.point(point?.geometry?.coordinates || turf.center(feature).geometry.coordinates, {
              camada: dataset.name,
              referencia: getReference(feature, index),
              tipo_geometria: feature.geometry.type,
              fonte: dataset.source,
              criterio: usingBuffer ? `Buffer de ${$("bufferSelect").selectedOptions[0].textContent}` : "Intersecao direta"
            }));
          }
        } catch (_error) {
          // Geometrias invalidas ficam fora da contagem operacional.
        }
      });

      state.results.push({
        id: dataset.id,
        name: dataset.name,
        features: featureCount(dataset.data),
        hits,
        kind: dataset.kind
      });
    });

  renderResults();
  updateMetrics();
}

function renderResults() {
  const rows = $("resultRows");
  rows.innerHTML = "";

  state.results.forEach((result) => {
    const tr = document.createElement("tr");
    const statusClass = result.hits ? "status-hit" : result.kind === "poligonal" ? "status-ok" : "status-note";
    const statusText = result.hits ? "Requer verificacao" : result.kind === "poligonal" ? "Sem sobreposicao" : "Indicativo";
    tr.innerHTML = `
      <td>${escapeHtml(result.name)}</td>
      <td>${formatNumber(result.features)}</td>
      <td><strong>${formatNumber(result.hits)}</strong></td>
      <td><span class="${statusClass}">${statusText}</span></td>
    `;
    rows.appendChild(tr);
  });

  const totalHits = state.results.reduce((sum, item) => sum + item.hits, 0);
  const impactedLayers = state.results.filter((item) => item.hits > 0).length;
  const officialFeatures = state.results.reduce((sum, item) => sum + item.features, 0);
  const uploadedLayers = state.datasets.filter((item) => item.removable).length;

  $("riskStrip").innerHTML = `
    <div class="risk-card"><span>Interferencias</span><strong>${formatNumber(totalHits)}</strong></div>
    <div class="risk-card"><span>Camadas afetadas</span><strong>${formatNumber(impactedLayers)}</strong></div>
    <div class="risk-card"><span>Feicoes analisadas</span><strong>${formatNumber(officialFeatures)}</strong></div>
    <div class="risk-card"><span>Extras carregadas</span><strong>${formatNumber(uploadedLayers)}</strong></div>
  `;
}

function updateMetrics() {
  const axis = axisFeature();
  const length = turf.length(axis, { units: "kilometers" });
  $("axisLength").textContent = `${formatNumber(length, 2)} km`;
  $("axisVertices").textContent = formatNumber(axis.geometry.coordinates.length);
  $("layerCount").textContent = formatNumber(state.datasets.length - 1);
  $("hitCount").textContent = formatNumber(state.results.reduce((sum, item) => sum + item.hits, 0));
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const header = "camada;feicoes_analisadas;interferencias;tipo_geometria\n";
  const body = state.results
    .map((item) => [item.name, item.features, item.hits, item.kind].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
  download("diagnostico_infovia_05.csv", header + body, "text/csv;charset=utf-8");
}

function exportGeojson() {
  const collection = turf.featureCollection(state.hitFeatures);
  download("interferencias_infovia_05.geojson", JSON.stringify(collection, null, 2), "application/geo+json");
}

function setupMap() {
  state.map = L.map("map", { zoomControl: false }).setView([-8.45, -63.9], 10);
  state.map.createPane("criticalPane");
  state.map.getPane("criticalPane").style.zIndex = 650;
  state.measureLayer = L.featureGroup().addTo(state.map);
  state.map.on("click", addMeasurePoint);
  state.map.on("click", showIdentifyPopup);
  state.map.on("dblclick", finishMeasurement);
  L.control.zoom({ position: "topright" }).addTo(state.map);
  L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(state.map);

  const technical = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS"
  }).addTo(state.map);

  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  });

  const imagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Esri"
  });

  L.control.layers({
    "Mapa tecnico - Esri Topografico": technical,
    "OpenStreetMap padrao": osm,
    "Imagem de satelite": imagery
  }, {}, { position: "topright" }).addTo(state.map);
}

function loadOfficialLayers() {
  const summaryByLayer = new Map(state.package.summary.map((item) => [item.camada, item]));
  const axisDataset = addDataset({
    id: "infovia_05",
    name: "Infovia 05 - eixo",
    data: state.package.layers.infovia_05,
    source: "Arquivo fornecido"
  });
  state.mainLayer = axisDataset.layer;

  state.package.summary
    .filter((item) => item.camada !== "infovia_05")
    .forEach((item) => {
      const data = state.package.layers[item.camada];
      if (!data) return;
      addDataset({
        id: item.camada,
        name: item.rotulo || item.camada,
        data,
        source: data.features?.[0]?.properties?.fonte_dado || "Base oficial"
      });
    });

  const bounds = state.mainLayer.getBounds();
  state.map.fitBounds(bounds, { padding: [35, 35] });
  $("sourceStatus").textContent = `${summaryByLayer.size} camadas, WGS 84 aparente, consulta consolidada em pacote local.`;
  updateMetrics();
}

async function init() {
  setupMap();
  const response = await fetch("data/official-package.json");
  if (!response.ok) throw new Error("Nao foi possivel carregar data/official-package.json");
  state.package = await response.json();
  loadOfficialLayers();
  renderWmsCatalog();
  runAnalysis();
}

$("runAnalysis").addEventListener("click", runAnalysis);
$("bufferSelect").addEventListener("change", runAnalysis);
$("fitAxis").addEventListener("click", () => state.map.fitBounds(state.mainLayer.getBounds(), { padding: [35, 35] }));
$("togglePanel").addEventListener("click", () => $("sidePanel").classList.toggle("open"));
$("exportCsv").addEventListener("click", exportCsv);
$("exportGeojson").addEventListener("click", exportGeojson);
$("toggleAnalysis").addEventListener("click", toggleAnalysisPanel);
$("toggleProjectSummary").addEventListener("click", toggleProjectSummary);
$("toggleSidebar").addEventListener("click", toggleSidebar);
$("measureDistance").addEventListener("click", () => setMeasureMode("distance"));
$("measureArea").addEventListener("click", () => setMeasureMode("area"));
$("clearMeasurements").addEventListener("click", clearMeasurements);

document.querySelectorAll("[data-panel-tab]").forEach((button) => {
  button.addEventListener("click", () => switchPanelTab(button.dataset.panelTab));
});

$("clearUploads").addEventListener("click", () => {
  state.datasets.filter((dataset) => dataset.removable).map((dataset) => dataset.id).forEach(removeDataset);
});

$("fileInput").addEventListener("change", async (event) => {
  for (const file of event.target.files) {
    try {
      const data = await readGeoFile(file);
      if (!featureCount(data)) throw new Error("sem feicoes");
      addDataset({
        id: `upload_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: file.name,
        data,
        source: "Camada carregada pelo usuario",
        removable: true
      });
    } catch (error) {
      alert(`Nao foi possivel ler ${file.name}. Confirme se e KML ou GeoJSON valido.`);
    }
  }
  event.target.value = "";
  runAnalysis();
});

$("addWms").addEventListener("click", () => {
  const url = $("wmsUrl").value.trim();
  const layers = $("wmsLayer").value.trim();
  if (!url || !layers) {
    alert("Informe a URL WMS e o nome tecnico da camada.");
    return;
  }
  try {
    addWmsService({
      id: `manual_${Date.now()}`,
      title: layers,
      agency: "WMS manual",
      status: "manual",
      url,
      layers,
      description: "Servico informado manualmente."
    });
  } catch (_error) {
    alert("Nao foi possivel adicionar o WMS informado.");
  }
});

setupLogin();
