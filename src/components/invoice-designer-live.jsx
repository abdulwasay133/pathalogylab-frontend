import { useState, useRef, useEffect } from "react";

const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const clamp = (v,mn,mx) => Math.min(mx,Math.max(mn,v));
const CW = 794, CH = 1123;

const MAKE = {
  heading:    () => ({ id:uid(), type:"heading",    x:60, y:60, w:420, h:56,  content:"Heading",        fontSize:26, fontWeight:"bold",   color:"#111", align:"left", italic:false }),
  text:       () => ({ id:uid(), type:"text",       x:60, y:60, w:320, h:48,  content:"Text block",     fontSize:14, fontWeight:"normal", color:"#333", align:"left", italic:false }),
  label:      () => ({ id:uid(), type:"label",      x:60, y:60, w:200, h:32,  content:"Label",          fontSize:11, fontWeight:"bold",   color:"#666", align:"left", italic:false }),
  field:      () => ({ id:uid(), type:"field",      x:60, y:60, w:240, h:36,  content:"Field Value",    fontSize:14, fontWeight:"normal", color:"#111", align:"left", italic:false, fieldKey:"field_"+Date.now() }),
  inputfield: () => ({ id:uid(), type:"inputfield", x:60, y:60, w:260, h:62,  label:"Field Label", placeholder:"Enter value…", fieldKey:"input_"+Date.now(), fontSize:13, borderColor:"#ccc", bgColor:"#fff", labelColor:"#555", borderRadius:4 }),
  divider:    () => ({ id:uid(), type:"divider",    x:60, y:60, w:680, h:2,   color:"#ccc", thickness:2 }),
  image:      () => ({ id:uid(), type:"image",      x:60, y:60, w:160, h:90,  src:"" }),
  table:      () => ({
    id:uid(), type:"table", x:60, y:60, w:680, h:200,
    cols:[
      { key:"description", label:"Description", widthPct:40 },
      { key:"qty",         label:"Qty",          widthPct:15 },
      { key:"price",       label:"Unit Price",   widthPct:20 },
      { key:"total",       label:"Total",        widthPct:25 },
    ],
    rows:[{ description:"Service Item", qty:"1", price:"$100.00", total:"$100.00" }],
    headerBg:"#1a1a2e", headerColor:"#fff", rowBg:"#fff", rowAltBg:"#f8f9ff", borderColor:"#e2e8f0", fontSize:13,
  }),
};

// ── Inline contenteditable ──────────────────────────────────────
function CE({ value, onChange, style }) {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.innerText = value ?? ""; }, []);
  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onBlur={() => onChange?.(ref.current?.innerText ?? "")}
      onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey){ e.preventDefault(); e.target.blur(); }}}
      style={{ outline:"none", cursor:"text", minWidth:4, ...style }}/>
  );
}

// ── Resize corner ───────────────────────────────────────────────
function ResizeCorner({ onDelta }) {
  const live=useRef(false), last=useRef({});
  const down = e => {
    e.stopPropagation(); e.preventDefault();
    live.current=true; last.current={x:e.clientX,y:e.clientY};
    const mv=ev=>{ if(!live.current)return; onDelta(ev.clientX-last.current.x,ev.clientY-last.current.y); last.current={x:ev.clientX,y:ev.clientY}; };
    const up=()=>{ live.current=false; window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
  };
  return <div onMouseDown={down} data-nondrag style={{ position:"absolute", right:-6, bottom:-6, width:14, height:14, background:"#2563eb", border:"2px solid #fff", borderRadius:3, cursor:"se-resize", zIndex:25 }}/>;
}

// ── Table element ───────────────────────────────────────────────
function TableEl({ el, onUpdate, selected }) {
  const upd = p => onUpdate(el.id, p);
  const startColResize = (e, ci) => {
    e.stopPropagation(); e.preventDefault();
    const sx=e.clientX, sw=el.cols.map(c=>c.widthPct);
    const mv=ev=>{ const d=(ev.clientX-sx)/(el.w/100); upd({ cols:el.cols.map((c,i)=>i===ci?{...c,widthPct:clamp(sw[i]+d,5,88)}:i===ci+1?{...c,widthPct:clamp(sw[i]-d,5,88)}:c) }); };
    const up=()=>{ window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
  };
  const setCell=(ri,key,v)=>upd({rows:el.rows.map((r,i)=>i===ri?{...r,[key]:v}:r)});
  const setLbl=(ci,v)=>upd({cols:el.cols.map((c,i)=>i===ci?{...c,label:v}:c)});
  const addRow=()=>{ const r={}; el.cols.forEach(c=>{r[c.key]="";}); upd({rows:[...el.rows,r]}); };
  const delRow=ri=>upd({rows:el.rows.filter((_,i)=>i!==ri)});
  const addCol=()=>{
    const key="col_"+Date.now(), share=15;
    upd({ cols:[...el.cols.map(c=>({...c,widthPct:c.widthPct*(100-share)/100})),{key,label:"Column",widthPct:share}], rows:el.rows.map(r=>({...r,[key]:""})) });
  };
  const delCol=ci=>{
    const key=el.cols[ci].key, gone=el.cols[ci].widthPct, rem=el.cols.filter((_,i)=>i!==ci), tot=rem.reduce((s,c)=>s+c.widthPct,0);
    upd({ cols:rem.map(c=>({...c,widthPct:c.widthPct/tot*(tot+gone)})), rows:el.rows.map(r=>{const n={...r};delete n[key];return n;}) });
  };
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column" }}>
      {/* drag handle */}
      <div style={{ height:13, flexShrink:0, background:selected?"#2563eb":"#cbd5e1", borderRadius:"2px 2px 0 0", display:"flex", alignItems:"center", justifyContent:"center", gap:3, cursor:"move", transition:"background .2s" }}>
        {[0,1,2,3,4,5].map(i=><div key={i} style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,.9)" }}/>)}
      </div>
      <div style={{ flex:1, overflow:"auto" }} data-nondrag>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:el.fontSize||13, tableLayout:"fixed" }}>
          <colgroup>{el.cols.map(c=><col key={c.key} style={{ width:`${c.widthPct}%` }}/>)}{selected&&<col style={{ width:26 }}/>}</colgroup>
          <thead>
            <tr>
              {el.cols.map((col,ci)=>(
                <th key={col.key} style={{ background:el.headerBg||"#1a1a2e", color:el.headerColor||"#fff", padding:"9px 10px", fontWeight:700, position:"relative", userSelect:"none", borderRight:"1px solid rgba(255,255,255,.15)" }}>
                  <CE value={col.label} onChange={v=>setLbl(ci,v)} style={{ color:el.headerColor||"#fff", fontWeight:700, textAlign:"center" }}/>
                  {ci<el.cols.length-1&&(
                    <div onMouseDown={e=>startColResize(e,ci)} style={{ position:"absolute", right:-4, top:0, bottom:0, width:8, cursor:"col-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:2, height:"60%", background:"rgba(255,255,255,.45)", borderRadius:1 }}/>
                    </div>
                  )}
                  {selected&&el.cols.length>1&&<div onClick={()=>delCol(ci)} style={{ position:"absolute", top:3, right:3, width:14, height:14, background:"#ef4444", color:"#fff", borderRadius:"50%", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>✕</div>}
                </th>
              ))}
              {selected&&<th style={{ background:el.headerBg||"#1a1a2e", textAlign:"center" }}><span onClick={addCol} style={{ color:"#aaa", cursor:"pointer", fontSize:16 }}>+</span></th>}
            </tr>
          </thead>
          <tbody>
            {el.rows.map((row,ri)=>(
              <tr key={ri} style={{ background:ri%2===0?(el.rowBg||"#fff"):(el.rowAltBg||"#f8f9ff") }}>
                {el.cols.map(col=>(
                  <td key={col.key} style={{ padding:"8px 10px", border:`1px solid ${el.borderColor||"#e2e8f0"}`, verticalAlign:"top" }}>
                    <CE value={row[col.key]||""} onChange={v=>setCell(ri,col.key,v)} style={{ fontSize:el.fontSize||13, color:"#111", minHeight:16 }}/>
                  </td>
                ))}
                {selected&&<td style={{ border:`1px solid ${el.borderColor||"#e2e8f0"}`, textAlign:"center", verticalAlign:"middle" }}><span onClick={()=>delRow(ri)} style={{ color:"#ef4444", cursor:"pointer", fontSize:14 }}>✕</span></td>}
              </tr>
            ))}
          </tbody>
        </table>
        {selected&&<button onClick={addRow} style={{ marginTop:6, background:"#eff6ff", border:"1px dashed #2563eb", color:"#2563eb", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontSize:12, fontWeight:600 }}>+ Add Row</button>}
      </div>
    </div>
  );
}

// ── Element renderer ────────────────────────────────────────────
function ElContent({ el, onUpdate, selected }) {
  const upd = p => onUpdate(el.id, p);
  if (el.type==="divider") return <div style={{ width:"100%", height:el.thickness||2, background:el.color||"#ccc" }}/>;
  if (el.type==="image") return (
    <div style={{ width:"100%", height:"100%", border:"2px dashed #d1d5db", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", background:"#f9fafb", overflow:"hidden" }}>
      {el.src ? <img src={el.src} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }}/> :
        <div style={{ textAlign:"center", color:"#9ca3af" }}>
          <div style={{ fontSize:28 }}>🖼</div>
          <div style={{ fontSize:11, marginTop:3 }}>Image / Logo</div>
          {selected&&<input data-nondrag type="text" placeholder="Paste image URL…" onBlur={e=>upd({src:e.target.value})} style={{ marginTop:6, fontSize:11, padding:"3px 7px", border:"1px solid #d1d5db", borderRadius:3, width:"80%", outline:"none" }}/>}
        </div>}
    </div>
  );
  if (el.type==="table") return <TableEl el={el} onUpdate={onUpdate} selected={selected}/>;
  if (el.type==="inputfield") return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", gap:4, padding:"0 3px", boxSizing:"border-box" }}>
      <CE value={el.label} onChange={v=>upd({label:v})} style={{ fontSize:(el.fontSize||13)-1, fontWeight:700, color:el.labelColor||"#555", lineHeight:1 }}/>
      <div style={{ width:"100%", height:30, border:`1.5px solid ${el.borderColor||"#d1d5db"}`, borderRadius:el.borderRadius??4, background:el.bgColor||"#fff", display:"flex", alignItems:"center", padding:"0 10px", boxSizing:"border-box" }}>
        <span style={{ fontSize:el.fontSize||13, color:"#9ca3af", fontStyle:"italic", pointerEvents:"none", userSelect:"none" }}>{el.placeholder||"Enter value…"}</span>
      </div>
    </div>
  );
  return (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", padding:"0 4px", boxSizing:"border-box" }}>
      <CE value={el.content} onChange={v=>upd({content:v})} style={{ width:"100%", fontSize:el.fontSize, fontWeight:el.fontWeight, color:el.color, textAlign:el.align, fontStyle:el.italic?"italic":"normal", whiteSpace:"pre-wrap", lineHeight:1.4, background:el.type==="field"?"rgba(37,99,235,.06)":"transparent", border:el.type==="field"?"1.5px dashed rgba(37,99,235,.4)":"none", borderRadius:el.type==="field"?3:0, padding:el.type==="field"?"2px 6px":0 }}/>
    </div>
  );
}

// ── Draggable wrapper ───────────────────────────────────────────
function DraggableEl({ el, selected, onSelect, onUpdate, onDelete, zoom }) {
  const live=useRef(false), orig=useRef({});
  const down=e=>{
    if(e.target.closest("[data-nondrag]"))return;
    e.stopPropagation(); onSelect(el.id);
    live.current=true; orig.current={mx:e.clientX,my:e.clientY,ex:el.x,ey:el.y};
    const mv=ev=>{ if(!live.current)return; onUpdate(el.id,{ x:Math.round(orig.current.ex+(ev.clientX-orig.current.mx)/zoom), y:Math.round(orig.current.ey+(ev.clientY-orig.current.my)/zoom) }); };
    const up=()=>{ live.current=false; window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
  };
  const resize=(dx,dy)=>onUpdate(el.id,{ w:Math.max(40,el.w+Math.round(dx/zoom)), h:Math.max(20,el.h+Math.round(dy/zoom)) });
  return (
    <div onMouseDown={down} style={{ position:"absolute", left:el.x, top:el.y, width:el.w, height:el.type==="divider"?(el.thickness||2):el.h, cursor:"move", boxSizing:"border-box", border:selected?"2px solid #2563eb":"2px solid transparent", borderRadius:3, zIndex:selected?10:1 }}>
      <ElContent el={el} onUpdate={onUpdate} selected={selected}/>
      {selected&&<ResizeCorner onDelta={resize}/>}
      {selected&&<button data-nondrag onClick={e=>{e.stopPropagation();onDelete(el.id);}} style={{ position:"absolute", top:-11, right:-11, width:22, height:22, background:"#ef4444", color:"#fff", border:"2px solid #fff", borderRadius:"50%", fontSize:13, lineHeight:1, cursor:"pointer", zIndex:30, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>×</button>}
    </div>
  );
}

// ── Properties Panel ────────────────────────────────────────────
function PropsPanel({ el, onUpdate }) {
  if (!el) return (
    <div style={{ padding:16 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:"#4b5563", marginBottom:12 }}>PROPERTIES</div>
      <div style={{ color:"#6b7280", fontSize:12, lineHeight:1.7 }}>Click any element on the canvas to edit its properties here.</div>
      <div style={{ marginTop:16, padding:12, background:"#f9fafb", borderRadius:8, fontSize:11, color:"#9ca3af", border:"1px solid #e5e7eb", lineHeight:2 }}>
        <div style={{ fontWeight:700, color:"#6b7280", marginBottom:4 }}>Quick tips</div>
        <div>• Click to select</div>
        <div>• Drag to move</div>
        <div>• Drag ↘ corner to resize</div>
        <div>• Drag col border ↔ to resize</div>
        <div>• Click text to edit</div>
        <div>• Del key removes element</div>
      </div>
    </div>
  );
  const upd=(k,v)=>onUpdate(el.id,{[k]:v});
  const Row=({label,children})=><div style={{ marginBottom:12 }}><div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", letterSpacing:1, marginBottom:5 }}>{label}</div>{children}</div>;
  const Inp=({k,type="text",value,min,max})=><input type={type} value={value!==undefined?value:(el[k]??"")} min={min} max={max} onChange={e=>upd(k,type==="number"?Number(e.target.value):e.target.value)} style={{ width:"100%", padding:"6px 8px", border:"1px solid #e5e7eb", borderRadius:5, fontSize:12, background:"#fff", color:"#374151", boxSizing:"border-box", outline:"none" }}/>;
  return (
    <div style={{ padding:14, overflowY:"auto", height:"100%", background:"#fff" }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:"#6b7280", marginBottom:14, paddingBottom:10, borderBottom:"1px solid #f3f4f6" }}>{el.type.toUpperCase()}</div>
      {["text","heading","label","field"].includes(el.type)&&<>
        <Row label="FONT SIZE"><Inp k="fontSize" type="number" min={8} max={96}/></Row>
        <Row label="COLOR"><Inp k="color" type="color"/></Row>
        <Row label="ALIGN"><div style={{ display:"flex", gap:4 }}>{["left","center","right"].map(a=><button key={a} onClick={()=>upd("align",a)} style={{ flex:1, padding:"6px 0", border:"1px solid #e5e7eb", borderRadius:5, background:el.align===a?"#2563eb":"#fff", color:el.align===a?"#fff":"#9ca3af", cursor:"pointer", fontSize:13 }}>{a==="left"?"⬤≡":a==="center"?"≡≡":"≡⬤"}</button>)}</div></Row>
        <Row label="STYLE"><div style={{ display:"flex", gap:4 }}><button onClick={()=>upd("fontWeight",el.fontWeight==="bold"?"normal":"bold")} style={{ flex:1, padding:"6px 0", border:"1px solid #e5e7eb", borderRadius:5, background:el.fontWeight==="bold"?"#2563eb":"#fff", color:el.fontWeight==="bold"?"#fff":"#9ca3af", cursor:"pointer", fontWeight:"bold" }}>B</button><button onClick={()=>upd("italic",!el.italic)} style={{ flex:1, padding:"6px 0", border:"1px solid #e5e7eb", borderRadius:5, background:el.italic?"#2563eb":"#fff", color:el.italic?"#fff":"#9ca3af", cursor:"pointer", fontStyle:"italic" }}>I</button></div></Row>
      </>}
      {el.type==="inputfield"&&<>
        <Row label="LABEL"><Inp k="label"/></Row>
        <Row label="PLACEHOLDER"><Inp k="placeholder"/></Row>
        <Row label="BORDER COLOR"><Inp k="borderColor" type="color"/></Row>
        <Row label="BACKGROUND"><Inp k="bgColor" type="color"/></Row>
        <Row label="LABEL COLOR"><Inp k="labelColor" type="color"/></Row>
        <Row label="BORDER RADIUS"><Inp k="borderRadius" type="number" min={0} max={24}/></Row>
        <Row label="FONT SIZE"><Inp k="fontSize" type="number" min={8} max={24}/></Row>
      </>}
      {el.type==="divider"&&<><Row label="COLOR"><Inp k="color" type="color"/></Row><Row label="THICKNESS (px)"><Inp k="thickness" type="number" min={1} max={20}/></Row></>}
      {el.type==="table"&&<><Row label="HEADER BG"><Inp k="headerBg" type="color"/></Row><Row label="HEADER TEXT"><Inp k="headerColor" type="color"/></Row><Row label="ROW BG"><Inp k="rowBg" type="color"/></Row><Row label="ALT ROW BG"><Inp k="rowAltBg" type="color"/></Row><Row label="BORDER COLOR"><Inp k="borderColor" type="color"/></Row><Row label="FONT SIZE"><Inp k="fontSize" type="number" min={9} max={24}/></Row></>}
      <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:12, marginTop:4 }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#9ca3af", letterSpacing:1, marginBottom:8 }}>POSITION & SIZE</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {["x","y","w","h"].map(k=><div key={k}><div style={{ fontSize:9, color:"#d1d5db", marginBottom:2 }}>{k.toUpperCase()}</div><input type="number" value={el[k]||0} onChange={e=>upd(k,Number(e.target.value))} style={{ width:"100%", padding:"5px 6px", border:"1px solid #e5e7eb", borderRadius:4, fontSize:12, background:"#fff", color:"#374151", boxSizing:"border-box", outline:"none" }}/></div>)}
        </div>
      </div>
    </div>
  );
}

// ── Toolbar button ───────────────────────────────────────────────
function TBtn({ icon, label, onClick, accent }) {
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} title={label}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 8px", background:hov?"rgba(255,255,255,.08)":"transparent", border:"none", borderRadius:6, cursor:"pointer", color:accent||"#cbd5e1", transition:"background .15s", minWidth:42, flexShrink:0 }}>
      <span style={{ fontSize:14, lineHeight:1 }}>{icon}</span>
      <span style={{ fontSize:9, fontWeight:700, letterSpacing:.3, whiteSpace:"nowrap" }}>{label}</span>
    </button>
  );
}

// ── Saved templates modal ────────────────────────────────────────
function TplModal({ templates, onClose, onLoad, onDelete }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:12, width:480, maxHeight:"75vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 25px 60px rgba(0,0,0,.4)" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:800, fontSize:15, color:"#111" }}>Saved Templates</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#9ca3af", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ overflowY:"auto", padding:16, flex:1 }}>
          {templates.length===0&&<div style={{ color:"#d1d5db", textAlign:"center", padding:48, fontSize:14 }}>No templates saved yet.</div>}
          {templates.map(t=>(
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", border:"1px solid #f3f4f6", borderRadius:8, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#111", fontSize:14 }}>{t.name}</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{t.elements?.length} elements · {new Date(t.savedAt).toLocaleString()}</div>
              </div>
              <button onClick={()=>onLoad(t)} style={{ background:"#2563eb", color:"#fff", border:"none", borderRadius:6, padding:"7px 14px", cursor:"pointer", fontWeight:700, fontSize:12 }}>Load</button>
              <button onClick={()=>onDelete(t.id)} style={{ background:"#fef2f2", color:"#ef4444", border:"1px solid #fecaca", borderRadius:6, padding:"7px 10px", cursor:"pointer", fontSize:12 }}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── JSON modal ───────────────────────────────────────────────────
function JSONModal({ data, onClose }) {
  const json=JSON.stringify(data,null,2);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:12, width:620, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,.7)" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #30363d", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, color:"#e6edf3", fontSize:13 }}>📦 Template JSON — Database Ready</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>navigator.clipboard?.writeText(json)} style={{ background:"#238636", color:"#fff", border:"none", borderRadius:5, padding:"5px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>Copy</button>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"#6e7681", fontSize:20, cursor:"pointer" }}>×</button>
          </div>
        </div>
        <pre style={{ overflowY:"auto", padding:18, margin:0, color:"#a5d6ff", fontSize:11, lineHeight:1.65, flex:1 }}>{json}</pre>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════
export default function App() {
  const [elements,setElements]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [templateName,setTemplateName]=useState("Untitled Template");
  const [templates,setTemplates]=useState([]);
  const [zoom,setZoom]=useState(0.75);
  const [showTpl,setShowTpl]=useState(false);
  const [showJSON,setShowJSON]=useState(false);
  const [flash,setFlash]=useState(false);
  const canvasRef=useRef();

  useEffect(()=>{ try{ const s=localStorage.getItem("_invtpl3"); if(s) setTemplates(JSON.parse(s)); }catch{} },[]);
  const persist=ts=>{ setTemplates(ts); try{ localStorage.setItem("_invtpl3",JSON.stringify(ts)); }catch{} };
  const addEl=type=>{ const el=MAKE[type](); el.x=Math.round((CW-el.w)/2); el.y=Math.round((CH-el.h)/2); setElements(p=>[...p,el]); setSelectedId(el.id); };
  const updEl=(id,ch)=>setElements(p=>p.map(el=>el.id===id?{...el,...ch}:el));
  const delEl=id=>{ setElements(p=>p.filter(el=>el.id!==id)); setSelectedId(null); };

  const buildPayload=()=>({
    id:`tpl_${Date.now()}`, name:templateName, elements, canvasW:CW, canvasH:CH,
    editableFields:[
      ...elements.filter(e=>e.type==="field").map(e=>({id:e.id,type:"text-field",key:e.fieldKey,label:e.content})),
      ...elements.filter(e=>e.type==="inputfield").map(e=>({id:e.id,type:"input",key:e.fieldKey,label:e.label,placeholder:e.placeholder})),
    ],
    savedAt:new Date().toISOString()
  });

  const save=()=>{
    const p=buildPayload();
    const u=templates.some(t=>t.name===templateName)?templates.map(t=>t.name===templateName?p:t):[...templates,p];
    persist(u); setFlash(true); setTimeout(()=>setFlash(false),2000);
  };

  useEffect(()=>{
    const h=e=>{ if(!selectedId)return; if(["Delete","Backspace"].includes(e.key)&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable) delEl(selectedId); };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[selectedId]);

  const sel=elements.find(e=>e.id===selectedId)??null;
  const Sep=()=><div style={{ width:1, height:30, background:"rgba(255,255,255,.1)", margin:"0 3px", flexShrink:0 }}/>;

  return (
    <div style={{ width:"100%", height:"100vh", display:"flex", flexDirection:"column", background:"#0f172a", fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden" }}>

      {/* ══ TOOLBAR ══ */}
      <div style={{ height:54, background:"linear-gradient(135deg,#1e293b,#0f172a)", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", padding:"0 12px", flexShrink:0, overflowX:"auto", gap:1 }}>
        {/* brand */}
        <div style={{ display:"flex", alignItems:"center", gap:8, paddingRight:14, marginRight:4, borderRight:"1px solid rgba(255,255,255,.1)", flexShrink:0 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <input value={templateName} onChange={e=>setTemplateName(e.target.value)} style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:13, fontWeight:700, width:148 }} placeholder="Template name…"/>
        </div>

        {/* text group */}
        <TBtn icon="H1" label="Heading"  onClick={()=>addEl("heading")}/>
        <TBtn icon="¶"  label="Text"     onClick={()=>addEl("text")}/>
        <TBtn icon="🏷" label="Label"    onClick={()=>addEl("label")}/>
        <Sep/>
        {/* interactive group */}
        <TBtn icon="✏️" label="Field"    onClick={()=>addEl("field")}      accent="#93c5fd"/>
        <TBtn icon="⬜" label="Input"    onClick={()=>addEl("inputfield")} accent="#6ee7b7"/>
        <TBtn icon="📊" label="Table"    onClick={()=>addEl("table")}/>
        <Sep/>
        {/* layout */}
        <TBtn icon="─"  label="Divider"  onClick={()=>addEl("divider")}/>
        <TBtn icon="🖼" label="Image"    onClick={()=>addEl("image")}/>
        <Sep/>
        {/* zoom */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <button onClick={()=>setZoom(z=>clamp(+(z-.1).toFixed(1),.3,2))} style={{ background:"rgba(255,255,255,.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,.1)", borderRadius:5, width:26, height:26, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
          <span style={{ color:"#64748b", fontSize:11, width:36, textAlign:"center", fontWeight:700 }}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>clamp(+(z+.1).toFixed(1),.3,2))} style={{ background:"rgba(255,255,255,.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,.1)", borderRadius:5, width:26, height:26, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        </div>

        <div style={{ flex:1 }}/>

        {/* actions */}
        <button onClick={()=>{ if(window.confirm("Clear canvas?")){ setElements([]); setSelectedId(null); } }} style={{ background:"transparent", color:"#475569", border:"1px solid rgba(255,255,255,.08)", borderRadius:6, padding:"5px 11px", cursor:"pointer", fontSize:12, marginRight:4 }}>Clear</button>
        <button onClick={()=>setShowTpl(true)} style={{ background:"rgba(255,255,255,.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,.1)", borderRadius:6, padding:"5px 11px", cursor:"pointer", fontSize:12, fontWeight:600, marginRight:4 }}>📁 {templates.length}</button>
        <button onClick={()=>setShowJSON(true)} style={{ background:"rgba(59,130,246,.15)", color:"#93c5fd", border:"1px solid rgba(59,130,246,.3)", borderRadius:6, padding:"5px 11px", cursor:"pointer", fontSize:12, fontWeight:600, marginRight:8 }}>{"{}"} JSON</button>
        <button onClick={save} style={{ background:flash?"#16a34a":"linear-gradient(135deg,#2563eb,#4f46e5)", color:"#fff", border:"none", borderRadius:7, padding:"7px 18px", cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .3s", boxShadow:flash?"none":"0 2px 12px rgba(37,99,235,.4)" }}>{flash?"✓ Saved!":"💾 Save"}</button>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* canvas */}
        <div style={{ flex:1, overflow:"auto", background:"#0f172a", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:36 }}>
          <div style={{ transform:`scale(${zoom})`, transformOrigin:"top center", transition:"transform .2s" }}>
            <div ref={canvasRef} onClick={e=>{ if(e.target===canvasRef.current) setSelectedId(null); }}
              style={{ width:CW, height:CH, background:"#ffffff", position:"relative", borderRadius:3, boxShadow:"0 0 0 1px rgba(255,255,255,.08), 0 30px 100px rgba(0,0,0,.9)", overflow:"hidden" }}>
              {/* dot grid */}
              <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,#e2e8f0 1px,transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none", opacity:.5 }}/>
              {elements.length===0&&(
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                  <div style={{ fontSize:48, opacity:.1 }}>📄</div>
                  <div style={{ fontSize:16, color:"#94a3b8", fontWeight:700, opacity:.3, marginTop:12 }}>Blank Canvas</div>
                  <div style={{ fontSize:12, color:"#94a3b8", opacity:.2, marginTop:6 }}>Click toolbar buttons above to start designing</div>
                </div>
              )}
              {elements.map(el=><DraggableEl key={el.id} el={el} selected={selectedId===el.id} onSelect={setSelectedId} onUpdate={updEl} onDelete={delEl} zoom={zoom}/>)}
            </div>
            <div style={{ textAlign:"center", marginTop:8, color:"#334155", fontSize:10, letterSpacing:.5 }}>A4 · 794 × 1123 px</div>
          </div>
        </div>

        {/* properties panel */}
        <div style={{ width:210, background:"#fff", borderLeft:"1px solid #e5e7eb", flexShrink:0, overflowY:"auto" }}>
          <PropsPanel el={sel} onUpdate={updEl}/>
        </div>
      </div>

      {showTpl&&<TplModal templates={templates} onClose={()=>setShowTpl(false)} onLoad={t=>{ setElements(t.elements||[]); setTemplateName(t.name); setSelectedId(null); setShowTpl(false); }} onDelete={id=>persist(templates.filter(t=>t.id!==id))}/>}
      {showJSON&&<JSONModal data={buildPayload()} onClose={()=>setShowJSON(false)}/>}
    </div>
  );
}
