export const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem('sf_'+k)||'null') } catch{return null} },
  set: (k,v) => localStorage.setItem('sf_'+k, JSON.stringify(v)),
};