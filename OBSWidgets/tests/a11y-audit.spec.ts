/**
 * Accessibility & layout audit for the exported OBS Widgets studio.
 *
 * Runs against the static export (`npm run build` → `out/`) served at the
 * production basePath (/widgets). Supabase is mocked so authenticated pages
 * render with representative sample data.
 *
 *   npm run build && npx playwright test tests/a11y-audit.spec.ts --project=chromium
 *
 * Results are printed and written to test-results/a11y-report.json.
 * Automated checks cannot prove WCAG conformance; see the manual checklist
 * in the project report.
 */
import { test, type Page, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_TIMER_CONFIG } from '../src/types/timer';
import { DEFAULT_SCREEN_CONFIG } from '../src/types/screen';
import { DEFAULT_CHYRON_CONFIG } from '../src/types/chyron';

const BASE = 'http://localhost:4173/widgets';
const SUPABASE_REF = 'iuorczkkpzdvnlcfrfaj';

const sample = {
  clock: {
    id: 'c1',
    widget_type: 'clock',
    config: {
      name: 'Main Clock', timeFormat: '12HR', timezone: 'LOCAL', showSeconds: true, showDate: false,
      fontFamily: 'Roboto Mono', sizeScale: 1, textColor: '#FF5900', opacity: 100, outline: false,
      dropShadow: false, glow: 'OFF', blinkingColon: false, bgMode: 'SOLID', bgColor: '#0a0a0a',
    },
  },
  timer: { id: 't1', widget_type: 'timer', config: { ...DEFAULT_TIMER_CONFIG, name: 'Starting Countdown' } },
  crawl: { id: 'k1', widget_type: 'crawl', config: { ...DEFAULT_CHYRON_CONFIG, name: 'Evening News' } },
  screen: { id: 's1', widget_type: 'screen', config: { ...DEFAULT_SCREEN_CONFIG, name: 'Stream Screens' } },
};
const allRows = Object.values(sample);

async function mockAuth(context: BrowserContext, theme: string, signedIn: boolean) {
  await context.addInitScript(
    ([ref, themeName, authed]) => {
      localStorage.setItem('theme', themeName as string);
      if (authed) {
        const now = Math.floor(Date.now() / 1000);
        localStorage.setItem(
          `sb-${ref}-auth-token`,
          JSON.stringify({
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            token_type: 'bearer',
            expires_in: 3600 * 24 * 365,
            expires_at: now + 3600 * 24 * 365,
            user: { id: 'u1', aud: 'authenticated', role: 'authenticated', email: 'dj@example.com' },
          })
        );
      }
    },
    [SUPABASE_REF, theme, signedIn]
  );

  await context.route('**/rest/v1/widget_configs**', async (route) => {
    const url = new URL(route.request().url());
    const filter = url.searchParams.get('widget_type') || '';
    let rows = allRows;
    if (filter.startsWith('eq.')) rows = allRows.filter((r) => r.widget_type === filter.slice(3));
    else if (filter.startsWith('in.')) {
      const types = filter.slice(4, -1).split(',');
      rows = allRows.filter((r) => types.includes(r.widget_type));
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(route.request().method() === 'GET' ? rows : []) });
  });
  await context.route('**/rest/v1/profiles**', async (route) => {
    const wantsObject = (route.request().headers()['accept'] || '').includes('vnd.pgrst.object');
    const profile = { id: 'u1', username: 'DJ Philly', avatar_url: '', theme };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wantsObject ? profile : [profile]) });
  });
  await context.route('**/auth/v1/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', aud: 'authenticated', email: 'dj@example.com' }) });
  });
}

const PAGES: { name: string; path: string; authed: boolean; ready: string }[] = [
  { name: 'dashboard', path: '/', authed: true, ready: 'main' },
  { name: 'clock-catalog', path: '/clock/', authed: true, ready: 'main h1' },
  { name: 'clock-editor', path: '/clock/?id=c1', authed: true, ready: 'main' },
  { name: 'timer-catalog', path: '/timer/', authed: true, ready: 'main h1' },
  { name: 'timer-editor', path: '/timer/?id=t1', authed: true, ready: 'main' },
  { name: 'chyron-catalog', path: '/crawl/', authed: true, ready: 'main h1' },
  { name: 'chyron-editor', path: '/crawl/?id=k1', authed: true, ready: 'main' },
  { name: 'screen-catalog', path: '/screen/', authed: true, ready: 'main h1' },
  { name: 'screen-editor', path: '/screen/?id=s1', authed: true, ready: 'main' },
  { name: 'account', path: '/account/', authed: true, ready: 'main h1' },
  { name: 'auth', path: '/auth/', authed: false, ready: 'main' },
];

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 640 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

type Finding = { page: string; viewport: string; theme: string; check: string; detail: unknown };
const OUT_DIR = path.join('test-results', 'a11y-findings');
fs.mkdirSync(OUT_DIR, { recursive: true });
function persist(name: string, findings: Finding[]) {
  fs.writeFileSync(path.join(OUT_DIR, `${name.replace(/[^a-z0-9]+/gi, '_')}.json`), JSON.stringify(findings, null, 2));
}

async function settle(page: Page, ready: string) {
  await page.waitForSelector(ready, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(900); // data fetch + hydration
}

async function measure(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const s = getComputedStyle(el as HTMLElement);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const label = (el: Element) =>
      `${el.tagName.toLowerCase()}${(el as HTMLElement).id ? '#' + (el as HTMLElement).id : ''}[${(
        el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.getAttribute('type') || ''
      ).trim().replace(/\s+/g, ' ').slice(0, 28)}]`;

    // Interactive targets (exclude inline links inside running text)
    const targets = Array.from(
      document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [role=checkbox], [role=slider], [role=combobox]')
    ).filter(visible);
    const below24: string[] = [];
    const below44: string[] = [];
    for (const el of targets) {
      const r = (el as HTMLElement).getBoundingClientRect();
      const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
      if (inline) continue;
      if (r.width < 24 || r.height < 24) below24.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      else if (r.width < 44 || r.height < 44) below44.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }

    // Text smaller than 16px (secondary text floor) – count by distinct size
    const small: Record<string, number> = {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const t = n.textContent?.trim();
      const p = n.parentElement;
      if (!t || !p || !visible(p) || p.closest('[aria-hidden=true], .preview-window-container, script, style')) continue;
      const fs = parseFloat(getComputedStyle(p).fontSize);
      if (fs < 15.99) small[fs.toFixed(1)] = (small[fs.toFixed(1)] || 0) + 1;
    }

    // Clipped text boxes (overflow hidden with content larger than the box)
    const clipped: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const s = getComputedStyle(el as HTMLElement);
      if (!visible(el) || (el as HTMLElement).closest('.preview-window-container')) continue;
      const hides = ['hidden', 'clip'].includes(s.overflowX) || ['hidden', 'clip'].includes(s.overflowY);
      if (!hides || !el.textContent?.trim()) continue;
      const h = el as HTMLElement;
      if (h.scrollHeight > h.clientHeight + 2 || h.scrollWidth > h.clientWidth + 2) {
        const textual = Array.from(el.childNodes).some((c) => c.nodeType === 3 && c.textContent?.trim());
        if (textual || el.tagName === 'BUTTON' || el.tagName === 'INPUT') clipped.push(label(el));
      }
    }

    return {
      overflowX: doc.scrollWidth > doc.clientWidth + 1 ? `${doc.scrollWidth}px > ${doc.clientWidth}px` : null,
      below24,
      below44,
      small,
      clipped: clipped.slice(0, 12),
    };
  });
}

async function checkFocusVisible(page: Page, steps = 14) {
  const bad: string[] = [];
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
      const ring = s.boxShadow && s.boxShadow !== 'none';
      return {
        name: `${el.tagName.toLowerCase()}[${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24)}]`,
        ok: outline || !!ring,
      };
    });
    if (info && !info.ok) bad.push(info.name);
  }
  return bad;
}

const THEME_FOR_FULL = 'light';

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    test(`audit ${pg.name} @ ${vp.name} (${THEME_FOR_FULL})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await mockAuth(context, THEME_FOR_FULL, pg.authed);
      const page = await context.newPage();
      await page.goto(`${BASE}${pg.path}`);
      await settle(page, pg.ready);

      const findings: Finding[] = [];
      const add = (check: string, detail: unknown) => findings.push({ page: pg.name, viewport: vp.name, theme: THEME_FOR_FULL, check, detail });

      // 1. axe-core (WCAG 2.0–2.2 A/AA rules)
      const axe = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      for (const v of axe.violations) {
        add(`axe:${v.id}`, { impact: v.impact, count: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' | ' + (n.any[0]?.message || n.all[0]?.message || n.none[0]?.message || '').slice(0, 140)) });
      }

      // 2. Layout / target / type measurements
      const m = await measure(page);
      if (m.overflowX) add('reflow:horizontal-scroll', m.overflowX);
      if (m.below24.length) add('target-size:<24px', m.below24.slice(0, 10));
      if (m.below44.length) add('target-size:<44px(advisory)', { count: m.below44.length, sample: m.below44.slice(0, 6) });
      if (Object.keys(m.small).length) add('type:<16px text nodes', m.small);
      if (m.clipped.length) add('clipping', m.clipped);

      // 3. Keyboard focus visibility (desktop only; same components everywhere)
      if (vp.name === 'desktop-1280') {
        const bad = await checkFocusVisible(page);
        if (bad.length) add('focus:no-visible-indicator', bad);
      }

      // 4. 200% text size + WCAG text-spacing overrides (1.4.4 / 1.4.12)
      await page.addStyleTag({ content: 'html{font-size:200% !important}' });
      await page.waitForTimeout(150);
      const zoomed = await measure(page);
      if (zoomed.overflowX) add('text-200%:horizontal-scroll', zoomed.overflowX);
      if (zoomed.clipped.length) add('text-200%:clipping', zoomed.clipped);
      await page.addStyleTag({
        content: '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}',
      });
      await page.waitForTimeout(150);
      const spaced = await measure(page);
      if (spaced.clipped.length) add('text-spacing:clipping', spaced.clipped);
      if (spaced.overflowX) add('text-spacing:horizontal-scroll', spaced.overflowX);

      if (process.env.SHOTS) {
        fs.mkdirSync('test-results/shots', { recursive: true });
        await page.screenshot({ path: `test-results/shots/${pg.name}-${vp.name}.png`, fullPage: false });
      }
      persist(`audit-${pg.name}-${vp.name}`, findings);
      await context.close();
    });
  }
}

// Contrast of all retained themes (the app already ships four; verify each).
const THEMES = ['light', 'dark', 'antd-light', 'antd-dark'];
for (const theme of THEMES) {
  for (const pg of PAGES.filter((p) => ['dashboard', 'clock-editor', 'chyron-editor', 'account'].includes(p.name))) {
    test(`contrast ${pg.name} (${theme})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await mockAuth(context, theme, true);
      const page = await context.newPage();
      await page.goto(`${BASE}${pg.path}`);
      await settle(page, pg.ready);
      const findings: Finding[] = [];
      const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      for (const v of axe.violations) {
        findings.push({
          page: pg.name, viewport: 'desktop-1280', theme, check: `axe:${v.id}`,
          detail: { count: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' | ' + (n.any[0]?.message || '').slice(0, 120)) },
        });
      }
      persist(`contrast-${pg.name}-${theme}`, findings);
      await context.close();
    });
  }
}

