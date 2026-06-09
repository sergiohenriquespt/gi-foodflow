import { useState, useEffect, useRef } from 'react'

export default function useSerial(onUidRef) {
  const [serialStatus, setSerialStatus] = useState('idle')
  const [serialErrMsg, setSerialErrMsg] = useState('')
  const portRef   = useRef(null)
  const readerRef = useRef(null)
  const mounted   = useRef(true)

  useEffect(() => {
    mounted.current = true
    if (!navigator.serial) return
    navigator.serial.getPorts().then(ports => { if(ports.length>0&&mounted.current) openPort(ports[0]) }).catch(()=>{})
    return () => { mounted.current=false; closePort() }
  }, [])

  const openPort = async port => {
    try {
      setSerialStatus('connecting')
      portRef.current = port
      try { await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'})
      } catch(_) { try{await port.close()}catch(_){}; await new Promise(r=>setTimeout(r,250)); await port.open({baudRate:9600,dataBits:8,stopBits:1,parity:'none'}) }
      if(!mounted.current){await port.close();return}
      setSerialStatus('connected')
      readPort(port)
    } catch(e) { if(mounted.current){setSerialStatus('error');setSerialErrMsg(e?.message||'Erro')} }
  }

  const readPort = async port => {
    let buf = ''
    try {
      const reader = port.readable.getReader(); readerRef.current = reader
      while(mounted.current) {
        const {value,done} = await reader.read(); if(done) break
        buf += new TextDecoder().decode(value)
        const lines = buf.split(/\r?\n/); buf = lines.pop()
        for(const l of lines) { const uid=l.replace(/[^\x21-\x7E]/g,'').trim(); if(uid.length>=2) onUidRef.current(uid) }
        const bc = buf.replace(/[^\x21-\x7E]/g,'').trim(); if(bc.length>=4){onUidRef.current(bc);buf=''}
      }
      reader.releaseLock()
    } catch(_) { if(mounted.current) setSerialStatus('error') }
  }

  const closePort = async () => {
    try{if(readerRef.current){await readerRef.current.cancel();readerRef.current=null}}catch(_){}
    try{if(portRef.current){await portRef.current.close();portRef.current=null}}catch(_){}
  }

  const connect = async () => {
    if(!navigator.serial) return
    try { const p=await navigator.serial.requestPort(); await openPort(p)
    } catch(e) { if(e?.name!=='NotFoundError'){setSerialStatus('error');setSerialErrMsg(e?.message||'Cancelado')} }
  }

  return {serialStatus,serialErrMsg,connect}
}
