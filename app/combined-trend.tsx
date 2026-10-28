'use client';

import {useId,useEffect,useRef,useState} from 'react';
import {Activity, Bike, createLucideIcon, Footprints, Car, NotebookPen, StickyNote, Pill} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Day, dateLabel, weekdayLabel, painRange, total} from '@/lib/records';

const BadmintonRacket=createLucideIcon('BadmintonRacket',[
 ['ellipse',{cx:'15',cy:'8',rx:'5',ry:'7',transform:'rotate(40 15 8)',key:'head'}],
 ['path',{d:'m10.5 13.5-3 3M3 21l4.5-4.5M12 4l7 6M10 7l7 6M14 3l-4 8M17 4l-5 9M20 6l-5 8',key:'strings'}],
]);
const Swimmer=createLucideIcon('Swimmer',[
 ['circle',{cx:'17',cy:'5',r:'2.1',fill:'currentColor',stroke:'none',key:'head'}],
 ['path',{d:'m3 10 5-5 7 7M7 15l5-6',strokeWidth:'2.2',key:'stroke'}],
 ['path',{d:'M2 17c1.7 0 1.7-1.5 3.4-1.5S7.1 17 8.8 17s1.7-1.5 3.4-1.5S13.9 17 15.6 17s1.7-1.5 3.4-1.5 1.7 1.5 3 1.5M2 21c1.7 0 1.7-1.5 3.4-1.5S7.1 21 8.8 21s1.7-1.5 3.4-1.5S13.9 21 15.6 21s1.7-1.5 3.4-1.5 1.7 1.5 3 1.5',strokeWidth:'1.8',key:'water'}],
]);
const activityIcons:Record<string,typeof Bike>={
 '자전거 등하교':Bike,'학교체육활동':BadmintonRacket,'산책':Footprints,'차로외출':Car,'수영':Swimmer,'진통제 복용':Pill,
};

export default function CombinedTrend({records,onOpen}:{records:Day[];onOpen:(day:Day)=>void}){
 const [range,setRange]=useState<'recent'|'all'>('recent');
 const [pageOffset,setPageOffset]=useState(0);
 const gradientId='pain-gradient-'+useId().replaceAll(':','');
 const scrollRef=useRef<HTMLDivElement>(null);const [availableWidth,setAvailableWidth]=useState(640);
 useEffect(()=>{const el=scrollRef.current;if(!el)return;const observer=new ResizeObserver(entries=>setAvailableWidth(Math.floor(entries[0].contentRect.width)));observer.observe(el);return()=>observer.disconnect();},[]);
 const sorted=[...records].sort((a,b)=>a.date.localeCompare(b.date));
 const byDate=new Map(sorted.map(r=>[r.date,r]));
 const first=Date.parse(sorted[0].date+'T00:00:00Z');
 const latest=Date.parse(sorted[sorted.length-1].date+'T00:00:00Z');
 const maxPage=Math.floor((latest-first)/(30*86400000));
 const page=Math.min(pageOffset,maxPage);
 const end=range==='recent'?latest-page*30*86400000:latest;
 const start=range==='recent'?Math.max(first,end-29*86400000):first;
 const slots=Array.from({length:Math.round((end-start)/86400000)+1},(_,i)=>{
  const date=new Date(start+i*86400000).toISOString().slice(0,10);
  return {date,record:byDate.get(date)};
 });
 const left=32,right=46,top=40,bottom=290;
 const viewport=Math.max(160,availableWidth);
 const width=viewport;
 const step=(width-left-right)/slots.length;
 const visibleRecords=slots.flatMap(slot=>slot.record?[slot.record]:[]);
 const maxTime=Math.max(30,Math.ceil(Math.max(0,...visibleRecords.map(total))/30)*30);
 const barWidth=Math.min(18,step*.6);
 const labelEvery=Math.max(1,Math.ceil(32/step));
 const showLabel=(i:number)=>range==='recent'&&(slots.length-1-i)%labelEvery===0;
 const tickCount=Math.min(slots.length,Math.max(2,Math.min(8,Math.floor((width-left-right)/90)+1)));
 const majorDates=Array.from({length:tickCount},(_,i)=>Math.round(i*(slots.length-1)/Math.max(1,tickCount-1)));
 const x=(i:number)=>left+(i+.5)*step;
 const yPain=(n:number)=>bottom-n/5*(bottom-top);
 const yTime=(n:number)=>bottom-n/maxTime*(bottom-top);
 const timeLabelY=(record:Day)=>{
  const point=yTime(total(record)),range=painRange(record);
  const labels=range?[yPain(range[1])-9,yPain(range[0])+17]:[];
  const candidates=[point-12,point+20,point-28,point+36];
  return candidates.find(y=>y>=16&&y<=307&&labels.every(label=>Math.abs(y-label)>=15))??point-12;
 };
 let painLine='';let connected=false;
 slots.forEach(({record},i)=>{
  const range=record?painRange(record):null;
  if(!range){connected=false;return;}
  painLine+=`${connected?'L':'M'} ${x(i)} ${yPain(range[1])} `;connected=true;
 });
 return <TooltipProvider delayDuration={150}><section className="combined-trend">
  <div className="trend-heading"><h2><Activity size={21}/>통증과 운동의 변화</h2><div className="trend-legend"><span><i className="gradient-key"/>통증 범위</span><span><i className="line-key"/>일일 최고 통증</span><span><i className="time-bar-key"/>운동 시간</span></div></div>
  <div className="trend-controls"><div className="trend-range-buttons" role="group" aria-label="그래프 기간"><button aria-pressed={range==='recent'} onClick={()=>{setRange('recent');setPageOffset(0);}}>최근 30일</button><button aria-pressed={range==='all'} onClick={()=>setRange('all')}>전체 기록 보기</button></div><span className="trend-period">{slots[0].date.replaceAll('-','.')} – {slots[slots.length-1].date.replaceAll('-','.')}</span>{range==='recent'&&<div className="trend-history-nav"><button disabled={page>=maxPage} onClick={()=>setPageOffset(Math.min(maxPage,page+1))} aria-label="이전 30일 보기">← 이전 30일</button><button disabled={page===0} onClick={()=>setPageOffset(Math.max(0,page-1))} aria-label="다음 30일 보기">다음 30일 →</button><button disabled={page===0} onClick={()=>setPageOffset(0)}>최신 30일</button></div>}</div>
  <p className="trend-help">통증은 왼쪽 눈금(0–5), 운동 시간은 오른쪽 눈금(분)으로 읽어요. 연한 막대는 운동 시간, 선은 하루 최고 통증이에요. {range==='recent'?'통증 범위 위는 최댓값, 아래는 최솟값이에요.':'전체 기간의 추이를 한눈에 볼 수 있어요.'}</p>
  <div ref={scrollRef} className={`trend-scroll trend-compact ${range==='recent'?'trend-recent':'trend-all'}`} tabIndex={0} role="region" aria-label={range==='recent'?'30일 단위 통증과 운동 그래프':'전체 기록 추이 그래프. 모든 기간이 한 화면에 표시됩니다.'}>
   <div className="trend-canvas" style={{width}}>
    <svg width="100%" height={range==='all'?345:315} viewBox={`0 0 ${width} ${range==='all'?345:315}`} role="img" aria-label="날짜를 가로축으로 한 통증 최저–최고 범위, 일일 최고 통증 선과 운동 시간 막대 그래프">
     <defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={bottom} x2={0} y2={top} colorInterpolation="sRGB"><stop offset="0%" stopColor="#3273ed"/><stop offset="20%" stopColor="#3273ed"/><stop offset="40%" stopColor="#facc15"/><stop offset="60%" stopColor="#f97316"/><stop offset="80%" stopColor="#ef4444"/><stop offset="100%" stopColor="#ef4444"/></linearGradient></defs>
     <text x={left-12} y={20} textAnchor="end" className="trend-axis-label">통증</text><text x={width-right+12} y={20} className="trend-axis-label">분</text>
     {[0,1,2,3,4,5].map(n=><g key={n}><line x1={left} x2={width-right} y1={yPain(n)} y2={yPain(n)} stroke="#e4eaf3" strokeDasharray={n?'3 5':undefined}/><text x={left-14} y={yPain(n)+5} textAnchor="end" className="trend-tick">{n}</text><text x={width-right+14} y={yPain(n)+5} className="trend-tick">{Math.round(maxTime*n/5)}</text></g>)}
     {slots.map(({date,record},i)=>record&&record.sessions.some(s=>s.minutes.some(m=>m!==''))?<rect key={date} className="trend-time-bar" x={x(i)-Math.min(28,step*.82)/2} y={yTime(total(record))} width={Math.min(28,step*.82)} height={bottom-yTime(total(record))} rx={Math.min(3,step*.15)} fill="#dce7f5"><title>{`${dateLabel(date)}: 운동 ${total(record)}분`}</title></rect>:null)}
     <path className="trend-pain-line" d={painLine} fill="none" stroke="#183b55" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
     {slots.map(({date,record},i)=>{const r=record?painRange(record):null;if(!r)return null;const high=yPain(r[1]),low=yPain(r[0]);return <g key={date}><rect x={x(i)-barWidth/2} y={high===low?high-2:high} width={barWidth} height={Math.max(4,low-high)} rx={Math.min(8,Math.max(2,(low-high)/2))} fill={`url(#${gradientId})`} opacity=".9"><title>{`${dateLabel(date)}: 통증 ${r[0]}–${r[1]}`}</title></rect>{showLabel(i)&&<text x={x(i)} y={high-9} textAnchor="middle" className="trend-range-value" aria-label={`최댓값 ${r[1]}`}>{r[1]}</text>}{showLabel(i)&&<text x={x(i)} y={low+17} textAnchor="middle" className="trend-range-value" aria-label={`최솟값 ${r[0]}`}>{r[0]}</text>}</g>;})}
     {slots.map(({date,record},i)=>{const r=record?painRange(record):null;if(!r)return null;const medication=range==='all'&&record!.activities.includes('진통제 복용');if(!medication&&range!=='recent'&&step<8)return null;return <circle key={date} className={medication?'trend-medication-dot':undefined} cx={x(i)} cy={yPain(r[1])} r={medication?3.5:Math.min(3,step*.2)} fill={medication?'#dc2626':'#fff'} stroke={medication?'#dc2626':'#183b55'} strokeWidth={2}><title>{`${dateLabel(date)}: 일일 최고 통증 ${r[1]}${medication?', 진통제 복용':''}`}</title></circle>;})}
     {slots.map(({date,record},i)=>record&&record.sessions.some(s=>s.minutes.some(m=>m!==''))&&showLabel(i)?<text key={date} x={x(i)} y={timeLabelY(record)} textAnchor="middle" className="trend-time-value">{total(record)}</text>:null)}
     {range==='all'&&majorDates.map((i,tick)=><g key={slots[i].date}><line x1={x(i)} x2={x(i)} y1={bottom} y2={bottom+5} stroke="#a7b4c8"/><text x={x(i)} y={bottom+25} textAnchor={tick===0?'start':tick===majorDates.length-1?'end':'middle'} className="trend-major-date">{slots[i].date.replaceAll('-','.')}</text></g>)}
    </svg>
    {range==='recent'&&<div className="trend-dates" style={{paddingLeft:left,paddingRight:right,gridTemplateColumns:`repeat(${slots.length},minmax(0,1fr))`}}>
     {slots.map(({date,record},i)=><div className="trend-day" key={date}><button className="trend-date" disabled={!record} onClick={()=>record&&onOpen(record)} aria-label={`${dateLabel(date)}, ${record?'통증 '+(painRange(record)?.join('–')??'미기록')+', 운동 '+(record.sessions.some(s=>s.minutes.some(m=>m!==''))?total(record)+'분':'미기록')+', 기록 열기':'미기록'}`}><span className={showLabel(i)?'trend-date-label':'trend-date-label sr-only'}>{date.slice(5).replace('-','.')}</span><span className={showLabel(i)?'trend-weekday':'trend-weekday sr-only'}>{weekdayLabel(date).slice(0,1)}</span></button><div className="trend-day-icons">{record?.activities.map(a=>{const Icon=activityIcons[a]||Activity;return <button key={a} className={`trend-activity-icon ${a==='진통제 복용'?'medication':''}`} title={a} aria-label={`${dateLabel(date)} ${a} 상세보기`} onClick={()=>onOpen(record)}><Icon size={18}/></button>;})}{record?.customActivity&&<button className="trend-activity-icon custom" title={record.customActivity} aria-label={`${dateLabel(date)} 추가 활동: ${record.customActivity}`} onClick={()=>onOpen(record)}><NotebookPen size={18}/></button>}{record?.notes.trim()&&<Tooltip><TooltipTrigger asChild><button className="trend-activity-icon memo" aria-label={`${dateLabel(date)} 특이사항 메모 보기`} onClick={()=>onOpen(record)}><StickyNote size={18}/></button></TooltipTrigger><TooltipContent className="trend-note-tooltip" side="top" sideOffset={8} collisionPadding={16}>{record.notes}</TooltipContent></Tooltip>}{!record?.activities.length&&!record?.customActivity&&!record?.notes.trim()&&<span className="trend-no-activity">—</span>}</div></div>)}
    </div>}
   </div>
  </div>
  {range==='recent'&&<div className="activity-icon-legend">{Object.entries(activityIcons).map(([name,Icon])=><span key={name} className={name==='진통제 복용'?'medication':undefined}><Icon size={16}/>{name}</span>)}<span><NotebookPen size={16}/>직접 입력</span><span><StickyNote size={16}/>특이사항 메모</span></div>}
  <p className="trend-footnote">{range==='recent'?'메모 아이콘에 마우스를 올리면 특이사항이 보여요. 날짜나 아이콘을 누르면 상세 기록이 열려요.':'전체 기록은 주요 날짜만 표시해요. 날짜별 상세 내용과 메모는 최근 30일 보기에서 확인할 수 있어요.'} 기록이 없는 날은 선을 연결하지 않아요.</p>
 </section></TooltipProvider>;
}
