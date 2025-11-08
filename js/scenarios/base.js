export async function loadScenario(name){
  const res = await fetch('./js/scenarios/' + name);
  return res.json();
}
