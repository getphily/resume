import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

target = """                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Rating</span>
                  <div className="mt-0.5 relative group inline-block w-fit cursor-pointer" onClick={() => updateData({ explicit: data.explicit === 'Yes' ? 'No' : 'Yes' })}>
                    {data.explicit === 'Yes' ? (
                      <Badge variant="destructive" className="px-2 py-0 text-[10px]">Explicit</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 px-2 py-0 text-[10px]">Clean</Badge>
                    )}
                  </div>
                </div>"""

replacement = """                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Rating</span>
                  <div className="flex gap-2 mt-0.5">
                    <Badge 
                      variant={(data.explicit === 'Clean' || data.explicit === 'No') ? "secondary" : "outline"} 
                      className={cn("cursor-pointer px-3 py-0.5 text-[10px]", (data.explicit === 'Clean' || data.explicit === 'No') ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "opacity-50 hover:opacity-100")}
                      onClick={() => updateData({ explicit: 'Clean' })}
                    >
                      Clean
                    </Badge>
                    <Badge 
                      variant={(data.explicit === 'Explicit' || data.explicit === 'Yes') ? "destructive" : "outline"} 
                      className={cn("cursor-pointer px-3 py-0.5 text-[10px]", (data.explicit === 'Explicit' || data.explicit === 'Yes') ? "" : "opacity-50 hover:opacity-100")}
                      onClick={() => updateData({ explicit: 'Explicit' })}
                    >
                      Explicit
                    </Badge>
                  </div>
                </div>"""

content = content.replace(target, replacement)

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)
