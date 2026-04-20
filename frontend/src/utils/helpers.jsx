export const uid = () => Math.random().toString(36).slice(2,10);
export const now = () => new Date().toISOString();
export const fmtDate = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
export const fmtTime = d => new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
export const fmtCurrency = (v, sym='₱') => `${sym}${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const hashPass = s => btoa(s + 'sf_salt_2025');