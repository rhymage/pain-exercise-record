import {env} from 'cloudflare:workers';

export function corsHeaders(request:Request):Record<string,string>{
 const origin=request.headers.get('origin');
 const allowed=env.RECORD_ALLOWED_ORIGIN;
 return {'Cache-Control':'no-store','Vary':'Origin',...(origin&&origin===allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, PUT, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600'}:{})};
}
export function originAllowed(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin||origin===env.RECORD_ALLOWED_ORIGIN;}
// The owner explicitly chose password-free shared access through GitHub Pages.
// Continue using the existing owner's records; never create a fallback account.
export function recordAccess():{userId:string;canEdit:boolean}|null{
 const owner=env.RECORD_OWNER_ID;
 return owner?{userId:owner,canEdit:true}:null;
}
