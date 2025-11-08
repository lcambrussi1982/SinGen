import { getState, persist, setRoundOpen, nextRound, resetAll } from '../state.js';
import { allocateDemand } from '../engine/demand.js';
import { operations } from '../engine/supply.js';
import { computeDRE } from '../engine/finance.js';
import { applyEvents } from '../engine/risk.js';

export function renderTeacher(root){
  const s = getState();
  root.innerHTML = `
    <section class="card">
      <h2>Painel do Professor <span class="badge">Rodada ${s.currentRound}</span></h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn ${s.roundOpen?'danger':''}" id="toggleRound">${s.roundOpen?'Fechar rodada':'Abrir próxima rodada'}</button>
        <button class="btn warn" id="eventFX">Injetar evento: câmbio +10%</button>
        <button class="btn" id="exportCSV">Exportar CSV</button>
        <button class="btn" id="hardReset">Reset total</button>
      </div>
    </section>
    <section class="card">
      <h3>Times</h3>
      <table>
        <thead><tr><th>Time</th><th>Preço</th><th>Produção</th><th>Marketing</th><th>Estoque</th><th>Receita</th><th>EBIT</th></tr></thead>
        <tbody id="teamsBody"></tbody>
      </table>
    </section>
  `;

  const $ = (sel)=> root.querySelector(sel);
  $('#toggleRound').onclick = ()=>{
    if(s.roundOpen){
      // fechar e processar
      setRoundOpen(false);
      applyEvents(s);
      const demandAll = allocateDemand(s.teams, s.scenario, s.currentRound);
      s.teams.forEach((t,i)=>{
        const ops = operations(t, s.scenario);
        const sold = Math.min(demandAll[i], ops.available);
        const dre = computeDRE(t, s.scenario, sold);
        t.reports[s.currentRound] = { sold, ...dre };
        t.inventory = Math.max(0, ops.available - sold);
        t.cash += dre.fluxo;
      });
      persist();
      renderTeacher(root);
    }else{
      nextRound();
      renderTeacher(root);
    }
  };
  $('#eventFX').onclick = ()=>{
    s.scenario.events.push({ round: s.currentRound, type:'fxShock', delta:0.10 });
    persist();
    alert('Evento de câmbio agendado para esta rodada.');
  };
  $('#hardReset').onclick = ()=>{
    if(confirm('Confirmar reset total?')) resetAll();
  };
  $('#exportCSV').onclick = ()=>{
    const rows = ['time,rodada,preco,producao,marketing,vendas,receita_liquida,ebit,fluxo'];
    s.teams.forEach(t=>{
      for(const [r, rep] of Object.entries(t.reports)){
        rows.push([t.name, r, t.decisions.price, t.decisions.production, t.decisions.marketing, rep.sold, rep.receitaLiquida, rep.ebit, rep.fluxo].join(','));
      }
    });
    const blob = new Blob([rows.join('\n')], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export-sim360.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // table
  const body = $('#teamsBody');
  body.innerHTML = s.teams.map(t=>{
    const rep = t.reports[s.currentRound] || { receitaLiquida:0, ebit:0, sold:0 };
    return `<tr>
      <td>${t.name}</td>
      <td>R$ ${t.decisions.price}</td>
      <td>${t.decisions.production}</td>
      <td>R$ ${t.decisions.marketing}</td>
      <td>${t.inventory}</td>
      <td>R$ ${rep.receitaLiquida.toFixed(2)}</td>
      <td>R$ ${rep.ebit.toFixed(2)}</td>
    </tr>`
  }).join('');
}
