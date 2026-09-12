import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';

export function corsHeaders(request:Request):Record<string,string>{
 const origin=request.headers.get('origin');
 const allowed=env.RECORD_ALLOWED_ORIGIN;
 return {'Cache-Control':'no-store','Vary':'Origin',...(origin&&origin===allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, PUT, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600'}:{})};
}
export function originAllowed(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin||origin===env.RECORD_ALLOWED_ORIGIN;}
function equal(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export async function recordAccess(request:Request):Promise<{userId:string;canEdit:boolean}|null>{
 const owner=env.RECORD_OWNER_ID;
 // Never fall back to a shared or arbitrary account when not configured.
 if(!owner)return null;
 const raw=request.headers.get('authorization');
 if(raw?.startsWith('Bearer ')){
  const token=raw.slice(7).trim();if(token.length>100)return null;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hex=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  if(env.RECORD_EDITOR_HASH&&equal(hex,env.RECORD_EDITOR_HASH))return {userId:owner,canEdit:true};
  if(env.RECORD_VIEWER_HASH&&equal(hex,env.RECORD_VIEWER_HASH))return {userId:owner,canEdit:false};
  return null;
 }
 const user=await getChatGPTUser();
 return user?.userId===owner?{userId:owner,canEdit:true}:null;
}
