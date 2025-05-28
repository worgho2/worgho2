'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon } from '@chakra-ui/react';
import {
  SiRust,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiGo,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiAmazon,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiElasticsearch,
  SiGit,
  SiLinux,
  SiVim,
  SiVscodium,
} from 'react-icons/si';
import { FaServer, FaCloud, FaDatabase, FaTools, FaJava } from 'react-icons/fa';

const skillCategories = [
  {
    title: 'Languages',
    icon: FaTools,
    skills: [
      { name: 'Rust', icon: SiRust, level: 90, color: '#CE422B' },
      { name: 'TypeScript', icon: SiTypescript, level: 95, color: '#3178C6' },
      { name: 'JavaScript', icon: SiJavascript, level: 95, color: '#F7DF1E' },
      { name: 'Java', icon: FaJava, level: 85, color: '#ED8B00' },
      { name: 'Python', icon: SiPython, level: 80, color: '#3776AB' },
      { name: 'Go', icon: SiGo, level: 75, color: '#00ADD8' },
    ],
  },
  {
    title: 'Frontend',
    icon: FaServer,
    skills: [
      { name: 'React', icon: SiReact, level: 95, color: '#61DAFB' },
      { name: 'Next.js', icon: SiNextdotjs, level: 90, color: '#000000' },
      { name: 'WebAssembly', icon: SiRust, level: 85, color: '#654FF0' },
      { name: 'Node.js', icon: SiNodedotjs, level: 90, color: '#339933' },
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: FaCloud,
    skills: [
      { name: 'AWS', icon: SiAmazon, level: 90, color: '#FF9900' },
      { name: 'Docker', icon: SiDocker, level: 85, color: '#2496ED' },
      { name: 'Kubernetes', icon: SiKubernetes, level: 80, color: '#326CE5' },
      { name: 'Terraform', icon: SiTerraform, level: 85, color: '#7B42BC' },
    ],
  },
  {
    title: 'Databases',
    icon: FaDatabase,
    skills: [
      { name: 'PostgreSQL', icon: SiPostgresql, level: 90, color: '#336791' },
      { name: 'MongoDB', icon: SiMongodb, level: 85, color: '#47A248' },
      { name: 'Redis', icon: SiRedis, level: 80, color: '#DC382D' },
      { name: 'Elasticsearch', icon: SiElasticsearch, level: 75, color: '#005571' },
    ],
  },
];

const SkillCard = ({ skill }: { skill: any }) => {
  return (
    <Box
      p={4}
      bg={{ base: 'white', _dark: 'gray.800' }}
      border='1px'
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      borderRadius='lg'
      transition='all 0.3s ease'
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        borderColor: skill.color,
      }}
      position='relative'
      overflow='hidden'
    >
      <HStack
        gap={3}
        mb={3}
      >
        <Icon
          color={skill.color}
          boxSize={6}
        >
          <skill.icon />
        </Icon>
        <Text
          fontWeight='semibold'
          fontSize='sm'
        >
          {skill.name}
        </Text>
      </HStack>

      {/* Skill Level Bar */}
      <Box>
        <HStack
          justify='space-between'
          mb={1}
        >
          <Text
            fontSize='xs'
            color='gray.500'
          >
            Proficiency
          </Text>
          <Text
            fontSize='xs'
            color='gray.500'
          >
            {skill.level}%
          </Text>
        </HStack>
        <Box
          h={2}
          bg={{ base: 'gray.100', _dark: 'gray.700' }}
          borderRadius='full'
          overflow='hidden'
        >
          <Box
            h='100%'
            bg={skill.color}
            borderRadius='full'
            width={`${skill.level}%`}
            transition='width 1s ease-out'
            style={{
              animation: 'fillBar 1.5s ease-out',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const CategorySection = ({ category }: { category: any }) => {
  return (
    <Box
      p={6}
      bg={{ base: 'gray.50', _dark: 'gray.900' }}
      border='1px'
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      borderRadius='xl'
      transition='all 0.3s ease'
      _hover={{
        shadow: 'md',
      }}
    >
      <HStack
        gap={3}
        mb={6}
      >
        <Icon
          boxSize={8}
          color={{ base: 'blue.500', _dark: 'blue.300' }}
        >
          <category.icon />
        </Icon>
        <Heading
          size='md'
          color={{ base: 'gray.800', _dark: 'white' }}
        >
          {category.title}
        </Heading>
      </HStack>

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        gap={4}
      >
        {category.skills.map((skill: any) => (
          <SkillCard
            key={skill.name}
            skill={skill}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default function SkillsSection() {
  return (
    <Box
      as='section'
      py={20}
      bg={{ base: 'white', _dark: 'gray.900' }}
      position='relative'
      overflow='hidden'
    >
      {/* Background Pattern */}
      <Box
        position='absolute'
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.03}
        backgroundImage='radial-gradient(circle at 25px 25px, gray 2px, transparent 0)'
        backgroundSize='50px 50px'
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
            maxW='3xl'
          >
            <Heading
              size='2xl'
              bgGradient='linear(to-r, blue.400, purple.500, pink.400)'
              bgClip='text'
              fontWeight='bold'
            >
              Technical Arsenal
            </Heading>
            <Text
              fontSize='xl'
              color={{ base: 'gray.600', _dark: 'gray.300' }}
              lineHeight='tall'
            >
              A comprehensive toolkit spanning from systems programming to cloud architecture,
              enabling me to build robust, scalable solutions across the entire technology stack.
            </Text>
          </VStack>

          {/* Skills Grid */}
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap={8}
            w='100%'
          >
            {skillCategories.map((category) => (
              <CategorySection
                key={category.title}
                category={category}
              />
            ))}
          </SimpleGrid>

          {/* Additional Tools */}
          <Box
            textAlign='center'
            maxW='4xl'
          >
            <Heading
              size='lg'
              mb={6}
              color={'white'}
            >
              Development Environment
            </Heading>
            <HStack
              justify='center'
              gap={8}
              flexWrap='wrap'
            >
              {[
                { icon: SiGit, name: 'Git', color: '#F05032' },
                { icon: SiLinux, name: 'Linux', color: '#FCC624' },
                { icon: SiVim, name: 'Vim', color: '#019733' },
                { icon: SiVscodium, name: 'VS Code', color: '#007ACC' },
              ].map((tool) => (
                <VStack
                  key={tool.name}
                  gap={2}
                  transition='all 0.3s ease'
                  _hover={{ transform: 'scale(1.1)' }}
                >
                  <Icon
                    boxSize={8}
                    color={tool.color}
                  >
                    <tool.icon />
                  </Icon>
                  <Text
                    fontSize='sm'
                    fontWeight='medium'
                  >
                    {tool.name}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Container>

      <style jsx>{`
        @keyframes fillBar {
          from {
            width: 0%;
          }
          to {
            width: var(--final-width);
          }
        }
      `}</style>
    </Box>
  );
}
