import {recordsDb} from '@/db/records-db';
import {Day,validDay} from '@/lib/records';
import {recordAccess,corsHeaders,originAllowed} from '@/lib/record-access';
export const dynamic='force-dynamic';
function reply(request:Request,data:unknown,status=200){return Response.json(data,{status,headers:corsHeaders(request)});}
export async function OPTIONS(request:Request){return new Response(null,{status:originAllowed(request)?204:403,headers:corsHeaders(request)});}
export async function GET(request:Request){
 if(!originAllowed(request))return reply(request,{error:'허용되지 않은 요청이에요.'},403);
 const access=await recordAccess(request);if(!access)return reply(request,{error:'접근 암호를 확인해 주세요.'},401);
 try{const result=await recordsDb().prepare('SELECT data, version FROM records WHERE user_id = ? ORDER BY date ASC').bind(access.userId).all<{data:string;version:number}>();return reply(request,{canEdit:access.canEdit,records:result.results.map(r=>({...JSON.parse(r.data),version:r.version}))});}
 catch(e){console.error('Read records failed',e);return reply(request,{error:'기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'},503);}
}
export async function PUT(request:Request){
 if(!originAllowed(request))return reply(request,{error:'허용되지 않은 요청이에요.'},403);
 const access=await recordAccess(request);if(!access)return reply(request,{error:'접근 암호를 확인해 주세요.'},401);
 if(!access.canEdit)return reply(request,{error:'보기 전용 암호로는 기록을 수정할 수 없어요.'},403);
 let day:Day;try{const body=await request.text();if(body.length>30000)return reply(request,{error:'입력 내용이 너무 길어요.'},400);day=JSON.parse(body);if(!validDay(day))return reply(request,{error:'날짜, 통증(0~4), 운동 시간(0~1440분)을 확인해 주세요.'},400);}catch{return reply(request,{error:'입력 형식을 확인해 주세요.'},400);}
 const record={...day,version:day.version+1};
 try{const db=recordsDb();const result=day.version===0?await db.prepare('INSERT INTO records (user_id,date,data,version) VALUES (?,?,?,1) ON CONFLICT(user_id,date) DO NOTHING').bind(access.userId,day.date,JSON.stringify(record)).run():await db.prepare('UPDATE records SET data = ?, version = version + 1 WHERE user_id = ? AND date = ? AND version = ?').bind(JSON.stringify(record),access.userId,day.date,day.version).run();if(!result.meta.changes)return reply(request,{error:'다른 기기에서 이 날짜의 기록이 변경됐어요. 입력 내용을 복사한 뒤 새로고침해서 최신 기록에 반영해 주세요.'},409);return reply(request,{record});}
 catch(e){console.error('Save record failed',e);return reply(request,{error:'저장하지 못했어요. 입력 내용은 유지되니 다시 시도해 주세요.'},503);}
}
