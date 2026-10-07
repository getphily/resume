import os

with open('src/app/(app)/podcast-tools/page.tsx', 'r') as f:
    content = f.read()

# Add tertiaryCategory to PodcastData
if "tertiaryCategory: string;" not in content:
    content = content.replace(
        "secondaryCategory: string;",
        "secondaryCategory: string;\n  tertiaryCategory: string;"
    )
    content = content.replace(
        "secondaryCategory: '',",
        "secondaryCategory: '',\n  tertiaryCategory: '',"
    )

# Add APPLE_PODCAST_CATEGORIES list
categories_list = """
const APPLE_CATEGORIES = [
  "Arts", "Arts: Books", "Arts: Design", "Arts: Fashion & Beauty", "Arts: Food", "Arts: Performing Arts", "Arts: Visual Arts",
  "Business", "Business: Careers", "Business: Entrepreneurship", "Business: Investing", "Business: Management", "Business: Marketing", "Business: Non-Profit",
  "Comedy", "Comedy: Comedy Interviews", "Comedy: Improv", "Comedy: Stand-Up",
  "Education", "Education: Courses", "Education: How To", "Education: Language Learning", "Education: Self-Improvement",
  "Fiction", "Fiction: Comedy Fiction", "Fiction: Drama", "Fiction: Science Fiction",
  "Government",
  "History",
  "Health & Fitness", "Health & Fitness: Alternative Health", "Health & Fitness: Fitness", "Health & Fitness: Medicine", "Health & Fitness: Mental Health", "Health & Fitness: Nutrition", "Health & Fitness: Sexuality",
  "Kids & Family", "Kids & Family: Education for Kids", "Kids & Family: Parenting", "Kids & Family: Pets & Animals", "Kids & Family: Stories for Kids",
  "Leisure", "Leisure: Animation & Manga", "Leisure: Automotive", "Leisure: Aviation", "Leisure: Crafts", "Leisure: Games", "Leisure: Hobbies", "Leisure: Home & Garden", "Leisure: Video Games",
  "Music", "Music: Music Commentary", "Music: Music History", "Music: Music Interviews",
  "News", "News: Business News", "News: Daily News", "News: Entertainment News", "News: News Commentary", "News: Politics", "News: Sports News", "News: Tech News",
  "Religion & Spirituality", "Religion & Spirituality: Buddhism", "Religion & Spirituality: Christianity", "Religion & Spirituality: Hinduism", "Religion & Spirituality: Islam", "Religion & Spirituality: Judaism", "Religion & Spirituality: Religion", "Religion & Spirituality: Spirituality",
  "Science", "Science: Astronomy", "Science: Chemistry", "Science: Earth Sciences", "Science: Life Sciences", "Science: Mathematics", "Science: Natural Sciences", "Science: Nature", "Science: Physics", "Science: Social Sciences",
  "Society & Culture", "Society & Culture: Documentary", "Society & Culture: Personal Journals", "Society & Culture: Philosophy", "Society & Culture: Places & Travel", "Society & Culture: Relationships",
  "Sports", "Sports: Baseball", "Sports: Basketball", "Sports: Cricket", "Sports: Fantasy Sports", "Sports: Football", "Sports: Golf", "Sports: Hockey", "Sports: Rugby", "Sports: Soccer", "Sports: Swimming", "Sports: Tennis", "Sports: Volleyball", "Sports: Wilderness", "Sports: Wrestling",
  "Technology",
  "True Crime"
];

function CategoryDropdown({ value, onSave, label }: { value: string, onSave: (v: string) => void, label: string }) {
  return (
    <select 
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className="bg-muted/20 border border-border/50 rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none max-w-full"
    >
      <option value="">{label}</option>
      {APPLE_CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
"""

if "const APPLE_CATEGORIES =" not in content:
    content = content.replace(
        "const coursesList =",
        categories_list + "\nconst coursesList ="
    )

# Replace the categories UI block
ui_target = """                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <div className="relative group inline-block">
                      {data.primaryCategory && <Badge variant="secondary" className="px-2 py-0 text-[10px]">{data.primaryCategory}</Badge>}
                      <EditableField 
                        value={data.primaryCategory}
                        onSave={(v) => updateData({ primaryCategory: v })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="relative group inline-block">
                      {data.secondaryCategory ? (
                         <Badge variant="outline" className="px-2 py-0 text-[10px]">{data.secondaryCategory}</Badge>
                      ) : (
                         <Badge variant="outline" className="px-2 py-0 text-[10px] border-dashed opacity-50">+ Add Category</Badge>
                      )}
                      <EditableField 
                        value={data.secondaryCategory}
                        onSave={(v) => updateData({ secondaryCategory: v })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>"""

ui_replacement = """                <div className="flex flex-col gap-2 col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                  <div className="flex flex-col gap-2 mt-0.5">
                    <CategoryDropdown 
                      value={data.primaryCategory} 
                      onSave={(v) => updateData({ primaryCategory: v })} 
                      label="Select Primary Category" 
                    />
                    <CategoryDropdown 
                      value={data.secondaryCategory} 
                      onSave={(v) => updateData({ secondaryCategory: v })} 
                      label="Select Secondary Category (Optional)" 
                    />
                    <CategoryDropdown 
                      value={data.tertiaryCategory} 
                      onSave={(v) => updateData({ tertiaryCategory: v })} 
                      label="Select Tertiary Category (Optional)" 
                    />
                  </div>
                </div>"""

if "CategoryDropdown" in content and "CategoryDropdown \n" not in content: # It is already in content from above
    content = content.replace(ui_target, ui_replacement)

# Make sure language also uses a select dropdown, or leave it as editable text
# For now, just fix categories.

with open('src/app/(app)/podcast-tools/page.tsx', 'w') as f:
    f.write(content)

