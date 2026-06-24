/* ==========================================================================
   PHIL YBARROLAZA RESUME TIMELINE — CLIENT-SIDE INTERACTION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initInfographicDashboard();
  loadDynamicContent();
});

// SVG Icons mapping for client-side rendering of socials without database bloat
const svgIcons = {
  linkedin: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  instagram: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
  youtube: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
  substack: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22.549 3H1.451A1.451 1.451 0 0 0 0 4.451v3.086h24V4.451A1.451 1.451 0 0 0 22.549 3zM0 19.049A1.451 1.451 0 0 0 1.451 20.5h21.098A1.451 1.451 0 0 0 24 19.049v-8.082H0zm0-7.391h24v2.24H0z"/></svg>`,
  tiktok: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.08-1.34v7.94c.03 2.12-.73 4.3-2.39 5.61-1.84 1.52-4.52 1.83-6.66 1.01-2.43-.88-4.22-3.29-4.29-5.91-.06-2.62 1.63-5.13 4.09-6.04 1.12-.42 2.33-.53 3.5-.32v4.11c-.78-.22-1.63-.16-2.35.22-.97.47-1.57 1.54-1.48 2.62.1 1.13.9 2.16 2.01 2.38 1.22.28 2.58-.29 3.03-1.42.22-.54.27-1.14.26-1.72v-14.3z"/></svg>`,
  threads: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10a1 1 0 0 0-2 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8a6 6 0 0 1-6 6c-2.21 0-4-1.79-4-4s1.79-4 4-4a4 4 0 0 1 4 4 1 1 0 0 0 2 0c0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6 4-1.79 4-4c0-4.418-3.582-8-8-8z"/></svg>`,
  twitch: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
  discord: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>`,
  spotify: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm5.494 17.306c-.216.354-.68.468-1.033.252-2.853-1.745-6.444-2.14-10.672-1.173-.404.092-.814-.162-.906-.565-.092-.403.162-.813.565-.905 4.63-1.058 8.59-.61 11.794 1.35.353.216.467.68.252 1.033c-.001.002-.001.002 0 0zm1.467-3.263c-.272.443-.855.584-1.298.312-3.265-2.007-8.243-2.59-12.1-1.417-.497.15-1.022-.13-.173-.627-.15-.497.13-1.022.627-1.172 4.41-1.338 9.9-1.688 13.633.606.444.272.585.855.312 1.298h-.001zm.126-3.41c-3.916-2.325-10.373-2.54-14.128-1.4c-.6.18-1.233-.153-1.414-.753-.18-.6.153-1.234.754-1.414 4.312-1.31 11.432-1.045 15.94 1.63.538.32.716 1.015.397 1.553-.32.538-1.016.717-1.55.398l.001-.004z"/></svg>`,
  merch: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  facebook: `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  email: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
};

const platformTrayClasses = {
  linkedin: 'link-linkedin',
  instagram: 'link-instagram',
  x: 'link-x',
  youtube: 'link-youtube'
};

const platformBadgeClasses = {
  merch: 'store-badge',
  email: 'email-badge',
  linkedin: 'linkedin-badge',
  instagram: 'instagram-badge',
  x: 'x-badge',
  youtube: 'youtube-badge'
};

const mediaMeta = {
  'redwood-empire': {
    title: 'Media Gallery & Production Log',
    notes: 'Photos of the studio mixing boards, editing suites, and podcast interview configurations will be placed here.'
  },
  'seiu-1021': {
    title: 'Bargaining & Field Campaign Records',
    notes: 'Photos documenting contract campaigns, member actions, rallies, and negotiating table assemblies.'
  },
  'teamsters-harris': {
    title: 'Campaign Assets & Digital Metrics',
    notes: 'Digital flyers, campaign headers, video clips, and engagement tracking matrices from the national campaign.'
  },
  'apple': {
    title: 'Workplace Records & Certifications',
    notes: 'Photos from team briefings and product launch deployments.'
  },
  'norcal-pods': {
    title: 'Podcast Logs & Cover Art',
    notes: 'Show covers, audio wave visualization captures, and distribution dashboards.'
  },
  'freelance': {
    title: 'Client Project Snapshots',
    notes: 'Screenshots of stream setups, design portfolios, and branding layouts engineered for independent creators.'
  },
  'healthy-democracy': {
    title: 'Assembly Streaming Configurations',
    notes: 'Photos of remote broadcasting, multi-camera layouts, and video routing stations used for community democratic forums.'
  },
  'teamsters-853': {
    title: 'Labor Actions & Local 853 Media',
    notes: 'Photos of local picket actions, community organizing banners, events, and education packets designed for Local 853.'
  },
  'north-coast-trust': {
    title: 'Trustee & Fiduciary Records',
    notes: 'Photos or documentation snippets regarding health plan designs and benefit coordination boards.'
  },
  'teamsters-665': {
    title: 'Representational Records',
    notes: 'Photos of member assemblies, actions, and local meetings.'
  },
  'teamsters-624': {
    title: 'Executive Office Records',
    notes: 'Photos of the local union hall, press briefings, and board meetings during presidential term.'
  }
};

// Fallback seed data in case Supabase API is down or credentials are unconfigured
const fallbackTimeline = [
  {
    id: 'redwood-empire',
    role: 'Partner / Producer / Editor',
    company: 'Redwood Empire Media',
    location: null,
    date_range: '02/2025 - Present',
    bullets: [
      'Complete in-person and remote video podcast production.',
      'Creation of premium short and long-form video content.',
      'Professional audio and video editing.',
      'Content strategy for individuals and businesses to increase online visibility.'
    ],
    media: [
      { title: 'Studio Recording Setup Photo', req: '1920x1080px (PNG/JPG)' },
      { title: 'Podcast Production Still', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 1
  },
  {
    id: 'seiu-1021',
    role: 'Field Representative',
    company: 'SEIU 1021',
    location: 'Santa Rosa, CA',
    date_range: '07/2023 - 06/2025',
    bullets: [
      'Led contract negotiations for the California Academy of Sciences, developing effective communication strategies.',
      'Bargained contracts and represented union members in public education sectors.',
      'Managed grievance presentation, member defense, and contract enforcement procedures.'
    ],
    media: [
      { title: 'California Academy of Sciences Rally', req: '1920x1080px (PNG/JPG)' },
      { title: 'Bargaining Committee Sessions', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 2
  },
  {
    id: 'teamsters-harris',
    role: 'Director',
    company: 'Teamsters for Harris',
    location: 'National Campaign',
    date_range: '07/2024 - 11/2024',
    bullets: [
      'Led digital organizing campaign, growing online communities by 10,000+ followers on X/Twitter and 3,000+ on Facebook in just two months.',
      'Managed cross-platform ad campaigns (X, Meta, Google) targeting union member recruitment and mobilization.',
      'Created dynamic digital assets, educational videos, and messaging frameworks tailored for labor audiences.',
      'Built a nationwide grassroots coalition leading to local/regional endorsements covering over 1 million union members.'
    ],
    media: [
      { title: 'Campaign Design & Banner Graphics', req: '1920x1080px (PNG/JPG)' },
      { title: 'Ad Campaign Analytics Graph', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 3
  },
  {
    id: 'apple',
    role: 'Specialist',
    company: 'Apple',
    location: 'Corte Madera, CA',
    date_range: '10/2021 - 08/2023',
    bullets: [
      'Maintained 95% customer satisfaction rating through empathetic, clear communication and high-impact troubleshooting.',
      'Developed targeted messaging and educational walkthroughs for a highly diverse consumer demographic.',
      'Leveraged modern technology suites to deliver premium client experiences.'
    ],
    media: [
      { title: 'Apple Store Corte Madera Still', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 4
  },
  {
    id: 'norcal-pods',
    role: 'Content Producer',
    company: 'NorCal Pods',
    location: 'San Francisco Bay Area',
    date_range: '09/2020 - 02/2023',
    bullets: [
      'Produced over 150 podcast episodes, expanding distribution channels to capture thousands of active listeners.',
      'Provided targeted marketing, SEO optimization, and algorithm tuning to maximize audience viewership and engagement.'
    ],
    media: [
      { title: 'NorCal Pods Episode Cover Designs', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 5
  },
  {
    id: 'freelance',
    role: 'Independent Communications Consultant',
    company: 'Freelance',
    location: 'Streaming Focus',
    date_range: '10/2020 - 08/2023',
    bullets: [
      'Advised and guided creators to expand, distribute, and monetize interactive digital content.',
      'Created and edited multi-format creative assets including print layout, graphic design, audio, and video streams.',
      'Strategized distribution pipelines to enhance structural SEO and organic viewer conversions.'
    ],
    media: [
      { title: 'Stream Overlay & Branding Layouts', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 6
  },
  {
    id: 'healthy-democracy',
    role: 'Technology and Logistics Specialist',
    company: 'Healthy Democracy',
    location: 'Portland, OR',
    date_range: '06/2022 - 08/2022',
    bullets: [
      'Managed digital streaming and communication technology pipelines for citizen engagement assemblies.',
      'Guaranteed seamless technical operations and low-latency broadcast systems for public participation processes.'
    ],
    media: [
      { title: 'Citizen Assembly Broadcaster Control Desk', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 7
  },
  {
    id: 'teamsters-853',
    role: 'Business Representative / Communications',
    company: 'Teamsters Local 853',
    location: 'Oakland, CA',
    date_range: '01/2014 - 10/2020',
    bullets: [
      'Managed comprehensive communications initiatives prior to the formation of a formal department.',
      'Negotiated, maintained, and enforced contracts. Handled grievance presentation and arbitration file preparation.',
      'Produced worker-facing media to train, onboard, and explain labor rights and benefit designs.',
      'Developed internal and external communications frameworks supporting dynamic local organizing drives.',
      'Planned and orchestrated large-scale union events and assemblies.'
    ],
    media: [
      { title: 'Union General Membership Meeting', req: '1920x1080px (PNG/JPG)' },
      { title: 'Picket Lines & Member Mobilization', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 8
  },
  {
    id: 'north-coast-trust',
    role: 'Trustee',
    company: 'North Coast Trust Fund',
    location: null,
    date_range: '09/2007 - 09/2014',
    bullets: [
      'Collaborated on structural health plan design, fiduciary coverage policies, and responsible trust fund budgeting.'
    ],
    media: [
      { title: 'Trust Fund Board Assembly', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 9
  },
  {
    id: 'teamsters-665',
    role: 'Business Representative',
    company: 'Teamsters Local 665',
    location: 'Santa Rosa, CA',
    date_range: '01/2012 - 01/2014',
    bullets: [
      'Bargained labor agreements, represented member interests, and conducted workplace audits and contract enforcement.'
    ],
    media: [
      { title: 'Local 665 Member Action Still', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 10
  },
  {
    id: 'teamsters-624',
    role: 'President',
    company: 'Teamsters Local 624',
    location: null,
    date_range: '06/2006 - 01/2012',
    bullets: [
      'Elected Local Union President, administering executive operations, financial budgeting, and strategic labor campaigns.',
      'Supervised all representational departments, business agents, and organizing drives.'
    ],
    media: [
      { title: 'Local 624 Union Hall & President Assembly', req: '1920x1080px (PNG/JPG)' }
    ],
    sort_order: 11
  }
];

const fallbackSocials = [
  { category: 'primary', platform: 'linkedin', url: 'https://linkedin.com/in/philybarrolaza', handle: 'linkedin.com/in/philybarrolaza', title: 'LinkedIn' },
  { category: 'primary', platform: 'instagram', url: 'https://instagram.com/getphily', handle: '@getphily', title: 'Instagram' },
  { category: 'primary', platform: 'x', url: 'https://x.com/thegetphily', handle: '@thegetphily', title: 'X (Twitter)' },
  { category: 'primary', platform: 'youtube', url: 'https://www.youtube.com/channel/UCbXMbRy8d4s3zK-zc_2ia8Q', handle: 'YouTube Channel', title: 'YouTube' },
  { category: 'community', platform: 'substack', url: 'https://substack.com/@getphily', handle: '@getphily', title: 'Substack' },
  { category: 'community', platform: 'tiktok', url: 'https://tiktok.com/@.getphily', handle: '@.getphily', title: 'TikTok' },
  { category: 'community', platform: 'threads', url: 'https://www.threads.net/@getphily', handle: '@getphily', title: 'Threads' },
  { category: 'community', platform: 'twitch', url: 'https://www.twitch.tv/getphily', handle: 'getphily', title: 'Twitch' },
  { category: 'community', platform: 'discord', url: 'https://discord.gg/jaTqahFj', handle: 'Join Community', title: 'Discord' },
  { category: 'community', platform: 'spotify', url: 'https://open.spotify.com/playlist/3xJduo2qI3XjEyYvO4oOoz?si=90241d67d9d84b34', handle: "Phil's Playlists", title: 'Spotify' },
  { category: 'community', platform: 'merch', url: 'https://getphily.creator-spring.com', handle: 'Shop Getphily', title: 'Merch Store' },
  { category: 'community', platform: 'facebook', url: 'https://www.facebook.com/philybar', handle: 'philybar', title: 'Facebook' },
  { category: 'community', platform: 'email', url: 'mailto:phil624@gmail.com', handle: 'phil624@gmail.com', title: 'Direct Email' }
];

const fallbackSkills = [
  { category: 'leadership', name: 'First Contracts & Collective Bargaining' },
  { category: 'leadership', name: 'Contract Costing & Financial Analysis' },
  { category: 'leadership', name: 'Coalition Building & Strategic Campaigns' },
  { category: 'leadership', name: 'Grievance Writing, Case Management & Panels' },
  { category: 'leadership', name: 'Organizing Drives & Project Management' },
  { category: 'leadership', name: 'Steward Training & Member Engagement' },
  { category: 'leadership', name: 'Leadership Recruitment & Team Coordination' },
  { category: 'comms', name: 'Digital Organizing & Social Media Management' },
  { category: 'comms', name: 'SEO, Website Development & Digital Algorithms' },
  { category: 'comms', name: 'Video Podcast Production & Editing' },
  { category: 'comms', name: 'Graphic Layout (Photoshop, Illustrator, InDesign)' },
  { category: 'comms', name: 'Audio & Video Editing (Final Cut Pro, Audacity, CapCut)' },
  { category: 'comms', name: 'Content Strategy & Campaign Messaging' },
  { category: 'comms', name: 'Fiduciary Trust Health Plan Design & Budgeting' }
];

const fallbackEducation = [
  { institution: 'Cuesta College', details: 'Economics Coursework | 1989 - 1990' },
  { institution: 'Santa Rosa Junior College', details: 'Political Science, Economics Coursework | 1988 - 1989' }
];

// Helper to fetch JSON from backend endpoints with error status check
async function fetchEndpoint(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Controller function to fetch and render all dynamic components from database
async function loadDynamicContent() {
  const fetchTimeline = fetchEndpoint('/api/timeline');
  const fetchSocials = fetchEndpoint('/api/socials');
  const fetchSkills = fetchEndpoint('/api/skills');
  const fetchEducation = fetchEndpoint('/api/education');

  try {
    const [timeline, socials, skills, education] = await Promise.all([
      fetchTimeline,
      fetchSocials,
      fetchSkills,
      fetchEducation
    ]);

    renderHeaderSocials(socials);
    renderTimeline(timeline);
    renderSkills(skills);
    renderEducation(education);
    renderSocialHub(socials);

    // Initialize interactive event listeners on dynamically generated DOM nodes
    initMediaDrawers();
    initScrollAnimationsFallback();
  } catch (error) {
    console.warn('Error loading dynamic content from Supabase API, loading local fallback data:', error);
    renderFallbacks();
  }

  // Portfolio items fetch and filter logic
  initPortfolioSection();
}

// Dynamic Rendering Functions
function renderHeaderSocials(socials) {
  const tray = document.getElementById('header-socials-tray');
  if (!tray) return;

  const primarySocials = socials.filter(s => s.category === 'primary');
  tray.innerHTML = primarySocials.map(s => {
    const platform = s.platform.toLowerCase();
    const className = platformTrayClasses[platform] || `link-${platform}`;
    const svg = svgIcons[platform] || '';
    return `
      <a href="${s.url}" target="_blank" rel="noopener" class="social-tray-link ${className}" aria-label="${s.title} Profile">
        ${svg}
      </a>
    `;
  }).join('');
}

function renderTimeline(timelineEntries) {
  const container = document.getElementById('timeline-entries-list');
  if (!container) return;

  if (timelineEntries.length === 0) {
    container.innerHTML = '<p class="no-items">No career timeline entries found.</p>';
    return;
  }

  container.innerHTML = timelineEntries.map((entry, idx) => {
    const activeClass = idx === 0 ? 'active' : '';
    const bulletsMarkup = entry.bullets.map(b => `<li>${b}</li>`).join('');
    
    // Check if there is media gallery content to render
    const meta = mediaMeta[entry.id] || {};
    const mediaTitle = meta.title || 'Media Gallery & Records';
    const mediaNotesText = meta.notes || '';
    
    const mediaMarkup = (entry.media && entry.media.length > 0) ? `
      <div class="media-gallery-section">
        <h5>${mediaTitle}</h5>
        <div class="photo-grid-placeholder">
          ${entry.media.map(m => `
            <div class="media-placeholder-card">
              <div class="placeholder-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p>${m.title}</p>
              <span class="file-spec">Required: ${m.req || '1920x1080px (PNG/JPG)'}</span>
            </div>
          `).join('')}
        </div>
        ${mediaNotesText ? `<p class="media-notes">${mediaNotesText}</p>` : ''}
      </div>
    ` : '';

    return `
      <article class="timeline-entry" id="entry-${entry.id}">
        <div class="timeline-dot-container">
          <div class="timeline-dot ${activeClass}"></div>
        </div>
        <div class="timeline-card card glass">
          <div class="card-header">
            <span class="entry-date">${entry.date_range}</span>
            <h3 class="entry-role">${entry.role}</h3>
            <h4 class="entry-company">${entry.company}${entry.location ? ` <span class="location">• ${entry.location}</span>` : ''}</h4>
          </div>
          
          <div class="card-body">
            <div class="details-drawer" id="details-${entry.id}">
              <div class="drawer-inner">
                <ul class="resume-bullets">
                  ${bulletsMarkup}
                </ul>
                ${mediaMarkup}
              </div>
            </div>
            
            <button class="expand-btn" aria-expanded="false" data-target="details-${entry.id}">
              <span>View Details & Media</span>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  const leadershipSkills = skills.filter(s => s.category === 'leadership');
  const commsSkills = skills.filter(s => s.category === 'comms');

  grid.innerHTML = `
    <div class="skills-category">
      <h3>Labor Relations & Leadership</h3>
      <ul class="skills-list">
        ${leadershipSkills.map(s => `<li>${s.name}</li>`).join('')}
      </ul>
    </div>
    
    <div class="skills-category">
      <h3>Content Creation, Communications & Technology</h3>
      <ul class="skills-list">
        ${commsSkills.map(s => `<li>${s.name}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderEducation(eduItems) {
  const container = document.getElementById('education-list');
  if (!container) return;

  container.innerHTML = eduItems.map(item => `
    <div class="education-item">
      <h3>${item.institution}</h3>
      <p class="edu-details">${item.details}</p>
    </div>
  `).join('');
}

// Platform badge class names override
const platformBadgeClasses = {
  merch: 'store-badge',
  email: 'email-badge',
  linkedin: 'linkedin-badge',
  instagram: 'instagram-badge',
  x: 'x-badge',
  youtube: 'youtube-badge'
};

function renderSocialHub(socials) {
  const grid = document.getElementById('social-grid');
  if (!grid) return;

  const communitySocials = socials.filter(s => s.category === 'community');
  grid.innerHTML = communitySocials.map(s => {
    const platform = s.platform.toLowerCase();
    const className = platformBadgeClasses[platform] || `${platform}-badge`;
    const svg = svgIcons[platform] || '';
    
    const isMail = s.url.startsWith('mailto:');
    const linkAttrs = isMail ? '' : 'target="_blank" rel="noopener"';
    
    return `
      <a href="${s.url}" ${linkAttrs} class="social-badge-card card glass ${className}">
        <div class="social-icon-wrapper">
          ${svg}
        </div>
        <div class="social-text">
          <span class="social-title">${s.title}</span>
          <span class="social-handle">${s.handle}</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderFallbacks() {
  renderHeaderSocials(fallbackSocials);
  renderTimeline(fallbackTimeline);
  renderSkills(fallbackSkills);
  renderEducation(fallbackEducation);
  renderSocialHub(fallbackSocials);

  // Initialize interactive event listeners on fallback DOM nodes
  initMediaDrawers();
  initScrollAnimationsFallback();
}


/**
 * Theme Toggle Handler
 * Syncs the page theme with user manual selections and localStorage,
 * falling back to prefers-color-scheme.
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Function to apply theme
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="color-scheme"]').content = 
      theme === 'system' ? 'light dark' : theme;
    localStorage.setItem('color-scheme', theme);
  };

  // Toggle Action
  toggleBtn.addEventListener('click', () => {
    // Determine current theme state
    let currentTheme = localStorage.getItem('color-scheme');
    if (!currentTheme) {
      // If nothing pinned, guess based on system setting to select the opposite
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme = systemIsDark ? 'dark' : 'light';
    }

    // Toggle to the opposite
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Watch system prefers-color-scheme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-adapt if the user hasn't pinned a specific theme override
    if (!localStorage.getItem('color-scheme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  });
}

/**
 * Media Accordion Drawers
 * Expands and collapses detail/media trays for each timeline element.
 */
function initMediaDrawers() {
  const expandButtons = document.querySelectorAll('.expand-btn');
  const timelineCards = document.querySelectorAll('.timeline-card');

  expandButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent card click from double toggling
      e.stopPropagation();
      toggleDrawer(btn);
    });
  });

  // Clicking the timeline card itself will also toggle the drawer for convenient UX
  timelineCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If user is clicking an anchor or interactive element inside the card, do not toggle
      if (e.target.closest('a') || e.target.closest('.media-placeholder-card')) {
        return;
      }
      const btn = card.querySelector('.expand-btn');
      if (btn) {
        toggleDrawer(btn);
      }
    });
  });
}

function toggleDrawer(btn) {
  const targetId = btn.getAttribute('data-target');
  const drawer = document.getElementById(targetId);
  if (!drawer) return;

  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  
  if (isExpanded) {
    btn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('expanded');
    btn.querySelector('span').textContent = 'View Details & Media';
  } else {
    btn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('expanded');
    btn.querySelector('span').textContent = 'Collapse Details & Media';
  }
}

/**
 * Scroll Animations Fallback
 * Uses IntersectionObserver to trigger entry animation classes
 * in browsers that do not support native CSS View Timelines (e.g. Firefox).
 */
function initScrollAnimationsFallback() {
  // Feature detect native CSS scroll-driven animations support
  const supportsCSSScrollTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!supportsCSSScrollTimeline) {
    console.log("CSS View-Timeline unsupported. Initializing IntersectionObserver fallback.");
    
    const timelineEntries = document.querySelectorAll('.timeline-entry');
    
    // Add fallback class immediately to prepare elements
    timelineEntries.forEach(entry => {
      entry.classList.add('js-scroll-animate');
    });

    // Set up observer
    const observerOptions = {
      root: null, // Viewport
      rootMargin: '0px 0px -10% 0px', // Trigger slightly before the item hits viewport bottom
      threshold: 0.1 // 10% visible
    };

    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once animated in, we can stop observing it
          self.unobserve(entry.target);
        }
      });
    }, observerOptions);

    timelineEntries.forEach(entry => {
      observer.observe(entry);
    });
  }
}

/**
 * Interactive Infographic Dashboard Handler
 * Manages the mouse/touch hover and click states of the Synergy Pipeline map
 * and updates the Details Panel dynamically with corresponding skills & metrics.
 */
function initInfographicDashboard() {
  const infographicData = {
    labor: {
      title: "Labor Relations & Presidency",
      subtitle: "20+ Years of Executive Union Leadership",
      theme: "labor-theme",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 10h6M12 7v6"/></svg>`,
      desc: "Bargaining contracts, enforcing collective agreements, resolving complex grievances, and guiding public & private sector labor organizations through executive presidency and field representation.",
      skills: [
        { name: "Contract Negotiations", val: 95 },
        { name: "Grievance Representation", val: 90 },
        { name: "Labor Costing & Audits", val: 85 },
        { name: "Trustee Health Plan Design", val: 80 }
      ],
      metrics: [
        { num: "20+ Yrs", label: "Executive President & Representative leadership", type: "labor" },
        { num: "95%", label: "Satisfaction representing members in negotiations", type: "labor" }
      ]
    },
    media: {
      title: "Digital Media & Production",
      subtitle: "Podcasting, Video Editing & Content Strategy",
      theme: "media-theme",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg>`,
      desc: "Directing high-quality podcast production pipelines, short/long-form video creation, editing, distribution, and SEO analytics to maximize individual and business visibility.",
      skills: [
        { name: "Podcast & Video Production", val: 95 },
        { name: "Audio & Video Editing", val: 92 },
        { name: "SEO & Content Algorithms", val: 88 },
        { name: "Streaming Tech Operations", val: 85 }
      ],
      metrics: [
        { num: "150+", label: "Podcast episodes produced and distributed online", type: "media" },
        { num: "100%", label: "In-house editing, mastering & SEO pipeline", type: "media" }
      ]
    },
    synergy: {
      title: "Digital Organizing Synergy",
      subtitle: "Mobilizing Communities & Amplifying Voices",
      theme: "synergy-theme",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 18H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.38a1 1 0 0 0 .7-.29l3.35-3.35A1 1 0 0 1 12 5v13z"/><path d="M12 9.5a3 3 0 0 1 0 5"/><path d="M12 6a7 7 0 0 1 0 12"/></svg>`,
      desc: "Intersecting extensive field organizing with digital storytelling to direct viral campaigns, run multi-channel social ads, build grassroots coalitions, and mobilize collective action.",
      skills: [
        { name: "Grassroots Mobilization", val: 95 },
        { name: "Coalition Building", val: 90 },
        { name: "Digital Organizing & Ads", val: 95 },
        { name: "Campaign Growth Strategy", val: 92 }
      ],
      metrics: [
        { num: "1M+", label: "Members covered under coalition endorsements", type: "synergy" },
        { num: "10K+", label: "Followers gained in two months on digital channels", type: "synergy" }
      ]
    }
  };

  const nodes = {
    labor: document.getElementById('node-labor'),
    media: document.getElementById('node-media'),
    synergy: document.getElementById('node-synergy')
  };

  const glows = {
    labor: document.querySelector('.labor-glow'),
    media: document.querySelector('.media-glow'),
    synergy: document.querySelector('.synergy-glow')
  };

  const svgWrapper = document.querySelector('.svg-wrapper');
  
  // Element selections for the dynamic pane
  const paneTitle = document.getElementById('dynamic-pane-title');
  const paneSubtitle = document.getElementById('dynamic-pane-subtitle');
  const paneDesc = document.getElementById('dynamic-pane-desc');
  const paneHeader = document.getElementById('dynamic-pane-header');
  const skillsList = document.getElementById('dynamic-skills-list');
  const metricsGrid = document.getElementById('dynamic-metrics-grid');

  if (!nodes.labor || !nodes.media || !nodes.synergy) return;

  let activeNodeId = 'synergy'; // Default active node
  let lockedNodeId = 'synergy'; // Click locked active node

  // Update Panel UI content
  function updatePanel(nodeId) {
    const data = infographicData[nodeId];
    if (!data) return;

    // Header content
    paneTitle.textContent = data.title;
    paneSubtitle.textContent = data.subtitle;
    paneDesc.textContent = data.desc;

    // Header Icon Theme class
    const iconWrapper = paneHeader.querySelector('.header-icon-wrapper');
    iconWrapper.className = 'header-icon-wrapper ' + data.theme;
    iconWrapper.innerHTML = data.icon;

    // Core Skills Bar list
    const barClass = nodeId === 'labor' ? 'labor-bar' : nodeId === 'media' ? 'media-bar' : 'synergy-bar';
    skillsList.innerHTML = data.skills.map(s => `
      <div class="skill-bar-wrapper">
        <div class="skill-label-row">
          <span class="skill-name">${s.name}</span>
          <span class="skill-val">${s.val}%</span>
        </div>
        <div class="bar-outer">
          <div class="bar-inner ${barClass}" style="width: 0%"></div>
        </div>
      </div>
    `).join('');

    // Trigger animations for skill bars in the next frame
    requestAnimationFrame(() => {
      const bars = skillsList.querySelectorAll('.bar-inner');
      data.skills.forEach((s, idx) => {
        if (bars[idx]) bars[idx].style.width = `${s.val}%`;
      });
    });

    // Metrics grid
    metricsGrid.innerHTML = data.metrics.map(m => `
      <div class="stat-card glass">
        <span class="stat-num text-${m.type}">${m.num}</span>
        <span class="stat-label">${m.label}</span>
      </div>
    `).join('');
  }

  // Set visual states (glows, stroke pipeline classes)
  function setVisualState(nodeId) {
    // Toggle active class on nodes
    Object.keys(nodes).forEach(key => {
      if (key === nodeId) {
        nodes[key].classList.add('active');
        nodes[key].setAttribute('aria-pressed', 'true');
        if (glows[key]) glows[key].classList.add('active');
      } else {
        nodes[key].classList.remove('active');
        nodes[key].setAttribute('aria-pressed', 'false');
        if (glows[key]) glows[key].classList.remove('active');
      }
    });

    // Handle pipeline flows classes
    if (svgWrapper) {
      svgWrapper.classList.remove('pipeline-active-left', 'pipeline-active-right', 'pipeline-active-both');
      if (nodeId === 'labor') {
        svgWrapper.classList.add('pipeline-active-left');
      } else if (nodeId === 'media') {
        svgWrapper.classList.add('pipeline-active-right');
      } else if (nodeId === 'synergy') {
        svgWrapper.classList.add('pipeline-active-both');
      }
    }
  }

  // Handle selection action
  function selectNode(nodeId, isClick = false) {
    activeNodeId = nodeId;
    if (isClick) {
      lockedNodeId = nodeId;
    }
    setVisualState(nodeId);
    updatePanel(nodeId);
  }

  // Attach Event Listeners to nodes
  Object.keys(nodes).forEach(key => {
    const node = nodes[key];

    // Hover mouse enter
    node.addEventListener('mouseenter', () => {
      selectNode(key, false);
    });

    // Click
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      selectNode(key, true);
    });

    // Accessibility Keyboard navigation
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectNode(key, true);
      }
    });

    // Touch support for mobile devices
    node.addEventListener('touchstart', (e) => {
      selectNode(key, true);
    }, { passive: true });
  });

  // Revert back when mouse leaves the infographic container
  const container = document.querySelector('.infographic-dashboard');
  if (container) {
    container.addEventListener('mouseleave', () => {
      selectNode(lockedNodeId, false);
    });
  }

  // --- Campaign Playbook Simulator Logic ---
  const playbookData = {
    bargaining: {
      ratio: 20, // 80% labor, 20% media (20% from left, placing marker near Labor)
      skills: [
        { name: "Contract Negotiation", type: "labor" },
        { name: "Costing & Auditing", type: "labor" },
        { name: "Member Mobilization", type: "labor" },
        { name: "Strategic Comms", type: "media" }
      ],
      outcome: "Bargained landmark contracts for California Academy of Sciences and public school systems, securing major worker wins.",
      node: "labor"
    },
    organizing: {
      ratio: 50, // 50/50 synergy
      skills: [
        { name: "Digital Campaigning", type: "synergy" },
        { name: "Ad Targeting", type: "synergy" },
        { name: "Coalition Building", type: "synergy" },
        { name: "Content Strategy", type: "media" }
      ],
      outcome: "Directed national digital campaigns (Teamsters for Harris) gaining 10,000+ followers in 2 months and building coalitions representing 1M+ members.",
      node: "synergy"
    },
    podcast: {
      ratio: 80, // 20% labor, 80% media (80% from left, placing marker near Media)
      skills: [
        { name: "Podcast Production", type: "media" },
        { name: "Audio/Video Editing", type: "media" },
        { name: "SEO & Algorithms", type: "media" },
        { name: "Member Stories", type: "labor" }
      ],
      outcome: "Produced 150+ podcast episodes for NorCal Pods and Redwood Empire Media, generating thousands of regular listeners.",
      node: "media"
    }
  };

  const playbookBtns = document.querySelectorAll('.playbook-tab-btn');
  const ratioFill = document.getElementById('playbook-ratio-fill');
  const ratioNode = document.getElementById('playbook-ratio-node');
  const playbookSkillsList = document.getElementById('playbook-skills-badges');
  const playbookOutcomeText = document.getElementById('playbook-outcome-text');

  function runPlaybookSimulation(scenarioId, syncMap = true) {
    const scenario = playbookData[scenarioId];
    if (!scenario) return;

    // Toggle active tab button
    playbookBtns.forEach(btn => {
      if (btn.getAttribute('data-scenario') === scenarioId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Animate ratio bar & node
    if (ratioFill && ratioNode) {
      ratioFill.style.width = `${scenario.ratio}%`;
      ratioNode.style.left = `${scenario.ratio}%`;
    }

    // Render skills badges
    if (playbookSkillsList) {
      playbookSkillsList.innerHTML = scenario.skills.map(s => `
        <span class="skill-badge badge-${s.type}">${s.name}</span>
      `).join('');
    }

    // Update outcome text
    if (playbookOutcomeText) {
      playbookOutcomeText.textContent = scenario.outcome;
    }

    // Sync Map node focus if requested
    if (syncMap) {
      lockedNodeId = scenario.node;
      activeNodeId = scenario.node;
      setVisualState(scenario.node);
      updatePanel(scenario.node);
    }
  }

  // Hook tab click events
  playbookBtns.forEach(btn => {
    const scenarioId = btn.getAttribute('data-scenario');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      runPlaybookSimulation(scenarioId, true);
    });

    btn.addEventListener('touchstart', (e) => {
      runPlaybookSimulation(scenarioId, true);
    }, { passive: true });
  });

  // Modify selectNode to also update the active playbook tab if nodes are interacted with directly
  const originalSelectNode = selectNode;
  selectNode = function(nodeId, isClick = false) {
    originalSelectNode(nodeId, isClick);
    
    // Find the playbook scenario matching this map node
    let matchingScenarioId = null;
    Object.keys(playbookData).forEach(key => {
      if (playbookData[key].node === nodeId) {
        matchingScenarioId = key;
      }
    });
    if (matchingScenarioId) {
      runPlaybookSimulation(matchingScenarioId, false);
    }
  };

  // Initialize the first state & simulation
  runPlaybookSimulation('organizing', true);
}

/**
 * Portfolio Gallery Handler
 * Loads items from portfolio.json, handles category filtering,
 * and sets up the lightbox modal for image previews.
 */
function initPortfolioSection() {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxTags = document.getElementById('lightbox-tags');

  if (!grid) return;

  let portfolioItems = [];

  // Fetch portfolio data from database with local json file fallback
  fetch('/api/portfolio')
    .then(res => {
      if (!res.ok) throw new Error('API request failed');
      return res.json();
    })
    .then(data => {
      portfolioItems = Array.isArray(data) ? data : (data.portfolioItems || []);
      renderPortfolio(portfolioItems);
    })
    .catch(err => {
      console.warn('Error loading portfolio data from Supabase, attempting local file fallback:', err);
      fetch('/portfolio.json')
        .then(res => res.json())
        .then(data => {
          portfolioItems = data.portfolioItems || [];
          renderPortfolio(portfolioItems);
        })
        .catch(localErr => {
          console.error('Local portfolio fallback failed:', localErr);
          grid.innerHTML = '<p class="error-msg">Failed to load portfolio items.</p>';
        });
    });

  // Render items grid
  function renderPortfolio(items) {
    if (items.length === 0) {
      grid.innerHTML = '<p class="no-items">No design items found.</p>';
      return;
    }

    grid.innerHTML = items.map(item => `
      <article class="portfolio-card card glass" data-id="${item.id}" tabindex="0" role="button" aria-label="View ${item.title}">
        <div class="portfolio-img-container">
          <!-- Temporary gradient design placeholders. Real images can be dropped into public/assets/portfolio/ -->
          <div class="portfolio-placeholder-graphic">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>${item.category}</span>
          </div>
        </div>
        <div class="portfolio-info">
          <span class="portfolio-card-category">${item.category}</span>
          <h3 class="portfolio-card-title">${item.title}</h3>
          <p class="portfolio-card-desc">${item.description}</p>
        </div>
      </article>
    `).join('');

    // Attach click listeners to cards
    const cards = grid.querySelectorAll('.portfolio-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openLightbox(id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.getAttribute('data-id');
          openLightbox(id);
        }
      });
    });
  }

  // Handle Category Filter pills
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      
      // Animate fade-out
      grid.style.opacity = '0';
      grid.style.transform = 'scale(0.98)';
      grid.style.transition = 'opacity 0.2s, transform 0.2s';

      setTimeout(() => {
        const filtered = filterValue === 'all' 
          ? portfolioItems 
          : portfolioItems.filter(item => item.category === filterValue);
        
        renderPortfolio(filtered);
        
        // Animate fade-out/fade-in
        grid.style.opacity = '1';
        grid.style.transform = 'scale(1)';
      }, 200);
    });
  });

  // Open Lightbox popup
  function openLightbox(itemId) {
    const item = portfolioItems.find(i => i.id === itemId);
    if (!item || !lightbox) return;

    // Set content - handles both database snake_case and JSON camelCase
    lightboxImg.src = item.image_path || item.imagePath;
    lightboxImg.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxCategory.textContent = item.category;
    lightboxDesc.textContent = item.description;

    // Tag list
    if (lightboxTags && item.tags) {
      lightboxTags.innerHTML = item.tags.map(t => `
        <span class="lightbox-tag">${t}</span>
      `).join('');
    }

    // Show modal
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock body scroll

    // Set focus on close button for accessibility
    setTimeout(() => lightboxClose.focus(), 100);
  }

  // Close Lightbox popup
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll

    // Restore focus to card if active
    const activeCard = grid.querySelector(`[data-id="${lightboxImg.alt}"]`);
    if (activeCard) activeCard.focus();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}
