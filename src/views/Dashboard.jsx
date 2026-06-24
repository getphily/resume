import React, { useState } from 'react';
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
  Divider,
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
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SearchIcon, ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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

  // Chart configuration (Skills Breakdown)
  const skillsChartOptions = {
    chart: {
      id: 'skills-radar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: [colorMode === 'dark' ? '#00F2FE' : '#4E65FF'],
    xaxis: {
      categories: ['Labor Org', 'Bargaining', 'Trust Fiduciary', 'Video Pods', 'Audio/Vid Edit', 'Design Systems', 'SEO & Coding'],
      labels: {
        style: {
          colors: colorMode === 'dark' ? '#A3AED0' : '#2B3674',
          fontSize: '10px',
          fontWeight: 600,
        },
      },
    },
    yaxis: { show: false },
    theme: { mode: colorMode },
    stroke: { width: 2 },
    markers: { size: 4 },
  };

  const skillsChartSeries = [
    {
      name: 'Phil\'s Competencies',
      data: [95, 90, 85, 92, 88, 80, 82],
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
              <StatHelpText fontSize="0.68rem" mb="0" color={textColorMuted}>15+ Years Fiduciary & Field</StatHelpText>
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
                <Thead bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}>
                  <Tr>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Role</Th>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Company</Th>
                    <Th fontSize="0.68rem" fontWeight="700" color={textColorMuted}>Timeline</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTimeline.map((item) => (
                    <Tr key={item.id} _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50') }}>
                      <Td fontWeight="600" fontSize="0.82rem">{item.role}</Td>
                      <Td fontSize="0.82rem" color={brandPrimary} fontWeight="600">{item.company}</Td>
                      <Td fontSize="0.82rem">{item.date_range}</Td>
                    </Tr>
                  ))}
                  {filteredTimeline.length === 0 && (
                    <Tr>
                      <Td colSpan="3" textAlign="center" py="2rem" color={textColorMuted}>
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
              <Thead bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}>
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
                  <Tr key={show.id} _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50') }}>
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
      </Box>
    </Box>
  );
}

export default Dashboard;
