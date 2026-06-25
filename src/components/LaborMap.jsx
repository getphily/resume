import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Box, Text, Heading, Flex, HStack, VStack, useColorMode, useColorModeValue } from '@chakra-ui/react';


const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

const INDUSTRY_COLORS = {
  'Transportation & Logistics':             '#3b82f6',
  'Education':                              '#06b6d4',
  'Automotive Services':                    '#f59e0b',
  'Food & Beverage':                        '#10b981',
  'Manufacturing & Construction':           '#8b5cf6',
  'Non-Profit / Cultural':                  '#f43f5e',
  'Media & Publishing':                     '#f97316',
  'Facilities & Services':                  '#6366f1',
  'Environmental & Waste Management':       '#84cc16',
  'Government':                             '#eab308',
  'Energy & Utilities':                     '#14b8a6',
  'Agriculture':                            '#a3e635',
  'Retail & Distribution':                  '#e879f9',
  'Financial & Administrative Services':    '#38bdf8',
  'Production Companies & Studio Entities': '#a78bfa',
};

// [longitude, latitude] — GeoJSON standard
const COORDS = {
  'Alameda, CA':                                    [-122.2416,  37.7652],
  'Bay Area Region, CA':                            [-122.2312,  37.8144],
  'Bay Area, CA':                                   [-122.3677,  37.6900],
  'Berkeley & San Leandro, CA':                     [-122.2727,  37.8716],
  'Brisbane, CA':                                   [-122.4009,  37.6799],
  'Burlingame, CA':                                 [-122.3477,  37.5767],
  'Colma / Daly City Area, CA':                     [-122.4701,  37.6785],
  'Colma, CA':                                      [-122.4611,  37.6795],
  'Corte Madera, CA':                               [-122.5271,  37.9254],
  'Geyserville, CA':                                [-122.9097,  38.7074],
  'Hayward, CA':                                    [-122.0808,  37.6688],
  'Lake County, CA':                                [-122.7544,  39.0968],
  'Los Angeles, CA':                                [-118.2437,  34.0522],
  'Manhattan Beach, CA':                            [-118.4109,  33.8847],
  'Marin County, CA':                               [-122.5328,  37.9007],
  'Martinez, CA':                                   [-122.1341,  37.9935],
  'Menlo Park, CA':                                 [-122.1817,  37.4530],
  'Mill Valley / Marin County, CA':                 [-122.5450,  37.9160],
  'Newark, Brisbane, and San Rafael, CA':           [-122.0402,  37.5296],
  'Newark, CA':                                     [-122.0502,  37.5296],
  'North Bay Area, CA':                             [-122.6500,  38.2500],
  'North Bay Regional Network, CA':                 [-122.7100,  38.3200],
  'Northern California Region':                     [-121.4944,  38.5816],
  'Oakland, CA':                                    [-122.2712,  37.8044],
  'Petaluma, CA':                                   [-122.6367,  38.2324],
  'Redwood City & San Jose, CA':                    [-122.2364,  37.4852],
  'Redwood City, CA':                               [-122.2464,  37.4852],
  'Regional Distribution Hubs, CA':                [-122.3100,  38.0200],
  'Rohnert Park, CA':                               [-122.7013,  38.3396],
  'San Francisco / Bay Area, CA':                   [-122.4194,  37.7749],
  'San Francisco, CA':                              [-122.4094,  37.7749],
  'San Mateo / East Bay / North Bay Regions, CA':   [-122.3255,  37.5630],
  'San Rafael, CA':                                 [-122.5311,  37.9735],
  'Santa Rosa / North Bay, CA':                     [-122.7241,  38.4404],
  'Santa Rosa, CA':                                 [-122.7141,  38.4404],
  'Santa Rosa/San Jose, CA':                        [-122.7041,  38.4404],
  'Sonoma County, CA (Rohnert Park / Cotati)':      [-122.7113,  38.3496],
  'Sonoma County, CA (Santa Rosa & Petaluma)':      [-122.7141,  38.4504],
  'Sonoma and Marin Counties, CA':                  [-122.6100,  38.1100],
  'Sonoma, CA':                                     [-122.4580,  38.2916],
  'South San Francisco, CA':                        [-122.4080,  37.6549],
  'Ukiah, CA':                                      [-123.2078,  39.1502],
};

function jitter(id, spread = 0.022) {
  const h1 = ((id * 1664525 + 1013904223) >>> 0);
  const h2 = ((h1 * 1664525 + 1013904223) >>> 0);
  const angle  = ((h1 % 628) / 100);
  const radius = ((h2 % 100) / 100) * spread;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function useCountUp(target, duration, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [trigger, target, duration]);
  return trigger ? val : 0;
}

export function LaborMap({ employers = [], borderLight, cardBg, textColorMuted }) {
  const { colorMode }               = useColorMode();
  const isDark                      = colorMode === 'dark';
  const mapBg        = isDark ? '#080c14'                   : '#eef2f8';
  const countyFill   = isDark ? '#0c1220'                   : '#e2e9f4';
  const countyStroke = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(30,50,100,0.10)';
  const statNumClr   = isDark ? 'white'                     : '#0f172a';
  const tooltipBg    = isDark ? 'rgba(6,9,18,0.96)'         : 'rgba(248,251,255,0.97)';
  const tooltipTxt   = isDark ? 'white'                     : '#0f172a';
  const noteBg       = isDark ? 'rgba(8,12,20,0.85)'        : 'rgba(242,246,255,0.90)';

  const [activeIndustry, setActiveIndustry] = useState(null);
  const [hovered, setHovered]               = useState(null);
  const [inView,  setInView]                = useState(false);
  const [revealed, setRevealed]             = useState(false);
  const containerRef = useRef(null);
  const mapBoxRef    = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setTimeout(() => setRevealed(true), 200);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const mapped = employers.map(emp => {
    const base = COORDS[emp.location];
    if (!base) return null;
    const [jx, jy] = jitter(emp.id);
    return { ...emp, coords: [base[0] + jx, base[1] + jy] };
  }).filter(Boolean);

  const norcal        = mapped.filter(e => e.coords[1] > 36.5);
  const southernCount = mapped.filter(e => e.coords[1] <= 36.5).length;
  const allIndustries = [...new Set(employers.map(e => e.industry))].sort();

  const cntEmployers  = useCountUp(employers.length,     1400, inView);
  const cntIndustries = useCountUp(allIndustries.length, 1100, inView);
  const cntRegions    = useCountUp(6, 900, inView);

  const dotColor = e => INDUSTRY_COLORS[e.industry] || '#64748b';
  const dimmed   = e => !!(activeIndustry && e.industry !== activeIndustry);

  function handleEnter(emp, el) {
    const circ = el.getBoundingClientRect();
    const box  = mapBoxRef.current.getBoundingClientRect();
    setHovered({
      ...emp,
      px: circ.left + circ.width / 2 - box.left,
      py: circ.top  - box.top,
    });
  }

  return (
    <Box
      ref={containerRef}
      id="labor-footprint"
      mb="4rem"
      border="1px solid"
      borderColor={borderLight}
      borderRadius="2xl"
      p={{ base: '1.5rem', md: '2rem' }}
      bg={cardBg}
    >
      {/* Header with Stats */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap="1rem"
        mb="1.75rem"
        pb="1.25rem"
        borderBottom="1px solid"
        borderColor={borderLight}
        flexShrink={0}
      >
        <Box>
          <Heading as="h2" fontSize="1.1rem" fontWeight="800" textTransform="uppercase" letterSpacing="0.08em" mb="0.25rem">
            Labor Footprint
          </Heading>
          <Text fontSize="0.85rem" color={textColorMuted}>
            Employer accounts represented across California
          </Text>
        </Box>
        <HStack spacing={0} wrap="wrap" rowGap="0.5rem" align="center" justify={{ base: 'start', md: 'end' }}>
          {[
            { n: cntEmployers,  label: 'Employers' },
            { n: cntIndustries, label: 'Industries' },
            { n: cntRegions,    label: 'Regions' },
          ].map(({ n, label }, i) => (
            <Box key={label} display="flex" alignItems="center">
              {i > 0 && <Box h="1.5rem" w="1px" bg={borderLight} mx={['0.75rem', '1.25rem']} />}
              <Box>
                <Text
                  fontSize={['1.2rem', '1.5rem']}
                  fontWeight="900"
                  lineHeight="1"
                  letterSpacing="-0.03em"
                  color={statNumClr}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {n}
                </Text>
                <Text fontSize="0.6rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={textColorMuted} mt="0.1rem">
                  {label}
                </Text>
              </Box>
            </Box>
          ))}
        </HStack>
      </Flex>

      <Flex direction="column" gap="1.25rem" align="stretch" w="100%">
        {/* Map */}
        <Box
          w="100%"
          maxW="800px"
          mx="auto"
          aspectRatio="1/1"
          position="relative"
          ref={mapBoxRef}
          borderRadius="xl"
          overflow="hidden"
          border="1px solid"
          borderColor={borderLight}
          bg={mapBg}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [-122.45, 38.2], scale: 12500 }}
            width={600}
            height={600}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies
                  .filter(g => g.id.startsWith('06'))
                  .map(g => (
                    <Geography
                      key={g.rsmKey}
                      geography={g}
                      style={{
                        default: { fill: countyFill, stroke: countyStroke, strokeWidth: 0.5, outline: 'none' },
                        hover:   { fill: countyFill, outline: 'none' },
                        pressed: { fill: countyFill, outline: 'none' },
                      }}
                    />
                  ))
              }
            </Geographies>

            {norcal.map((emp, i) => {
              const col  = dotColor(emp);
              const dim  = dimmed(emp);
              const hot  = hovered?.id === emp.id;
              return (
                <Marker key={emp.id} coordinates={emp.coords}>
                  <circle
                    r={hot ? 8 : dim ? 2.5 : 5}
                    fill={col}
                    fillOpacity={hot ? 1 : dim ? 0.12 : 0.88}
                    style={{
                      filter: dim ? 'none' : `drop-shadow(0 0 ${hot ? 10 : 5}px ${col})`,
                      transition: `r 0.22s ease, fill-opacity 0.22s ease, filter 0.22s ease, opacity 0.45s ease ${Math.min(i * 10, 700)}ms`,
                      opacity: revealed ? 1 : 0,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => handleEnter(emp, e.currentTarget)}
                    onMouseLeave={() => setHovered(null)}
                  />
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Tooltip */}
          {hovered && (
            <Box
              position="absolute"
              left={`${hovered.px}px`}
              top={`${hovered.py - 10}px`}
              transform="translateX(-50%) translateY(-100%)"
              pointerEvents="none"
              zIndex={20}
              bg={tooltipBg}
              backdropFilter="blur(14px)"
              border="1px solid"
              borderColor={`${dotColor(hovered)}40`}
              borderRadius="8px"
              overflow="hidden"
              boxShadow={`0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${dotColor(hovered)}18`}
              minW="185px"
              maxW="245px"
            >
              <style>{`@keyframes ftUp{from{opacity:0;transform:translateX(-50%) translateY(calc(-100% + 8px))}to{opacity:1;transform:translateX(-50%) translateY(-100%)}}`}</style>
              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={dotColor(hovered)} />
              <Box pl="1rem" pr="0.85rem" py="0.7rem">
                <HStack spacing="0.4rem" mb="0.35rem">
                  <Box w="6px" h="6px" borderRadius="full" bg={dotColor(hovered)} flexShrink={0}
                    style={{ boxShadow: `0 0 6px ${dotColor(hovered)}` }} />
                  <Text fontSize="0.6rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.09em" color={dotColor(hovered)} noOfLines={1}>
                    {hovered.industry}
                  </Text>
                </HStack>
                <Text fontSize="0.84rem" fontWeight="700" color={tooltipTxt} lineHeight="1.3" mb="0.2rem">
                  {hovered.name}
                </Text>
                <Text fontSize="0.72rem" color={textColorMuted}>
                  {hovered.location}
                </Text>
              </Box>
            </Box>
          )}

          {southernCount > 0 && (
            <Box position="absolute" bottom="0.75rem" right="0.75rem"
              fontSize="0.63rem" color={textColorMuted}
              bg={noteBg} px="0.6rem" py="0.3rem"
              borderRadius="6px" border="1px solid" borderColor={borderLight}>
              +{southernCount} employer{southernCount !== 1 ? 's' : ''} in Southern CA not shown
            </Box>
          )}
        </Box>

        {/* Industry filter key (Horizontal layout underneath map) */}
        <Box
          w="100%"
          p="1rem"
          bg={useColorModeValue('rgba(0,0,0,0.015)', 'rgba(255,255,255,0.015)')}
          border="1px solid"
          borderColor={borderLight}
          borderRadius="xl"
        >
          <Text fontSize="0.68rem" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em" color={textColorMuted} mb="1rem">
            Filter by Industry
          </Text>
          <Flex wrap="wrap" gap="0.5rem">
            <Box
              as="button"
              display="flex" alignItems="center" gap="0.45rem"
              px="0.75rem" py="0.45rem" borderRadius="6px"
              fontSize="0.72rem" fontWeight={!activeIndustry ? '700' : '500'}
              color={!activeIndustry ? (isDark ? 'white' : 'gray.800') : textColorMuted}
              bg={!activeIndustry ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : 'transparent'}
              border="1px solid"
              borderColor={!activeIndustry ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : 'transparent'}
              transition="all 0.15s" onClick={() => setActiveIndustry(null)}
              cursor="pointer"
              _hover={{ bg: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }}
            >
              <span>All</span>
              <Box as="span" fontSize="0.63rem" style={{ opacity: 0.55 }} flexShrink={0}>{employers.length}</Box>
            </Box>

            {allIndustries.map(ind => {
              const c   = INDUSTRY_COLORS[ind] || '#64748b';
              const on  = activeIndustry === ind;
              const cnt = employers.filter(e => e.industry === ind).length;
              return (
                <Box
                  key={ind}
                  as="button"
                  display="flex" alignItems="center" gap="0.45rem"
                  px="0.75rem" py="0.45rem" borderRadius="6px"
                  fontSize="0.7rem" fontWeight={on ? '700' : '500'}
                  color={on ? c : textColorMuted}
                  bg={on ? `${c}18` : 'transparent'}
                  border="1px solid"
                  borderColor={on ? `${c}44` : 'transparent'}
                  transition="all 0.15s"
                  onClick={() => setActiveIndustry(on ? null : ind)}
                  cursor="pointer"
                  sx={{ '&:hover': { bg: `${c}12`, color: c } }}
                >
                  <Box as="span" w="7px" h="7px" borderRadius="full" bg={c} flexShrink={0}
                    style={{ boxShadow: on ? `0 0 5px ${c}` : 'none', transition: 'box-shadow 0.15s' }} />
                  <Box as="span" lineHeight="1.3" style={{ whiteSpace: 'nowrap' }}>{ind}</Box>
                  <Box as="span" fontSize="0.62rem" style={{ opacity: 0.55 }} flexShrink={0}>{cnt}</Box>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
