const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const turf = require(path.join(root, 'assets/vendor/turf.min.js'));
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, { value: '0', selectedOptions: [{textContent:'Intersecao direta'}], addEventListener() {}, appendChild() {}, classList:{remove(){},toggle(){}}, setAttribute(){} });
  return elements.get(id);
}
const context = vm.createContext({turf, console, setTimeout(){}, sessionStorage:{getItem(){return null;}}, document:{getElementById:element,querySelectorAll(){return [];},createElement(){return element(Math.random());}}, L:{geoJSON(){return {addTo(){return this;}};}}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),context);
const pkg = JSON.parse(fs.readFileSync(path.join(root,'data/official-package.json'),'utf8'));
context.pkg = pkg;
vm.runInContext(`state.package=pkg; state.map={removeLayer(){}}; state.datasets=Object.entries(pkg.layers).map(([id,data])=>({id,data,name:id,source:'Teste',kind:geometryKind(data)}));`,context);
for (const [buffer,label] of [['0','Intersecao direta'],['0.03','Buffer de 30 m'],['0.05','Buffer de 50 m']]) {
  element('bufferSelect').value=buffer;
  element('bufferSelect').selectedOptions[0].textContent=label;
  vm.runInContext('runAnalysis()',context);
  const result=vm.runInContext('({rows:state.results,features:state.hitFeatures})',context);
  assert(!result.rows.some(r=>r.id==='pontos_criticos'));
  assert.equal(result.rows.reduce((sum,r)=>sum+r.hits,0),result.features.length);
  assert(result.features.every(f=>f.properties.criterio===label));
  assert(result.features.some(f=>f.geometry.type.includes('Polygon')));
  if(buffer==='0') {
    assert.equal(result.features.length,33);
    assert.equal(result.rows.reduce((sum,r)=>sum+r.errors,0),15);
  }
  console.log(label,JSON.stringify({hits:result.features.length,errors:result.rows.reduce((sum,r)=>sum+r.errors,0)}));
}
vm.runInContext(`state.datasets.push({id:'invalid',name:'Invalid',kind:'mista',data:{features:[{type:'Feature',geometry:null,properties:{}}]}});runAnalysis();`,context);
assert.equal(vm.runInContext('state.results.at(-1).errors',context),1);
const {jsPDF}=require(path.join(root,'assets/vendor/jspdf.umd.min.js'));
context.jspdf={jsPDF};
vm.runInContext(fs.readFileSync(path.join(root,'assets/report.js'),'utf8'),context);
const pdf=vm.runInContext(`createDiagnosticReport({results:state.results,criterion:'Buffer de 50 m',lengthKm:79.48,generatedAt:'Teste',sources:[]})`,context);
assert(pdf.output().startsWith('%PDF-'));
assert(pdf.output().includes('Buffer de 50 m'));
if (process.env.REPORT_TEST_OUTPUT) fs.writeFileSync(process.env.REPORT_TEST_OUTPUT, Buffer.from(pdf.output('arraybuffer')));
console.log('PASS: criterios, exclusao de derivados, geometrias preservadas, falhas e PDF.');
