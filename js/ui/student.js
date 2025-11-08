import { getState, persist, logAudit } from '../state.js';
import { operations } from '../engine/supply.js';
import { allocateDemand } from '../engine/demand.js';
import { computeDRE } from '../engine/finance.js';
import { kpiCard } from './charts.js';

export function renderStudent(root){
  const s = getState();
  const meName = s?.session?.team || 'Time A';
  const me = s.teams.find(t => t.name === meName) || s.teams[0];

  if(!s.roundOpen){
    root.innerHTML = `<section class="card"><h2>Rodada fechada</h2><p>Aguarde o professor abrir a próxima rodada.</p></section>`;
    return;
  }

  root.innerHTML = `
    <section class="card">
      <h2>Decisões — ${me.name} <span class="badge">Rodada ${s.currentRound}</span></h2>
      <div class="grid cols-3">
        <div>
          <div class="label">Preço (R$)</div>
          <input id="price" type="number" class="input" value="${me.decisions.price}">
        </div>
        <div>
          <div class="label">Produção (un.)</div>
          <input id="prod" type="number" class="input" value="${me.decisions.production}">
        </div>
        <div>
          <div class="label">Marketing (R$)</div>
          <input id="mkt" type="number" class="input" value="${me.decisions.marketing}">
        </div>
      </div>
      <div class="grid cols-3" style="margin-top:12px">
        ${kpiCard('Qualidade', Math.round(me.kpis.quality*100),'%')}
        ${kpiCard('Serviço', Math.round(me.kpis.service*100),'%')}
        ${kpiCard('ESG', Math.round(me.kpis.esg*100),'%')}
      </div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn" id="simulate">Simular</button>
        <button class="btn alt" id="save">Salvar</button>
      </div>
      <div id="simout" class="card" style="margin-top:14px;display:none"></div>
    </section>
  `;

  const $ = sel => root.querySelector(sel);
  $('#simulate').onclick = ()=>{
    const tmp = clone(me);
    tmp.decisions.price = +$('#price').value;
    tmp.decisions.production = +$('#prod').value;
    tmp.decisions.marketing = +$('#mkt').value;
    const ops = operations(tmp, s.scenario);
    const demand = allocateDemand([tmp], s.scenario, s.currentRound)[0];
    const sold = Math.min(demand, ops.available);
    const dre = computeDRE(tmp, s.scenario, sold);
    const el = $('#simout');
    el.style.display = 'block';
    el.innerHTML = `
      <h3>Prévia</h3>
      <table>
        <tr><th>Vendas (un.)</th><td>${sold}</td></tr>
        <tr><th>Receita Líquida</th><td>R$ ${dre.receitaLiquida.toFixed(2)}</td></tr>
        <tr><th>EBIT</th><td>R$ ${dre.ebit.toFixed(2)}</td></tr>
        <tr><th>Fluxo</th><td>R$ ${dre.fluxo.toFixed(2)}</td></tr>
      </table>`;
  };

  $('#save').onclick = ()=>{
    const before = JSON.stringify(me.decisions);
    me.decisions.price = +$('#price').value;
    me.decisions.production = +$('#prod').value;
    me.decisions.marketing = +$('#mkt').value;
    persist();
    logAudit({ actor:me.name, type:'save_decisions', before, after: JSON.stringify(me.decisions) });
    alert('Decisões salvas! Aguarde o fechamento da rodada.');
  };
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
