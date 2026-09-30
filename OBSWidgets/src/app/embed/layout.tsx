export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { background-color: transparent !important; }
      `}} />
      {children}
    </>
  );
}
