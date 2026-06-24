import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Resume from './views/Resume';
import Dashboard from './views/Dashboard';
import {
  fallbackTimeline,
  fallbackPodcasts,
  fallbackPortfolio,
  fallbackSocials,
  fallbackSkills,
  fallbackEducation,
} from './data/fallbacks';

function App() {
  const [state, setState] = useState({
    timeline: [],
    podcasts: [],
    portfolio: [],
    socials: null,
    skills: [],
    education: [],
    loading: true,
    usingFallbacks: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchEndpoint = async (url) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        };

        // Fetch all endpoints in parallel
        const [timeline, podcasts, portfolio, socials, skills, education] = await Promise.all([
          fetchEndpoint('/api/timeline'),
          fetchEndpoint('/api/podcasts'),
          fetchEndpoint('/api/portfolio'),
          fetchEndpoint('/api/socials'),
          fetchEndpoint('/api/skills'),
          fetchEndpoint('/api/education'),
        ]);

        setState({
          timeline,
          podcasts,
          portfolio,
          socials: formatSocials(socials),
          skills,
          education,
          loading: false,
          usingFallbacks: false,
        });
      } catch (err) {
        console.warn('WARNING: Failed to fetch API data, loading offline fallbacks. Details:', err.message);
        
        // Transform fallbackSocials array into structured primary/community object for frontend consumption
        setState({
          timeline: fallbackTimeline,
          podcasts: fallbackPodcasts,
          portfolio: fallbackPortfolio,
          socials: formatSocials(fallbackSocials),
          skills: fallbackSkills,
          education: fallbackEducation,
          loading: false,
          usingFallbacks: true,
        });
      }
    }

    fetchData();
  }, []);

  // Helper to restructure the flat socials list into categorised format (compatible with public/socials.json)
  function formatSocials(socialsData) {
    if (!socialsData) return null;
    if (!Array.isArray(socialsData)) return socialsData; // If already formatted as { primary, community }

    const primary = {};
    const community = {};

    socialsData.forEach((s) => {
      if (s.category === 'primary') {
        primary[s.platform] = s.url;
      } else {
        community[s.platform] = s.url;
      }
    });

    return { primary, community };
  }

  if (state.loading) {
    return null; // Return empty or a loading spinner while state initializes
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Resume data={state} />} />
        <Route path="/dashboard" element={<Dashboard data={state} />} />
      </Routes>
    </Router>
  );
}

export default App;
