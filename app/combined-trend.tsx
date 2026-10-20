'use client';

import {useId,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Activity, Bike, createLucideIcon, Footprints, Car, NotebookPen, StickyNote} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Day, dateLabel, weekdayLabel, painRange, total} from '@/lib/records';

const BadmintonRacket=createLucideIcon('BadmintonRacket',[
 ['ellipse',{cx:'15',cy:'8',rx:'5',ry:'7',transform:'rotate(40 15 8)',key:'head'}],
 ['path',{d:'m10.5 13.5-3 3M3 21l4.5-4.5M12 4l7 6M10 7l7 6M14 3l-4 8M17 4l-5 9M20 6l-5 8',key:'strings'}],
]);
const activityIcons:Record<string,typeof Bike>={
 '자전거 등하교':Bike,'학교체육활동':BadmintonRacket,'산책':Footprints,'차로외출':Car,
};

export default function CombinedTrend({records,onOpen}:{records:Day[];onOpen:(day:Day)=>void}){
 const [range,setRange]=useState<'recent'|'all'>('recent');
 const gradientId='pain-gradient-'+useId().replaceAll(':','');
 const scrollRef=useRef<HTMLDivElement>(null);const [availableWidth,setAvailableWidth]=useState(640);
 useEffect(()=>{const el=scrollRef.current;if(!el)return;const observer=new ResizeObserver(entries=>setAvailableWidth(Math.floor(entries[0].contentRect.width)));observer.observe(el);return()=>observer.disconnect();},[]);
 const sorted=[...records].sort((a,b)=>a.date.localeCompare(b.date));
 const byDate=new Map(sorted.map(r=>[r.date,r]));
 const first=Date.parse(sorted[0].date+'T00:00:00Z');
 const end=Date.parse(sorted[sorted.length-1].date+'T00:00:00Z');
 const start=range==='recent'?Math.max(first,end-29*86400000):first;
 const slots=Array.from({length:Math.round((end-start)/86400000)+1},(_,i)=>{
  const date=new Date(start+i*86400000).toISOString().slice(0,10);
  return {date,record:byDate.get(date)};
 });
 const left=32,right=46,top=40,bottom=290;
 const viewport=Math.max(160,availableWidth);
 const width=range==='recent'?viewport:Math.max(viewport,slots.length*Math.max(26,(viewport-left-right)/30)+left+right);
 const step=(width-left-right)/slots.length;
 const visibleRecords=slots.flatMap(slot=>slot.record?[slot.record]:[]);
 const maxTime=Math.max(30,Math.ceil(Math.max(0,...visibleRecords.map(total))/30)*30);
 const barWidth=Math.min(18,step*.6);
 const labelEvery=Math.max(1,Math.ceil(32/step));
 const showLabel=(i:number)=>(slots.length-1-i)%labelEvery===0;
 useLayoutEffect(()=>{const el=scrollRef.current;if(el)el.scrollLeft=el.scrollWidth-el.clientWidth;},[range,width,end]);
 const move=(direction:number)=>{const el=scrollRef.current;if(el)el.scrollBy({left:direction*el.clientWidth*.85,behavior:'smooth'});};
 const x=(i:number)=>left+(i+.5)*step;
 const yPain=(n:number)=>bottom-n/5*(bottom-top);
 const yTime=(n:number)=>bottom-n/maxTime*(bottom-top);
 const timeLabelY=(record:Day)=>{
  const point=yTime(total(record)),range=painRange(record);
  const labels=range?[yPain(range[1])-9,yPain(range[0])+17]:[];
  const candidates=[point-12,point+20,point-28,point+36];
  return candidates.find(y=>y>=16&&y<=307&&labels.every(label=>Math.abs(y-label)>=15))??point-12;
 };
 let line='';let connected=false;
 slots.forEach(({record},i)=>{
  const hasTime=record?.sessions.some(s=>s.minutes.some(m=>m!==''));
  if(!record||!hasTime){connected=false;return;}
  line+=`${connected?'L':'M'} ${x(i)} ${yTime(total(record))} `;connected=true;
 });
 return <TooltipProvider delayDuration={150}><section className="combined-trend">
  <div className="trend-heading"><h2><Activity size={21}/>통증과 운동의 변화</h2><div className="trend-legend"><span><i className="gradient-key"/>통증 범위</span><span><i className="line-key"/>운동 시간</span></div></div>
  <div className="trend-controls"><div className="trend-range-buttons" role="group" aria-label="그래프 기간"><button aria-pressed={range==='recent'} onClick={()=>setRange('recent')}>최근 30일</button><button aria-pressed={range==='all'} onClick={()=>setRange('all')}>전체 기록 보기</button></div><span className="trend-period">{slots[0].date.replaceAll('-','.')} – {slots[slots.length-1].date.replaceAll('-','.')}</span>{range==='all'&&width>viewport&&<div className="trend-history-nav"><button onClick={()=>move(-1)} aria-label="이전 날짜 보기">← 이전</button><button onClick={()=>move(1)} aria-label="다음 날짜 보기">다음 →</button><button onClick={()=>{const el=scrollRef.current;if(el)el.scrollTo({left:el.scrollWidth,behavior:'smooth'});}}>최신 날짜</button></div>}</div>
  <p className="trend-help">통증은 왼쪽 눈금(0–5), 운동 시간은 오른쪽 눈금(분)으로 읽어요. 막대 위는 최댓값, 아래는 최솟값이에요.</p>
  <div ref={scrollRef} className={`trend-scroll trend-compact ${range==='recent'?'trend-recent':'trend-all'}`} tabIndex={0} role="region" aria-label={range==='recent'?'최신 기록 날짜 기준 최근 30일 그래프':'전체 기록 그래프. 이전·다음 버튼이나 좌우 스크롤로 이동할 수 있습니다.'}>
   <div className="trend-canvas" style={{width}}>
    <svg width="100%" height={315} viewBox={`0 0 ${width} 315`} role="img" aria-label="날짜를 가로축으로 한 통증 최저–최고 범위 막대와 운동 시간 선 그래프">
     <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={bottom} x2={0} y2={top} colorInterpolation="sRGB"><stop offset="0%" stopColor="#3273ed"/><stop offset="20%" stopColor="#3273ed"/><stop offset="40%" stopColor="#facc15"/><stop offset="60%" stopColor="#f97316"/><stop offset="80%" stopColor="#ef4444"/><stop offset="100%" stopColor="#ef4444"/></linearGradient></defs>
     <text x={left-12} y={20} textAnchor="end" className="trend-axis-label">통증</text><text x={width-right+12} y={20} className="trend-axis-label">분</text>
     {[0,1,2,3,4,5].map(n=><g key={n}><line x1={left} x2={width-right} y1={yPain(n)} y2={yPain(n)} stroke="#e4eaf3" strokeDasharray={n?'3 5':undefined}/><text x={left-14} y={yPain(n)+5} textAnchor="end" className="trend-tick">{n}</text><text x={width-right+14} y={yPain(n)+5} className="trend-tick">{Math.round(maxTime*n/5)}</text></g>)}
     {slots.map(({date,record},i)=>{const r=record?painRange(record):null;if(!r)return null;const high=yPain(r[1]),low=yPain(r[0]);return <g key={date}><rect x={x(i)-barWidth/2} y={high===low?high-2:high} width={barWidth} height={Math.max(4,low-high)} rx={Math.min(8,Math.max(2,(low-high)/2))} fill={`url(#${gradientId})`} opacity=".9"><title>{`${dateLabel(date)}: 통증 ${r[0]}–${r[1]}`}</title></rect>{showLabel(i)&&<text x={x(i)} y={high-9} textAnchor="middle" className="trend-range-value" aria-label={`최댓값 ${r[1]}`}>{r[1]}</text>}{showLabel(i)&&<text x={x(i)} y={low+17} textAnchor="middle" className="trend-range-value" aria-label={`최솟값 ${r[0]}`}>{r[0]}</text>}</g>;})}
     <path d={line} fill="none" stroke="#183b55" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
     {slots.map(({date,record},i)=>record&&record.sessions.some(s=>s.minutes.some(m=>m!==''))?<g key={date}><circle cx={x(i)} cy={yTime(total(record))} r={Math.min(4,step*.23)} fill="#fff" stroke="#183b55" strokeWidth={2.5}><title>{`${dateLabel(date)}: 운동 ${total(record)}분`}</title></circle>{showLabel(i)&&<text x={x(i)} y={timeLabelY(record)} textAnchor="middle" className="trend-time-value">{total(record)}</text>}</g>:null)}
    </svg>
    <div className="trend-dates" style={{paddingLeft:left,paddingRight:right,gridTemplateColumns:`repeat(${slots.length},minmax(0,1fr))`}}>
     {slots.map(({date,record},i)=><div className="trend-day" key={date}><button className="trend-date" disabled={!record} onClick={()=>record&&onOpen(record)} aria-label={`${dateLabel(date)}, ${record?'통증 '+(painRange(record)?.join('–')??'미기록')+', 운동 '+(record.sessions.some(s=>s.minutes.some(m=>m!==''))?total(record)+'분':'미기록')+', 기록 열기':'미기록'}`}><span className={showLabel(i)?'trend-date-label':'trend-date-label sr-only'}>{date.slice(5).replace('-','.')}</span><span className={showLabel(i)?'trend-weekday':'trend-weekday sr-only'}>{weekdayLabel(date).slice(0,1)}</span></button><div className="trend-day-icons">{record?.activities.map(a=>{const Icon=activityIcons[a]||Activity;return <button key={a} className="trend-activity-icon" title={a} aria-label={`${dateLabel(date)} ${a} 상세보기`} onClick={()=>onOpen(record)}><Icon size={18}/></button>;})}{record?.customActivity&&<button className="trend-activity-icon custom" title={record.customActivity} aria-label={`${dateLabel(date)} 추가 활동: ${record.customActivity}`} onClick={()=>onOpen(record)}><NotebookPen size={18}/></button>}{record?.notes.trim()&&<Tooltip><TooltipTrigger asChild><button className="trend-activity-icon memo" aria-label={`${dateLabel(date)} 특이사항 메모 보기`} onClick={()=>onOpen(record)}><StickyNote size={18}/></button></TooltipTrigger><TooltipContent className="trend-note-tooltip" side="top" sideOffset={8} collisionPadding={16}>{record.notes}</TooltipContent></Tooltip>}{!record?.activities.length&&!record?.customActivity&&!record?.notes.trim()&&<span className="trend-no-activity">—</span>}</div></div>)}
    </div>
   </div>
  </div>
  <div className="activity-icon-legend">{Object.entries(activityIcons).map(([name,Icon])=><span key={name}><Icon size={16}/>{name}</span>)}<span><NotebookPen size={16}/>직접 입력</span><span><StickyNote size={16}/>특이사항 메모</span></div>
  <p className="trend-footnote">메모 아이콘에 마우스를 올리면 특이사항이 보여요. 날짜나 아이콘을 누르면 상세 기록이 열려요. 기록이 없는 날은 선을 연결하지 않아요.</p>
 </section></TooltipProvider>;
}
