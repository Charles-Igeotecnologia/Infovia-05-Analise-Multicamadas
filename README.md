# Infovia 05 - Instituto Everest

Aplicacao estatica de consulta e triagem territorial com Leaflet e Turf.

## Executar

```powershell
python -m http.server 8095 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8095/index.html. A senha de demonstracao e 123.
O login e local ao navegador; nao protege dados ou documentos publicados no GitHub Pages.

## Diagnostico

- Analisa todas as camadas vetoriais de entrada, inclusive ocultas.
- Pontos criticos sao referencias derivadas do pacote original e nao sao somados novamente.
- WMS e somente referencia visual.
- Buffer representa distancia para cada lado do eixo.
- Feicoes rejeitadas pela validacao Turf ficam fora do calculo e sao explicitamente contabilizadas.
- Ausencia de feicoes no pacote nao comprova ausencia de ocorrencias no territorio.
- GeoJSON exporta as geometrias originais afetadas, sem recorte, com seus atributos.
- Relatorio PDF e gerado na sessao, sem sair do mapa, com criterio, fontes e contagens atuais.
- PDFs em outputs e o gerador Python sao artefatos historicos; nao representam a sessao atual.

## Verificacao

```powershell
node --check assets/app.js
node --check assets/report.js
node tools/test_analysis.cjs
```

Regressao com o pacote atual: 33 feicoes afetadas na intersecao direta,
73 no buffer de 30 m e 157 no buffer de 50 m. Em todos os casos,
15 feicoes sao rejeitadas pela validacao (13 CNFP e 2 IBAMA).
Esses resultados sao parciais ate a revisao das geometrias de origem.

Bibliotecas locais: Turf 7.2.0 e jsPDF 3.0.4, licencas incluidas nos arquivos distribuidos.

## Evolucao pendente

Autenticacao no servidor e protecao dos arquivos; revisao topologica das 15 feicoes;
consulta GetFeatureInfo para WMS; exportacao de intersecoes recortadas;
indice espacial e processamento em worker; filtros e persistencia do ambiente;
metadados de origem e cobertura confirmados por camada.
