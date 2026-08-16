'use client';
import {Eye,EyeOff} from 'lucide-react';import {useState} from 'react';
export function PasswordInput({name,placeholder}:{name:string;placeholder?:string}){const [show,setShow]=useState(false);return <div className="relative"><input className="input pr-11" name={name} type={show?'text':'password'} placeholder={placeholder??'Password'} required minLength={6}/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 muted" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>}
