const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/crawl/page.tsx', 'utf8');

// 1. Update Higher Level Layer Drag Handle and Toggle Button for accessibility touch targets while preserving look
content = content.replace(
  `{/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps} aria-label="Drag to reorder"
                                    className="text-muted-foreground hover:text-foreground cursor-grab p-0.5"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>

                                  {/* Visibility toggle */}
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); toggleLayer(layerId); }}
                                    className="bg-transparent border-0 cursor-pointer p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label={isEnabled ? \`Hide \${LAYER_LABELS[layerId]}\` : \`Show \${LAYER_LABELS[layerId]}\`}
                                  >`,
  `{/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps} aria-label="Drag to reorder"
                                    className="text-muted-foreground hover:text-foreground cursor-grab min-w-[24px] min-h-[24px] flex items-center justify-center -ml-1"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>

                                  {/* Visibility toggle */}
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); toggleLayer(layerId); }}
                                    className="bg-transparent border-0 cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label={isEnabled ? \`Hide \${LAYER_LABELS[layerId]}\` : \`Show \${LAYER_LABELS[layerId]}\`}
                                  >`
);


// 2. Update Nested Crawl Blocks to match
const oldNestedBlock = `<Draggable key={block.id} draggableId={\`crawlBlock-\${block.id}\`} index={idx}>
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={provided.draggableProps.style}
                                                  >
                                                    <div
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLayer(\`crawlBlock:\${block.id}\`);
                                                        setSelectedPanel('layer');
                                                      }}
                                                      className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors border-l-2 group/cblock",
                                                        isBlockActive
                                                          ? "bg-primary/10 border-primary text-primary font-bold"
                                                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium",
                                                        !block.enabled && "opacity-50"
                                                      )}
                                                    >
                                                      <div
                                                        {...provided.dragHandleProps}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-muted-foreground/30 hover:text-foreground/80 cursor-grab active:cursor-grabbing p-1 -ml-1 flex items-center justify-center rounded-md hover:bg-muted transition-colors opacity-0 group-hover/cblock:opacity-100 focus-within:opacity-100"
                                                        aria-label="Drag to reorder"
                                                      >
                                                        <GripVertical className="w-3 h-3" />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => toggleBlockEnabled(block.id, e)}
                                                        className="bg-transparent border-0 cursor-pointer p-1.5 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 -ml-1"
                                                        title={block.enabled ? "Hide block" : "Show block"}
                                                      >
                                                        {block.enabled ? <Eye className="w-3 h-3 text-success" /> : <EyeOff className="w-3 h-3" />}
                                                      </button>

                                                      <span className="flex-1 truncate">
                                                        {block.label || 'Unnamed Block'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </Draggable>`;

const newNestedBlock = `<Draggable key={block.id} draggableId={\`crawlBlock-\${block.id}\`} index={idx}>
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={provided.draggableProps.style}
                                                  >
                                                    <div
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLayer(\`crawlBlock:\${block.id}\`);
                                                        setSelectedPanel('layer');
                                                      }}
                                                      className={cn(
                                                        "flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors border-l-2",
                                                        isBlockActive
                                                          ? "bg-primary/10 border-primary text-primary"
                                                          : snapshot.isDragging
                                                          ? "bg-muted border-transparent"
                                                          : "hover:bg-muted/40 border-transparent text-foreground",
                                                        !block.enabled && "bg-muted/50 text-muted-foreground"
                                                      )}
                                                    >
                                                      {/* Drag Handle */}
                                                      <div
                                                        {...provided.dragHandleProps}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-muted-foreground hover:text-foreground cursor-grab min-w-[24px] min-h-[24px] flex items-center justify-center -ml-1"
                                                        aria-label="Drag to reorder"
                                                      >
                                                        <GripVertical className="w-3.5 h-3.5" />
                                                      </div>

                                                      {/* Visibility toggle */}
                                                      <button
                                                        type="button"
                                                        onClick={(e) => toggleBlockEnabled(block.id, e)}
                                                        className="bg-transparent border-0 cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                                                        title={block.enabled ? "Hide block" : "Show block"}
                                                      >
                                                        {block.enabled ? <Eye className="w-3.5 h-3.5 text-success" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                      </button>

                                                      {/* Label */}
                                                      <span className="flex-1 text-xs font-semibold truncate">
                                                        {block.label || 'Unnamed Block'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </Draggable>`;

content = content.replace(oldNestedBlock, newNestedBlock);

fs.writeFileSync('src/app/(app)/crawl/page.tsx', content);
