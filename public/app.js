/* ==========================================================================
   PHIL YBARROLAZA RESUME TIMELINE — CLIENT-SIDE INTERACTION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMediaDrawers();
  initScrollAnimationsFallback();
  initInfographicDashboard();
  initPortfolioSection();
});

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

  // Fetch portfolio data
  fetch('/portfolio.json')
    .then(res => res.json())
    .then(data => {
      portfolioItems = data.portfolioItems || [];
      renderPortfolio(portfolioItems);
    })
    .catch(err => {
      console.error('Error loading portfolio data:', err);
      grid.innerHTML = '<p class="error-msg">Failed to load portfolio items.</p>';
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

    // Set content
    lightboxImg.src = item.imagePath;
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
