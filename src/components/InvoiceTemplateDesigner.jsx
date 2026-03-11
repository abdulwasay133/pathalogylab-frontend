import { useState, useRef, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import ConfirmModal from "./confirmModal/ConfirmModal";
import FormModal from "./formModal/FormModal";
import api from "api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

// ─── Element factory defaults ──────────────────────────────────────
const DEFAULTS = {
  h1:         ()=>({ id:uid(), type:"h1",         content:"Main Heading",            fontSize:28, fontWeight:"bold",   color:"#111111", align:"left", italic:false, marginBottom:12 }),
  h2:         ()=>({ id:uid(), type:"h2",         content:"Sub Heading",             fontSize:20, fontWeight:"bold",   color:"#222222", align:"left", italic:false, marginBottom:10 }),
  h3:         ()=>({ id:uid(), type:"h3",         content:"Section Title",           fontSize:15, fontWeight:"bold",   color:"#333333", align:"left", italic:false, marginBottom:8  }),
  paragraph:  ()=>({ id:uid(), type:"paragraph",  content:"Enter your text here.",   fontSize:13, fontWeight:"normal", color:"#444444", align:"left", italic:false, marginBottom:8  }),
  label:      ()=>({ id:uid(), type:"label",      content:"Label Text",              fontSize:11, fontWeight:"bold",   color:"#666666", align:"left", italic:false, marginBottom:4  }),
  field:      ()=>({ id:uid(), type:"field",      content:"{{value}}",               fontSize:13, fontWeight:"normal", color:"#111111", align:"left", italic:false, marginBottom:8, fieldKey:"field_"+Date.now(), borderBottom:true }),
  inputfield: ()=>({ id:uid(), type:"inputfield", label:"Field Label",               placeholder:"Enter value…", fieldKey:"input_"+Date.now(), fontSize:13, borderColor:"#d1d5db", bgColor:"#ffffff", labelColor:"#374151", borderRadius:4, marginBottom:12 }),
  divider:    ()=>({ id:uid(), type:"divider",    color:"#e5e7eb",                   thickness:1, marginTop:16, marginBottom:16 }),
  spacer:     ()=>({ id:uid(), type:"spacer",     height:24 }),
  image:      ()=>({ id:uid(), type:"image",      src:"",                            alt:"Image", width:150, align:"left", marginBottom:12 }),
  twocol:     ()=>({
    id:uid(), type:"twocol", marginBottom:16,
    left:  [{ id:uid(),type:"label",    content:"Bill To",   fontSize:10,fontWeight:"bold",  color:"#888",align:"left",italic:false,marginBottom:4 },
            { id:uid(),type:"paragraph",content:"Client Name\n123 Street\nCity, ZIP",fontSize:13,fontWeight:"normal",color:"#111",align:"left",italic:false,marginBottom:0 }],
    right: [{ id:uid(),type:"label",    content:"Invoice #", fontSize:10,fontWeight:"bold",  color:"#888",align:"right",italic:false,marginBottom:4 },
            { id:uid(),type:"paragraph",content:"INV-0001",  fontSize:13,fontWeight:"normal",color:"#111",align:"right",italic:false,marginBottom:0 }],
  }),
  table: ()=>({
    id:uid(), type:"table", marginBottom:16,
    cols:[
      { key:"description", label:"Test Name", widthPct:22 },
      { key:"qty",         label:"Normal Ranges",          widthPct:40 },
      { key:"price",       label:"Unit",   widthPct:15 },
      { key:"total",       label:"Result",        widthPct:23 },
    ],
    rows:[
      { description:"Service Item 1", qty:"1", price:"00.00", total:"00.00" },
      { description:"Service Item 2", qty:"2", price:"00.00",  total:"00.00" },
    ],
    headerBg:"#1e293b", headerColor:"#ffffff", rowBg:"#ffffff", rowAltBg:"#f8fafc",
    borderColor:"#e2e8f0", fontSize:13, padding:10,
  }),
};

// ─── Element → HTML string ─────────────────────────────────────────
function elToHTML(el, pad = "  ") {
  const mb = el.marginBottom != null ? `margin-bottom:${el.marginBottom}px;` : "";
  const mt = el.marginTop != null ? `margin-top:${el.marginTop}px;` : "";

  // Divider
  if (el.type === "divider") {
    return `${pad}<hr style="border:none;border-top:${el.thickness || 1}px solid ${el.color || "#e5e7eb"};${mt}${mb}"/>`;
  }

  // Spacer
  if (el.type === "spacer") {
    return `${pad}<div style="height:${el.height || 24}px;"></div>`;
  }

  // Image
  if (el.type === "image") {
    const aln =
      el.align === "center"
        ? "margin:0 auto;display:block;"
        : el.align === "right"
        ? "margin-left:auto;display:block;"
        : "display:block;";

    return `${pad}<div style="${mb}">
      <img src="${el.src || ""}" alt="${el.alt || ""}"
        style="width:${el.width || 150}px;height:auto;${aln}"/>
    </div>`;
  }

  // Text elements
  if (["h1", "h2", "h3", "paragraph", "label", "field"].includes(el.type)) {
    const tag = ["h1", "h2", "h3"].includes(el.type) ? el.type : "p";
    const bb =
      el.type === "field" && el.borderBottom
        ? "border-bottom:1.5px solid #2563eb;padding-bottom:2px;"
        : "";

    const style = `
      font-size:${el.fontSize || 14}px;
      font-weight:${el.fontWeight || "normal"};
      color:${el.color || "#111"};
      text-align:${el.align || "left"};
      font-style:${el.italic ? "italic" : "normal"};
      margin-top:0;
      ${mt}${mb}${bb}
    `;

    return `${pad}<${tag} contenteditable="true" style="${style}">
      ${(el.content || "").replace(/\n/g, "<br/>")}
    </${tag}>`;
  }

  // Input field
  if (el.type === "inputfield") {
    return [
      `${pad}<div style="${mb}">`,
      `${pad}  <label contenteditable="true"
        style="display:block;
        font-size:${(el.fontSize || 13) - 2}px;
        font-weight:700;
        color:${el.labelColor || "#374151"};
        margin-bottom:4px;">
        ${el.label || "Label"}
      </label>`,
      `${pad}  <input type="text"
        name="${el.fieldKey || "field"}"
        placeholder="${el.placeholder || ""}"
        data-field="${el.fieldKey || ""}"
        style="
          width:100%;
          box-sizing:border-box;
          padding:7px 10px;
          border:1.5px solid ${el.borderColor || "#d1d5db"};
          border-radius:${el.borderRadius || 4}px;
          font-size:${el.fontSize || 13}px;
          background:${el.bgColor || "#fff"};
          color:#111;
          outline:none;
          font-family:inherit;
        "/>`,
      `${pad}</div>`,
    ].join("\n");
  }

  // Two-column layout
  if (el.type === "twocol") {
    const L = (el.left || []).map(c => elToHTML(c, pad + "    ")).join("\n");
    const R = (el.right || []).map(c => elToHTML(c, pad + "    ")).join("\n");

    return [
      `${pad}<div style="display:flex;gap:24px;${mb}">`,
      `${pad}  <div style="flex:1;">\n${L}\n${pad}  </div>`,
      `${pad}  <div style="flex:1;">\n${R}\n${pad}  </div>`,
      `${pad}</div>`,
    ].join("\n");
  }

  // Table
  if (el.type === "table") {
    const total = el.cols.reduce((s, c) => s + c.widthPct, 0);

    const heads = el.cols
      .map(
        c => `${pad}      <th style="
          width:${((c.widthPct / total) * 100).toFixed(1)}%;
          padding:${el.padding || 10}px;
          background:${el.headerBg || "#1e293b"};
          color:${el.headerColor || "#fff"};
          font-size:${el.fontSize || 13}px;
          text-align:left;
          font-weight:700;">
          ${c.label}
        </th>`
      )
      .join("\n");

    const rows = el.rows
      .map((row, ri) => {
        const cells = el.cols
          .map(
            col => `${pad}      <td contenteditable="true"
              style="
                padding:${el.padding || 10}px;
                border:1px solid ${el.borderColor || "#e2e8f0"};
                font-size:${el.fontSize || 13}px;
                background:${ri % 2 === 0 ? el.rowBg || "#fff" : el.rowAltBg || "#f8fafc"};
              ">
              ${row[col.key] || ""}
            </td>`
          )
          .join("\n");

        return `${pad}    <tr>\n${cells}\n${pad}    </tr>`;
      })
      .join("\n");

    return [
      `${pad}<table style="width:100%;border-collapse:collapse;${mb}">`,
      `${pad}  <thead><tr>\n${heads}\n${pad}  </tr></thead>`,
      `${pad}  <tbody>\n${rows}\n${pad}  </tbody>`,
      `${pad}</table>`,
    ].join("\n");
  }

  return "";
}

const toBodyHTML  = els => els.map(el=>elToHTML(el)).join("\n");
const toFullHTML  = (els,name) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;}
    .page{max-width:794px;margin:0 auto;padding:48px;min-height:1123px;}
    input[type="text"]{font-family:inherit;}
    @media print{.page{padding:32px;}}
  </style>
</head>
<body>
  <div class="page">
${toBodyHTML(els)}
  </div>
</body>
</html>`;

// ─── Inline contenteditable ────────────────────────────────────────
function CE({ value, onChange, style, multiline }) {
  const ref=useRef();
  useEffect(()=>{ if(ref.current) ref.current.innerText=value??""; },[]);
  return <div ref={ref} contentEditable suppressContentEditableWarning
    onBlur={()=>onChange?.(ref.current?.innerText??"")}
    onKeyDown={e=>{ if(!multiline&&e.key==="Enter"){e.preventDefault();e.target.blur();} }}
    style={{ outline:"none", cursor:"text", minWidth:8, ...style }}/>;
}

// ─── Element renderer (live on canvas) ────────────────────────────
function LiveEl({ el, onUpdate, selected, onSelect, onMoveUp, onMoveDown, onDelete, isFirst, isLast }) {
  const upd=p=>onUpdate(el.id,p);
  const mb=el.marginBottom??8, mt=el.marginTop??0;
  const ring={ outline:selected?"2px solid #3b82f6":"2px solid transparent", borderRadius:4, position:"relative", cursor:"default", transition:"outline .12s" };
  const ctrlBtnStyle=bg=>({ background:bg, color:"#fff", border:"none", borderRadius:4, width:26, height:26, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" });

  const Controls = () => !selected ? null : (
    <div style={{ position:"absolute", right:-34, top:0, display:"flex", flexDirection:"column", gap:3, zIndex:20 }}>
      {!isFirst&&<button onClick={e=>{e.stopPropagation();onMoveUp(el.id);}} style={ctrlBtnStyle("#64748b")}>↑</button>}
      {!isLast &&<button onClick={e=>{e.stopPropagation();onMoveDown(el.id);}} style={ctrlBtnStyle("#64748b")}>↓</button>}
      <button onClick={e=>{e.stopPropagation();onDelete(el.id);}} style={ctrlBtnStyle("#ef4444")}>✕</button>
    </div>
  );

  if(el.type==="divider") return (
    <div style={ring} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <hr style={{ border:"none", borderTop:`${el.thickness||1}px solid ${el.color||"#e5e7eb"}`, marginTop:mt, marginBottom:mb }}/>
      <Controls/>
    </div>
  );

  if(el.type==="spacer") return (
    <div style={ring} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <div style={{ height:el.height||24, background:selected?"rgba(59,130,246,.07)":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {selected&&<span style={{ fontSize:10, color:"#94a3b8", userSelect:"none" }}>↕ Spacer {el.height||24}px</span>}
      </div>
      <Controls/>
    </div>
  );

  if(el.type==="image") return (
    <div style={ring} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <div style={{ marginBottom:mb, marginTop:mt, textAlign:el.align||"left" }}>
        {el.src
          ? <img src={el.src} alt={el.alt||""} style={{ width:el.width||150, height:"auto", display:"inline-block" }}/>
          : <div style={{ width:el.width||150, height:80, border:"2px dashed #cbd5e1", borderRadius:6, display:"inline-flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4, background:"#f8fafc", color:"#94a3b8", fontSize:11 }}>
              <span style={{ fontSize:22 }}>🖼</span><span>Image</span>
            </div>}
      </div>
      <Controls/>
    </div>
  );

  if(el.type==="twocol") return (
    <div style={{...ring, marginBottom:mb}} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <div style={{ display:"flex", gap:24 }}>
        <div style={{ flex:1 }}>
          {(el.left||[]).map((child,i)=>(
            <LiveEl key={child.id} el={child} selected={false} onSelect={()=>{}} isFirst={i===0} isLast={i===(el.left||[]).length-1}
              onUpdate={(id,ch)=>upd({left:(el.left||[]).map(c=>c.id===id?{...c,...ch}:c)})}
              onMoveUp={()=>{}} onMoveDown={()=>{}} onDelete={()=>{}}/>
          ))}
        </div>
        <div style={{ flex:1 }}>
          {(el.right||[]).map((child,i)=>(
            <LiveEl key={child.id} el={child} selected={false} onSelect={()=>{}} isFirst={i===0} isLast={i===(el.right||[]).length-1}
              onUpdate={(id,ch)=>upd({right:(el.right||[]).map(c=>c.id===id?{...c,...ch}:c)})}
              onMoveUp={()=>{}} onMoveDown={()=>{}} onDelete={()=>{}}/>
          ))}
        </div>
      </div>
      <Controls/>
    </div>
  );

  if(el.type==="table"){
    const tot=el.cols.reduce((s,c)=>s+c.widthPct,0);
    const startCR=(e,ci)=>{
      e.stopPropagation(); e.preventDefault();
      const sx=e.clientX, sw=el.cols.map(c=>c.widthPct);
      const tbl=e.currentTarget.closest("table"), tw=tbl?tbl.offsetWidth:600;
      const mv=ev=>{ const d=(ev.clientX-sx)/(tw/100); upd({cols:el.cols.map((c,i)=>i===ci?{...c,widthPct:Math.max(5,Math.min(90,sw[i]+d))}:i===ci+1?{...c,widthPct:Math.max(5,Math.min(90,sw[i]-d))}:c)}); };
      const up=()=>{ window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
      window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
    };
    const setCell=(ri,key,v)=>upd({rows:el.rows.map((r,i)=>i===ri?{...r,[key]:v}:r)});
    const setLbl=(ci,v)=>upd({cols:el.cols.map((c,i)=>i===ci?{...c,label:v}:c)});
    const addRow=()=>{ const r={}; el.cols.forEach(c=>{r[c.key]="";}); upd({rows:[...el.rows,r]}); };
    const delRow=ri=>upd({rows:el.rows.filter((_,i)=>i!==ri)});
    const addCol=()=>{ const key="c"+Date.now(),s=15; upd({cols:[...el.cols.map(c=>({...c,widthPct:c.widthPct*(100-s)/100})),{key,label:"Column",widthPct:s}],rows:el.rows.map(r=>({...r,[key]:""}))});};
    const delCol=ci=>{ const key=el.cols[ci].key,gone=el.cols[ci].widthPct,rem=el.cols.filter((_,i)=>i!==ci),tot2=rem.reduce((s,c)=>s+c.widthPct,0); upd({cols:rem.map(c=>({...c,widthPct:c.widthPct/tot2*(tot2+gone)})),rows:el.rows.map(r=>{const n={...r};delete n[key];return n;})});};
    return (
      <div style={{...ring,marginBottom:mb}} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:el.fontSize||13, tableLayout:"fixed" }}>
          <colgroup>{el.cols.map(c=><col key={c.key} style={{ width:`${(c.widthPct/tot*100).toFixed(1)}%` }}/>)}{selected&&<col style={{ width:28 }}/>}</colgroup>
          <thead><tr>
            {el.cols.map((col,ci)=>(
              <th key={col.key} style={{ background:el.headerBg||"#1e293b", color:el.headerColor||"#fff", padding:el.padding||10, fontWeight:700, position:"relative", userSelect:"none", textAlign:"left", borderRight:"1px solid rgba(255,255,255,.15)" }}>
                <CE value={col.label} onChange={v=>setLbl(ci,v)} style={{ color:el.headerColor||"#fff", fontWeight:700 }}/>
                {ci<el.cols.length-1&&<div onMouseDown={e=>startCR(e,ci)} style={{ position:"absolute",right:-4,top:0,bottom:0,width:8,cursor:"col-resize",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:2,height:"55%",background:"rgba(255,255,255,.4)",borderRadius:1 }}/></div>}
                {selected&&el.cols.length>1&&<div onClick={e=>{e.stopPropagation();delCol(ci);}} style={{ position:"absolute",top:3,right:3,width:14,height:14,background:"#ef4444",color:"#fff",borderRadius:"50%",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>✕</div>}
              </th>
            ))}
            {selected&&<th style={{ background:el.headerBg||"#1e293b",textAlign:"center" }}><span onClick={e=>{e.stopPropagation();addCol();}} style={{ color:"#94a3b8",cursor:"pointer",fontSize:18,fontWeight:300 }}>+</span></th>}
          </tr></thead>
          <tbody>
            {el.rows.map((row,ri)=>(
              <tr key={ri}>
                {el.cols.map(col=>(
                  <td key={col.key} style={{ padding:el.padding||10, border:`1px solid ${el.borderColor||"#e2e8f0"}`, background:ri%2===0?(el.rowBg||"#fff"):(el.rowAltBg||"#f8fafc"), verticalAlign:"top" }}>
                    <CE value={row[col.key]||""} onChange={v=>setCell(ri,col.key,v)} style={{ fontSize:el.fontSize||13,color:"#111",minHeight:16 }}/>
                  </td>
                ))}
                {selected&&<td style={{ border:`1px solid ${el.borderColor||"#e2e8f0"}`,textAlign:"center",verticalAlign:"middle",background:"#fff" }}><span onClick={e=>{e.stopPropagation();delRow(ri);}} style={{ color:"#ef4444",cursor:"pointer",fontSize:14 }}>✕</span></td>}
              </tr>
            ))}
          </tbody>
        </table>
        {selected&&<button onClick={e=>{e.stopPropagation();addRow();}} style={{ marginTop:6,background:"#eff6ff",border:"1px dashed #3b82f6",color:"#3b82f6",borderRadius:4,padding:"5px 14px",cursor:"pointer",fontSize:12,fontWeight:600 }}>+ Add Row</button>}
        <Controls/>
      </div>
    );
  }

  if(el.type==="inputfield") return (
    <div style={{...ring,marginBottom:mb,marginTop:mt}} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <div>
        <CE value={el.label} onChange={v=>upd({label:v})} style={{ display:"block",fontSize:(el.fontSize||13)-2,fontWeight:700,color:el.labelColor||"#374151",marginBottom:4 }}/>
        <div style={{ width:"100%",padding:"7px 10px",border:`1.5px solid ${el.borderColor||"#d1d5db"}`,borderRadius:el.borderRadius||4,background:el.bgColor||"#fff",fontSize:el.fontSize||13,color:"#9ca3af",boxSizing:"border-box" }}>
          <CE value={el.placeholder} onChange={v=>upd({placeholder:v})} style={{ color:"#9ca3af",fontStyle:"italic" }}/>
        </div>
      </div>
      <Controls/>
    </div>
  );

  // text / heading / label / field
  const tag=["h1","h2","h3"].includes(el.type)?el.type:"p";
  const Tag=tag;
  const bb=el.type==="field"&&el.borderBottom?{borderBottom:"1.5px solid #3b82f6",paddingBottom:2}:{};
  return (
    <div style={ring} onClick={e=>{e.stopPropagation();onSelect(el.id);}}>
      <Tag style={{ fontSize:el.fontSize,fontWeight:el.fontWeight,color:el.color,textAlign:el.align,fontStyle:el.italic?"italic":"normal",marginBottom:mb,marginTop:mt,lineHeight:1.55,...bb }}>
        <CE value={el.content} onChange={v=>upd({content:v})} multiline style={{ whiteSpace:"pre-wrap" }}/>
      </Tag>
      <Controls/>
    </div>
  );
}

// ─── Properties panel ──────────────────────────────────────────────
function Props({ el, onUpdate }) {
  if(!el) return (
    <div style={{ padding:18,fontSize:12,color:"#6b7280" }}>
      <div style={{ fontSize:10,fontWeight:800,letterSpacing:1.2,color:"#9ca3af",marginBottom:12 }}>PROPERTIES</div>
      <div style={{ lineHeight:1.8 }}>Select an element to edit its properties.</div>
      <div style={{ marginTop:16,padding:12,background:"#f9fafb",borderRadius:8,fontSize:11,color:"#9ca3af",border:"1px solid #f3f4f6",lineHeight:2.1 }}>
        <b style={{ color:"#6b7280",display:"block",marginBottom:4 }}>Tips</b>
        Click element → select<br/>Click text → edit inline<br/>↑↓ → reorder rows<br/>✕ → delete<br/>Drag col border → resize
      </div>
    </div>
  );
  const upd=(k,v)=>onUpdate(el.id,{[k]:v});
  const inp={width:"100%",padding:"6px 8px",border:"1px solid #e5e7eb",borderRadius:5,fontSize:12,background:"#fff",color:"#374151",boxSizing:"border-box",outline:"none"};
  const Row=({label,children})=><div style={{ marginBottom:12 }}><div style={{ fontSize:9,fontWeight:700,color:"#9ca3af",letterSpacing:1,marginBottom:5 }}>{label}</div>{children}</div>;
  const Num=({k,min,max,val})=><input type="number" value={val!==undefined?val:(el[k]??0)} min={min} max={max} onChange={e=>upd(k,Number(e.target.value))} style={inp}/>;
  const Col=({k,val})=><input type="color" value={val!==undefined?val:(el[k]||"#000000")} onChange={e=>upd(k,e.target.value)} style={{...inp,padding:2,height:34,cursor:"pointer"}}/>;
  const Txt=({k,val,ph})=><input type="text" value={val!==undefined?val:(el[k]||"")} placeholder={ph} onChange={e=>upd(k,e.target.value)} style={inp}/>;

  return (
    <div style={{ padding:14,overflowY:"auto",height:"100%",background:"#fff" }}>
      <div style={{ fontSize:10,fontWeight:800,letterSpacing:1.2,color:"#9ca3af",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #f3f4f6" }}>{el.type.toUpperCase()}</div>

      {["h1","h2","h3","paragraph","label","field"].includes(el.type)&&<>
        <Row label="FONT SIZE"><Num k="fontSize" min={8} max={96}/></Row>
        <Row label="COLOR"><Col k="color"/></Row>
        <Row label="ALIGN"><div style={{ display:"flex",gap:4 }}>{["left","center","right"].map(a=><button key={a} onClick={()=>upd("align",a)} style={{ flex:1,padding:"6px 0",border:"1px solid #e5e7eb",borderRadius:5,background:el.align===a?"#3b82f6":"#fff",color:el.align===a?"#fff":"#9ca3af",cursor:"pointer",fontSize:13 }}>{a==="left"?"⬤≡":a==="center"?"≡≡":"≡⬤"}</button>)}</div></Row>
        <Row label="STYLE"><div style={{ display:"flex",gap:4 }}><button onClick={()=>upd("fontWeight",el.fontWeight==="bold"?"normal":"bold")} style={{ flex:1,padding:"6px 0",border:"1px solid #e5e7eb",borderRadius:5,background:el.fontWeight==="bold"?"#3b82f6":"#fff",color:el.fontWeight==="bold"?"#fff":"#9ca3af",cursor:"pointer",fontWeight:"bold" }}>B</button><button onClick={()=>upd("italic",!el.italic)} style={{ flex:1,padding:"6px 0",border:"1px solid #e5e7eb",borderRadius:5,background:el.italic?"#3b82f6":"#fff",color:el.italic?"#fff":"#9ca3af",cursor:"pointer",fontStyle:"italic" }}>I</button></div></Row>
        <Row label="BOTTOM MARGIN"><Num k="marginBottom" min={0} max={80}/></Row>
      </>}

      {el.type==="inputfield"&&<>
        <Row label="LABEL"><Txt k="label"/></Row>
        <Row label="PLACEHOLDER"><Txt k="placeholder"/></Row>
        <Row label="BORDER COLOR"><Col k="borderColor"/></Row>
        <Row label="BACKGROUND"><Col k="bgColor"/></Row>
        <Row label="LABEL COLOR"><Col k="labelColor"/></Row>
        <Row label="BORDER RADIUS"><Num k="borderRadius" min={0} max={24}/></Row>
        <Row label="FONT SIZE"><Num k="fontSize" min={8} max={24}/></Row>
        <Row label="BOTTOM MARGIN"><Num k="marginBottom" min={0} max={80}/></Row>
      </>}

      {el.type==="divider"&&<>
        <Row label="COLOR"><Col k="color"/></Row>
        <Row label="THICKNESS"><Num k="thickness" min={1} max={20}/></Row>
        <Row label="TOP MARGIN"><Num k="marginTop" min={0} max={60}/></Row>
        <Row label="BOTTOM MARGIN"><Num k="marginBottom" min={0} max={60}/></Row>
      </>}

      {el.type==="spacer"&&<Row label="HEIGHT (px)"><Num k="height" min={4} max={200}/></Row>}

      {el.type==="image"&&<>
        <Row label="IMAGE URL"><Txt k="src" ph="https://…"/></Row>
        <Row label="ALT TEXT"><Txt k="alt"/></Row>
        <Row label="WIDTH (px)"><Num k="width" min={20} max={700}/></Row>
        <Row label="ALIGN"><div style={{ display:"flex",gap:4 }}>{["left","center","right"].map(a=><button key={a} onClick={()=>upd("align",a)} style={{ flex:1,padding:"6px 0",border:"1px solid #e5e7eb",borderRadius:5,background:el.align===a?"#3b82f6":"#fff",color:el.align===a?"#fff":"#9ca3af",cursor:"pointer",fontSize:13 }}>{a==="left"?"⬤≡":a==="center"?"≡≡":"≡⬤"}</button>)}</div></Row>
        <Row label="BOTTOM MARGIN"><Num k="marginBottom" min={0} max={60}/></Row>
      </>}

      {el.type==="table"&&<>
        <Row label="HEADER BG"><Col k="headerBg"/></Row>
        <Row label="HEADER TEXT"><Col k="headerColor"/></Row>
        <Row label="ROW BG"><Col k="rowBg"/></Row>
        <Row label="ALT ROW BG"><Col k="rowAltBg"/></Row>
        <Row label="BORDER COLOR"><Col k="borderColor"/></Row>
        <Row label="CELL PADDING"><Num k="padding" min={4} max={30}/></Row>
        <Row label="FONT SIZE"><Num k="fontSize" min={8} max={24}/></Row>
        <Row label="BOTTOM MARGIN"><Num k="marginBottom" min={0} max={60}/></Row>
      </>}
    </div>
  );
}

// ─── Toolbar button ────────────────────────────────────────────────
function TBtn({ icon, label, onClick, accent }) {
  const [h,setH]=useState(false);
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} title={label} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"5px 8px",background:h?"rgba(255,255,255,.1)":"transparent",border:"none",borderRadius:6,cursor:"pointer",color:accent||"#cbd5e1",transition:"background .15s",flexShrink:0,minWidth:42 }}><span style={{ fontSize:14,lineHeight:1 }}>{icon}</span><span style={{ fontSize:9,fontWeight:700,letterSpacing:.3,whiteSpace:"nowrap" }}>{label}</span></button>;
}

// ─── HTML Preview modal ────────────────────────────────────────────
function HTMLModal({ html, onClose }) {
  const [tab,setTab]=useState("preview"), [cp,setCp]=useState(false);
  const body=html.match(/<div class="page">([\s\S]*?)<\/div>\s*<\/body>/)?.[1]?.trim()||html;
  const copy=(txt)=>{ navigator.clipboard?.writeText(txt); setCp(true); setTimeout(()=>setCp(false),2000); };
  const tabS=id=>({ padding:"8px 16px",border:"none",borderBottom:tab===id?"2px solid #3b82f6":"2px solid transparent",background:"transparent",color:tab===id?"#3b82f6":"#6b7280",cursor:"pointer",fontSize:12,fontWeight:700 });
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:12,width:"min(860px,96vw)",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 30px 80px rgba(0,0,0,.5)",overflow:"hidden" }}>
        <div style={{ padding:"10px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f9fafb",flexWrap:"wrap",gap:8 }}>
          <div style={{ display:"flex" }}>
            <button style={tabS("preview")} onClick={()=>setTab("preview")}>👁 Preview</button>
            <button style={tabS("body")} onClick={()=>setTab("body")}>{"</>"}  Body HTML</button>
            <button style={tabS("full")} onClick={()=>setTab("full")}>📄 Full HTML</button>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>copy(tab==="full"?html:body)} style={{ background:cp?"#16a34a":"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700,transition:"background .3s" }}>{cp?"✓ Copied!":"Copy"}</button>
            <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",color:"#6b7280",fontSize:12,fontWeight:700 }}>Close</button>
          </div>
        </div>
        <div style={{ flex:1,overflow:"hidden",minHeight:0 }}>
          {tab==="preview"
            ? <iframe srcDoc={html} style={{ width:"100%",height:"100%",border:"none" }} title="preview"/>
            : <pre style={{ margin:0,padding:20,overflow:"auto",height:"100%",fontSize:11,lineHeight:1.7,color:"#1e293b",background:"#f8fafc",whiteSpace:"pre-wrap",wordBreak:"break-word",boxSizing:"border-box" }}>{tab==="full"?html:body}</pre>
          }
        </div>
        <div style={{ padding:"10px 20px",borderTop:"1px solid #f3f4f6",background:"#f9fafb",fontSize:11,color:"#9ca3af" }}>
          💡 <b>LIMS</b> = Your Template Design  <b>Coding View</b> = standalone printable page.
        </div>
      </div>
    </div>
  );
}

// ─── Saved templates modal ─────────────────────────────────────────
function TplModal({ templates, onClose, onLoad, onDelete }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:12,width:500,maxHeight:"75vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.3)" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontWeight:800,fontSize:15,color:"#111" }}>Saved Templates</span>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto",padding:16,flex:1 }}>
          {templates.length===0&&<div style={{ color:"#d1d5db",textAlign:"center",padding:48,fontSize:14 }}>No templates yet.</div>}
          {templates.map(t=>(
            <div key={t.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"1px solid #f3f4f6",borderRadius:8,marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,color:"#111",fontSize:13 }}>{t.name}</div>
                <div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>{t.elementCount} elements · {new Date(t.savedAt).toLocaleString()}</div>
                <div style={{ fontSize:10,color:"#c0c0c0",marginTop:1,fontFamily:"monospace" }}>html: {(t.html||"").length} chars</div>
              </div>
              <button onClick={()=>onLoad(t)} style={{ background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontWeight:700,fontSize:12 }}>Load</button>
              <button onClick={()=>onDelete(t.id)} style={{ background:"#fef2f2",color:"#ef4444",border:"1px solid #fecaca",borderRadius:6,padding:"7px 10px",cursor:"pointer",fontSize:12 }}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  DEFAULT EXPORT
// ══════════════════════════════════════════════════════════════════
export default function InvoiceTemplateDesigner({ onSave, initialTemplate,id }={}) {
  const [elements,setElements]     = useState(initialTemplate?.elements??[]);
  const [selectedId,setSelectedId] = useState(null);
  const [name,setName]             = useState(initialTemplate?.name??"Untitled Template");
  const [templates,setTemplates]   = useState([]);
  const [showTpl,setShowTpl]       = useState(false);
  const [showHTML,setShowHTML]     = useState(false);
  const [htmlCache,setHTMLCache]   = useState("");
  const [flash,setFlash]           = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors,isValid,isSubmitting },
  } = useForm({
    model: "onChange",
    reValidateMode: "onChange",
  });

  const getTemplate = async (id) => {
    try {
      const response = await api.get(`/test/${id}`);
      console.log(response.data.data);
      if(response.status===200){
        setTemplates(response.data.data); 
        try{ 
          localStorage.setItem("_inv_html_v1",JSON.stringify(response.data.data)); 
        }catch{}
        setElements(response.data.data.elements);
        setName(response.data.data.name);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      return null;
    }
  }
  

  useEffect(()=>{
     try{ 
      const s=localStorage.getItem("_inv_html_v1");
       if(s) setTemplates(JSON.parse(s));
       if(id) getTemplate(id);
      }catch{} 
    },[]);
  const persist=ts=>{ setTemplates(ts); try{ localStorage.setItem("_inv_html_v1",JSON.stringify(ts)); }catch{}};

  const addEl=type=>{ const el=DEFAULTS[type](); setElements(p=>[...p,el]); setSelectedId(el.id); };
  const updEl=(id,ch)=>setElements(p=>p.map(el=>el.id===id?{...el,...ch}:el));
  const delEl=id=>{ setElements(p=>p.filter(el=>el.id!==id)); setSelectedId(null); };
  const moveUp=id=>setElements(p=>{ const i=p.findIndex(e=>e.id===id); if(i<=0)return p; const a=[...p]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; });
  const moveDown=id=>setElements(p=>{ const i=p.findIndex(e=>e.id===id); if(i>=p.length-1)return p; const a=[...p]; [a[i],a[i+1]]=[a[i+1],a[i]]; return a; });

  const save = () => {
  if (!name?.trim()) {
    setConfirmMessage("Template is required.Please Enter Template Name");
    setConfirmType('error');
    setShowConfirm(true);
    return;
  }
  if(toBodyHTML(elements)==""){
    setConfirmMessage("Canvas is Empty. Please add elements to the canvas");
    setConfirmType('error');
    setShowConfirm(true);
    return;
  }
  setShowSaveModal(true);
};
const update = async () => {
  try {
    const html     = toBodyHTML(elements);   // ← store this in DB
    const fullHtml = toFullHTML(elements,name);
    const payload  = {
      id:           `tpl_${Date.now()}`,
      name,
      html,          // ← THE DB COLUMN: clean body HTML only
      fullHtml,      // ← optional: standalone printable page
      elements,      // ← optional: keep for re-editing in designer
      elementCount:  elements.length,
      editableFields: elements.filter(e=>["field","inputfield"].includes(e.type)).map(e=>({ key:e.fieldKey, label:e.type==="inputfield"?e.label:e.content, type:e.type })),
      savedAt:       new Date().toISOString(),
    };
     if(toBodyHTML(elements)==""){
    setConfirmMessage("Canvas is Empty. Please add elements to the canvas");
    setConfirmType('error');
    setShowConfirm(true);
    return;
  }
    const response = await api.put(`/update-template/${id}`, payload);
    console.log(response);
    if(response.status===200){
      toast.success(response.data.message);
      navigate("/admin/test-management");
    }
    
  } catch (error) {
    console.error("Error saving template:", error);
  }
}
const confirmSave = async (formData) => {
    const html     = toBodyHTML(elements);   // ← store this in DB
    const fullHtml = toFullHTML(elements,name);
    const payload  = {
      id:           `tpl_${Date.now()}`,
      name,
      html,          // ← THE DB COLUMN: clean body HTML only
      fullHtml,      // ← optional: standalone printable page
      elements,      // ← optional: keep for re-editing in designer
      elementCount:  elements.length,
      editableFields: elements.filter(e=>["field","inputfield"].includes(e.type)).map(e=>({ key:e.fieldKey, label:e.type==="inputfield"?e.label:e.content, type:e.type })),
      savedAt:       new Date().toISOString(),
      ...formData
    };
    // const updated=templates.some(t=>t.name===name)?templates.map(t=>t.name===name?payload:t):[...templates,payload];
    console.log(payload);

    try {
      const response = await api.post("/test", payload);
      console.log(response);
      if(response.status===200){
        setShowSaveModal(false);
        toast.success(response.data.message);
        handleClear();
      }else{
        toast.error(response.data.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Faild To Add Something else");
    }
    
    // persist(updated);
    setFlash(true); setTimeout(()=>setFlash(false),2500);
    onSave?.(payload);
  };

  useEffect(()=>{
    const h=e=>{ if(!selectedId)return; if(["Delete","Backspace"].includes(e.key)&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable) delEl(selectedId); };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[selectedId]);

  const sel=elements.find(e=>e.id===selectedId)??null;
  const Sep=()=><div style={{ width:1,height:30,background:"#f4f5f6",margin:"0 3px",flexShrink:0 }}/>;

  const handleClear = () => {
    setElements([]);
    setSelectedId(null);
    setShowConfirm(false);
  };

  return (
    <div style={{ width:"100%",height:"100%",display:"flex",flexDirection:"column",background:"#ffffff",fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden" }}>

      {/* ══ TOOLBAR ══ */}
      <div style={{ height:54,background:"linear-gradient(90deg,#1e293b,#0f172a)",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",padding:"0 12px",flexShrink:0,overflowX:"auto",gap:1 }}>
        {/* brand */}
        <div style={{ display:"flex",alignItems:"center",gap:8,paddingRight:14,marginRight:4,borderRight:"1px solid rgba(255,255,255,.1)",flexShrink:0 }}>
          {/* <div style={{ width:28,height:28,background:"linear-gradient(135deg,#3b82f6,#6366f1)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>⚡</div> */}
          <input value={name} onChange={e=>setName(e.target.value)} style={{ background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:13,fontWeight:700,width:145 }} placeholder="Template name…"/>
        </div>
        {/* text */}
        <TBtn icon="H1" label="Heading 1" onClick={()=>addEl("h1")}/>
        <TBtn icon="H2" label="Heading 2" onClick={()=>addEl("h2")}/>
        <TBtn icon="H3" label="Heading 3" onClick={()=>addEl("h3")}/>
        <TBtn icon="¶"  label="Paragraph" onClick={()=>addEl("paragraph")}/>
        <TBtn icon="🏷" label="Label"     onClick={()=>addEl("label")}/>
        <Sep/>
        {/* interactive */}
        <TBtn icon="✏️" label="Field"     onClick={()=>addEl("field")}      accent="#93c5fd"/>
        <TBtn icon="⬜" label="Input"     onClick={()=>addEl("inputfield")} accent="#6ee7b7"/>
        <TBtn icon="📊" label="Table"     onClick={()=>addEl("table")}/>
        <Sep/>
        {/* layout */}
        <TBtn icon="▥"  label="Two-Col"   onClick={()=>addEl("twocol")}/>
        <TBtn icon="─"  label="Divider"   onClick={()=>addEl("divider")}/>
        <TBtn icon="↕"  label="Spacer"    onClick={()=>addEl("spacer")}/>
        <TBtn icon="🖼" label="Image"     onClick={()=>addEl("image")}/>
        <Sep/>
        <div style={{ flex:1 }}/>
              <button
        onClick={() => {
          setShowConfirm(true);
          setConfirmMessage("Are you sure you want to clear the template?");
          setConfirmType('warning');}}
        style={{
          background: "transparent",
          color: "#475569",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 6,
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: 12,
          marginRight: 4
        }}
      >
        Clear
      </button>
        {/* <button onClick={()=>setShowTpl(true)} style={{ background:"rgba(255,255,255,.06)",color:"#94a3b8",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,marginRight:4 }}>📁 {templates.length}</button> */}
        <button onClick={()=>{ setHTMLCache(toFullHTML(elements,name)); setShowHTML(true); }} style={{ background:"rgba(59,130,246,.15)",color:"#93c5fd",border:"1px solid rgba(59,130,246,.3)",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700,marginRight:8 }}>{"</>"} HTML</button>
        <button
  onClick={id ? update : save}
  style={{
    background: flash ? "#16a34a" : "linear-gradient(135deg,#3b82f6,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "7px 20px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    transition: "all .3s",
    boxShadow: flash ? "none" : "0 2px 12px rgba(59,130,246,.4)",
    whiteSpace: "nowrap"
  }}
>
  {flash
    ? "✓ Saved!"
    : id
      ? "Update Template"
      : "Save Template"}
</button>
      </div>

      {/* ══ BODY ══ */}
      <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
        {/* canvas */}
        <div style={{ flex:1,overflow:"auto",background:"#f4f5f6",padding:32,display:"flex",justifyContent:"center",alignItems:"flex-start" }}>
          <div style={{ width:794,background:"#ffffff",minHeight:1123,borderRadius:3,boxShadow:"0 0 0 1px rgba(255,255,255,.06),0 30px 80px rgba(0,0,0,.7)",padding:48,paddingRight:92,boxSizing:"border-box",position:"relative" }}
            onClick={()=>setSelectedId(null)}>

            {elements.length===0&&(
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                <div style={{ fontSize:48,opacity:.1 }}>📄</div>
                <div style={{ fontSize:16,color:"#94a3b8",fontWeight:700,opacity:.25,marginTop:12 }}>Blank Canvas</div>
                <div style={{ fontSize:12,color:"#94a3b8",opacity:.2,marginTop:6 }}>Use the toolbar above to add elements</div>
              </div>
            )}

            {elements.map((el,i)=>(
              <LiveEl key={el.id} el={el}
                selected={selectedId===el.id}
                onSelect={setSelectedId}
                onUpdate={updEl}
                onDelete={delEl}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                isFirst={i===0}
                isLast={i===elements.length-1}
              />
            ))}
          </div>
        </div>

        {/* properties */}
        <div style={{ width:215,background:"#fff",borderLeft:"1px solid #e5e7eb",flexShrink:0,overflowY:"auto" }}>
          <Props el={sel} onUpdate={updEl}/>
        </div>
      </div>

      {/* modals */}
      {showTpl&&<TplModal templates={templates} onClose={()=>setShowTpl(false)}
        onLoad={t=>{ 
          console.log(t);
          setElements(t.elements||[]);
          setName(t.name);
          setSelectedId(null);
          setShowTpl(false);
        }}
        onDelete={id=>persist(templates.filter(t=>t.id!==id))}/>}
      {showHTML&&<HTMLModal html={htmlCache} onClose={()=>setShowHTML(false)}/>}
        {showConfirm && (
        <ConfirmModal
          type={confirmType}
          message={confirmMessage}
          onConfirm={handleClear}
          onCancel={() => setShowConfirm(false)}
        />
      )}
{showSaveModal && (
  <FormModal
  title="Test Details"
  type="info"
  fields={[
    { label: "Test Name", name: "testName", placeholder: "Enter Test Name" },
    { label: "Test Short Name", name: "testShortName", placeholder: "Short Name" },
    { label: "Price", name: "amount", type: "number", placeholder: "Test Price" },
  ]}
  onSubmit={(formData) => {
    console.log(
      'form data',
      formData
    );
    confirmSave(formData);
  }}
  onCancel={() => setShowSaveModal(false)}
/>
)}
    </div>
  );
}
