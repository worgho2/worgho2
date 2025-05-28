'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  Link,
} from '@chakra-ui/react';
import { SiRust, SiReact, SiNextdotjs, SiTypescript, SiAmazon, SiNotion } from 'react-icons/si';
import {
  FaExternalLinkAlt,
  FaGithub,
  FaRocket,
  FaBrain,
  FaLink,
  FaBook,
  FaJava,
} from 'react-icons/fa';

const projects = [
  {
    title: 'Sudoku Solver',
    description:
      'High-performance Sudoku solver built with Rust and compiled to WebAssembly for blazing-fast browser execution. Features advanced algorithms and an intuitive React interface.',
    technologies: ['Rust', 'WebAssembly', 'React', 'TypeScript'],
    techIcons: [SiRust, SiReact, SiTypescript],
    icon: FaBrain,
    color: '#CE422B',
    gradient: 'linear(to-br, orange.400, red.500)',
    features: [
      'Rust-powered WebAssembly core',
      'Sub-millisecond solving times',
      'Interactive puzzle interface',
      'Multiple difficulty levels',
    ],
    demoUrl: '/sudoku-solver',
    githubUrl: 'https://github.com/worgho2/sudoku-solver',
    status: 'Live',
  },
  {
    title: 'URL Shortener',
    description:
      'Enterprise-grade URL shortening service built with Java Micronaut and deployed on AWS. Features custom domains, analytics, and high-availability architecture.',
    technologies: ['Java', 'Micronaut', 'AWS', 'DynamoDB'],
    techIcons: [FaJava, SiAmazon],
    icon: FaLink,
    color: '#ED8B00',
    gradient: 'linear(to-br, blue.400, purple.500)',
    features: [
      'Serverless AWS architecture',
      'Custom domain support',
      'Real-time analytics',
      '99.9% uptime SLA',
    ],
    demoUrl: '/url-shortener',
    githubUrl: 'https://github.com/worgho2/url-shortener',
    status: 'Live',
  },
  {
    title: 'Notion Blog',
    description:
      'Modern blog platform powered by Notion as a CMS, built with Next.js. Seamlessly integrates content management with a beautiful, fast-loading frontend.',
    technologies: ['Next.js', 'Notion API', 'TypeScript', 'Vercel'],
    techIcons: [SiNextdotjs, SiNotion, SiTypescript],
    icon: FaBook,
    color: '#000000',
    gradient: 'linear(to-br, gray.600, gray.800)',
    features: [
      'Notion-powered CMS',
      'Static site generation',
      'SEO optimized',
      'Lightning-fast performance',
    ],
    demoUrl: '/blog',
    githubUrl: 'https://github.com/worgho2/notion-blog',
    status: 'Live',
  },
];

const ProjectCard = ({ project }: { project: any }) => {
  return (
    <Box
      bg={{ base: 'white', _dark: 'gray.800' }}
      border='1px'
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      borderRadius='xl'
      overflow='hidden'
      transition='all 0.3s ease'
      _hover={{
        transform: 'translateY(-4px)',
        shadow: '2xl',
        borderColor: project.color,
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
          colorScheme={project.status === 'Live' ? 'green' : 'yellow'}
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
          color='white'
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
          bg='white'
          borderRadius='full'
          opacity={0.3}
        />
        <Box
          position='absolute'
          bottom={3}
          right={6}
          w={2}
          h={2}
          bg='white'
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
            {project.technologies.map((tech: string) => (
              <Badge
                key={tech}
                variant='outline'
                colorScheme='blue'
                borderRadius='full'
                px={3}
                py={1}
              >
                {tech}
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
              colorScheme='blue'
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
            href={project.githubUrl}
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

export default function FeaturedProjectsSection() {
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
              bgClip='text'
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
                colorScheme='blue'
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
}
