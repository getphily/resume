import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  IconButton,
  Link,
  Tag,
  useColorMode,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SearchIcon, ArrowBackIcon, ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import Chart from 'react-apexcharts';
import { FaPodcast, FaBriefcase, FaFolderOpen, FaUsers } from 'react-icons/fa';

function Dashboard({ data }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Color mappings
  const sidebarBg = useColorModeValue('white', 'oklch(18% 0.015 240 / 0.85)');
  const mainBg = useColorModeValue('oklch(98% 0.005 240)', 'oklch(14% 0.01 240)');
  const cardBg = useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)');
  const borderLight = useColorModeValue('oklch(90% 0.01 240)', 'oklch(28% 0.015 240 / 0.7)');
  const textColorMuted = useColorModeValue('oklch(50% 0.01 240)', 'oklch(65% 0.01 240)');
  const brandPrimary = useColorModeValue('oklch(55% 0.16 260)', 'oklch(75% 0.15 200)');
  const brandSecondary = useColorModeValue('oklch(50% 0.18 200)', 'oklch(65% 0.20 280)');
  const rowHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');

  // Search filter for timeline
  const filteredTimeline = data.timeline.filter(
    item =>
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculations
  const totalJobs = data.timeline.length;
  const totalPodcasts = data.podcasts.length;
  const activePodcasts = data.podcasts.filter(p => p.status === 'active').length;
  const totalPortfolioItems = data.portfolio.length;

  // Chart configuration (Skills Breakdown) — Full Dual-Axis
  const skillsChartOptions = {
    chart: {
      id: 'skills-radar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#3182CE', '#805AD5'],
    xaxis: {
      categories: [
        'Contract Bargaining',
        'Field Organizing',
        'Grievance Admin',
        'Regulatory & Law',
        'Data & Analytics',
        'Video Production',
        'Audio Engineering',
        'Design Systems',
        'SEO & Web Dev',
        'AI & Automation',
      ],
      labels: {
        style: {
          colors: colorMode === 'dark' ? Array(10).fill('#A3AED0') : Array(10).fill('#2B3674'),
          fontSize: '10px',
          fontWeight: 600,
        },
      },
    },
    yaxis: { show: false },
    theme: { mode: colorMode },
    stroke: { width: 2 },
    markers: { size: 4 },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '11px',
      markers: { width: 10, height: 10 },
    },
  };

  const skillsChartSeries = [
    {
      name: 'Labor & Campaigns 🔵',
      data: [95, 90, 88, 82, 78, 0, 0, 0, 0, 0],
    },
    {
      name: 'Digital & Comms 🟣',
      data: [0, 0, 0, 0, 72, 92, 88, 80, 82, 75],
    },
  ];

  return (
    <Box minH="100vh" bg={mainBg} display="flex" flexDirection={{ base: 'column', md: 'row' }}>
      {/* 1. Horizon Sidebar Navigation */}
      <Box
        as="aside"
        w={{ base: '100%', md: '260px' }}
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderLight}
        p="1.5rem"
        display="flex"
        flexDirection="column"
        position={{ base: 'relative', md: 'sticky' }}
        top="0"
        h={{ base: 'auto', md: '100vh' }}
        flexShrink={0}
      >
        <VStack align="start" spacing="2rem" w="100%">
          <Heading
            fontSize="1.1rem"
            fontWeight="800"
            letterSpacing="0.08em"
            color={brandPrimary}
            textTransform="uppercase"
            borderBottom="1px solid"
            borderColor={borderLight}
            pb="1rem"
            w="100%"
          >
            Horizon Resume
          </Heading>

          <VStack align="start" spacing="1rem" w="100%">
            <Button
              w="100%"
              justifyContent="start"
              variant="solid"
              colorScheme="teal"
              leftIcon={<FaFolderOpen />}
              size="sm"
            >
              Dashboard Overview
            </Button>
            <Button
              w="100%"
              justifyContent="start"
              variant="ghost"
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              size="sm"
            >
              Public Resume View
            </Button>
          </VStack>
        </VStack>

        <Box mt="auto" pt="2rem" display={{ base: 'none', md: 'block' }}>
          <Text fontSize="0.75rem" fontWeight="600" color={textColorMuted}>
            Horizon UI Layout v2.0
          </Text>
          <Text fontSize="0.65rem" color={textColorMuted} opacity={0.8}>
            React + Chakra UI Build
          </Text>
        </Box>
      </Box>

      {/* 2. Main Dashboard Area */}
      <Box flex="1" p={{ base: '1.5rem', md: '2.5rem' }}>
        {/* Floating Page Header */}
        <Flex justify="space-between" align="center" mb="2.5rem" wrap="wrap" gap="1rem">
          <Box>
            <Text fontSize="0.78rem" color={textColorMuted} fontWeight="700" letterSpacing="0.05em" textTransform="uppercase">
              Pages / Dashboard
            </Text>
            <Heading as="h1" fontSize="1.8rem" fontWeight="800" letterSpacing="-0.02em" color={useColorModeValue('#1B254B', 'white')}>
              Main Dashboard
            </Heading>
          </Box>
          <HStack spacing="1rem">
            <Button
              leftIcon={<ArrowBackIcon />}
              size="sm"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Resume
            </Button>
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
          </HStack>
        </Flex>

        {/* 3. Metric KPI Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="1.5rem" mb="2.5rem">
          <Box bg={cardBg} p="1.2rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} display="flex" alignItems="center">
            <Box bg="teal.50" color="teal.500" p="0.8rem" borderRadius="xl" mr="1rem">
              <FaBriefcase size="20" />
            </Box>
            <Stat>
              <StatLabel fontSize="0.75rem" color={textColorMuted} fontWeight="700">Total Career Chapters</StatLabel>
              <StatNumber fontSize="1.3rem" fontWeight="800">{totalJobs} Roles</StatNumber>
              <StatHelpText fontSize="0.68rem" mb="0" color={textColorMuted}>20+ Years Fiduciary & Field</StatHelpText>
            </Stat>
          </Box>

          <Box bg={cardBg} p="1.2rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} display="flex" alignItems="center">
            <Box bg="purple.50" color="purple.500" p="0.8rem" borderRadius="xl" mr="1rem">
              <FaPodcast size="20" />
            </Box>
            <Stat>
              <StatLabel fontSize="0.75rem" color={textColorMuted} fontWeight="700">Podcast Channels</StatLabel>
              <StatNumber fontSize="1.3rem" fontWeight="800">{totalPodcasts} Shows</StatNumber>
              <StatHelpText fontSize="0.68rem" mb="0" color="green.500" fontWeight="700">
                <StatArrow type="increase" /> {activePodcasts} Active
              </StatHelpText>
            </Stat>
          </Box>

          <Box bg={cardBg} p="1.2rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} display="flex" alignItems="center">
            <Box bg="blue.50" color="blue.500" p="0.8rem" borderRadius="xl" mr="1rem">
              <FaFolderOpen size="20" />
            </Box>
            <Stat>
              <StatLabel fontSize="0.75rem" color={textColorMuted} fontWeight="700">Creative Deliverables</StatLabel>
              <StatNumber fontSize="1.3rem" fontWeight="800">{totalPortfolioItems} Assets</StatNumber>
              <StatHelpText fontSize="0.68rem" mb="0" color={textColorMuted}>Flyers, Campaigns & Logos</StatHelpText>
            </Stat>
          </Box>

          <Box bg={cardBg} p="1.2rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} display="flex" alignItems="center">
            <Box bg="orange.50" color="orange.500" p="0.8rem" borderRadius="xl" mr="1rem">
              <FaUsers size="20" />
            </Box>
            <Stat>
              <StatLabel fontSize="0.75rem" color={textColorMuted} fontWeight="700">Campaign Scale</StatLabel>
              <StatNumber fontSize="1.3rem" fontWeight="800">1 Million+</StatNumber>
              <StatHelpText fontSize="0.68rem" mb="0" color="green.500" fontWeight="700">
                <StatArrow type="increase" /> Coalition reach
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* 4. ApexCharts Analysis & Search Panel */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing="1.5rem" mb="2.5rem">
          {/* Radar Chart */}
          <Box bg={cardBg} p="1.5rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} gridColumn={{ lg: 'span 5' }}>
            <Heading as="h3" fontSize="1.05rem" fontWeight="800" mb="1.5rem">
              Skills Spectrum Index
            </Heading>
            <Box h="260px" display="flex" alignItems="center" justifyContent="center">
              <Chart
                options={skillsChartOptions}
                series={skillsChartSeries}
                type="radar"
                width="100%"
                height="100%"
              />
            </Box>
          </Box>

          {/* Experience Data Grid */}
          <Box bg={cardBg} p="1.5rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} gridColumn={{ lg: 'span 7' }}>
            <Flex justify="space-between" align="center" mb="1.5rem" wrap="wrap" gap="1rem">
              <Heading as="h3" fontSize="1.05rem" fontWeight="800">
                Structured Experience Logs
              </Heading>
              <InputGroup size="sm" maxW="220px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={textColorMuted} />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="full"
                />
              </InputGroup>
            </Flex>

            <TableContainer maxH="250px" overflowY="auto">
              <Table variant="simple" size="sm">
                <Thead bg={rowHoverBg}>
                  <Tr>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Role</Th>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Company</Th>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Timeline</Th>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Category</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTimeline.map((item) => {
                    const isLabor = ['seiu-1021', 'teamsters-harris', 'teamsters-853', 'north-coast-trust', 'teamsters-665', 'teamsters-624'].includes(item.id);
                    return (
                      <Tr key={item.id} _hover={{ bg: rowHoverBg }}>
                        <Td fontWeight="600" fontSize="0.82rem">{item.role}</Td>
                        <Td fontSize="0.82rem" color={isLabor ? 'blue.500' : 'purple.500'} fontWeight="600">{item.company}</Td>
                        <Td fontSize="0.82rem">{item.date_range}</Td>
                        <Td>
                          <Tag size="sm" variant="subtle" colorScheme={isLabor ? 'blue' : 'purple'} fontSize="0.68rem" fontWeight="700">
                            {isLabor ? 'Labor Relations' : 'Digital Media'}
                          </Tag>
                        </Td>
                      </Tr>
                    );
                  })}
                  {filteredTimeline.length === 0 && (
                    <Tr>
                      <Td colSpan="4" textAlign="center" py="2rem" color={textColorMuted}>
                        No roles found matching your query.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </SimpleGrid>

        {/* 5. Podcasts Ingestion Database Grid */}
        <Box bg={cardBg} p="1.5rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} mb="2.5rem">
          <Heading as="h3" fontSize="1.05rem" fontWeight="800" mb="1.5rem">
            Podcast Ingestion Registry
          </Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg={rowHoverBg}>
                <Tr>
                  <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Show Title</Th>
                  <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Host(s)</Th>
                  <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Frequency</Th>
                  <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Platform Search</Th>
                  <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.podcasts.map((show) => (
                  <Tr key={show.id} _hover={{ bg: rowHoverBg }}>
                    <Td fontWeight="700" fontSize="0.82rem" color={show.apple_podcasts_url ? brandPrimary : undefined}>
                      {show.title}
                    </Td>
                    <Td fontSize="0.82rem" fontWeight="500">{show.host}</Td>
                    <Td fontSize="0.82rem">{show.frequency}</Td>
                    <Td fontSize="0.82rem">
                      {show.apple_podcasts_url ? (
                        <Link href={show.apple_podcasts_url} isExternal color={brandSecondary} fontWeight="600" display="inline-flex" alignItems="center" gap="0.2rem">
                          Apple Podcasts <ExternalLinkIcon mx="2px" />
                        </Link>
                      ) : (
                        <Text fontSize="0.78rem" color={textColorMuted} italic="true">No standalone match</Text>
                      )}
                    </Td>
                    <Td>
                      <Tag
                        size="sm"
                        variant="solid"
                        colorScheme={
                          show.status === 'active'
                            ? 'green'
                            : show.status === 'ended'
                            ? 'red'
                            : 'gray'
                        }
                        fontWeight="bold"
                        fontSize="0.68rem"
                        px="0.4rem"
                        py="2px"
                      >
                        {show.status === 'active' ? 'Active' : show.status === 'ended' ? 'Ended' : 'External'}
                      </Tag>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* 6. Employer Universe TreeMap */}
        <EmployerTreeMap
          employers={data.employers}
          cardBg={cardBg}
          borderLight={borderLight}
          textColorMuted={textColorMuted}
          colorMode={colorMode}
        />

        {/* 7. Competency Command Center */}
        <CompetencyCommandCenter
          competencies={data.competencies}
          cardBg={cardBg}
          borderLight={borderLight}
          textColorMuted={textColorMuted}
          rowHoverBg={rowHoverBg}
        />

      </Box>
    </Box>
  );
}

export default Dashboard;

// ─── Employer Universe TreeMap ──────────────────────────────────────────────
const INDUSTRY_COLORS = {
  'Transportation & Logistics': '#3182CE',
  'Education': '#2B6CB0',
  'Manufacturing & Construction': '#2C7A7B',
  'Government': '#2B6CB0',
  'Environmental & Waste Management': '#276749',
  'Automotive Services': '#553C9A',
  'Production Companies & Studio Entities': '#805AD5',
  'Media & Publishing': '#6B46C1',
  'Financial & Administrative Services': '#9F7AEA',
  'Food & Beverage': '#38B2AC',
  'Facilities & Services': '#4A5568',
  'Energy & Utilities': '#D69E2E',
  'Agriculture': '#68D391',
  'Retail & Distribution': '#FC8181',
  'Non-Profit / Cultural': '#B794F4',
};

function EmployerTreeMap({ employers, cardBg, borderLight, textColorMuted, colorMode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const drawerBg = colorMode === 'dark' ? 'oklch(18% 0.015 240)' : 'white';

  const industryGroups = useMemo(() => {
    const map = {};
    (employers || []).forEach(e => {
      if (!map[e.industry]) map[e.industry] = [];
      map[e.industry].push(e);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [employers]);

  const treemapSeries = [{
    data: industryGroups.map(([name, emps]) => ({
      x: name,
      y: emps.length,
      fillColor: INDUSTRY_COLORS[name] || '#718096',
    })),
  }];

  const treemapOptions = {
    chart: {
      type: 'treemap',
      toolbar: { show: false },
      background: 'transparent',
      events: {
        dataPointSelection: (event, chartCtx, config) => {
          const industry = industryGroups[config.dataPointIndex]?.[0];
          if (industry) {
            setSelectedIndustry(industry);
            onOpen();
          }
        },
      },
    },
    theme: { mode: colorMode },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      formatter: (text, op) => [text, `${op.value} employers`],
    },
    tooltip: {
      y: { formatter: (val) => `${val} employers` },
    },
    plotOptions: {
      treemap: {
        enableShades: false,
        distributed: true,
      },
    },
  };

  const selectedEmps = selectedIndustry
    ? industryGroups.find(([n]) => n === selectedIndustry)?.[1] || []
    : [];

  const accentColor = selectedIndustry ? (INDUSTRY_COLORS[selectedIndustry] || '#718096') : '#718096';
  const drawerScheme = selectedIndustry && (
    INDUSTRY_COLORS[selectedIndustry]?.startsWith('#3182') ||
    INDUSTRY_COLORS[selectedIndustry]?.startsWith('#2B6') ||
    INDUSTRY_COLORS[selectedIndustry]?.startsWith('#2C7') ||
    INDUSTRY_COLORS[selectedIndustry]?.startsWith('#276')
  ) ? 'blue' : 'purple';

  return (
    <>
      <Box bg={cardBg} p="1.5rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} mb="2.5rem">
        <Box mb="1.5rem">
          <Heading as="h3" fontSize="1.05rem" fontWeight="800">
            Employer Universe
          </Heading>
          <Text fontSize="0.78rem" color={textColorMuted} mt="0.2rem">
            {(employers || []).length} accounts across {industryGroups.length} industries &mdash; Click a segment to explore
          </Text>
        </Box>

        <Box h="320px">
          <Chart
            options={treemapOptions}
            series={treemapSeries}
            type="treemap"
            width="100%"
            height="100%"
          />
        </Box>
      </Box>

      {/* Industry Detail Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.400" />
        <DrawerContent bg={drawerBg} borderLeft="3px solid" borderLeftColor={accentColor}>
          <DrawerCloseButton mt="0.5rem" />
          <DrawerHeader pb="0" pt="1.5rem">
            <VStack align="start" spacing="0.25rem">
              <Text
                fontSize="0.65rem"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="0.1em"
                color={accentColor}
              >
                Industry Sector
              </Text>
              <Text fontSize="1.15rem" fontWeight="800" lineHeight="1.2">
                {selectedIndustry}
              </Text>
              <HStack spacing="0.5rem" mt="0.25rem">
                <Tag size="sm" colorScheme={drawerScheme} variant="solid" fontWeight="700">
                  {selectedEmps.length} employer{selectedEmps.length !== 1 ? 's' : ''}
                </Tag>
                <Tag size="sm" colorScheme={drawerScheme} variant="outline" fontWeight="600">
                  California
                </Tag>
              </HStack>
            </VStack>
          </DrawerHeader>

          <DrawerBody pt="1.5rem">
            <VStack align="stretch" spacing="0.75rem">
              {selectedEmps.map((e) => (
                <Box
                  key={e.id}
                  p="0.85rem"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderLight}
                  borderLeft="3px solid"
                  borderLeftColor={accentColor}
                  _hover={{ bg: drawerScheme === 'blue' ? 'blue.50' : 'purple.50', _dark: { bg: 'whiteAlpha.50' } }}
                  transition="background 0.15s"
                >
                  <Text fontSize="0.88rem" fontWeight="700">{e.name}</Text>
                  <Text fontSize="0.75rem" color={textColorMuted} mt="0.15rem">
                    📍 {e.location}
                  </Text>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}


// ─── Competency Command Center ──────────────────────────────────────────────
const COMP_TABS = [
  { key: 'strategic_core', label: 'Strategic Core', scheme: 'blue', emoji: '⚡' },
  { key: 'core_professional', label: 'Professional Core', scheme: 'purple', emoji: '🎯' },
  { key: 'technical_skills', label: 'Technical Skills', scheme: 'teal', emoji: '💻' },
  { key: 'skills_list', label: 'Skills Inventory', scheme: 'green', emoji: '📋' },
];

function CompetencyCommandCenter({ competencies, cardBg, borderLight, textColorMuted, rowHoverBg }) {
  const [search, setSearch] = useState('');
  const [tabIdx, setTabIdx] = useState(0);

  const currentGroup = COMP_TABS[tabIdx].key;
  const currentScheme = COMP_TABS[tabIdx].scheme;

  const groupData = useMemo(() => {
    const filtered = (competencies || []).filter(c => c.group_type === currentGroup);
    const byCategory = {};
    filtered.forEach(c => {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    });
    return Object.entries(byCategory);
  }, [competencies, currentGroup]);

  const filteredData = useMemo(() => {
    if (!search) return groupData;
    const q = search.toLowerCase();
    return groupData
      .map(([cat, items]) => [
        cat,
        items.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
      ])
      .filter(([, items]) => items.length > 0);
  }, [groupData, search]);

  return (
    <Box bg={cardBg} p="1.5rem" borderRadius="2xl" border="1px solid" borderColor={borderLight} mb="2.5rem">
      <Flex justify="space-between" align="center" mb="1.5rem" wrap="wrap" gap="1rem">
        <Box>
          <Heading as="h3" fontSize="1.05rem" fontWeight="800">
            Competency Command Center
          </Heading>
          <Text fontSize="0.78rem" color={textColorMuted} mt="0.2rem">
            {(competencies || []).length} competencies across 3 domains
          </Text>
        </Box>
        <InputGroup size="sm" maxW="240px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={textColorMuted} />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search competencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="full"
          />
        </InputGroup>
      </Flex>

      <Tabs index={tabIdx} onChange={setTabIdx} variant="soft-rounded" size="sm" mb="1.5rem">
        <TabList gap="0.5rem">
          {COMP_TABS.map((t, i) => (
            <Tab key={t.key} colorScheme={t.scheme} fontWeight="700" fontSize="0.8rem">
              {t.emoji} {t.label}
              <Badge ml="0.5rem" colorScheme={t.scheme} borderRadius="full" fontSize="0.65rem">
                {(competencies || []).filter(c => c.group_type === t.key).length}
              </Badge>
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="1rem">
        {filteredData.map(([category, items]) => (
          <CompetencyCard
            key={category}
            category={category}
            items={items}
            scheme={currentScheme}
            borderLight={borderLight}
            textColorMuted={textColorMuted}
            rowHoverBg={rowHoverBg}
          />
        ))}
      </SimpleGrid>

      {filteredData.length === 0 && (
        <Text textAlign="center" py="3rem" color={textColorMuted} fontSize="0.9rem">
          No competencies found matching &ldquo;{search}&rdquo;
        </Text>
      )}
    </Box>
  );
}

function CompetencyCard({ category, items, scheme, borderLight, textColorMuted, rowHoverBg }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <Box border="1px solid" borderColor={borderLight} borderRadius="xl" overflow="hidden">
      <Box
        px="1rem"
        py="0.75rem"
        borderLeft="3px solid"
        borderLeftColor={scheme === 'blue' ? 'blue.400' : scheme === 'purple' ? 'purple.400' : 'teal.400'}
        bg={rowHoverBg}
      >
        <Text fontSize="0.75rem" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
          {category}
        </Text>
        <Text fontSize="0.65rem" color={textColorMuted}>{items.length} skill{items.length !== 1 ? 's' : ''}</Text>
      </Box>
      <VStack align="stretch" spacing="0" divider={<Box borderTop="1px solid" borderColor={borderLight} />}>
        {items.map((item) => (
          <Box key={item.name}>
            <HStack
              px="1rem"
              py="0.6rem"
              cursor="pointer"
              _hover={{ bg: rowHoverBg }}
              justify="space-between"
              onClick={() => setExpanded(e => e === item.name ? null : item.name)}
            >
              <Text fontSize="0.8rem" fontWeight="600">{item.name}</Text>
              <Box fontSize="0.7rem" opacity={0.5} flexShrink={0}>
                {expanded === item.name ? '▴' : '▾'}
              </Box>
            </HStack>
            <Collapse in={expanded === item.name} animateOpacity>
              <Text px="1rem" pb="0.75rem" fontSize="0.75rem" color={textColorMuted} lineHeight="1.5">
                {item.description}
              </Text>
            </Collapse>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
