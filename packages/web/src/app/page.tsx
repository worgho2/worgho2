import {
  AboutSection,
  ContactSection,
  FeaturedProjectsSection,
  HeroSection,
  PageContentContainer,
  SkillsSection,
} from '@/components';

export default function Home() {
  return (
    <PageContentContainer
      minH={'100vh'}
      pt={'60px'}
    >
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <FeaturedProjectsSection />
      <ContactSection />
    </PageContentContainer>
  );
}
