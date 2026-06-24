import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
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
  Collapse,
  useColorMode,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// Inline Tech Stack Icon Paths
const techIcons = {
  node: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
    </svg>
  ),
  express: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z"/>
    </svg>
  ),
  supabase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"/>
    </svg>
  ),
  js: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
    </svg>
  ),
  css3: (
    <svg width="18" height="18" viewBox="0 0 128 128" fill="currentColor">
      <path d="M18.814 114.123L8.76 1.352h110.48l-10.064 112.754-45.243 12.543-45.119-12.526z"/>
      <path d="M64.001 117.062l36.559-10.136 8.601-96.354h-45.16v106.49z" opacity="0.15"/>
      <path d="M64.001 51.429h18.302l1.264-14.163H64.001V23.435h34.682l-.332 3.711-3.4 38.114h-30.95V51.429z"/>
      <path d="M64.083 87.349l-.061.018-15.403-4.159-.985-11.031H33.752l1.937 21.717 28.331 7.863.063-.018v-14.39z"/>
      <path d="M81.127 64.675l-1.666 18.522-15.426 4.164v14.39l28.354-7.858.208-2.337 2.406-26.881H81.127z"/>
      <path d="M64.048 23.435v13.831H30.64l-.277-3.108-.63-7.012-.331-3.711h34.646zm-.047 27.996v13.831H48.792l-.277-3.108-.631-7.012-.33-3.711h16.447z"/>
    </svg>
  ),
  html5: (
    <svg width="18" height="18" viewBox="0 0 128 128" fill="currentColor">
      <path d="M19.037 113.876L9.032 1.661h109.936l-10.016 112.198-45.019 12.48z"/>
      <path d="M64 116.8l36.378-10.086 8.559-95.878H64z" opacity="0.15"/>
      <path d="M64 52.455H45.788L44.53 38.361H64V24.599H29.489l.33 3.692 3.382 37.927H64zm0 35.743l-.061.017-15.327-4.14-.979-10.975H33.816l1.928 21.609 28.193 7.826.063-.017z"/>
      <path d="M63.952 52.455v13.763h16.947l-1.597 17.849-15.35 4.143v14.319l28.215-7.82.207-2.325 3.234-36.233.335-3.696h-3.708zm0-27.856v13.762h33.244l.276-3.092.628-6.978.329-3.692z"/>
    </svg>
  ),
};

function Resume({ data }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImg, setLightboxImg] = useState({ src: '', alt: '', title: '', desc: '', tags: [] });
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openLightbox = (imgData) => {
    setLightboxImg(imgData);
    onOpen();
  };

  // Color mappings
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.75)', 'rgba(20, 22, 32, 0.75)');
  const borderLight = useColorModeValue('oklch(90% 0.01 240)', 'oklch(28% 0.015 240 / 0.7)');
  const textColorMuted = useColorModeValue('oklch(50% 0.01 240)', 'oklch(65% 0.01 240)');
  const brandPrimary = useColorModeValue('oklch(55% 0.16 260)', 'oklch(75% 0.15 200)');
  const brandSecondary = useColorModeValue('oklch(50% 0.18 200)', 'oklch(65% 0.20 280)');

  // Filtered portfolio items
  const filteredPortfolio = selectedCategory === 'all'
    ? data.portfolio
    : data.portfolio.filter(item => item.category === selectedCategory);

  return (
    <Box minH="100vh" pb="2rem">
      {/* 1. Header & Navigation */}
      <Box
        as="nav"
        position="sticky"
        top="0"
        zIndex="100"
        bg={navBg}
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={borderLight}
        py="1rem"
      >
        <Container maxW="container.lg" display="flex" justifyContent="space-between" alignItems="center">
          <Heading
            fontSize="1.3rem"
            fontWeight="800"
            letterSpacing="-0.02em"
            bgGradient={`linear(to-r, ${brandPrimary}, ${brandSecondary})`}
            bgClip="text"
            cursor="pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            PHIL YBARROLAZA
          </Heading>

          <HStack spacing="1.5rem" display={{ base: 'none', md: 'flex' }}>
            <Link href="#timeline" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Timeline</Link>
            <Link href="#skills" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Skills & Edu</Link>
            <Link href="#portfolio" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Portfolio</Link>
            <Button
              size="xs"
              variant="outline"
              colorScheme="teal"
              fontWeight="bold"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard View
            </Button>
            <Divider orientation="vertical" height="20px" borderColor={borderLight} />
            <HStack spacing="0.75rem">
              {data.socials?.primary?.linkedin && (
                <IconButton
                  as="a"
                  href={data.socials.primary.linkedin}
                  target="_blank"
                  rel="noopener"
                  aria-label="LinkedIn"
                  icon={<FaLinkedin />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.x && (
                <IconButton
                  as="a"
                  href={data.socials.primary.x}
                  target="_blank"
                  rel="noopener"
                  aria-label="X"
                  icon={<FaXTwitter />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.instagram && (
                <IconButton
                  as="a"
                  href={data.socials.primary.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  icon={<FaInstagram />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.youtube && (
                <IconButton
                  as="a"
                  href={data.socials.primary.youtube}
                  target="_blank"
                  rel="noopener"
                  aria-label="YouTube"
                  icon={<FaYoutube />}
                  size="sm"
                  variant="ghost"
                />
              )}
            </HStack>
          </HStack>

          <HStack spacing="1rem">
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
            <Button
              display={{ base: 'flex', md: 'none' }}
              size="xs"
              variant="outline"
              colorScheme="teal"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxW="container.md" pt="3rem">
        {/* Warning Badge if using fallbacks */}
        {data.usingFallbacks && (
          <Box
            bg="orange.500"
            color="white"
            px="1rem"
            py="0.5rem"
            borderRadius="md"
            mb="2rem"
            fontSize="0.85rem"
            fontWeight="bold"
            textAlign="center"
          >
            ⚠️ Running in Local Fallback Mode (Supabase database unconfigured or offline).
          </Box>
        )}

        {/* 2. Hero / Profile Section */}
        <VStack align="start" spacing="1rem" mb="4rem">
          <Tag size="sm" variant="subtle" colorScheme="teal" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">
            Labor Relations & Digital Communications
          </Tag>
          <Heading as="h1" fontSize={{ base: '2rem', md: '2.8rem' }} fontWeight="800" letterSpacing="-0.03em" lineHeight="1.1">
            Bridging collective organizing with modern digital narratives.
          </Heading>
          <Text fontSize="1.05rem" color={textColorMuted} lineHeight="1.6">
            Field representative, former union local president, and digital media producer with 15+ years of experience directing high-impact contract campaigns, building nationwide labor coalitions, and producing viral video/audio podcasts.
          </Text>
        </VStack>

        <Divider borderColor={borderLight} my="3rem" />

        {/* 3. Timeline Section */}
        <Box id="timeline" mb="5rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="2rem" letterSpacing="-0.01em">
            Career Timeline
          </Heading>
          <VStack spacing="1.5rem" align="stretch">
            {data.timeline.map((item) => {
              const isExpanded = expandedCards[item.id] || false;
              return (
                <Box
                  key={item.id}
                  border="1px solid"
                  borderColor={borderLight}
                  borderRadius="xl"
                  bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                  p="1.5rem"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md' }}
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing="0.2rem">
                      <Heading as="h3" fontSize="1.1rem" fontWeight="700">
                        {item.role}
                      </Heading>
                      <Text fontSize="0.9rem" fontWeight="600" color={brandPrimary}>
                        {item.company} {item.location && `• ${item.location}`}
                      </Text>
                      <Text fontSize="0.8rem" color={textColorMuted} fontWeight="500">
                        {item.date_range}
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="Expand details"
                      icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      size="sm"
                      onClick={() => toggleCard(item.id)}
                      variant="ghost"
                    />
                  </HStack>

                  <Collapse in={isExpanded} animateOpacity>
                    <VStack align="start" spacing="0.8rem" mt="1.5rem" pl="0.5rem">
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {item.bullets.map((bullet, idx) => (
                          <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                            {bullet}
                          </li>
                        ))}
                      </ul>

                      {/* Timeline Media Gallery */}
                      {item.media && item.media.length > 0 && (
                        <Box w="100%" mt="1rem">
                          <Text fontSize="0.75rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" mb="0.75rem" color={textColorMuted}>
                            Campaign Media & Production Logs
                          </Text>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="1rem">
                            {item.media.map((med, idx) => {
                              // Match actual local media or generate mockup assets
                              const mockImgUrl = `/assets/portfolio/still.png`; // Fallback image path
                              return (
                                <Box
                                  key={idx}
                                  border="1px solid"
                                  borderColor={borderLight}
                                  borderRadius="lg"
                                  overflow="hidden"
                                  cursor="pointer"
                                  onClick={() => openLightbox({
                                    src: mockImgUrl,
                                    alt: med.title,
                                    title: item.company,
                                    desc: `${med.title} (${med.req || 'Campaign Log'})`,
                                    tags: [item.role]
                                  })}
                                  transition="transform 0.2s"
                                  _hover={{ transform: 'scale(1.02)' }}
                                >
                                  <Box bg="blackAlpha.200" h="100px" position="relative" display="flex" alignItems="center" justifyContent="center" p="0.5rem">
                                    <Text fontSize="0.8rem" fontWeight="600" textAlign="center" opacity="0.8">
                                      📷 {med.title}
                                    </Text>
                                  </Box>
                                </Box>
                              );
                            })}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  </Collapse>
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* 4. Skills & Education Section */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="2rem" id="skills" mb="5rem">
          <Box>
            <Heading as="h2" fontSize="1.3rem" fontWeight="800" mb="1.5rem">
              Skills & Core Competencies
            </Heading>
            <VStack align="start" spacing="1.5rem">
              <Box w="100%">
                <Text fontSize="0.8rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" mb="0.75rem" color={brandPrimary}>
                  Campaign Leadership & Strategy
                </Text>
                <HStack spacing="0.5rem" wrap="wrap" rowGap="0.5rem">
                  {data.skills.filter(s => s.category === 'leadership').map((skill) => (
                    <Tag key={skill.id} size="sm" variant="subtle" colorScheme="blue">
                      {skill.name}
                    </Tag>
                  ))}
                </HStack>
              </Box>

              <Box w="100%">
                <Text fontSize="0.8rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" mb="0.75rem" color={brandSecondary}>
                  Digital Media & Communications
                </Text>
                <HStack spacing="0.5rem" wrap="wrap" rowGap="0.5rem">
                  {data.skills.filter(s => s.category === 'comms').map((skill) => (
                    <Tag key={skill.id} size="sm" variant="subtle" colorScheme="purple">
                      {skill.name}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </Box>

          <Box>
            <Heading as="h2" fontSize="1.3rem" fontWeight="800" mb="1.5rem">
              Education
            </Heading>
            <VStack spacing="1rem" align="stretch">
              {data.education.map((edu) => (
                <Box
                  key={edu.id}
                  border="1px solid"
                  borderColor={borderLight}
                  borderRadius="xl"
                  p="1.2rem"
                  bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                >
                  <Heading as="h4" fontSize="0.95rem" fontWeight="700" mb="0.2rem">
                    {edu.institution}
                  </Heading>
                  <Text fontSize="0.85rem" color={textColorMuted}>
                    {edu.details}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider borderColor={borderLight} my="3rem" />

        {/* 5. Creative Portfolio Section */}
        <Box id="portfolio" mb="5rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="1rem" letterSpacing="-0.01em">
            Creative Portfolio
          </Heading>
          <Text fontSize="0.95rem" color={textColorMuted} mb="2rem">
            Branding, mobilization flyers, and digital ad headers created for public campaign drives.
          </Text>

          {/* Filter Pills */}
          <HStack spacing="0.5rem" mb="2rem" wrap="wrap" rowGap="0.5rem">
            {['all', 'campaigns', 'flyers', 'branding'].map((cat) => (
              <Button
                key={cat}
                size="xs"
                variant={selectedCategory === cat ? 'solid' : 'ghost'}
                colorScheme="teal"
                borderRadius="full"
                onClick={() => setSelectedCategory(cat)}
                textTransform="capitalize"
              >
                {cat}
              </Button>
            ))}
          </HStack>

          {/* Portfolio Grid */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="1.5rem">
            {filteredPortfolio.map((item) => (
              <Box
                key={item.id}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="xl"
                overflow="hidden"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                transition="transform 0.25s"
                _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
                cursor="pointer"
                onClick={() => openLightbox({
                  src: `/${item.image_path}`,
                  alt: item.title,
                  title: item.title,
                  desc: item.description,
                  tags: item.tags
                })}
              >
                <Box h="180px" bg="blackAlpha.200" position="relative" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="2rem">🎨</Text>
                  <Box position="absolute" top="0.75rem" left="0.75rem">
                    <Tag size="sm" variant="solid" colorScheme="teal" textTransform="uppercase" fontSize="0.65rem" fontWeight="700">
                      {item.category}
                    </Tag>
                  </Box>
                </Box>
                <Box p="1.2rem">
                  <Heading as="h4" fontSize="1rem" fontWeight="700" mb="0.5rem">
                    {item.title}
                  </Heading>
                  <Text fontSize="0.82rem" color={textColorMuted} noOfLines={2}>
                    {item.description}
                  </Text>
                  <HStack mt="1rem" spacing="0.3rem" wrap="wrap">
                    {item.tags.map((tag) => (
                      <Tag key={tag} size="sm" variant="outline" fontSize="0.7rem" py="1px">
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider borderColor={borderLight} my="4rem" />

        {/* 6. Footer & Tech Stack badges */}
        <VStack spacing="2rem" as="footer" textAlign="center" pt="2rem">
          <VStack spacing="0.75rem">
            <Text
              fontSize="0.75rem"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
              color={textColorMuted}
            >
              Built with the stack
            </Text>
            <HStack spacing="0.75rem" wrap="wrap" justify="center">
              <Link
                href="https://nodejs.org/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(65% 0.15 140)',
                  borderColor: 'oklch(65% 0.15 140)',
                  boxShadow: '0 4px 12px oklch(65% 0.15 140 / 0.2)'
                }}
              >
                {techIcons.node}
                <Text>Node.js</Text>
              </Link>
              <Link
                href="https://expressjs.com/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: useColorModeValue('black', 'white'),
                  borderColor: useColorModeValue('black', 'white'),
                  boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                }}
              >
                {techIcons.express}
                <Text>Express</Text>
              </Link>
              <Link
                href="https://supabase.com/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(72% 0.18 150)',
                  borderColor: 'oklch(72% 0.18 150)',
                  boxShadow: '0 4px 12px oklch(72% 0.18 150 / 0.2)'
                }}
              >
                {techIcons.supabase}
                <Text>Supabase</Text>
              </Link>
              <Link
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(80% 0.15 90)',
                  borderColor: 'oklch(80% 0.15 90)',
                  boxShadow: '0 4px 12px oklch(80% 0.15 90 / 0.2)'
                }}
              >
                {techIcons.js}
                <Text>JavaScript</Text>
              </Link>
              <Link
                href="https://developer.mozilla.org/en-US/docs/Web/CSS"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(60% 0.18 250)',
                  borderColor: 'oklch(60% 0.18 250)',
                  boxShadow: '0 4px 12px oklch(60% 0.18 250 / 0.2)'
                }}
              >
                {techIcons.css3}
                <Text>CSS3</Text>
              </Link>
              <Link
                href="https://developer.mozilla.org/en-US/docs/Web/HTML"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(65% 0.2 40)',
                  borderColor: 'oklch(65% 0.2 40)',
                  boxShadow: '0 4px 12px oklch(65% 0.2 40 / 0.2)'
                }}
              >
                {techIcons.html5}
                <Text>HTML5</Text>
              </Link>
            </HStack>
          </VStack>

          <VStack spacing="0.4rem" fontSize="0.85rem" color={textColorMuted}>
            <Text>&copy; 2026 Phil Ybarrolaza. Built as an interactive index for media & past experiences.</Text>
            <Text fontWeight="600" color={brandPrimary}>
              Served via <Link href="https://getphily.io" isExternal>getphily.io</Link>
            </Text>
          </VStack>
        </VStack>
      </Container>

      {/* Lightbox Modal Component */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent border="1px solid" borderColor={borderLight} borderRadius="xl" overflow="hidden">
          <ModalHeader py="0.75rem" fontSize="1.1rem" fontWeight="700">
            {lightboxImg.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p="0" bg="black">
            <Image
              src={lightboxImg.src}
              alt={lightboxImg.alt}
              maxH="550px"
              w="100%"
              objectFit="contain"
              mx="auto"
            />
          </ModalBody>
          <Box p="1.5rem" bg={useColorModeValue('white', 'rgba(25, 27, 38, 0.95)')}>
            <Text fontSize="0.9rem" fontWeight="500" mb="1rem">
              {lightboxImg.desc}
            </Text>
            <HStack spacing="0.5rem">
              {lightboxImg.tags.map((tag) => (
                <Tag key={tag} size="sm" colorScheme="teal" variant="outline">
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Resume;
