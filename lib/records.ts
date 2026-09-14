export const periods = ['아침', '오후', '밤'];
export const exercises = ['누워서 브릿지', '경사블럭', '다리들기'];
export const activities = ['자전거 등하교', '학교체육활동', '산책', '차로외출'];
export type Session = { pain: string; minutes: string[] };
export type Day = { date: string; sessions: Session[]; activities: string[]; customActivity: string; notes: string; version: number };
export function today() { const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function blank(date:string):Day {return {date,sessions:periods.map(()=>({pain:'',minutes:['','','']})),activities:[],customActivity:'',notes:'',version:0};}
export function total(day:Day) {return Math.round(day.sessions.reduce((s,p)=>s+p.minutes.reduce((a,b)=>a+Number(b||0),0),0)*10)/10;}
export function painRange(day:Day) {const v=day.sessions.filter(p=>p.pain!=='').map(p=>Number(p.pain));return v.length?[Math.min(...v),Math.max(...v)]:null;}
export function weekdayLabel(date:string) {return new Date(`${date}T00:00:00Z`).toLocaleDateString('ko-KR',{weekday:'long',timeZone:'UTC'});}
export function dateLabel(date:string) {return new Date(`${date}T12:00:00`).toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});}
export function validDay(d:Day) {const num=(v:unknown,max:number)=>typeof v==='string'&&(v===''||(/^\d+(\.\d)?$/.test(v)&&Number(v)>=0&&Number(v)<=max));return d&&typeof d.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&!isNaN(Date.parse(d.date))&&new Date(d.date).toISOString().slice(0,10)===d.date&&Number.isInteger(d.version)&&d.version>=0&&Array.isArray(d.sessions)&&d.sessions.length===3&&d.sessions.every(s=>s&&num(s.pain,5)&&Array.isArray(s.minutes)&&s.minutes.length===3&&s.minutes.every(m=>num(m,1440)))&&Array.isArray(d.activities)&&d.activities.every(a=>activities.includes(a))&&new Set(d.activities).size===d.activities.length&&typeof d.customActivity==='string'&&d.customActivity.length<=500&&typeof d.notes==='string'&&d.notes.length<=5000;}

