import './globals.css';import type {Metadata} from 'next';import {Header} from '@/components/Header';import {Footer} from '@/components/Footer';
export const metadata:Metadata={title:'Lodhi Connect · C2 & D1',description:'Resident complaint and community portal for Lodhi Colony C2 & D1 Blocks.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<Footer/></body></html>}
