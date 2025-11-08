export function kpiCard(label, value, suffix=''){
  return `<div class="kpi"><span class="label">${label}</span><b>${value}${suffix}</b></div>`;
}
