import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Flex, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const treeData = {
  id: 'root',
  label: 'Phil Ybarrolaza',
  children: [
    {
      id: 'labor',
      label: 'Labor Relations & Leadership',
      children: [
        {
          id: 'bargaining',
          label: 'Collective Bargaining',
          children: [
            { id: 'contract_costing', label: 'Contract Costing & Financial Analysis' },
            { id: 'first_contracts', label: 'First Contracts' }
          ]
        },
        {
          id: 'organizing',
          label: 'Organizing & Campaigns',
          children: [
            { id: 'coalition_building', label: 'Coalition Building & Strategic Campaigns' },
            { id: 'steward_training', label: 'Steward Training & Member Engagement' },
            { id: 'project_management', label: 'Organizing Drives & Project Management' }
          ]
        },
        { id: 'grievance', label: 'Grievance Writing, Case Management & Panels' }
      ]
    },
    {
      id: 'comms',
      label: 'Strategic Communications',
      children: [
        {
          id: 'digital',
          label: 'Digital Organizing',
          children: [
            { id: 'seo', label: 'SEO, Website Development & Digital Algorithms' },
            { id: 'social_media', label: 'Digital Organizing & Social Media Management' },
            { id: 'content_strategy', label: 'Content Strategy & Campaign Messaging' }
          ]
        },
        {
          id: 'media_production',
          label: 'Media Production',
          children: [
            { id: 'video_podcast', label: 'Video Podcast Production & Editing' },
            { id: 'av_editing', label: 'Audio & Video Editing (Final Cut Pro, Audacity, CapCut)' },
            { id: 'graphic_design', label: 'Graphic Layout (Photoshop, Illustrator, InDesign)' }
          ]
        }
      ]
    }
  ]
};

// Helper functions for tree traversal and relationship checks
const isDescendant = (parent, childId) => {
  if (parent.id === childId) return true;
  if (parent.children) {
    return parent.children.some(c => isDescendant(c, childId));
  }
  return false;
};

const findNode = (root, id) => {
  if (root.id === id) return root;
  if (root.children) {
    for (let child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

const TreeNode = ({ node, isRoot, borderLight, brandPrimary, onNodeClick, focusedNodeId, focusedNodeObj }) => {
  const nodeBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Check if this node is in the active path of the focused branch
  const inFocusPath = useMemo(() => {
    if (!focusedNodeId) return true;
    return isDescendant(node, focusedNodeId) || (focusedNodeObj && isDescendant(focusedNodeObj, node.id));
  }, [node, focusedNodeId, focusedNodeObj]);

  return (
    <Flex id={`subtree-${node.id}`} align="flex-start" position="relative" _notLast={{ mb: "1rem" }}>
      {/* Node Box */}
      <Flex align="center">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          style={{ zIndex: 2, opacity: inFocusPath ? 1 : 0.22, transition: 'opacity 0.4s ease' }}
        >
          <Box
            px="1rem"
            py="0.75rem"
            bg={isRoot ? brandPrimary : nodeBg}
            border="2px solid"
            borderColor={isRoot ? brandPrimary : borderLight}
            borderRadius="md"
            boxShadow="sm"
            position="relative"
            minW="180px"
            maxW="250px"
            textAlign="center"
            _hover={{ borderColor: brandPrimary, boxShadow: 'md' }}
            transition="border-color 0.2s, box-shadow 0.2s"
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(node.id);
            }}
          >
            <Text 
              fontWeight={isRoot ? "800" : "600"} 
              fontSize={isRoot ? "1rem" : "0.85rem"} 
              color={isRoot ? "white" : textColor}
              lineHeight="1.2"
            >
              {node.label}
            </Text>
          </Box>
        </motion.div>
        
        {/* Horizontal line from parent node to children wrapper */}
        {node.children && node.children.length > 0 && (
          <Box 
            w="2rem" 
            h="2px" 
            bg={borderLight} 
            zIndex={1} 
            opacity={inFocusPath ? 1 : 0.15}
            transition="opacity 0.4s ease"
          />
        )}
      </Flex>

      {/* Children Wrapper */}
      {node.children && node.children.length > 0 && (
        <Flex direction="column" position="relative" py="0.5rem">
          {node.children.map((child, index) => {
            const isFirst = index === 0;
            const isLast = index === node.children.length - 1;
            
            // Check if the line to this child should be highlighted
            const childInFocus = !focusedNodeId || 
              isDescendant(child, focusedNodeId) || 
              (focusedNodeObj && isDescendant(focusedNodeObj, child.id));
            const lineOpacity = childInFocus ? 1 : 0.15;
            
            return (
              <Flex key={child.id} align="center" position="relative" mt={isFirst ? 0 : "1rem"}>
                
                {/* Horizontal branch line connecting to this child */}
                <Box 
                  w="2rem" 
                  h="2px" 
                  bg={borderLight} 
                  position="absolute" 
                  left="-2rem" 
                  top="50%" 
                  transform="translateY(-50%)" 
                  zIndex={1} 
                  opacity={lineOpacity}
                  transition="opacity 0.4s ease"
                />
                
                {/* Vertical branch line segments */}
                <Box
                  position="absolute"
                  left="-2rem"
                  top={isFirst ? "50%" : 0}
                  bottom={isLast ? "50%" : 0}
                  w="2px"
                  bg={borderLight}
                  zIndex={1}
                  opacity={lineOpacity}
                  transition="opacity 0.4s ease"
                />

                <TreeNode 
                  node={child} 
                  isRoot={false} 
                  borderLight={borderLight} 
                  brandPrimary={brandPrimary} 
                  onNodeClick={onNodeClick}
                  focusedNodeId={focusedNodeId}
                  focusedNodeObj={focusedNodeObj}
                />
              </Flex>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};

export default function SkillsTree({ borderLight, brandPrimary }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState({ x: 20, y: 50, scale: 0.95 });
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  const focusedNodeObj = useMemo(() => {
    return focusedNodeId ? findNode(treeData, focusedNodeId) : null;
  }, [focusedNodeId]);

  const handleNodeClick = (nodeId) => {
    if (!containerRef.current) return;
    setFocusedNodeId(nodeId);

    const container = containerRef.current.getBoundingClientRect();
    const subtree = document.getElementById(`subtree-${nodeId}`);
    if (!subtree) return;
    
    const subtreeRect = subtree.getBoundingClientRect();

    // 1. Calculate raw coordinates (canceling out current transform)
    const relLeft = subtreeRect.left - container.left;
    const relTop = subtreeRect.top - container.top;
    
    const rawLeft = (relLeft - zoom.x) / zoom.scale;
    const rawTop = (relTop - zoom.y) / zoom.scale;
    const rawWidth = subtreeRect.width / zoom.scale;
    const rawHeight = subtreeRect.height / zoom.scale;

    // 2. Determine target scale to fit the subtree with padding
    const scaleX = (container.width * 0.75) / rawWidth;
    const scaleY = (container.height * 0.75) / rawHeight;
    let targetScale = Math.min(scaleX, scaleY);
    // Clamp scale so it doesn't get ridiculously huge or tiny
    targetScale = Math.max(Math.min(targetScale, 1.4), 0.8);

    // 3. Center the subtree
    const rawCenterX = rawLeft + rawWidth / 2;
    const rawCenterY = rawTop + rawHeight / 2;

    const targetX = container.width / 2 - rawCenterX * targetScale;
    const targetY = container.height / 2 - rawCenterY * targetScale;

    setZoom({ x: targetX, y: targetY, scale: targetScale });
  };

  const handleReset = () => {
    setFocusedNodeId(null);
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    
    const subtree = document.getElementById('subtree-root');
    if (!subtree) {
      setZoom({ x: 20, y: 80, scale: 0.9 });
      return;
    }
    const subtreeRect = subtree.getBoundingClientRect();
    
    const relLeft = subtreeRect.left - container.left;
    const relTop = subtreeRect.top - container.top;
    
    const rawLeft = (relLeft - zoom.x) / zoom.scale;
    const rawTop = (relTop - zoom.y) / zoom.scale;
    const rawWidth = subtreeRect.width / zoom.scale;
    const rawHeight = subtreeRect.height / zoom.scale;
    
    const scaleX = (container.width * 0.9) / rawWidth;
    const scaleY = (container.height * 0.8) / rawHeight;
    const targetScale = Math.min(scaleX, scaleY, 0.95);
    
    const rawCenterX = rawLeft + rawWidth / 2;
    const rawCenterY = rawTop + rawHeight / 2;
    
    const targetX = container.width / 2 - rawCenterX * targetScale;
    const targetY = container.height / 2 - rawCenterY * targetScale;
    
    setZoom({ x: targetX, y: targetY, scale: targetScale });
  };

  // Center tree on load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleReset();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box 
      ref={containerRef}
      w="100%" 
      h="520px"
      overflow="hidden" 
      position="relative"
      bg={useColorModeValue('gray.50', 'rgba(0,0,0,0.15)')}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderLight}
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
    >
      {/* Zoomable Container Wrapper */}
      <motion.div
        animate={{
          x: zoom.x,
          y: zoom.y,
          scale: zoom.scale
        }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        style={{
          transformOrigin: "top left",
          display: "inline-block",
          padding: "2rem"
        }}
      >
        <TreeNode 
          node={treeData} 
          isRoot={true} 
          borderLight={borderLight} 
          brandPrimary={brandPrimary} 
          onNodeClick={handleNodeClick}
          focusedNodeId={focusedNodeId}
          focusedNodeObj={focusedNodeObj}
        />
      </motion.div>

      {/* Navigation overlay controls */}
      <Flex 
        position="absolute" 
        bottom="1.25rem" 
        left="1.25rem" 
        gap="0.5rem" 
        zIndex={10}
      >
        {focusedNodeId && (
          <Button
            size="xs"
            colorScheme="blue"
            onClick={handleReset}
            borderRadius="md"
            boxShadow="md"
          >
            Reset Zoom
          </Button>
        )}
        <Text fontSize="0.7rem" color="gray.400" bg={useColorModeValue('whiteAlpha.800', 'blackAlpha.800')} px="0.5rem" py="0.2rem" borderRadius="md" display="flex" alignItems="center">
          Click any skill to zoom-to-fit
        </Text>
      </Flex>
    </Box>
  );
}
