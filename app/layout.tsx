import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'통증 운동 기록',description:'아침, 오후, 밤 통증과 운동 시간을 기록하는 하루 운동일지',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body>{children}</body></html>;}

