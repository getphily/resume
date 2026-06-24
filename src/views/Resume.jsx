import React, { useState, useEffect } from 'react';
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
  react: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/>
    </svg>
  ),
  vite: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.056 23.238a.57.57 0 0 1-1.02-.355v-5.202c0-.63-.512-1.143-1.144-1.143H5.148a.57.57 0 0 1-.464-.903l3.777-5.29c.54-.753 0-1.804-.93-1.804H.57a.574.574 0 0 1-.543-.746.6.6 0 0 1 .08-.157L5.008.78a.57.57 0 0 1 .467-.24h14.589a.57.57 0 0 1 .466.903l-3.778 5.29c-.54.755 0 1.806.93 1.806h5.745c.238 0 .424.138.513.322a.56.56 0 0 1-.063.603z"/>
    </svg>
  ),
  chakraui: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.678 1.583a3.492 3.492 0 0 0-3.03 1.76L.265 10.997a2.035 2.035 0 0 0-.064 1.886l4.486 7.784a3.493 3.493 0 0 0 3.03 1.751l8.602-.01a3.495 3.495 0 0 0 3.026-1.759l4.39-7.655a2.025 2.025 0 0 0-.002-2.008L19.339 3.34a3.494 3.494 0 0 0-3.028-1.756Zm4.365 1.244V9.11c0 .32.226.595.54.656l6.089 1.187c-2.005 3.466-4.006 6.934-6.008 10.4-.17.296-.62.176-.62-.166v-6.286a.667.667 0 0 0-.538-.656l-6.072-1.193 5.988-10.393c.168-.29.621-.178.621.168z"/>
    </svg>
  ),
};

function Resume({ data }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImg, setLightboxImg] = useState({ src: '', alt: '', title: '', desc: '', tags: [] });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Scroll past the title elements threshold (approx 220px)
      if (window.scrollY > 220) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openLightbox = (imgData) => {
    setLightboxImg(imgData);
    onOpen();
  };

  // Helper functions for career color coding
  const getTimelineTheme = (itemId) => {
    const laborIds = ['seiu-1021', 'teamsters-harris', 'teamsters-853', 'north-coast-trust', 'teamsters-665', 'teamsters-624'];
    if (laborIds.includes(itemId)) {
      return {
        color: useColorModeValue('blue.600', 'blue.300'),
        scheme: 'blue',
        label: 'Labor & Campaigns'
      };
    }
    return {
      color: useColorModeValue('purple.600', 'purple.300'),
      scheme: 'purple',
      label: 'Digital & Comms'
    };
  };

  const getPortfolioScheme = (category) => {
    if (category === 'campaigns' || category === 'flyers') {
      return 'blue';
    }
    return 'purple';
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
      <Box
        as="nav"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="100"
        bg={navBg}
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={borderLight}
        py="1rem"
        transform={scrolled ? 'translateY(0)' : 'translateY(-100%)'}
        opacity={scrolled ? 1 : 0}
        pointerEvents={scrolled ? 'auto' : 'none'}
        transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease"
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
      <Container maxW="container.md" pt="2rem">
        {/* Inline Top Header (scrolls away naturally) */}
        <Box mb="3rem" pb="1.5rem" borderBottom="2px solid" borderColor={borderLight}>
          {/* Row 1: Social links (LinkedIn first), dashboard view, and theme buttons */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            w="100%"
            mb="2rem"
            pb="0.75rem"
            borderBottom="1px solid"
            borderColor={borderLight}
          >
            <HStack spacing="0.5rem">
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
            </HStack>

            <HStack spacing="0.5rem">
              <Button
                size="xs"
                variant="outline"
                colorScheme="teal"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard View
              </Button>
              <IconButton
                aria-label="Toggle Color Mode"
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
            </HStack>
          </Box>

          {/* Grid row for Profile Image + Name / Contact info details */}
          <Box
            display="flex"
            flexDirection={{ base: 'column-reverse', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'center', md: 'center' }}
            gap="2rem"
            w="100%"
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing="0.75rem" textAlign={{ base: 'center', md: 'left' }}>
              {/* Row 2: Name */}
              <Heading
                as="h1"
                fontSize={{ base: '2.4rem', md: '3.5rem' }}
                fontWeight="800"
                letterSpacing="-0.03em"
                color={useColorModeValue('oklch(15% 0 0)', 'white')}
                lineHeight="1"
              >
                PHIL YBARROLAZA
              </Heading>

              {/* Row 3: City, phone number, and email address */}
              <Text
                fontSize={{ base: '0.82rem', md: '0.92rem' }}
                fontWeight="600"
                color={textColorMuted}
                display="flex"
                flexWrap="wrap"
                gap={{ base: '0.3rem 0.6rem', md: '0.5rem 0.8rem' }}
                alignItems="center"
                justifyContent={{ base: 'center', md: 'flex-start' }}
              >
                <Box as="span">Petaluma, California</Box>
                <Box as="span" color={borderLight}>|</Box>
                <Link href="tel:+17072925778" _hover={{ color: brandPrimary }}>(707) 292-5778</Link>
                <Box as="span" color={borderLight}>|</Box>
                <Link href="mailto:phil@redwoodempiremedia.com" _hover={{ color: brandPrimary }}>phil@redwoodempiremedia.com</Link>
              </Text>
            </VStack>

            {/* Profile Image */}
            <Box flexShrink="0">
              <Image
                src="/assets/profile.jpg"
                alt="Phil Ybarrolaza"
                borderRadius="full"
                boxSize={{ base: '100px', md: '120px' }}
                objectFit="cover"
                border="3px solid"
                borderColor={brandPrimary}
                shadow="md"
              />
            </Box>
          </Box>
        </Box>

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

        {/* 2. Hero / Profile Section (Traditional Professional Summary) */}
        <VStack align="start" spacing="1.2rem" mb="4rem">
          <Heading
            as="h2"
            fontSize="1.2rem"
            fontWeight="800"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color={brandPrimary}
          >
            Professional Summary
          </Heading>
          <Text fontSize="1.05rem" fontWeight="600" lineHeight="1.5">
            Combines deep labor relations expertise with cutting-edge digital communication strategies to amplify voices, build coalitions, and advance economic and social justice.
          </Text>
          <Text fontSize="1rem" color={textColorMuted} lineHeight="1.65">
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
              const theme = getTimelineTheme(item.id);
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
                      <Text fontSize="0.9rem" fontWeight="600" color={theme.color}>
                        {item.company} {item.location && `• ${item.location}`}
                      </Text>
                      <Text fontSize="0.8rem" color={textColorMuted} fontWeight="500">
                        {item.date_range}
                      </Text>
                    </VStack>
                    <HStack spacing="0.5rem" align="center">
                      <Tag size="sm" variant="subtle" colorScheme={theme.scheme} fontSize="0.75rem" fontWeight="700">
                        {theme.label}
                      </Tag>
                      <IconButton
                        aria-label="Expand details"
                        icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        size="sm"
                        onClick={() => toggleCard(item.id)}
                        variant="ghost"
                      />
                    </HStack>
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

        {/* 4. Skills & Core Competencies Section */}
        <Box id="skills" mb="4rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="1.5rem" letterSpacing="-0.01em">
            Skills & Core Competencies
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="2rem">
            <Box>
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

            <Box>
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
          </SimpleGrid>
        </Box>

        <Divider borderColor={borderLight} my="3rem" />

        {/* 4b. Education Section */}
        <Box id="education" mb="4rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="1.5rem" letterSpacing="-0.01em">
            Education
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="1.5rem">
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
          </SimpleGrid>
        </Box>

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
                    <Tag size="sm" variant="solid" colorScheme={getPortfolioScheme(item.category)} textTransform="uppercase" fontSize="0.65rem" fontWeight="700">
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
                href="https://react.dev/"
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
                  color: 'oklch(75% 0.15 200)',
                  borderColor: 'oklch(75% 0.15 200)',
                  boxShadow: '0 4px 12px oklch(75% 0.15 200 / 0.2)'
                }}
              >
                {techIcons.react}
                <Text>React</Text>
              </Link>
              <Link
                href="https://vite.dev/"
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
                  color: 'oklch(65% 0.20 280)',
                  borderColor: 'oklch(65% 0.20 280)',
                  boxShadow: '0 4px 12px oklch(65% 0.20 280 / 0.2)'
                }}
              >
                {techIcons.vite}
                <Text>Vite</Text>
              </Link>
              <Link
                href="https://v2.chakra-ui.com/"
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
                  color: 'oklch(68% 0.17 185)',
                  borderColor: 'oklch(68% 0.17 185)',
                  boxShadow: '0 4px 12px oklch(68% 0.17 185 / 0.2)'
                }}
              >
                {techIcons.chakraui}
                <Text>Chakra UI</Text>
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
