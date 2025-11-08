export function operations(team, params){
  // Estoque simples: inv += prod - vendas; ruptura se vendas > inv+prod
  const prod = Math.max(0, Math.floor(team.decisions.production));
  let available = team.inventory + prod;
  return { prod, available };
}
