'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon } from '@chakra-ui/react';
import {
  SiRust,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiAmazon,
  SiDocker,
  SiTerraform,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGit,
  SiLinux,
  SiZsh,
  SiSwift,
  SiShell,
  SiWebassembly,
  SiChakraui,
  SiVite,
  SiGooglecloud,
  SiJenkins,
  SiRailway,
  SiGithubactions,
  SiVectorworks,
  SiSqlite,
  SiAmazonwebservices,
  SiNodedotjs,
} from 'react-icons/si';
import { FaServer, FaCloud, FaDatabase, FaTools, FaJava } from 'react-icons/fa';
import { VscVscode } from 'react-icons/vsc';
import { IconType } from 'react-icons';

interface Skill {
  name: string;
  icon: IconType;
  color: string;
}

interface SkillCategory {
  title: string;
  icon: IconType;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Languages & Tools',
    icon: FaTools,
    skills: [
      { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
      { name: 'Swift', icon: SiSwift, color: '#F05138' },
      { name: 'Shell', icon: SiShell, color: '#00ADD8' },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'Rust', icon: SiRust, color: '#CE422B' },
      { name: 'Java', icon: FaJava, color: '#ED8B00' },
    ],
  },
  {
    title: 'Frontend',
    icon: FaServer,
    skills: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
      { name: 'WebAssembly', icon: SiWebassembly, color: '#654FF0' },
      { name: 'Vite', icon: SiVite, color: '#019733' },
      { name: 'Chakra UI', icon: SiChakraui, color: '#000000' },
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: FaCloud,
    skills: [
      { name: 'AWS', icon: SiAmazonwebservices, color: '#FF9900' },
      { name: 'GCP', icon: SiGooglecloud, color: '#4285F4' },
      { name: 'Railway', icon: SiRailway, color: '#2496ED' },
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'GitHub Actions', icon: SiGithubactions, color: '#24292E' },
      { name: 'Jenkins', icon: SiJenkins, color: '#D24939' },
      { name: 'Terraform', icon: SiTerraform, color: '#7B42BC' },
      { name: 'AWS CDK', icon: SiAmazonwebservices, color: '#FF9900' },
    ],
  },
  {
    title: 'Databases',
    icon: FaDatabase,
    skills: [
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'Redis', icon: SiRedis, color: '#DC382D' },
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791' },
      { name: 'SQLite', icon: SiSqlite, color: '#003B57' },
      { name: 'Pinecone Vector Database', icon: SiVectorworks, color: '#005571' },
    ],
  },
];

interface SkillCardProps {
  skill: Skill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
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
            %
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
            width={`100%`}
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

interface CategorySectionProps {
  category: SkillCategory;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  return (
    <Box
      p={6}
      bg={{ base: 'gray.50', _dark: 'gray.900' }}
      borderWidth='1px'
      borderColor={{ base: 'gray.200', _dark: 'gray.800' }}
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
        {category.skills.map((skill) => (
          <SkillCard
            key={skill.name}
            skill={skill}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export const SkillsSection: React.FC = () => {
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
              colorPalette='white'
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
              colorPalette='white'
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
                { icon: SiZsh, name: 'Zsh', color: '#019733' },
                { icon: SiDocker, name: 'Docker', color: '#2496ED' },
                { icon: VscVscode, name: 'VS Code', color: '#007ACC' },
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
};
