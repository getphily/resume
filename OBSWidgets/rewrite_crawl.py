import re

with open("src/app/(app)/crawl/page.tsx.bak", "r") as f:
    original = f.read()

# We will just write a whole new page.tsx using the components from the original file.
# The original file has many properties components: TitleProperties, SubheaderProperties, etc.
# We will extract everything UP TO `function ChyronBuilderContent() {`
idx = original.find("function ChyronBuilderContent() {")
components_part = original[:idx]

# We also need to extract `ChyronBuilder` from the bottom.
# And we will write a new `ChyronStudioContent`.

new_code = components_part + """
import { StudioShell } from '@/components/StudioShell';

function ChyronStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [session, setSession] = useState<any>(null);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [config, setConfig] = useState<ChyronConfig>(DEFAULT_CHYRON_CONFIG);
  
  const [selectedLayer, setSelectedLayer] = useState<string | null>('crawl');
  const [selectedPanel, setSelectedPanel] = useState<'layer' | 'layout' | 'export' | 'crawlBlocks'>('layer');
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isCrawlExpanded, setIsCrawlExpanded] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (queryId && session) {
        const { data } = await supabase.from('widget_configs').select('id, config').eq('id', queryId).single();
        if (data) {
          setActiveConfigId(data.id);
          setConfig(data.config as ChyronConfig);
        } else {
          toast.error('Chyron not found.');
          router.push('/dashboard');
        }
      } else {
        setConfig({ ...DEFAULT_CHYRON_CONFIG, name: 'New Chyron Widget' });
      }
      setIsInitializing(false);
    });
  }, [queryId, router]);

  useEffect(() => {
    if (!activeConfigId || !session || isInitializing) return;
    const saveConfig = async () => {
      setSaving(true);
      await supabase.from('widget_configs').update({ config }).eq('id', activeConfigId);
      setSaving(false);
    };
    const debounceTimer = setTimeout(() => { saveConfig(); }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [config, activeConfigId, session, isInitializing]);

  const handleManualSave = async () => {
    if (!session) {
      toast.error('Please sign in to save widgets.');
      router.push('/auth');
      return;
    }
    setSaving(true);
    if (activeConfigId) {
      await supabase.from('widget_configs').update({ config }).eq('id', activeConfigId);
      toast.success('Chyron saved!');
    } else {
      const { data, error } = await supabase.from('widget_configs').insert({
        user_id: session.user.id,
        widget_type: 'crawl',
        config
      }).select('id').single();
      
      if (error) {
        toast.error('Failed to create chyron.');
      } else if (data) {
        setActiveConfigId(data.id);
        toast.success('New chyron created!');
        router.replace(`/crawl?id=${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!activeConfigId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/widgets/embed/crawl?id=${activeConfigId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    toast.success('Widget URL copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    
    if (type === 'CRAWL_BLOCK') {
      const reorderedBlocks = Array.from(config.crawl.blocks);
      const [movedBlock] = reorderedBlocks.splice(source.index, 1);
      reorderedBlocks.splice(destination.index, 0, movedBlock);
      setConfig({ ...config, crawl: { ...config.crawl, blocks: reorderedBlocks } });
    } else {
      const newOrder = Array.from(config.layerOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      setConfig({ ...config, layerOrder: newOrder });
    }
  };

  const toggleBlockEnabled = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfig({
      ...config,
      crawl: {
        ...config.crawl,
        blocks: config.crawl.blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b)
      }
    });
  };

  const addBlockFromSidebar = () => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      label: `News Item ${config.crawl.blocks.length + 1}`,
      text: '',
      enabled: true,
      color: '#ffffff'
    };
    setConfig({
      ...config,
      crawl: {
        ...config.crawl,
        blocks: [...config.crawl.blocks, newBlock]
      }
    });
    setSelectedLayer(`crawlBlock:${newBlock.id}`);
    setIsCrawlExpanded(true);
    toast.success('Added news block');
  };

  const settingsPanel = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 p-1 bg-muted rounded-md shrink-0">
        <button
          type="button"
          onClick={() => setSelectedPanel('layer')}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'layer' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Layers
        </button>
        <button
          type="button"
          onClick={() => { setSelectedPanel('layout'); setSelectedLayer(null); }}
          className={cn("py-1.5 flex-1 text-xs font-semibold rounded-sm transition-all", selectedPanel === 'layout' ? "bg-background shadow-2xs text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Global Layout
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {selectedPanel === 'layer' && (
          <div className="flex flex-col gap-2 bg-muted/20 border border-border rounded-lg p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Composition
            </span>
            <Droppable droppableId="layers-list" type="LAYER">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col">
                  {['title', 'subheader', 'crawl', 'logo', 'clock']
                    .sort((a, b) => {
                      const idxA = config.layerOrder.indexOf(a as any);
                      const idxB = config.layerOrder.indexOf(b as any);
                      if (idxA === -1 && idxB === -1) return 0;
                      if (idxA === -1) return 1;
                      if (idxB === -1) return -1;
                      return idxA - idxB;
                    })
                    .map((layerId, i) => {
                      const key = layerId as keyof Pick<ChyronConfig, 'title' | 'subheader' | 'logo' | 'clock' | 'crawl'>;
                      const layer = config[key];
                      const isEnabled = layer && 'enabled' in layer ? layer.enabled : true;
                      const isSelected = selectedPanel === 'layer' && selectedLayer === layerId;

                      return (
                        <Draggable key={layerId} draggableId={layerId} index={i}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={cn(snapshot.isDragging && "z-50 shadow-lg rounded-md bg-card ring-1 ring-border")}
                            >
                              <div
                                onClick={() => { setSelectedLayer(layerId); setSelectedPanel('layer'); }}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors border-l-2",
                                  isSelected ? "bg-primary/10 border-primary text-primary" : snapshot.isDragging ? "bg-muted/80 border-transparent text-foreground" : "hover:bg-muted/40 border-transparent text-foreground",
                                  !isEnabled && "bg-muted/50 text-muted-foreground"
                                )}
                              >
                                <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab min-w-[20px]">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                </div>
                                <span className="flex-1 text-xs font-semibold capitalize">{layerId}</span>
                              </div>
                              {layerId === 'crawl' && (
                                <div className={cn("ml-8 pl-2 border-l border-border mt-1 flex flex-col gap-1", !isCrawlExpanded && "hidden")}>
                                  <Droppable droppableId="crawl-blocks" type="CRAWL_BLOCK">
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col">
                                        {config.crawl.blocks.map((block, idx) => {
                                          const isBlockActive = selectedLayer === `crawlBlock:${block.id}`;
                                          return (
                                            <Draggable key={block.id} draggableId={block.id} index={idx}>
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  style={provided.draggableProps.style}
                                                >
                                                  <div
                                                    onClick={(e) => { e.stopPropagation(); setSelectedLayer(`crawlBlock:${block.id}`); setSelectedPanel('layer'); }}
                                                    className={cn("flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs transition-colors rounded-sm", isBlockActive ? "bg-primary/20 text-primary" : "hover:bg-muted", !block.enabled && "opacity-50")}
                                                  >
                                                    <div {...provided.dragHandleProps} className="cursor-grab shrink-0 text-muted-foreground">
                                                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                                    </div>
                                                    <button onClick={(e) => toggleBlockEnabled(block.id, e)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                                      {block.enabled ? 'O' : '-'}
                                                    </button>
                                                    <span className="truncate">{block.label || 'Unnamed'}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          );
                                        })}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                  <button onClick={(e) => { e.stopPropagation(); addBlockFromSidebar(); }} className="text-xs text-primary hover:underline self-start mt-1 px-2">+ Add Block</button>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </DragDropContext>

      <div className="flex-1 min-h-[400px]">
        {selectedPanel === 'layer' && selectedLayer === 'title' && <TitleProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'subheader' && <SubheaderProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'logo' && <LogoProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'clock' && <ClockProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer === 'crawl' && <CrawlProperties config={config} onChange={setConfig} />}
        {selectedPanel === 'layer' && selectedLayer?.startsWith('crawlBlock:') && <CrawlBlockProperties config={config} onChange={setConfig} blockId={selectedLayer.replace('crawlBlock:', '')} />}
        {selectedPanel === 'layout' && <LayoutProperties config={config} onChange={setConfig} />}
      </div>
    </div>
  );

  const previewCanvas = (
    <div className="w-full h-full flex items-end justify-center pb-8 px-4 overflow-hidden">
      <div className="w-full max-w-5xl shadow-2xl rounded-xl border border-border/50 overflow-hidden relative" style={{aspectRatio: '1920/200'}}>
         <ChyronCardPreview config={config} />
      </div>
    </div>
  );

  if (isInitializing) return <div className="p-10 text-sm text-muted-foreground">Loading Chyron Studio...</div>;

  return (
    <StudioShell
      title="Chyron Studio"
      icon={<Layers className="w-4 h-4" />}
      widgetName={config.name || ''}
      onNameChange={(n) => setConfig({ ...config, name: n })}
      onSave={handleManualSave}
      isSaving={saving}
      hasId={!!activeConfigId}
      onCopyUrl={handleCopy}
      copySuccess={copySuccess}
      settingsPanel={settingsPanel}
      previewCanvas={previewCanvas}
    />
  );
}

export default function ChyronBuilder() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading studio...</div>}>
      <ChyronStudioContent />
    </Suspense>
  );
}
"""

with open("src/app/(app)/crawl/page.tsx", "w") as f:
    f.write(new_code)
