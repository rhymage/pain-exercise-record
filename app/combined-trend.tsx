'use client';

import {useId,useEffect,useRef,useState} from 'react';
import {Activity, Bike, Dumbbell, Footprints, Car, NotebookPen} from 'lucide-react';
import {Day, dateLabel, painRange, total} from '@/lib/records';

const activityIcons:Record<string,typeof Bike>={
 '자전거 등하교':Bike,'학교체육활동':Dumbbell,'산책':Footprints,'차로외출':Car,
};

export default function CombinedTrend({records,onOpen}:{records:Day[];onOpen:(day:Day)=>void}){
 const gradientId='pain-gradient-'+useId().replaceAll(':','');
 const scrollRef=useRef<HTMLDivElement>(null);const [availableWidth,setAvailableWidth]=useState(640);
 useEffect(()=>{const el=scrollRef.current;if(!el)return;const observer=new ResizeObserver(entries=>setAvailableWidth(Math.floor(entries[0].contentRect.width)));observer.observe(el);return()=>observer.disconnect();},[]);
 const sorted=[...records].sort((a,b)=>a.date.localeCompare(b.date));
 const byDate=new Map(sorted.map(r=>[r.date,r]));
 const start=Date.parse(sorted[0].date+'T00:00:00Z');
 const end=Date.parse(sorted[sorted.length-1].date+'T00:00:00Z');
 const slots=Array.from({length:Math.round((end-start)/86400000)+1},(_,i)=>{
  const date=new Date(start+i*86400000).toISOString().slice(0,10);
  return {date,record:byDate.get(date)};
 });
 const width=Math.max(640,availableWidth,slots.length*90+120),left=58,right=58,top=40,bottom=290;
 const step=(width-left-right)/slots.length;
 const maxTime=Math.max(30,Math.ceil(Math.max(...records.map(total))/30)*30);
 const x=(i:number)=>left+(i+.5)*step;
 const yPain=(n:number)=>bottom-n/5*(bottom-top);
 const yTime=(n:number)=>bottom-n/maxTime*(bottom-top);
 let line='';let connected=false;
 slots.forEach(({record},i)=>{
  const hasTime=record?.sessions.some(s=>s.minutes.some(m=>m!==''));
  if(!record||!hasTime){connected=false;return;}
  line+=`${connected?'L':'M'} ${x(i)} ${yTime(total(record))} `;connected=true;
 });
 return <section className="combined-trend">
  <div className="trend-heading"><h2><Activity size={21}/>통증과 운동의 변화</h2><div className="trend-legend"><span><i className="gradient-key"/>통증 범위</span><span><i className="line-key"/>운동 시간</span></div></div>
  <p className="trend-help">통증은 왼쪽 눈금(0–5), 운동 시간은 오른쪽 눈금(분)으로 읽어요.</p>
  <div ref={scrollRef} className="trend-scroll" tabIndex={0} role="region" aria-label="날짜별 통증과 운동 그래프. 좌우로 스크롤할 수 있습니다.">
   <div className="trend-canvas" style={{width}}>
    <svg width="100%" viewBox={`0 0 ${width} 315`} role="img" aria-label="날짜를 가로축으로 한 통증 최저–최고 범위 막대와 운동 시간 선 그래프">
     <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={bottom} x2={0} y2={top} colorInterpolation="sRGB"><stop offset="0%" stopColor="#3273ed"/><stop offset="20%" stopColor="#3273ed"/><stop offset="40%" stopColor="#facc15"/><stop offset="60%" stopColor="#f97316"/><stop offset="80%" stopColor="#ef4444"/><stop offset="100%" stopColor="#ef4444"/></linearGradient></defs>
     <text x={left-12} y={20} textAnchor="end" className="trend-axis-label">통증</text><text x={width-right+12} y={20} className="trend-axis-label">분</text>
     {[0,1,2,3,4,5].map(n=><g key={n}><line x1={left} x2={width-right} y1={yPain(n)} y2={yPain(n)} stroke="#e4eaf3" strokeDasharray={n?'3 5':undefined}/><text x={left-14} y={yPain(n)+5} textAnchor="end" className="trend-tick">{n}</text><text x={width-right+14} y={yPain(n)+5} className="trend-tick">{Math.round(maxTime*n/5)}</text></g>)}
     {slots.map(({date,record},i)=>{const r=record?painRange(record):null;if(!r)return null;const high=yPain(r[1]),low=yPain(r[0]);return <g key={date}><rect x={x(i)-13} y={high===low?high-2:high} width={26} height={Math.max(4,low-high)} rx={Math.min(8,Math.max(2,(low-high)/2))} fill={`url(#${gradientId})`} opacity=".9"><title>{dateLabel(date)}: 통증 {r[0]}–{r[1]}</title></rect><text x={x(i)+19} y={(high+low)/2+4} className="trend-range-value">{r[0]===r[1]?r[0]:`${r[0]}–${r[1]}`}</text></g>;})}
     <path d={line} fill="none" stroke="#183b55" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
     {slots.map(({date,record},i)=>record&&record.sessions.some(s=>s.minutes.some(m=>m!==''))?<g key={date}><circle cx={x(i)} cy={yTime(total(record))} r={4.5} fill="#fff" stroke="#183b55" strokeWidth={2.5}><title>{dateLabel(date)}: 운동 {total(record)}분</title></circle><text x={x(i)} y={yTime(total(record))-12} textAnchor="middle" className="trend-time-value">{total(record)}분</text></g>:null)}
    </svg>
    <div className="trend-dates" style={{paddingLeft:left,paddingRight:right,gridTemplateColumns:`repeat(${slots.length},minmax(0,1fr))`}}>
     {slots.map(({date,record})=><div className="trend-day" key={date}><button className="trend-date" disabled={!record} onClick={()=>record&&onOpen(record)} aria-label={`${dateLabel(date)}, ${record?'통증 '+(painRange(record)?.join('–')??'미기록')+', 운동 '+(record.sessions.some(s=>s.minutes.some(m=>m!==''))?total(record)+'분':'미기록')+', 기록 열기':'미기록'}`}><span>{date.slice(5).replace('-','.')}</span><small>{date.slice(0,4)}</small></button><div className="trend-day-icons">{record?.activities.map(a=>{const Icon=activityIcons[a]||Activity;return <button key={a} className="trend-activity-icon" title={a} aria-label={`${dateLabel(date)} ${a} 상세보기`} onClick={()=>onOpen(record)}><Icon size={18}/></button>;})}{record?.customActivity&&<button className="trend-activity-icon custom" title={record.customActivity} aria-label={`${dateLabel(date)} 추가 활동: ${record.customActivity}`} onClick={()=>onOpen(record)}><NotebookPen size={18}/></button>}{!record?.activities.length&&!record?.customActivity&&<span className="trend-no-activity">—</span>}</div></div>)}
    </div>
   </div>
  </div>
  <div className="activity-icon-legend">{Object.entries(activityIcons).map(([name,Icon])=><span key={name}><Icon size={16}/>{name}</span>)}<span><NotebookPen size={16}/>직접 입력</span></div>
  <p className="trend-footnote">날짜나 아이콘을 누르면 상세 기록이 열려요. 기록이 없는 날은 선을 연결하지 않아요.</p>
 </section>;
}
