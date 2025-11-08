import { rng } from '../rng.js';

export function attractiveness(team, params){
  const d = team.decisions;
  const w = params.demand.weights;
  // preço menor ajuda (elasticidade negativa)
  const priceEffect = Math.exp(params.demand.elasticities.price.massa * ( (1500 - d.price)/1500 ));
  const adsEffect = Math.pow(1 + d.marketing/100000, params.demand.elasticities.ads);
  const quality = team.kpis.quality;
  const service = team.kpis.service;
  const esg = team.kpis.esg;
  return priceEffect + adsEffect + w.quality*quality + w.service*service + w.esg*esg;
}

export function allocateDemand(teams, params, round){
  const season = params.demand.seasonality[(round-1) % params.demand.seasonality.length];
  const base = (params.demand.base.premium + params.demand.base.massa) * season;
  const scores = teams.map(t => Math.max(0.01, attractiveness(t, params)));
  const sum = scores.reduce((a,b)=>a+b,0);
  const R = rng(2025+round);
  return teams.map((t,i)=> Math.floor(base * (scores[i]/sum) * (0.97 + R()*0.06)));
}
