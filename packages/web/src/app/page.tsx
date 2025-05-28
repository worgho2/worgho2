import { PageContentContainer } from '@/app/_components/page-content-container';
import { HeroSection } from './_components/hero-section';
import SkillsSection from './_components/SkillsSection';
import FeaturedProjectsSection from './_components/FeaturedProjectsSection';
import { AboutSection } from './_components/about-section';
import { ContactSection } from './_components/contact-section';

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
