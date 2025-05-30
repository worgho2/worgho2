'use client';

import {
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  SiRust,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNotion,
  SiWebassembly,
  SiAmazondynamodb,
  SiFramework,
  SiGradle,
  SiChakraui,
} from 'react-icons/si';
import {
  FaExternalLinkAlt,
  FaGithub,
  FaRocket,
  FaBrain,
  FaLink,
  FaBook,
  FaJava,
} from 'react-icons/fa';
import { Button } from './button';
import { IconType } from 'react-icons/lib';
import { useColorModeValue } from './color-mode';

interface Technology {
  name: string;
  icon?: IconType;
  color: string;
}

interface Project {
  title: string;
  description: string;
  technologies: Technology[];
  icon: IconType;
  color: string;
  gradient: string;
  features: string[];
  sourceCodeUrl: string;
  demoUrl: string;
  status: 'Live' | 'In Progress' | 'On Hold';
}

const projects: Project[] = [
  {
    title: 'Sudoku Solver',
    description:
      'High-performance Sudoku solver built with Rust and compiled to WebAssembly for blazing-fast browser execution. Features graph coloring and backtracking algorithms.',
    technologies: [
      { name: 'Rust', icon: SiRust, color: '#CE422B' },
      { name: 'WebAssembly', icon: SiWebassembly, color: '#61DAFB' },
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
    ],
    icon: FaBrain,
    color: '#CE422B',
    gradient: 'linear(to-br, orange.400, red.500)',
    features: [
      'Rust-powered WebAssembly core',
      'Multiple game modes',
      'Graph coloring modelling',
      'Backtracking solver',
    ],
    demoUrl: '/sudoku-solver',
    sourceCodeUrl: 'https://github.com/worgho2/sudoku-solver',
    status: 'Live',
  },
  {
    title: 'URL Shortener',
    description:
      'Enterprise-grade URL shortening service built with Java Micronaut and deployed on AWS. Features custom paths and auto-expiry.',
    technologies: [
      { name: 'Java', icon: FaJava, color: '#007396' },
      { name: 'Micronaut', icon: SiFramework, color: '#007396' },
      { name: 'Gradle', icon: SiGradle, color: '#007396' },
      { name: 'DynamoDB', icon: SiAmazondynamodb, color: '#405059' },
    ],
    icon: FaLink,
    color: '#ED8B00',
    gradient: 'linear(to-br, blue.400, purple.500)',
    features: ['Serverless architecture', 'Custom paths', 'Auto-expiry', 'Turnstile captcha'],
    demoUrl: '/url-shortener',
    sourceCodeUrl: 'https://github.com/worgho2/url-shortener',
    status: 'Live',
  },
  {
    title: 'Notion Blog',
    description:
      'Modern blog platform powered by Notion as a CMS, built with Next.js. Seamlessly integrates content management with a beautiful, fast-loading frontend.',
    technologies: [
      { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
      { name: 'Notion', icon: SiNotion, color: '#000000' },
      { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
      { name: 'Chakra UI', icon: SiChakraui, color: '#000000' },
    ],
    icon: FaBook,
    color: '#805AD5',
    gradient: 'linear(to-br, gray.600, gray.800)',
    features: [
      'Notion as CMS',
      'Static site generation',
      'SEO optimized',
      'Lightning-fast loading',
    ],
    demoUrl: '/blog',
    sourceCodeUrl: 'https://github.com/worgho2/notion-blog',
    status: 'Live',
  },
];

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Box
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderWidth='1px'
      borderColor={{ base: 'gray.200', _dark: 'black' }}
      borderRadius='xl'
      overflow='hidden'
      transition='all 0.3s ease'
      _hover={{
        transform: 'translateY(-4px)',
        shadow: '2xl',
      }}
      position='relative'
    >
      {/* Status Badge */}
      <Box
        position='absolute'
        top={4}
        right={4}
        zIndex={2}
      >
        <Badge
          colorPalette={project.status === 'Live' ? 'green' : 'yellow'}
          variant='solid'
          borderRadius='full'
          px={3}
          py={1}
        >
          {project.status}
        </Badge>
      </Box>

      {/* Header with Gradient */}
      <Box
        h={20}
        bgGradient={project.gradient}
        position='relative'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Icon
          boxSize={12}
          color={useColorModeValue('gray.400', 'whiteAlpha.500')}
        >
          <project.icon />
        </Icon>

        {/* Decorative Elements */}
        <Box
          position='absolute'
          top={2}
          left={4}
          w={3}
          h={3}
          bg='gray.200'
          borderRadius='full'
          opacity={0.3}
        />
        <Box
          position='absolute'
          bottom={3}
          right={6}
          w={2}
          h={2}
          bg='gray.200'
          borderRadius='full'
          opacity={0.4}
        />
      </Box>

      {/* Content */}
      <VStack
        gap={6}
        p={6}
        align='stretch'
      >
        {/* Title and Description */}
        <VStack
          gap={3}
          align='stretch'
        >
          <Heading
            size='lg'
            color={{ base: 'gray.800', _dark: 'white' }}
          >
            {project.title}
          </Heading>
          <Text
            color={{ base: 'gray.600', _dark: 'gray.300' }}
            lineHeight='tall'
          >
            {project.description}
          </Text>
        </VStack>

        {/* Technologies */}
        <Box>
          <Text
            fontSize='sm'
            fontWeight='semibold'
            mb={3}
            color='gray.500'
          >
            Technologies
          </Text>
          <HStack
            gap={2}
            flexWrap='wrap'
          >
            {project.technologies.map((tech) => (
              <Badge
                key={tech.name}
                variant='outline'
                colorPalette='blue'
                borderRadius='full'
                px={3}
                py={1}
              >
                {tech.icon && (
                  <Icon
                    boxSize={3}
                    color={tech.color}
                  >
                    <tech.icon />
                  </Icon>
                )}
                {tech.name}
              </Badge>
            ))}
          </HStack>
        </Box>

        {/* Features */}
        <Box>
          <Text
            fontSize='sm'
            fontWeight='semibold'
            mb={3}
            color='gray.500'
          >
            Key Features
          </Text>
          <VStack
            gap={2}
            align='stretch'
          >
            {project.features.map((feature: string, index: number) => (
              <HStack
                key={index}
                gap={2}
              >
                <Icon
                  boxSize={3}
                  color={project.color}
                >
                  <FaRocket />
                </Icon>
                <Text
                  fontSize='sm'
                  color={{ base: 'gray.600', _dark: 'gray.300' }}
                >
                  {feature}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack
          gap={3}
          pt={2}
        >
          <Link
            href={project.demoUrl}
            flex={1}
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              size='sm'
              colorPalette='blue'
              w='100%'
            >
              <HStack gap={2}>
                <Icon boxSize={3}>
                  <FaExternalLinkAlt />
                </Icon>
                <Text>View Demo</Text>
              </HStack>
            </Button>
          </Link>

          <Link
            href={project.sourceCodeUrl}
            flex={1}
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              size='sm'
              variant='outline'
              w='100%'
            >
              <HStack gap={2}>
                <Icon boxSize={3}>
                  <FaGithub />
                </Icon>
                <Text>Source</Text>
              </HStack>
            </Button>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
};

export const FeaturedProjectsSection: React.FC = () => {
  return (
    <Box
      as='section'
      py={20}
      bg={{ base: 'gray.50', _dark: 'gray.800' }}
      position='relative'
      overflow='hidden'
    >
      {/* Background Elements */}
      <Box
        position='absolute'
        top={10}
        right={10}
        w={40}
        h={40}
        bgGradient='radial(circle, blue.100, transparent)'
        borderRadius='full'
        opacity={0.3}
      />
      <Box
        position='absolute'
        bottom={10}
        left={10}
        w={32}
        h={32}
        bgGradient='radial(circle, purple.100, transparent)'
        borderRadius='full'
        opacity={0.3}
      />

      <Container
        maxW='7xl'
        position='relative'
      >
        <VStack gap={16}>
          {/* Header */}
          <VStack
            gap={4}
            textAlign='center'
            maxW='4xl'
          >
            <Heading
              size='2xl'
              bgGradient='linear(to-r, blue.400, purple.500, pink.400)'
              colorPalette='white'
              fontWeight='bold'
            >
              Featured Projects
            </Heading>
            <Text
              fontSize='xl'
              color={{ base: 'gray.600', _dark: 'gray.300' }}
              lineHeight='tall'
            >
              A showcase of innovative solutions spanning from high-performance systems programming
              to modern web applications, demonstrating expertise across the full technology stack.
            </Text>
          </VStack>

          {/* Projects Grid */}
          <SimpleGrid
            columns={{ base: 1, lg: 3 }}
            gap={8}
            w='100%'
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
              />
            ))}
          </SimpleGrid>

          {/* Call to Action */}
          <VStack
            gap={4}
            textAlign='center'
          >
            <Text
              fontSize='lg'
              color={{ base: 'gray.600', _dark: 'gray.300' }}
            >
              Want to see more? Check out my complete portfolio on GitHub.
            </Text>
            <Link
              href='https://github.com/worgho2'
              _hover={{ textDecoration: 'none' }}
            >
              <Button
                size='lg'
                colorPalette='blue'
                // leftIcon={<FaGithub />/ˀ
              >
                View All Projects
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};
