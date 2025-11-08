import { loadScenario } from './scenarios/base.js';

const KEY = 'sim360_eletro_state_v1';
let state = null;

export async function initState(){
  if(state) return;
  const saved = localStorage.getItem(KEY);
  if(saved){
    state = JSON.parse(saved);
  } else {
    state = await freshState();
    persist();
  }
  return state;
}

async function freshState(){
  const scenario = await loadScenario('eletro.json');
  return {
    scenario,
    currentRound: 1,
    roundOpen: true,
    session: null,
    teams: [
      mkTeam('Time A'),
      mkTeam('Time B'),
      mkTeam('Time C')
    ],
    audit: []
  };
}
function mkTeam(name){
  return {
    name, pin:'0000',
    decisions: baseDecisions(),
    kpis: { quality:0.7, service:0.8, esg:0.5 },
    unitCostAdj: 0,
    reports: {},
    inventory: 80,
    cash: 200000
  };
}
function baseDecisions(){
  return {
    price: 1500,
    production: 100,
    supplier: 'painel',
    marketing: 20000,
    rd: 8000,
    hr: { training: 3000, hires: 0 },
    finance: { loan: 0, amort: 0 }
  };
}

export function getState(){ return state; }
export function persist(){ localStorage.setItem(KEY, JSON.stringify(state)); }
export function resetAll(){ localStorage.removeItem(KEY); location.reload(); }

export function logAudit(entry){
  state.audit.push({ ts: Date.now(), ...entry });
  persist();
}

export function setRoundOpen(v){
  state.roundOpen = v;
  persist();
}

export function nextRound(){
  state.currentRound += 1;
  state.roundOpen = true;
  persist();
}
