import React, { useRef, useEffect, useCallback } from "react";
import { Box, Text } from "@chakra-ui/react";

// ─── Physics ────────────────────────────────────────────────────────────────
const BASE_R    = 29;
const REPULSE   = 4800;   // slightly softer so nodes can pass closer
const Z_REPULSE = 1400;
const SPRING_K  = 0.014;  // loosened — more slack between connected nodes
const Z_SPRING  = 0.005;
const REST      = 128;
const DAMP      = 0.910;  // higher = more motion accumulates
const Z_DAMP    = 0.960;
const GRAVITY   = 0.0018; // lighter pull to cluster — nodes wander more
const Z_GRAVITY = 0.0008;
const DRIFT     = 0.22;   // 2× stronger orbital churn
const Z_DRIFT   = 0.16;   // more visible depth oscillation
const TICK      = 0.010;  // 3× faster time → orbit completes in ~35s not 116s

const NODES = [
  // Labor Relations (blue)
  { id: "cb",   label: "Collective\nBargaining",   group: 0, size: 1.00 },
  { id: "ca",   label: "Contract\nArchitecture",   group: 0, size: 1.00 },
  { id: "fo",   label: "Field\nOrganizing",        group: 0, size: 1.00 },
  { id: "ga",   label: "Grievance\nAdmin",         group: 0, size: 1.00 },
  { id: "nlrb", label: "NLRB\nRepresent.",         group: 0, size: 1.00 },
  { id: "ug",   label: "Union\nGovernance",        group: 0, size: 1.00 },
  { id: "mm",   label: "Member\nMobilization",     group: 0, size: 1.00 },
  { id: "pa",   label: "Political\nAction",        group: 0, size: 1.00 },
  { id: "cs",   label: "Campaign\nStrategy",       group: 0, size: 1.00 },
  { id: "rc",   label: "Regulatory\nCompliance",   group: 0, size: 1.00 },
  { id: "ta",   label: "Trust\nAdmin",             group: 0, size: 1.00 },
  { id: "wa",   label: "Workforce\nAdvocacy",      group: 0, size: 1.00 },
  { id: "cr",   label: "Conflict\nResolution",     group: 0, size: 1.00 },
  { id: "arb",  label: "Labor\nArbitration",       group: 0, size: 1.00 },
  { id: "st",   label: "Steward\nTraining",        group: 0, size: 1.00 },
  { id: "wi",   label: "Workplace\nInvestigation", group: 0, size: 1.00 },
  // Bridge (teal)
  { id: "da",   label: "Data\nAnalytics",          group: 2, size: 1.00 },
  { id: "do",   label: "Digital\nOrganizing",      group: 2, size: 1.00 },
  // Digital Media (purple)
  { id: "vp",   label: "Video\nProduction",        group: 1, size: 1.00 },
  { id: "ae",   label: "Audio\nEngineering",       group: 1, size: 1.00 },
  { id: "pp",   label: "Podcast\nProduction",      group: 1, size: 1.00 },
  { id: "gd",   label: "Graphic\nDesign",          group: 1, size: 1.00 },
  { id: "seo",  label: "SEO &\nWeb Dev",           group: 1, size: 1.00 },
  { id: "ai",   label: "AI &\nAutomation",         group: 1, size: 1.00 },
  { id: "sm",   label: "Social\nMedia",            group: 1, size: 1.00 },
  { id: "cnt",  label: "Content\nStrategy",        group: 1, size: 1.00 },
  { id: "sp",   label: "Studio\nProduction",       group: 1, size: 1.00 },
  { id: "code", label: "Coding &\nDev",            group: 1, size: 1.00 },
  { id: "em",   label: "Email\nMarketing",         group: 1, size: 1.00 },
  { id: "bi",   label: "Brand\nIdentity",          group: 1, size: 1.00 },
  { id: "ls",   label: "Live\nStreaming",          group: 1, size: 1.00 },
];

const EDGES = [
  // Labor cluster
  ["cb","ca"],["cb","ga"],["cb","rc"],["ca","rc"],["ga","nlrb"],["ga","cr"],
  ["fo","mm"],["fo","cs"],["fo","wa"],["mm","pa"],["mm","cr"],["pa","cs"],
  ["ug","ta"],["ug","rc"],["cs","da"],["wa","cr"],
  ["arb","ga"],["arb","cr"],["arb","cb"],
  ["st","mm"],["st","fo"],["st","wa"],
  ["wi","ga"],["wi","rc"],["wi","cr"],
  // Digital cluster
  ["vp","pp"],["vp","sp"],["ae","pp"],["ae","sp"],["gd","cnt"],["cnt","ai"],["cnt","sm"],
  ["seo","do"],["seo","code"],["ai","code"],["sm","do"],
  ["em","cnt"],["em","sm"],["bi","gd"],["bi","cnt"],["ls","vp"],["ls","sp"],
  // Bridge edges (cross-career)
  ['cs','cnt'], ['cs','do'],  ['da','ai'],  ['fo','do'],  ['pa','sm'],
  ['cnt','mm'], ['cnt','pa'],
  // Media → Organizing cross-career connections
  ['pp','fo'],  ['pp','mm'],  ['pp','wa'],  ['pp','st'],
  ['vp','fo'],  ['vp','mm'],  ['vp','wa'],  ['vp','st'],
];

function buildNodes(W, H) {
  const laborNodes   = NODES.filter(n => n.group === 0);
  const digitalNodes = NODES.filter(n => n.group === 1);
  let li = 0, di = 0;
  return NODES.map(n => {
    let cx, cy;
    if (n.group === 0) {
      const a = (li / laborNodes.length) * Math.PI * 2;
      li++;
      cx = W * 0.26 + Math.cos(a) * W * 0.17;
      cy = H * 0.50 + Math.sin(a) * H * 0.33;
    } else if (n.group === 1) {
      const a = (di / digitalNodes.length) * Math.PI * 2;
      di++;
      cx = W * 0.74 + Math.cos(a) * W * 0.17;
      cy = H * 0.50 + Math.sin(a) * H * 0.33;
    } else {
      cx = W * 0.50 + (Math.random() - 0.5) * 80;
      cy = H * 0.50 + (Math.random() - 0.5) * 80;
    }
    return {
      ...n,
      x: cx+(Math.random()-0.5)*20, y: cy+(Math.random()-0.5)*20,
      z: (Math.random()-0.5)*2.0,   // full -1 to 1 range for deep spread
      vx: 0, vy: 0, vz: 0,
      phase:  Math.random()*Math.PI*2,
      freq:   0.18 + Math.random()*0.22,
      zPhase: Math.random()*Math.PI*2,
      zFreq:  0.12 + Math.random()*0.16,
    };
  });
}

// Node colors — light (center) and dark (edge)
const C1 = (g) => g===0 ? '#7EC8F5' : g===1 ? '#C4AAFC' : '#8EEEF8';
const C2 = (g) => g===0 ? '#4A8DC4' : g===1 ? '#8562CC' : '#4ABEC8';

// Convert hex color to rgba string
function hexAlpha(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+a+')';
}

// Perspective scale: clamped at 0.58 min so even deep-back nodes remain legible
// Range: 0.58 (far) → 1.00 (near)
const pScale = (z) => Math.max(0.58, 0.60 + z * 0.40);

export default function SkillOrbMap({ colorMode }) {
  const canvasRef  = useRef(null);
  const nodesRef   = useRef(null);
  const rafRef     = useRef(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const tooltipRef = useRef(null);
  const tRef       = useRef(0);
  const isDark     = colorMode === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas._dpr = dpr;
      if (!nodesRef.current) nodesRef.current = buildNodes(W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const frame = () => {
      const dpr = canvas._dpr || 1, W = canvas.offsetWidth, H = canvas.offsetHeight;
      const ctx = canvas.getContext('2d'), nodes = nodesRef.current;
      if (!nodes || W === 0) { rafRef.current = requestAnimationFrame(frame); return; }

      tRef.current += TICK;
      const t = tRef.current;

      // ── XY + Z Repulsion ─────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y;
          const dxy=Math.sqrt(dx*dx+dy*dy)||0.1, fxy=REPULSE/(dxy*dxy);
          nodes[i].vx-=(dx/dxy)*fxy; nodes[i].vy-=(dy/dxy)*fxy;
          nodes[j].vx+=(dx/dxy)*fxy; nodes[j].vy+=(dy/dxy)*fxy;
          // Z repulsion (1-D)
          const dz=nodes[j].z-nodes[i].z, adz=Math.abs(dz)||0.1;
          const fz=Z_REPULSE/(adz*adz);
          nodes[i].vz-=(dz/adz)*fz; nodes[j].vz+=(dz/adz)*fz;
        }
      }

      // ── XY + Z Springs (edges) ───────────────────────────────────────────
      const nm={}; nodes.forEach(n=>{nm[n.id]=n;});
      EDGES.forEach(([aId,bId])=>{
        const a=nm[aId],b=nm[bId]; if(!a||!b) return;
        // XY spring
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||0.1,f=SPRING_K*(d-REST);
        a.vx+=(dx/d)*f; a.vy+=(dy/d)*f; b.vx-=(dx/d)*f; b.vy-=(dy/d)*f;
        // Z spring — pull connected nodes toward same depth
        const dz=b.z-a.z, fz=Z_SPRING*dz;
        a.vz+=fz; b.vz-=fz;
      });

      // ── Cluster gravity (XY) + Z gravity toward 0 ────────────────────────
      nodes.forEach(n=>{
        const cx=n.group===0?W*0.27:n.group===1?W*0.73:W*0.50;
        n.vx+=(cx-n.x)*GRAVITY; n.vy+=(H*0.5-n.y)*GRAVITY;
        n.vz+=(-n.z)*Z_GRAVITY;
      });

      // ── Integrate: damping + slow sinusoidal drift ────────────────────────
      nodes.forEach(n=>{
        // Coupled cos/sin at same freq+phase = slow circular orbit per node
        // Each node churns at its own speed — "thick fluid" effect
        n.vx=n.vx*DAMP + Math.cos(t*n.freq + n.phase)*DRIFT;
        n.vy=n.vy*DAMP + Math.sin(t*n.freq + n.phase)*DRIFT;
        n.vz=n.vz*Z_DAMP + Math.sin(t*n.zFreq+n.zPhase    )*Z_DRIFT;
        n.x+=n.vx; n.y+=n.vy; n.z+=n.vz;
        const r=BASE_R*n.size;
        n.x=Math.max(r+3,Math.min(W-r-3,n.x));
        n.y=Math.max(r+3,Math.min(H-r-3,n.y));
        n.z=Math.max(-1,Math.min(1,n.z));
      });

      // ── Render ───────────────────────────────────────────────────────────
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);

      // Z-sorted draw order (back → front)
      const sorted=[...nodes].sort((a,b)=>a.z-b.z);
      const mx=mouseRef.current.x, my=mouseRef.current.y;

      // Hovered node — use projected radius for hit test
      let hov=null;
      nodes.forEach(n=>{
        const pr=BASE_R*n.size*pScale(n.z);
        if(Math.hypot(n.x-mx,n.y-my)<pr) hov=n;
      });
      const conn=new Set();
      if(hov) EDGES.forEach(([a,b])=>{ if(a===hov.id||b===hov.id){conn.add(a);conn.add(b);} });

      // ── Draw edges (before nodes so all orbs float on top) ───────────────
      EDGES.forEach(([aId,bId])=>{
        const a=nm[aId],b=nm[bId]; if(!a||!b) return;
        const hl=hov&&(hov.id===aId||hov.id===bId);
        // Depth-blend alpha: lines between far-back nodes are more transparent
        const avgZ=(a.z+b.z)*0.5;
        const depthAlpha=0.55+avgZ*0.25; // 0.30 when both far back, 0.80 near
        const baseAlpha=hl?0.92:depthAlpha*0.28;
        const lw=hl?2.5:1.5;
        // Gradient from node-A color to node-B color
        const lg=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        lg.addColorStop(0, hexAlpha(C1(a.group), baseAlpha));
        lg.addColorStop(1, hexAlpha(C1(b.group), baseAlpha));
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=lg; ctx.lineWidth=lw; ctx.stroke();
      });

      // ── Draw nodes back→front (3-D depth sorting) ────────────────────────
      sorted.forEach(n=>{
        const ps=pScale(n.z);
        const r=BASE_R*n.size*ps;    // projected radius
        const isH=hov&&hov.id===n.id;
        const isC=hov&&conn.has(n.id)&&!isH;
        const fade=hov&&!isH&&!isC;
        const dr=isH?r*1.1:r;
        // Subtle radial gradient
        const grad=ctx.createRadialGradient(n.x,n.y-dr*0.12,0,n.x,n.y,dr);
        grad.addColorStop(0,C1(n.group)); grad.addColorStop(1,C2(n.group));
        ctx.shadowBlur=isH?14:isC?5:0; ctx.shadowColor=C1(n.group);
        ctx.globalAlpha=fade?0.28:1;
        ctx.beginPath(); ctx.arc(n.x,n.y,dr,0,Math.PI*2);
        ctx.fillStyle=grad; ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=isH?1.5:1; ctx.stroke();
        ctx.shadowBlur=0;
        // Label — scale font with depth
        const lines=n.label.split('\n'), fs=Math.max(7,Math.min(11,dr*0.36));
        ctx.font='700 '+fs+'px Inter,system-ui,sans-serif';
        ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.textAlign='center'; ctx.textBaseline='middle';
        const lh=fs*1.2, sy=n.y-((lines.length-1)*lh)/2;
        lines.forEach((ln,i)=>ctx.fillText(ln,n.x,sy+i*lh));
        ctx.globalAlpha=1;
      });

      // ── Tooltip ──────────────────────────────────────────────────────────
      if(tooltipRef.current){
        if(hov){
          tooltipRef.current.textContent=hov.label.replace('\n',' ');
          tooltipRef.current.style.display='block';
          tooltipRef.current.style.left=(Math.min(mx+14,W-150))+'px';
          tooltipRef.current.style.top=(Math.max(my-38,6))+'px';
        } else { tooltipRef.current.style.display='none'; }
      }
      rafRef.current=requestAnimationFrame(frame);
    };
    rafRef.current=requestAnimationFrame(frame);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, [colorMode, isDark]);

  const handleMouseMove = useCallback((e) => {
    const rect=canvasRef.current?.getBoundingClientRect();
    if(rect) mouseRef.current={x:e.clientX-rect.left,y:e.clientY-rect.top};
  },[]);
  const handleMouseLeave = useCallback(()=>{
    mouseRef.current={x:-9999,y:-9999};
    if(tooltipRef.current) tooltipRef.current.style.display="none";
  },[]);

  const bgGrad = isDark
    ? "linear-gradient(135deg, #0d1117 0%, #0f0d1a 100%)"
    : "linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%)";

  return (
    <Box position="relative" w="100%" h="540px" overflow="visible">
      <canvas ref={canvasRef}
        style={{width:"100%",height:"100%",display:"block",cursor:"crosshair"}}
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        role="img"
        aria-label="Interactive skills network. Blue orbs: Labor Relations. Purple orbs: Digital Media. Teal orbs: Bridge Skills connecting both careers. Hover to highlight connections."
      />
      <div ref={tooltipRef} style={{display:"none",position:"absolute",
        background:"rgba(26,32,44,0.94)",color:"white",fontSize:"0.72rem",fontWeight:"700",
        padding:"0.3rem 0.65rem",borderRadius:"6px",pointerEvents:"none",zIndex:10,
        whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(0,0,0,0.3)",letterSpacing:"0.01em"}} />
      <Box position="absolute" bottom="0.85rem" left="50%" transform="translateX(-50%)"
        display="flex" gap="1.1rem" px="1rem" py="0.4rem" borderRadius="full" backdropFilter="blur(10px)"
        bg={isDark?"rgba(0,0,0,0.55)":"rgba(255,255,255,0.78)"}
        border="1px solid" borderColor={isDark?"whiteAlpha.100":"blackAlpha.100"}>
        {[{color:"#63B3ED",label:"Labor Relations"},{color:"#B794F4",label:"Digital & Media"},{color:"#76E4F7",label:"Bridge Skills"}]
          .map(({color,label})=>(
            <Box key={label} display="flex" alignItems="center" gap="0.35rem">
              <Box w="7px" h="7px" borderRadius="full" bg={color} flexShrink={0} style={{boxShadow:'0 0 6px '+color}} />
              <Text fontSize="0.63rem" fontWeight="700" opacity={0.8} whiteSpace="nowrap">{label}</Text>
            </Box>
          ))}
      </Box>
      <Box position="absolute" top="0.85rem" right="0.85rem">
        <Text fontSize="0.62rem" color={isDark?"whiteAlpha.400":"blackAlpha.400"} fontWeight="600">Hover to explore connections</Text>
      </Box>
      <Box as="ul" position="absolute" width="1px" height="1px" overflow="hidden"
        style={{clip:"rect(0,0,0,0)",whiteSpace:"nowrap",margin:"-1px",padding:0,border:0}}>
        {NODES.map(n=>(
          <li key={n.id}>{n.label.replace("\n"," ")} — {n.group===0?"Labor Relations":n.group===1?"Digital Media":"Bridge Skill"}</li>
        ))}
      </Box>
    </Box>
  );
}
