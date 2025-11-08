export function computeDRE(team, params, soldUnits){
  const price = team.decisions.price;
  const receitaBruta = soldUnits * price;
  const impostos = receitaBruta * (params.taxes.icms + params.taxes.pis + params.taxes.cofins + (params.taxes.ipi||0));
  const receitaLiquida = receitaBruta - impostos;

  const unitCost = 1200 + team.unitCostAdj; // base simplificada
  const cmv = soldUnits * unitCost;

  const despesas = team.decisions.marketing + team.decisions.rd + (team.decisions.hr.training||0);
  const ebit = receitaLiquida - cmv - despesas;

  // fluxo bem simples
  const fluxo = ebit - Math.max(0, team.decisions.finance.amort||0);

  return { receitaBruta, impostos, receitaLiquida, cmv, despesas, ebit, fluxo };
}
