export function applyEvents(state){
  const round = state.currentRound;
  for(const ev of state.scenario.events || []){
    if(ev.round === round){
      if(ev.type === 'fxShock'){
        state.scenario.economy.fxBRLUSD *= (1+ev.delta);
      }
      if(ev.type === 'recall'){
        const t = state.teams[0];
        t.kpis.quality = Math.max(0, t.kpis.quality - ev.rate*2);
      }
    }
  }
}
