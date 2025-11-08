export function rivalStrategy(team, state){
  // Ajuste simples: se vendeu pouco, reduz preço; se margem boa, aumenta marketing
  const last = team.reports[state.currentRound-1];
  if(!last) return;
  if(last.receitaBruta < 0.8 * team.decisions.production * team.decisions.price){
    team.decisions.price = Math.max(900, team.decisions.price - 50);
  }else{
    team.decisions.marketing = Math.min(120000, team.decisions.marketing + 5000);
  }
}
