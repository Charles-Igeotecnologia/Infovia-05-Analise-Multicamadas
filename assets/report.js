function createDiagnosticReport(snapshot) {
  const doc = new jspdf.jsPDF();
  let y = 20;
  const clean = (value) => String(value ?? "").replace(/[\u0000-\u001f]/g, " ").replace(/[\u2013\u2014]/g, "-");
  function paragraph(value, size = 10) {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(clean(value), 176);
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 17, y);
      y += size * 0.45 + 1;
    }
    y += 3;
  }
  paragraph("Instituto Everest | Infovia 05", 17);
  paragraph("Diagnostico multicamadas", 13);
  paragraph(`Gerado em: ${snapshot.generatedAt}`);
  paragraph(`Criterio: ${snapshot.criterion} | Extensao: ${snapshot.lengthKm.toFixed(2)} km`);
  const total = snapshot.results.reduce((sum, row) => sum + row.hits, 0);
  const errors = snapshot.results.reduce((sum, row) => sum + row.errors, 0);
  paragraph(`Feicoes afetadas: ${total} | Nao analisadas: ${errors}`, 12);
  paragraph("Escopo: todas as camadas vetoriais de entrada, inclusive as ocultas. WMS e pontos criticos derivados nao entram na contagem. Buffer medido para cada lado do eixo.");
  for (const row of snapshot.results) {
    paragraph(row.name, 11);
    paragraph(`Recebidas: ${row.features} | Afetadas: ${row.hits} | Nao analisadas: ${row.errors}`);
    if (!row.features) paragraph("Sem dados no pacote. Nao comprova ausencia de ocorrencias no territorio.");
  }
  paragraph("Fontes e rastreabilidade", 13);
  for (const source of snapshot.sources) {
    paragraph(`${source.name}: ${source.source}`);
    if (source.url) paragraph(source.url, 9);
  }
  paragraph("Dados locais: atualidade, cobertura e sistema de referencia devem ser confirmados nos metadados de origem. Triagem cartografica; nao substitui verificacao tecnica e documental.");
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.text(`Instituto Everest | ${page} / ${pages}`, 17, 289);
  }
  return doc;
}
