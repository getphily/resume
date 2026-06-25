import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Styles ───────────────────────────────────────────────────────────────────
const c = {
  root: { minHeight:'100vh', background:'linear-gradient(135deg,#07091a 0%,#0d1225 60%,#07091a 100%)', color:'#e2e8f0', fontFamily:"'Inter',-apple-system,sans-serif" },
  loginWrap: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' },
  loginBox: { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'2.5rem', width:'100%', maxWidth:'380px' },
  h1: { fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 0.3rem' },
  sub: { fontSize:'0.85rem', color:'#64748b', marginBottom:'1.8rem' },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.75rem 1rem', color:'#e2e8f0', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  select: { width:'100%', background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.7rem 1rem', color:'#e2e8f0', fontSize:'0.88rem', outline:'none', boxSizing:'border-box' },
  textarea: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.7rem 1rem', color:'#e2e8f0', fontSize:'0.88rem', outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:'70px' },
  btn: { padding:'0.7rem 1.4rem', borderRadius:'10px', border:'none', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', transition:'all 0.2s' },
  btnPrimary: { background:'linear-gradient(135deg,#4299e1,#667eea)', color:'#fff' },
  btnGhost: { background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' },
  btnDanger: { background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' },
  btnSm: { padding:'0.3rem 0.7rem', fontSize:'0.75rem' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.9rem 2rem', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', position:'sticky', top:0, zIndex:50 },
  logo: { fontSize:'1.1rem', fontWeight:800 },
  tabBar: { display:'flex', gap:'0.4rem', padding:'1.25rem 2rem 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  tab: { padding:'0.55rem 1.1rem', borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', transition:'all 0.2s' },
  tabOn: { background:'rgba(66,153,225,0.15)', color:'#60a5fa', borderBottom:'2px solid #60a5fa' },
  tabOff: { background:'transparent', color:'#475569' },
  page: { padding:'2rem', maxWidth:'1200px', margin:'0 auto' },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden' },
  label: { display:'block', fontSize:'0.7rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.35rem' },
  pill: { display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.6rem', borderRadius:'999px', fontSize:'0.73rem', background:'rgba(96,165,250,0.15)', color:'#93c5fd', border:'1px solid rgba(96,165,250,0.25)', margin:'0.15rem' },
  err: { color:'#f87171', fontSize:'0.82rem' },
  ok: { color:'#4ade80', fontSize:'0.82rem' },
  sectionTitle: { fontSize:'0.72rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 1rem' },
};

// ─── Admin fetch helper ───────────────────────────────────────────────────────
function af(url, opts={}, pwd) {
  return fetch(url, { ...opts, headers:{ 'x-admin-password':pwd, ...(opts.headers||{}) } });
}

// ─── EXIF extraction via exifr (no Nominatim — avoids blocking batch uploads) ──
async function extractMeta(file) {
  if (!file.type.startsWith('image/')) return {};
  try {
    const exifr = (await import('exifr')).default;
    const raw = await exifr.parse(file, {
      gps: true, iptc: true, xmp: true, ifd0: true,
      pick: ['latitude','longitude','Caption','caption',
             'ImageDescription','description','Keywords','keywords','Subject','subject',
             'City','State','Country'],
    });
    if (!raw) return {};
    const lat = raw.latitude ?? null;
    const lng = raw.longitude ?? null;
    const caption = raw.Caption ?? raw.caption ?? raw.ImageDescription ?? raw.description ?? '';
    const kwRaw = raw.Keywords ?? raw.keywords ?? raw.Subject ?? raw.subject ?? [];
    const keywords = Array.isArray(kwRaw) ? kwRaw : (kwRaw ? [kwRaw] : []);
    // Location label from IPTC only — no external geocoding calls
    const locParts = [raw.City, raw.State, raw.Country].filter(Boolean);
    const locationLabel = locParts.length ? locParts.join(', ') : '';
    return { caption, keywords, lat, lng, locationLabel };
  } catch { return {}; }
}

// Concurrency-limited async map (avoids flooding browser with parallel EXIF reads)
async function pMap(items, fn, concurrency = 4) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [pwd,    setPwd]    = useState('');
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminPwd') || null);
  const [err,    setErr]    = useState('');
  const [tab,    setTab]    = useState('media');

  async function login(e) {
    e.preventDefault(); setErr('');
    const res = await fetch('/api/admin/auth', { method:'POST', headers:{ 'x-admin-password': pwd } });
    if (res.ok) { sessionStorage.setItem('adminPwd', pwd); setAuthed(pwd); }
    else setErr('Invalid password');
  }

  if (!authed) return (
    <div style={c.root}>
      <div style={c.loginWrap}>
        <div style={c.loginBox}>
          <div style={c.h1}>🗂 Admin</div>
          <div style={c.sub}>Media Library &amp; Settings</div>
          <form onSubmit={login}>
            <input style={{...c.input, marginBottom:'1rem'}} type="password"
              placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} autoFocus />
            {err && <div style={{...c.err, marginBottom:'0.75rem'}}>{err}</div>}
            <button type="submit" style={{...c.btn, ...c.btnPrimary, width:'100%'}}>Sign In →</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div style={c.root}>
      <header style={c.header}>
        <span style={c.logo}>🗂 Admin</span>
        <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
          <span style={{color:'#475569', fontSize:'0.8rem'}}>Signed in</span>
          <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}}
            onClick={()=>{ sessionStorage.removeItem('adminPwd'); setAuthed(null); }}>Sign Out</button>
        </div>
      </header>
      <div style={c.tabBar}>
        {[
          ['media','📁 Media Library'],
          ['employers','🏢 Employers'],
          ['education','🎓 Education'],
          ['slides','🎴 Slides'],
          ['settings','⚙️ Settings']
        ].map(([id,label])=>(
          <button key={id} style={{...c.tab, ...(tab===id?c.tabOn:c.tabOff)}} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>
      <div style={c.page}>
        {tab==='media'      && <MediaLibrary pwd={authed} />}
        {tab==='employers'  && <EmployersManager pwd={authed} />}
        {tab==='education'  && <EducationManager pwd={authed} />}
        {tab==='slides'     && <SlidesManager pwd={authed} />}
        {tab==='settings'   && <SettingsPanel pwd={authed} />}
      </div>
    </div>
  );
}

// ─── Media Library ────────────────────────────────────────────────────────────
function MediaLibrary({ pwd }) {
  const [queue,    setQueue]    = useState([]); // files pending upload
  const [assets,   setAssets]   = useState([]);
  const [jobs,     setJobs]     = useState([]);
  const [dragging, setDragging] = useState(false);
  const [globalJob, setGlobalJob] = useState(''); // "apply to all" job
  const [uploading, setUploading] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [msg,      setMsg]      = useState({ type:'', text:'' });
  const [filter,    setFilter]    = useState('all');
  const [queuePage,  setQueuePage]  = useState(20);
  const [bulkMode,    setBulkMode]    = useState(false);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkJob,     setBulkJob]     = useState('');
  const [bulkMsg,     setBulkMsg]     = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkKwInput,  setBulkKwInput]  = useState('');      // raw comma-separated input
  const [bulkKwMode,   setBulkKwMode]   = useState('append'); // 'append' | 'replace'
  const fileRef = useRef();

  useEffect(()=>{ loadAssets(); loadJobs(); }, []);

  async function loadAssets() {
    const res = await af('/api/media', {}, pwd);
    if (res.ok) setAssets(await res.json());
  }
  async function loadJobs() {
    const res = await fetch('/api/timeline');
    if (res.ok) setJobs(await res.json());
  }

  // ── Add files to queue (with concurrency-limited EXIF + one batch state update) ─
  async function addFiles(files) {
    const arr = Array.from(files);
    // Only create object URL previews for first 20 to limit memory
    const placeholders = arr.map((f, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      file: f,
      preview: (i < 20 && f.type.startsWith('image/')) ? URL.createObjectURL(f) : null,
      meta: { caption:'', keywords:[], lat:'', lng:'', locationLabel:'', jobId:'' },
      extracting: true,
      status: 'pending',
    }));
    setQueue(q => [...q, ...placeholders]);

    // Extract EXIF for all files with concurrency=4, then do ONE batch state update
    const extracted = await pMap(placeholders, async item => ({
      id: item.id,
      meta: await extractMeta(item.file),
    }));

    const metaMap = Object.fromEntries(extracted.map(r => [r.id, r.meta]));
    setQueue(q => q.map(x => {
      const m = metaMap[x.id];
      if (!m) return x;
      return {
        ...x,
        extracting: false,
        meta: {
          caption: m.caption || '',
          keywords: m.keywords || [],
          lat: m.lat ?? '',
          lng: m.lng ?? '',
          locationLabel: m.locationLabel || '',
          jobId: '',
        },
      };
    }));
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }
  function onFileInput(e) { if (e.target.files.length) addFiles(e.target.files); }

  function updateQueueItem(id, field, value) {
    setQueue(q => q.map(x => x.id!==id ? x : { ...x, meta:{ ...x.meta, [field]:value } }));
  }
  function removeFromQueue(id) {
    setQueue(q => {
      const item = q.find(x=>x.id===id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return q.filter(x=>x.id!==id);
    });
  }

  // ── Apply global job to all pending ─────────────────────────────────────────
  function applyGlobalJob() {
    setQueue(q => q.map(x => x.status==='pending' ? {...x, meta:{...x.meta, jobId:globalJob}} : x));
  }

  // ── Upload all pending ───────────────────────────────────────────────────────
  async function uploadAll() {
    const pending = queue.filter(x => x.status === 'pending');
    if (!pending.length) return;
    setUploading(true); setMsg({ type:'', text:'' });

    for (const item of pending) {
      setQueue(q => q.map(x => x.id===item.id ? {...x, status:'uploading'} : x));
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('caption',        item.meta.caption);
      fd.append('keywords',       item.meta.keywords.join(','));
      fd.append('location_label', item.meta.locationLabel);
      fd.append('location_lat',   item.meta.lat ?? '');
      fd.append('location_lng',   item.meta.lng ?? '');
      fd.append('timeline_job_id', item.meta.jobId || '');

      const res = await af('/api/admin/media/upload', { method:'POST', body:fd }, pwd);
      if (res.ok) {
        setQueue(q => q.map(x => x.id===item.id ? {...x, status:'done'} : x));
      } else {
        const errData = await res.json().catch(()=>({error:'Upload failed'}));
        setQueue(q => q.map(x => x.id===item.id ? {...x, status:'error', error:errData.error} : x));
      }
    }
    setUploading(false);
    await loadAssets();
    // Clear done items after a moment
    setTimeout(()=>setQueue(q=>q.filter(x=>x.status!=='done')), 2000);
    setMsg({ type:'ok', text:`Uploaded ${pending.length} file(s)` });
  }

  // ── Delete asset ─────────────────────────────────────────────────────
  async function handleDelete(id) {
    // no confirm() here — AssetCard handles inline two-step confirm
    const res = await af(`/api/admin/media/${id}`, { method:'DELETE' }, pwd);
    if (res.ok) setAssets(a=>a.filter(x=>x.id!==id));
  }

  // ── Filtered view ────────────────────────────────────────────────────────────
  const displayed = assets.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return !a.timeline_job_id;
    return a.timeline_job_id === filter;
  });

  const pendingCount = queue.filter(x=>x.status==='pending').length;

  // ── Bulk-assign handler ─────────────────────────────────────────────────────
  async function bulkAssign() {
    if (selectedIds.size === 0) return;
    setBulkMsg('');
    const keywords = bulkKwInput.split(',').map(k=>k.trim()).filter(Boolean);
    const res = await af('/api/admin/media/bulk-assign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: [...selectedIds],
        jobId: bulkJob || undefined,
        keywords: keywords.length ? keywords : undefined,
        keywordMode: bulkKwMode,
      }),
    }, pwd);
    if (res.ok) {
      const { updated } = await res.json();
      setBulkMsg(`✓ ${updated} asset${updated!==1?'s':''} updated`);
      setSelectedIds(new Set());
      setBulkMode(false);
      setBulkKwInput('');
      loadAssets();
    } else {
      const e = await res.json();
      setBulkMsg(`Error: ${e.error}`);
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() { setSelectedIds(new Set(displayed.map(a => a.id))); }
  function clearSelection() { setSelectedIds(new Set()); setBulkDeleting(false); setBulkKwInput(''); }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!bulkDeleting) { setBulkDeleting(true); return; } // first click: ask confirm
    setBulkDeleting(false);
    setBulkMsg('');
    const res = await af('/api/admin/media/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selectedIds] }),
    }, pwd);
    if (res.ok) {
      const { deleted } = await res.json();
      setBulkMsg(`✓ ${deleted} asset${deleted!==1?'s':''} deleted`);
      setSelectedIds(new Set());
      setBulkMode(false);
      loadAssets();
    } else {
      const e = await res.json();
      setBulkMsg(`Error: ${e.error}`);
    }
  }

  return (
    <div>
      {/* ── Drop zone ── */}
      <div
        style={{ border:`2px dashed ${dragging?'#60a5fa':'rgba(96,165,250,0.3)'}`,
          borderRadius:'16px', padding:'2.5rem 2rem', textAlign:'center', cursor:'pointer',
          background: dragging?'rgba(96,165,250,0.05)':'transparent', transition:'all 0.2s',
          marginBottom: queue.length ? '1.5rem' : '2rem' }}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={onDrop}
        onClick={()=>fileRef.current.click()}
      >
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,application/pdf"
          style={{display:'none'}} onChange={onFileInput} />
        <div style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>📁</div>
        <div style={{fontWeight:700, fontSize:'1rem', marginBottom:'0.25rem'}}>Drop files or click to browse</div>
        <div style={{fontSize:'0.8rem', color:'#475569'}}>Images, Videos, PDFs · Multiple files supported · Up to 50 MB each</div>
        <div style={{fontSize:'0.75rem', color:'#334155', marginTop:'0.4rem'}}>EXIF metadata (GPS, caption, keywords) will be auto-extracted from images</div>
      </div>

      {/* ── Upload queue ── */}
      {queue.length > 0 && (
        <div style={{marginBottom:'2.5rem'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
            <div style={c.sectionTitle}>{queue.length} file{queue.length!==1?'s':''} in queue</div>
            <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap'}}>
              {/* Apply to all shortcut */}
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                <select style={{...c.select, width:'auto', fontSize:'0.8rem', padding:'0.4rem 0.75rem'}}
                  value={globalJob} onChange={e=>setGlobalJob(e.target.value)}>
                  <option value="">Assign all to job…</option>
                  {jobs.map(j=><option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
                </select>
                <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}} onClick={applyGlobalJob}>Apply</button>
              </div>
              {pendingCount > 0 && (
                <button style={{...c.btn, ...c.btnPrimary}} onClick={uploadAll} disabled={uploading}>
                  {uploading ? 'Uploading…' : `⬆ Upload ${pendingCount} file${pendingCount!==1?'s':''}`}
                </button>
              )}
              <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}} onClick={()=>setQueue([])}>Clear All</button>
            </div>
          </div>

          {msg.text && <div style={{...(msg.type==='ok'?c.ok:c.err), marginBottom:'0.75rem'}}>{msg.text}</div>}

          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
            {queue.slice(0, queuePage).map(item => <QueueItem key={item.id} item={item} jobs={jobs}
              onChange={(f,v)=>updateQueueItem(item.id,f,v)}
              onRemove={()=>removeFromQueue(item.id)} />)}
          </div>
          {queue.length > queuePage && (
            <button style={{...c.btn, ...c.btnGhost, width:'100%', marginTop:'0.75rem', fontSize:'0.8rem'}}
              onClick={() => setQueuePage(p => p + 20)}>
              Show {Math.min(20, queue.length - queuePage)} more ({queue.length - queuePage} remaining)
            </button>
          )}
        </div>
      )}

      {/* ── Library filter bar ── */}
      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap', alignItems:'center'}}>
        <div style={c.sectionTitle}>Library ({assets.length})</div>
        <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', marginLeft:'auto', alignItems:'center'}}>
          {[['all','All'],['unassigned','Unassigned'],...jobs.map(j=>[j.id, j.company])].map(([id,label])=>(
            <button key={id} style={{
              ...c.btn, ...c.btnSm,
              background: filter===id ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter===id ? '#60a5fa' : '#64748b',
              border: `1px solid ${filter===id?'rgba(96,165,250,0.4)':'rgba(255,255,255,0.08)'}`,
            }} onClick={()=>setFilter(id)}>{label}</button>
          ))}
          <button style={{
            ...c.btn, ...c.btnSm,
            background: bulkMode ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.04)',
            color: bulkMode ? '#60a5fa' : '#64748b',
            border: `1px solid ${bulkMode ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
            marginLeft: '0.5rem',
          }} onClick={()=>{ setBulkMode(m=>!m); clearSelection(); setBulkMsg(''); }}>
            {bulkMode ? '✕ Cancel' : '☑ Select'}
          </button>
        </div>
      </div>

      {/* ── Bulk toolbar — visible when bulkMode ── */}
      {bulkMode && (
        <div style={{
          background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.25)',
          borderRadius:'12px', padding:'0.9rem 1.2rem', marginBottom:'1.25rem',
          display:'flex', flexDirection:'column', gap:'0.75rem',
        }}>
          {/* Row 1: count + job assign + delete */}
          <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap'}}>
            <span style={{fontSize:'0.82rem', fontWeight:700, color:'#60a5fa', minWidth:'80px'}}>
              {selectedIds.size} selected
            </span>
            <select style={{...c.select, flex:1, minWidth:'180px', maxWidth:'260px', fontSize:'0.8rem', padding:'0.4rem 0.75rem'}}
              value={bulkJob} onChange={e=>setBulkJob(e.target.value)}>
              <option value=''>— Job (no change) —</option>
              <option value='__clear__'>Clear assignment</option>
              {jobs.map(j=><option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
            </select>
            <button style={{...c.btn, ...c.btnPrimary, ...c.btnSm}}
              onClick={bulkAssign} disabled={selectedIds.size===0}>
              Apply to {selectedIds.size > 0 ? selectedIds.size : ''} selected
            </button>
            {bulkDeleting ? (
              <>
                <span style={{fontSize:'0.8rem', color:'#f87171', fontWeight:600}}>
                  Delete {selectedIds.size} file{selectedIds.size!==1?'s':''}? Cannot be undone.
                </span>
                <button style={{...c.btn, ...c.btnDanger, ...c.btnSm}} onClick={bulkDelete}>✓ Confirm</button>
                <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}} onClick={()=>setBulkDeleting(false)}>Cancel</button>
              </>
            ) : (
              <button style={{...c.btn, ...c.btnDanger, ...c.btnSm}}
                onClick={bulkDelete} disabled={selectedIds.size===0}>
                🗑 Delete {selectedIds.size > 0 ? selectedIds.size : ''}
              </button>
            )}
            <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}} onClick={selectAll}>Select all ({displayed.length})</button>
            <button style={{...c.btn, ...c.btnGhost, ...c.btnSm}} onClick={clearSelection}>Clear</button>
          </div>

          {/* Row 2: keywords */}
          <div style={{display:'flex', gap:'0.6rem', alignItems:'center', flexWrap:'wrap',
            paddingTop:'0.65rem', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <span style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, whiteSpace:'nowrap'}}>
              Keywords:
            </span>
            <input
              style={{...c.input, flex:1, minWidth:'200px', fontSize:'0.8rem', padding:'0.4rem 0.75rem'}}
              placeholder="tag1, tag2, tag3 — comma separated"
              value={bulkKwInput}
              onChange={e=>setBulkKwInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter' && bulkAssign()}
            />
            <div style={{display:'flex', gap:'0.35rem'}}>
              {['append','replace'].map(mode=>(
                <button key={mode}
                  style={{
                    ...c.btn, ...c.btnSm,
                    background: bulkKwMode===mode ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
                    color: bulkKwMode===mode ? '#60a5fa' : '#64748b',
                    border: `1px solid ${bulkKwMode===mode?'rgba(96,165,250,0.4)':'rgba(255,255,255,0.08)'}`,
                    textTransform:'capitalize',
                  }}
                  onClick={()=>setBulkKwMode(mode)}>
                  {mode}
                </button>
              ))}
            </div>
            <span style={{fontSize:'0.68rem', color:'#334155'}}>
              {bulkKwMode==='append' ? 'Add to existing keywords' : 'Replace all keywords'}
            </span>
          </div>

          {bulkMsg && <span style={{fontSize:'0.8rem', color: bulkMsg.startsWith('✓') ? '#4ade80' : '#f87171'}}>{bulkMsg}</span>}
        </div>
      )}

      {/* ── Asset grid ── */}
      {displayed.length === 0 ? (
        <div style={{textAlign:'center', padding:'4rem', color:'#334155'}}>
          {filter==='unassigned' ? 'No unassigned assets.' : 'No assets yet — upload files above.'}
        </div>
      ) : (
        <div style={{columns:'4 220px', columnGap:'0.75rem'}}>
          {displayed.map(asset=>(
            <div key={asset.id} style={{position:'relative', breakInside:'avoid', marginBottom:'0.75rem'}}>
              {/* Checkbox overlay in bulk mode */}
              {bulkMode && (
                <div
                  onClick={()=>toggleSelect(asset.id)}
                  style={{
                    position:'absolute', inset:0, zIndex:5, cursor:'pointer', borderRadius:'12px',
                    background: selectedIds.has(asset.id) ? 'rgba(96,165,250,0.18)' : 'transparent',
                    border: selectedIds.has(asset.id) ? '2px solid #60a5fa' : '2px solid transparent',
                    transition:'all 0.15s ease',
                  }}
                >
                  <div style={{
                    position:'absolute', top:'0.55rem', left:'0.55rem',
                    width:'20px', height:'20px', borderRadius:'5px',
                    background: selectedIds.has(asset.id) ? '#3b82f6' : 'rgba(0,0,0,0.55)',
                    border: `2px solid ${selectedIds.has(asset.id) ? '#3b82f6' : 'rgba(255,255,255,0.4)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.75rem', color:'white', fontWeight:700, transition:'all 0.15s',
                  }}>
                    {selectedIds.has(asset.id) ? '✓' : ''}
                  </div>
                </div>
              )}
              <AssetCard asset={asset} jobs={jobs} pwd={pwd}
                isEditing={!bulkMode && editId===asset.id}
                setEditing={bulkMode ? ()=>{} : setEditId}
                onDelete={handleDelete} onSaved={loadAssets} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Queue Item ───────────────────────────────────────────────────────────────
function QueueItem({ item, jobs, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [kwInput,  setKwInput]  = useState('');

  const statusColor = { pending:'#60a5fa', uploading:'#f59e0b', done:'#4ade80', error:'#f87171' }[item.status];
  const statusLabel = { pending:'Pending', uploading:'Uploading…', done:'Done ✓', error:'Error' }[item.status];

  function addKw() {
    const k = kwInput.trim();
    if (k && !item.meta.keywords.includes(k)) onChange('keywords', [...item.meta.keywords, k]);
    setKwInput('');
  }

  return (
    <div style={{ ...c.card, borderLeft:`3px solid ${statusColor}` }}>
      <div style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', cursor:'pointer'}}
        onClick={()=>item.status==='pending'&&setExpanded(e=>!e)}>
        {/* Thumbnail */}
        {item.preview
          ? <img src={item.preview} alt="" style={{width:'52px', height:'52px', objectFit:'cover', borderRadius:'8px', flexShrink:0}} />
          : <div style={{width:'52px', height:'52px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0}}>
              {item.file.type.startsWith('video/')? '🎬' : '📄'}
            </div>
        }
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.file.name}</div>
          <div style={{display:'flex', gap:'0.5rem', marginTop:'0.2rem', alignItems:'center', flexWrap:'wrap'}}>
            <span style={{fontSize:'0.72rem', color:statusColor, fontWeight:600}}>{statusLabel}</span>
            {item.extracting && <span style={{fontSize:'0.7rem', color:'#475569'}}>Reading metadata…</span>}
            {item.meta.jobId && <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>{jobs.find(j=>j.id===item.meta.jobId)?.company}</span>}
            {!item.meta.jobId && <span style={{fontSize:'0.7rem', color:'#334155'}}>Unassigned</span>}
            {item.meta.caption && <span style={{fontSize:'0.7rem', color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px'}}>{item.meta.caption}</span>}
          </div>
        </div>
        <div style={{display:'flex', gap:'0.4rem', flexShrink:0}}>
          {item.status==='pending' && <span style={{fontSize:'0.7rem', color:'#475569'}}>{expanded?'▲ less':'▼ edit'}</span>}
          {item.error && <span style={{fontSize:'0.72rem', color:'#f87171'}} title={item.error}>⚠ {item.error.slice(0,30)}</span>}
          <button style={{...c.btn, ...c.btnDanger, ...c.btnSm}} onClick={e=>{e.stopPropagation();onRemove();}}>✕</button>
        </div>
      </div>

      {/* Editable fields — shown when expanded */}
      {expanded && item.status==='pending' && (
        <div style={{padding:'0 1rem 1rem', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginTop:'0.75rem'}}>
            {/* Job */}
            <div style={{gridColumn:'1/-1'}}>
              <label style={c.label}>Job Assignment <span style={{color:'#334155', textTransform:'none', fontSize:'0.68rem'}}>(optional — can assign later)</span></label>
              <select style={c.select} value={item.meta.jobId} onChange={e=>onChange('jobId',e.target.value)}>
                <option value="">— Unassigned —</option>
                {jobs.map(j=><option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
              </select>
            </div>
            {/* Caption */}
            <div style={{gridColumn:'1/-1'}}>
              <label style={c.label}>Caption</label>
              <textarea style={c.textarea} value={item.meta.caption} onChange={e=>onChange('caption',e.target.value)} placeholder="Describe this asset…" />
            </div>
            {/* Keywords */}
            <div style={{gridColumn:'1/-1'}}>
              <label style={c.label}>Keywords</label>
              <div style={{display:'flex', gap:'0.5rem', marginBottom:'0.4rem'}}>
                <input style={{...c.input, flex:1}} placeholder="Add keyword…" value={kwInput}
                  onChange={e=>setKwInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addKw();}}} />
                <button type="button" style={{...c.btn,...c.btnGhost,...c.btnSm}} onClick={addKw}>Add</button>
              </div>
              {item.meta.keywords.map(kw=>(
                <span key={kw} style={c.pill}>{kw}
                  <span style={{cursor:'pointer',opacity:0.6}} onClick={()=>onChange('keywords',item.meta.keywords.filter(k=>k!==kw))}>✕</span>
                </span>
              ))}
            </div>
            {/* Location label */}
            <div>
              <label style={c.label}>Location</label>
              <input style={c.input} value={item.meta.locationLabel} onChange={e=>onChange('locationLabel',e.target.value)} placeholder="City, State" />
            </div>
            {/* Lat/Lng */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
              <div>
                <label style={c.label}>Lat</label>
                <input style={c.input} type="number" step="any" value={item.meta.lat} onChange={e=>onChange('lat',e.target.value)} placeholder="37.77" />
              </div>
              <div>
                <label style={c.label}>Lng</label>
                <input style={c.input} type="number" step="any" value={item.meta.lng} onChange={e=>onChange('lng',e.target.value)} placeholder="-122.41" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────
function AssetCard({ asset, jobs, pwd, isEditing, setEditing, onDelete, onSaved }) {
  const [form, setForm] = useState({
    caption: asset.caption||'', keywords:(asset.keywords||[]).join(', '),
    timeline_job_id: asset.timeline_job_id||'',
    location_label: asset.location_label||'',
    location_lat: asset.location_lat||'', location_lng: asset.location_lng||'',
  });
  const [confirmDel, setConfirmDel] = useState(false);
  const job = jobs.find(j=>j.id===asset.timeline_job_id);

  async function save() {
    const res = await af(`/api/admin/media/${asset.id}`, {
      method:'PATCH', headers:{'content-type':'application/json'},
      body: JSON.stringify({ ...form, keywords: form.keywords }),
    }, pwd);
    if (res.ok) { onSaved(); setEditing(null); }
  }

  return (
    <div style={{...c.card, marginBottom:'0.75rem', breakInside:'avoid'}}>
      {asset.file_type==='image' && <img src={asset.public_url} alt={asset.caption||asset.filename} style={{width:'100%', display:'block'}} loading="lazy" />}
      {asset.file_type==='video' && <video src={asset.public_url} style={{width:'100%', display:'block', maxHeight:'180px', objectFit:'cover'}} controls />}
      {asset.file_type==='pdf'   && <div style={{height:'70px', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.08)', fontSize:'1.8rem'}}>📄</div>}
      <div style={{padding:'0.7rem 0.85rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:'0.4rem'}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:'0.78rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{asset.filename}</div>
            {job
              ? <span style={{display:'inline-block', marginTop:'0.25rem', padding:'0.15rem 0.5rem', borderRadius:'999px', fontSize:'0.68rem', fontWeight:600, background:'rgba(96,165,250,0.15)', color:'#93c5fd'}}>{job.company}</span>
              : <span style={{display:'inline-block', marginTop:'0.25rem', padding:'0.15rem 0.5rem', borderRadius:'999px', fontSize:'0.68rem', fontWeight:500, background:'rgba(255,255,255,0.05)', color:'#475569'}}>Unassigned</span>
            }
            {asset.caption && <div style={{fontSize:'0.73rem', color:'#64748b', marginTop:'0.3rem', lineHeight:1.35}}>{asset.caption}</div>}
          </div>
          <div style={{display:'flex', gap:'0.3rem', flexShrink:0, alignItems:'center'}}>
            <button style={{...c.btn,...c.btnGhost,...c.btnSm}} onClick={()=>setEditing(isEditing?null:asset.id)}>{isEditing?'Close':'✏️'}</button>
            {confirmDel ? (
              <>
                <button style={{...c.btn,...c.btnDanger,...c.btnSm, fontSize:'0.72rem', padding:'0.3rem 0.5rem'}}
                  onClick={()=>onDelete(asset.id)}>
                  Sure?
                </button>
                <button style={{...c.btn,...c.btnGhost,...c.btnSm, fontSize:'0.72rem', padding:'0.3rem 0.4rem'}}
                  onClick={()=>setConfirmDel(false)}>
                  ✕
                </button>
              </>
            ) : (
              <button style={{...c.btn,...c.btnDanger,...c.btnSm}} onClick={()=>setConfirmDel(true)}>🗑</button>
            )}
          </div>
        </div>
        {isEditing && (
          <div style={{marginTop:'0.75rem', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
            <div>
              <label style={c.label}>Job <span style={{textTransform:'none', fontSize:'0.67rem', color:'#334155'}}>(optional)</span></label>
              <select style={c.select} value={form.timeline_job_id} onChange={e=>setForm(f=>({...f,timeline_job_id:e.target.value}))}>
                <option value="">— Unassigned —</option>
                {jobs.map(j=><option key={j.id} value={j.id}>{j.role} @ {j.company}</option>)}
              </select>
            </div>
            <div>
              <label style={c.label}>Caption</label>
              <textarea style={{...c.textarea, minHeight:'55px', fontSize:'0.8rem'}} value={form.caption} onChange={e=>setForm(f=>({...f,caption:e.target.value}))} />
            </div>
            <div>
              <label style={c.label}>Keywords (comma-separated)</label>
              <input style={c.input} value={form.keywords} onChange={e=>setForm(f=>({...f,keywords:e.target.value}))} />
            </div>
            <div>
              <label style={c.label}>Location</label>
              <input style={c.input} value={form.location_label} onChange={e=>setForm(f=>({...f,location_label:e.target.value}))} />
            </div>
            <button style={{...c.btn,...c.btnPrimary, fontSize:'0.8rem', padding:'0.5rem 1rem', alignSelf:'flex-start'}} onClick={save}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsPanel({ pwd }) {
  const [cur,  setCur]  = useState('');
  const [nw,   setNw]   = useState('');
  const [conf, setConf] = useState('');
  const [msg,  setMsg]  = useState({ type:'', text:'' });

  const [slogan, setSlogan] = useState('');
  const [sloganMsg, setSloganMsg] = useState({ type:'', text:'' });
  const [loadingSlogan, setLoadingSlogan] = useState(true);

  useEffect(() => {
    async function loadSlogan() {
      try {
        const res = await fetch('/api/slogan');
        if (res.ok) {
          const d = await res.json();
          setSlogan(d.slogan || '');
        }
      } catch (err) {
        console.error('Failed to load slogan:', err);
      } finally {
        setLoadingSlogan(false);
      }
    }
    loadSlogan();
  }, []);

  async function updateSlogan(e) {
    e.preventDefault();
    setSloganMsg({ type:'', text:'' });
    try {
      const res = await af('/api/admin/slogan', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slogan }),
      }, pwd);
      if (res.ok) {
        setSloganMsg({ type: 'ok', text: 'Slogan updated successfully.' });
      } else {
        const d = await res.json().catch(() => ({ error: 'Failed' }));
        setSloganMsg({ type: 'err', text: d.error || 'Failed to update slogan' });
      }
    } catch (err) {
      setSloganMsg({ type: 'err', text: err.message });
    }
  }

  async function change(e) {
    e.preventDefault(); setMsg({ type:'', text:'' });
    if (nw !== conf) return setMsg({ type:'err', text:'Passwords do not match' });
    if (nw.length < 8) return setMsg({ type:'err', text:'Minimum 8 characters' });
    const res = await af('/api/admin/password', {
      method:'PUT', headers:{'content-type':'application/json','x-admin-password':cur||pwd},
      body: JSON.stringify({ newPassword:nw }),
    }, cur||pwd);
    if (res.ok) {
      sessionStorage.setItem('adminPwd', nw);
      setMsg({ type:'ok', text:'Password updated. Still signed in.' });
      setCur(''); setNw(''); setConf('');
    } else {
      const d = await res.json().catch(()=>({error:'Failed'}));
      setMsg({ type:'err', text: d.error });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '420px' }}>
      <div>
        <div style={{fontWeight:700, fontSize:'1.1rem', marginBottom:'0.3rem'}}>Resume Slogan</div>
        <div style={{color:'#475569', fontSize:'0.85rem', marginBottom:'1.5rem'}}>Displayed prominently under your name on the homepage.</div>
        <form onSubmit={updateSlogan} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div>
            <label style={c.label}>Slogan / Tagline</label>
            <input
              style={c.input}
              type="text"
              placeholder="e.g. Strategic Campaigns, Labor Representation & Digital Organizing"
              value={slogan}
              onChange={e=>setSlogan(e.target.value)}
              disabled={loadingSlogan}
            />
          </div>
          {sloganMsg.text && <div style={sloganMsg.type==='ok'?c.ok:c.err}>{sloganMsg.text}</div>}
          <button type="submit" style={{...c.btn,...c.btnPrimary, alignSelf:'flex-start'}} disabled={loadingSlogan}>
            Update Slogan
          </button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5rem' }}>
        <div style={{fontWeight:700, fontSize:'1.1rem', marginBottom:'0.3rem'}}>Change Password</div>
        <div style={{color:'#475569', fontSize:'0.85rem', marginBottom:'2rem'}}>Stored as a bcrypt hash — never in plain text.</div>
        <form onSubmit={change} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          {[['Current',cur,setCur],['New Password (≥8 chars)',nw,setNw],['Confirm New',conf,setConf]].map(([label,val,setter])=>(
            <div key={label}>
              <label style={c.label}>{label}</label>
              <input style={c.input} type="password" value={val} onChange={e=>setter(e.target.value)} />
            </div>
          ))}
          {msg.text && <div style={msg.type==='ok'?c.ok:c.err}>{msg.text}</div>}
          <button type="submit" style={{...c.btn,...c.btnPrimary, alignSelf:'flex-start'}}>Update Password</button>
        </form>
      </div>
    </div>
  );
}

// ─── Employers Manager ────────────────────────────────────────────────────────
function EmployersManager({ pwd }) {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Employer Form State
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  // Edit State
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const INDUSTRIES = [
    'Transportation & Logistics',
    'Education',
    'Automotive Services',
    'Food & Beverage',
    'Manufacturing & Construction',
    'Non-Profit / Cultural',
    'Media & Publishing',
    'Facilities & Services',
    'Environmental & Waste Management',
    'Government',
    'Energy & Utilities',
    'Agriculture',
    'Retail & Distribution',
    'Financial & Administrative Services',
    'Production Companies & Studio Entities'
  ];

  const LOCATIONS = [
    'Alameda, CA',
    'Bay Area Region, CA',
    'Bay Area, CA',
    'Berkeley & San Leandro, CA',
    'Brisbane, CA',
    'Burlingame, CA',
    'Colma / Daly City Area, CA',
    'Colma, CA',
    'Corte Madera, CA',
    'Geyserville, CA',
    'Hayward, CA',
    'Lake County, CA',
    'Los Angeles, CA',
    'Manhattan Beach, CA',
    'Marin County, CA',
    'Martinez, CA',
    'Menlo Park, CA',
    'Mill Valley / Marin County, CA',
    'Newark, Brisbane, and San Rafael, CA',
    'Newark, CA',
    'North Bay Area, CA',
    'North Bay Regional Network, CA',
    'Northern California Region',
    'Oakland, CA',
    'Petaluma, CA',
    'Redwood City & San Jose, CA',
    'Redwood City, CA',
    'Regional Distribution Hubs, CA',
    'Rohnert Park, CA',
    'San Francisco / Bay Area, CA',
    'San Francisco, CA',
    'San Mateo / East Bay / North Bay Regions, CA',
    'San Rafael, CA',
    'Santa Rosa / North Bay, CA',
    'Santa Rosa, CA',
    'Santa Rosa/San Jose, CA',
    'Sonoma County, CA (Rohnert Park / Cotati)',
    'Sonoma County, CA (Santa Rosa & Petaluma)',
    'Sonoma and Marin Counties, CA',
    'Sonoma, CA',
    'South San Francisco, CA',
    'Ukiah, CA'
  ];

  const loadEmployers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employers');
      if (res.ok) {
        setEmployers(await res.json());
      } else {
        setError('Failed to load employers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployers();
  }, [loadEmployers]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddMsg({ type: '', text: '' });
    if (!newName || !newIndustry || !newLocation) {
      setAddMsg({ type: 'err', text: 'All fields are required' });
      return;
    }
    try {
      const res = await af('/api/admin/employers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newName, industry: newIndustry, location: newLocation })
      }, pwd);
      if (res.ok) {
        setNewName('');
        setNewIndustry('');
        setNewLocation('');
        setAddMsg({ type: 'ok', text: 'Employer added successfully!' });
        loadEmployers();
      } else {
        const d = await res.json();
        setAddMsg({ type: 'err', text: d.error || 'Failed to add employer' });
      }
    } catch (err) {
      setAddMsg({ type: 'err', text: err.message });
    }
  }

  async function handleSaveEdit(id) {
    setEditMsg({ type: '', text: '' });
    if (!editName || !editIndustry || !editLocation) {
      setEditMsg({ type: 'err', text: 'All fields are required' });
      return;
    }
    try {
      const res = await af(`/api/admin/employers/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: editName, industry: editIndustry, location: editLocation })
      }, pwd);
      if (res.ok) {
        setEditId(null);
        loadEmployers();
      } else {
        const d = await res.json();
        setEditMsg({ type: 'err', text: d.error || 'Failed to update' });
      }
    } catch (err) {
      setEditMsg({ type: 'err', text: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      const res = await af(`/api/admin/employers/${id}`, {
        method: 'DELETE'
      }, pwd);
      if (res.ok) {
        setDeleteConfirmId(null);
        loadEmployers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(emp) {
    setEditId(emp.id);
    setEditName(emp.name);
    setEditIndustry(emp.industry);
    setEditLocation(emp.location);
    setEditMsg({ type: '', text: '' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Add Employer Card */}
      <div style={{ ...c.card, padding: '2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>🏢 Add New Employer</div>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={c.label}>Employer Name</label>
            <input style={c.input} type="text" placeholder="e.g. Acme Corp" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div>
            <label style={c.label}>Industry</label>
            <select style={c.select} value={newIndustry} onChange={e => setNewIndustry(e.target.value)}>
              <option value="">-- Select Industry --</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={c.label}>Location Mapping</label>
            <select style={c.select} value={newLocation} onChange={e => setNewLocation(e.target.value)}>
              <option value="">-- Select Map Region --</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ ...c.btn, ...c.btnPrimary }}>+ Add</button>
        </form>
        {addMsg.text && <div style={{ mt: '1rem', ...(addMsg.type === 'ok' ? c.ok : c.err), marginTop: '0.75rem' }}>{addMsg.text}</div>}
      </div>

      {/* Employers List Table */}
      <div style={{ ...c.card, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Employer Accounts Represented</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{employers.length} total records</span>
        </div>

        {loading ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading employers...</div>
        ) : error ? (
          <div style={c.err}>{error}</div>
        ) : employers.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No employers found. Add one above.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Industry</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Location (Map Coordinate)</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map(emp => {
                  const isEditing = editId === emp.id;
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem', color: '#475569' }}>{emp.id}</td>
                      <td style={{ padding: '1rem' }}>
                        {isEditing ? (
                          <input style={c.input} type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{emp.name}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {isEditing ? (
                          <select style={c.select} value={editIndustry} onChange={e => setEditIndustry(e.target.value)}>
                            {INDUSTRIES.map(ind => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 650 }}>{emp.industry}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {isEditing ? (
                          <select style={c.select} value={editLocation} onChange={e => setEditLocation(e.target.value)}>
                            {LOCATIONS.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>{emp.location}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveEdit(emp.id)} style={{ ...c.btn, ...c.btnPrimary, ...c.btnSm }}>Save</button>
                              <button onClick={() => setEditId(null)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(emp)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Edit</button>
                              {deleteConfirmId === emp.id ? (
                                <>
                                  <button onClick={() => handleDelete(emp.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm }}>Confirm</button>
                                  <button onClick={() => setDeleteConfirmId(null)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Cancel</button>
                                </>
                              ) : (
                                <button onClick={() => setDeleteConfirmId(emp.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm, background: 'transparent', color: '#f87171' }}>Delete</button>
                              )}
                            </>
                          )}
                        </div>
                        {isEditing && editMsg.text && (
                          <div style={{ ...(editMsg.type === 'ok' ? c.ok : c.err), fontSize: '0.78rem', marginTop: '0.4rem', textAlign: 'right' }}>{editMsg.text}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Education Manager ────────────────────────────────────────────────────────
function EducationManager({ pwd }) {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Education Form State
  const [newInstitution, setNewInstitution] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  // Edit State
  const [editId, setEditId] = useState(null);
  const [editInstitution, setEditInstitution] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadEducation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/education');
      if (res.ok) {
        setEducation(await res.json());
      } else {
        setError('Failed to load education records');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddMsg({ type: '', text: '' });
    if (!newInstitution || !newDetails) {
      setAddMsg({ type: 'err', text: 'All fields are required' });
      return;
    }
    try {
      const res = await af('/api/admin/education', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ institution: newInstitution, details: newDetails })
      }, pwd);
      if (res.ok) {
        setNewInstitution('');
        setNewDetails('');
        setAddMsg({ type: 'ok', text: 'Education record added successfully!' });
        loadEducation();
      } else {
        const d = await res.json();
        setAddMsg({ type: 'err', text: d.error || 'Failed to add education record' });
      }
    } catch (err) {
      setAddMsg({ type: 'err', text: err.message });
    }
  }

  async function handleSaveEdit(id) {
    setEditMsg({ type: '', text: '' });
    if (!editInstitution || !editDetails) {
      setEditMsg({ type: 'err', text: 'All fields are required' });
      return;
    }
    try {
      const res = await af(`/api/admin/education/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ institution: editInstitution, details: editDetails })
      }, pwd);
      if (res.ok) {
        setEditId(null);
        loadEducation();
      } else {
        const d = await res.json();
        setEditMsg({ type: 'err', text: d.error || 'Failed to update' });
      }
    } catch (err) {
      setEditMsg({ type: 'err', text: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      const res = await af(`/api/admin/education/${id}`, {
        method: 'DELETE'
      }, pwd);
      if (res.ok) {
        setDeleteConfirmId(null);
        loadEducation();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(edu) {
    setEditId(edu.id);
    setEditInstitution(edu.institution);
    setEditDetails(edu.details);
    setEditMsg({ type: '', text: '' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Add Education Card */}
      <div style={{ ...c.card, padding: '2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>🎓 Add New Education Card</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={c.label}>Institution / Program Name</label>
            <input style={c.input} type="text" placeholder="e.g. University of California, Berkeley" value={newInstitution} onChange={e => setNewInstitution(e.target.value)} />
          </div>
          <div>
            <label style={c.label}>Details (Degree, dates, or coursework)</label>
            <textarea style={c.textarea} placeholder="e.g. B.A. in Labor Studies, 2018" value={newDetails} onChange={e => setNewDetails(e.target.value)} />
          </div>
          <button type="submit" style={{ ...c.btn, ...c.btnPrimary, alignSelf: 'flex-start' }}>+ Add Education</button>
        </form>
        {addMsg.text && <div style={{ ...(addMsg.type === 'ok' ? c.ok : c.err), marginTop: '0.75rem' }}>{addMsg.text}</div>}
      </div>

      {/* Education List Table */}
      <div style={{ ...c.card, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Education &amp; Credentials</div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{education.length} total records</span>
        </div>

        {loading ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading education records...</div>
        ) : error ? (
          <div style={c.err}>{error}</div>
        ) : education.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No education records found. Add one above.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, width: '80px' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, width: '250px' }}>Institution</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Details</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'right', width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {education.map(edu => {
                  const isEditing = editId === edu.id;
                  return (
                    <tr key={edu.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem', color: '#475569' }}>{edu.id}</td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {isEditing ? (
                          <input style={c.input} type="text" value={editInstitution} onChange={e => setEditInstitution(e.target.value)} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{edu.institution}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {isEditing ? (
                          <textarea style={c.textarea} value={editDetails} onChange={e => setEditDetails(e.target.value)} />
                        ) : (
                          <span style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{edu.details}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveEdit(edu.id)} style={{ ...c.btn, ...c.btnPrimary, ...c.btnSm }}>Save</button>
                              <button onClick={() => setEditId(null)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(edu)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Edit</button>
                              {deleteConfirmId === edu.id ? (
                                <>
                                  <button onClick={() => handleDelete(edu.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm }}>Confirm</button>
                                  <button onClick={() => setDeleteConfirmId(null)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Cancel</button>
                                </>
                              ) : (
                                <button onClick={() => setDeleteConfirmId(edu.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm, background: 'transparent', color: '#f87171' }}>Delete</button>
                              )}
                            </>
                          )}
                        </div>
                        {isEditing && editMsg.text && (
                          <div style={{ ...(editMsg.type === 'ok' ? c.ok : c.err), fontSize: '0.78rem', marginTop: '0.4rem', textAlign: 'right' }}>{editMsg.text}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Slides Manager ──────────────────────────────────────────────────────────
function SlidesManager({ pwd }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState(null);

  // Add Slide Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('markdown');
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  // Edit Slide Form State
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content_type: 'markdown',
    content_data: {},
    is_enabled: true,
    sort_order: 0
  });
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  // Deletion Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const INDUSTRIES = []; // Not used in this manager but keeps env happy if checked

  const INDUSTRIES_COMPAT = [];

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await af('/api/admin/slides', {}, pwd);
      if (res.ok) {
        setSlides(await res.json());
      } else {
        setError('Failed to load slides');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pwd]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddMsg({ type: '', text: '' });
    if (!newTitle) {
      setAddMsg({ type: 'err', text: 'Title is required' });
      return;
    }

    const defaultData = newType === 'markdown'
      ? { lead: 'Lead paragraph...', body: 'Body paragraph...' }
      : [
          { year: 1969, title: 'Born', details: 'Born and raised...' },
          { year: 2026, title: 'Today', details: 'Working on full stack web dev...' }
        ];

    try {
      const res = await af('/api/admin/slides', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content_type: newType,
          content_data: defaultData,
          is_enabled: true,
          sort_order: parseInt(newSortOrder) || 0
        })
      }, pwd);

      if (res.ok) {
        setNewTitle('');
        setNewSortOrder('0');
        setAddMsg({ type: 'ok', text: 'Slide created successfully!' });
        loadSlides();
      } else {
        const d = await res.json();
        setAddMsg({ type: 'err', text: d.error || 'Failed to create slide' });
      }
    } catch (err) {
      setAddMsg({ type: 'err', text: err.message });
    }
  }

  async function toggleEnabled(slide) {
    try {
      const res = await af(`/api/admin/slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_enabled: !slide.is_enabled })
      }, pwd);
      if (res.ok) {
        loadSlides();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEdit(e) {
    if (e) e.preventDefault();
    setEditMsg({ type: '', text: '' });
    try {
      const res = await af(`/api/admin/slides/${editId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editForm)
      }, pwd);
      if (res.ok) {
        setEditId(null);
        setEditMsg({ type: 'ok', text: 'Saved!' });
        loadSlides();
      } else {
        const d = await res.json();
        setEditMsg({ type: 'err', text: d.error || 'Failed to update' });
      }
    } catch (err) {
      setEditMsg({ type: 'err', text: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      const res = await af(`/api/admin/slides/${id}`, {
        method: 'DELETE'
      }, pwd);
      if (res.ok) {
        setDeleteConfirmId(null);
        loadSlides();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(slide) {
    setEditId(slide.id);
    setEditForm({
      title: slide.title,
      content_type: slide.content_type,
      content_data: JSON.parse(JSON.stringify(slide.content_data)), // deep clone
      is_enabled: slide.is_enabled,
      sort_order: slide.sort_order
    });
    setEditMsg({ type: '', text: '' });
  }

  async function handleEventImageUpload(idx, file) {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await af('/api/admin/media/upload', {
        method: 'POST',
        body: fd
      }, pwd);
      if (res.ok) {
        const data = await res.json();
        updateTimelineEvent(idx, 'image_url', data.public_url);
      } else {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        alert(err.error || 'Upload failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingIdx(null);
    }
  }

  function updateTimelineEvent(idx, field, value) {
    const copy = [...(Array.isArray(editForm.content_data) ? editForm.content_data : [])];
    copy[idx] = {
      ...copy[idx],
      [field]: field === 'year' ? parseInt(value) || value : value
    };
    setEditForm(prev => ({ ...prev, content_data: copy }));
  }

  function addTimelineEvent() {
    const copy = [...(Array.isArray(editForm.content_data) ? editForm.content_data : [])];
    copy.push({ year: new Date().getFullYear(), title: 'New Event', details: 'Details...', image_url: '' });
    setEditForm(prev => ({ ...prev, content_data: copy }));
  }

  function deleteTimelineEvent(idx) {
    const copy = (Array.isArray(editForm.content_data) ? editForm.content_data : [])
      .filter((_, i) => i !== idx);
    setEditForm(prev => ({ ...prev, content_data: copy }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Creation form */}
      <div style={{ ...c.card, padding: '2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>🎴 Create New Slide</div>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={c.label}>Slide Title</label>
            <input style={c.input} type="text" placeholder="e.g. Personal Journey" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div>
            <label style={c.label}>Content Type</label>
            <select style={c.select} value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="markdown">Markdown Text</option>
              <option value="personal_timeline">Horizontal Personal Timeline</option>
            </select>
          </div>
          <div>
            <label style={c.label}>Sort Order</label>
            <input style={c.input} type="number" value={newSortOrder} onChange={e => setNewSortOrder(e.target.value)} />
          </div>
          <button type="submit" style={{ ...c.btn, ...c.btnPrimary }}>+ Create</button>
        </form>
        {addMsg.text && <div style={{ marginTop: '0.75rem', ...(addMsg.type === 'ok' ? c.ok : c.err) }}>{addMsg.text}</div>}
      </div>

      {/* Grid of slides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Manage Slides</div>
        
        {loading ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading slides...</div>
        ) : error ? (
          <div style={c.err}>{error}</div>
        ) : slides.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No slides found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {slides.map(slide => {
              const isEditing = editId === slide.id;
              return (
                <div key={slide.id} style={{ ...c.card, padding: '1.5rem', border: isEditing ? '1px solid #4299e1' : c.card.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>{slide.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {slide.content_type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={slide.is_enabled} onChange={() => toggleEnabled(slide)} />
                        Enabled
                      </label>

                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Order: <strong>{slide.sort_order}</strong>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={c.label}>Title</label>
                          <input style={c.input} type="text" value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div>
                          <label style={c.label}>Sort Order</label>
                          <input style={c.input} type="number" value={editForm.sort_order} onChange={e => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                        </div>
                      </div>

                      {/* Content editor based on type */}
                      {editForm.content_type === 'markdown' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label style={c.label}>Lead Highlight Paragraph</label>
                            <textarea style={c.textarea} value={editForm.content_data?.lead || ''} onChange={e => setEditForm(prev => ({ ...prev, content_data: { ...prev.content_data, lead: e.target.value } }))} />
                          </div>
                          <div>
                            <label style={c.label}>Body Paragraph</label>
                            <textarea style={c.textarea} value={editForm.content_data?.body || ''} onChange={e => setEditForm(prev => ({ ...prev, content_data: { ...prev.content_data, body: e.target.value } }))} />
                          </div>
                        </div>
                      )}

                      {editForm.content_type === 'personal_timeline' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={c.label}>Timeline Events</label>
                            <button type="button" onClick={addTimelineEvent} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm, color: '#60a5fa', borderColor: 'rgba(96,165,250,0.2)' }}>
                              + Add Event
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {(editForm.content_data || []).map((ev, idx) => (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 2fr 1.5fr auto', gap: '0.75rem', alignItems: 'start', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                  <label style={{ ...c.label, fontSize: '0.62rem' }}>Year</label>
                                  <input style={{ ...c.input, padding: '0.5rem' }} type="number" value={ev.year} onChange={e => updateTimelineEvent(idx, 'year', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...c.label, fontSize: '0.62rem' }}>Event Title</label>
                                  <input style={{ ...c.input, padding: '0.5rem' }} type="text" value={ev.title} onChange={e => updateTimelineEvent(idx, 'title', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...c.label, fontSize: '0.62rem' }}>Description Details</label>
                                  <textarea style={{ ...c.textarea, padding: '0.5rem', minHeight: '38px' }} value={ev.details} onChange={e => updateTimelineEvent(idx, 'details', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ ...c.label, fontSize: '0.62rem' }}>Image Asset</label>
                                  {ev.image_url ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <img src={ev.image_url} alt="thumbnail" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                      <button type="button" onClick={() => updateTimelineEvent(idx, 'image_url', '')} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm, padding: '0.2rem 0.4rem' }}>
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id={`event-file-input-${idx}`}
                                        onChange={e => handleEventImageUpload(idx, e.target.files[0])}
                                        disabled={uploadingIdx !== null}
                                      />
                                      <label
                                        htmlFor={`event-file-input-${idx}`}
                                        style={{
                                          ...c.btn,
                                          ...c.btnGhost,
                                          ...c.btnSm,
                                          display: 'inline-block',
                                          textAlign: 'center',
                                          cursor: uploadingIdx !== null ? 'not-allowed' : 'pointer',
                                          padding: '0.4rem 0.6rem',
                                          width: '100%',
                                          boxSizing: 'border-box'
                                        }}
                                      >
                                        {uploadingIdx === idx ? '...' : 'Upload'}
                                      </label>
                                    </div>
                                  )}
                                </div>
                                <button type="button" onClick={() => deleteTimelineEvent(idx)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm, alignSelf: 'center', background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}>
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" style={{ ...c.btn, ...c.btnPrimary }}>Save Changes</button>
                        <button type="button" onClick={() => setEditId(null)} style={{ ...c.btn, ...c.btnGhost }}>Cancel</button>
                      </div>
                      {editMsg.text && (
                        <div style={editMsg.type === 'ok' ? c.ok : c.err}>{editMsg.text}</div>
                      )}
                    </form>
                  ) : (
                    <div>
                      {slide.content_type === 'markdown' && (
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
                          <p style={{ fontWeight: 600, color: '#e2e8f0', margin: '0 0 0.5rem' }}>{slide.content_data?.lead}</p>
                          <p style={{ margin: 0 }}>{slide.content_data?.body}</p>
                        </div>
                      )}

                      {slide.content_type === 'personal_timeline' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {(slide.content_data || []).map((ev, i) => (
                            <span key={i} style={{ ...c.pill, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              <strong>{ev.year}</strong>: {ev.title}
                              {ev.image_url && (
                                <img src={ev.image_url} alt="" style={{ width: '16px', height: '16px', borderRadius: '3px', objectFit: 'cover' }} />
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem' }}>
                        <button onClick={() => startEdit(slide)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Edit Slide</button>
                        {deleteConfirmId === slide.id ? (
                          <>
                            <button onClick={() => handleDelete(slide.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm }}>Confirm Delete</button>
                            <button onClick={() => setDeleteConfirmId(null)} style={{ ...c.btn, ...c.btnGhost, ...c.btnSm }}>Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(slide.id)} style={{ ...c.btn, ...c.btnDanger, ...c.btnSm, background: 'transparent', color: '#f87171' }}>Delete</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
