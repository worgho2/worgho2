import { PageContentContainer } from '@/app/_components/page-content-container';
import { Metadata } from 'next';
import { baseMetadata } from '@/app/_helpers/seo';
import { SolverForm } from './_components/solver-form';

export const metadata: Metadata = {
  title: 'Sudoku Solver',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Sudoku Solver',
  },
};

export default function Sudoku() {
  return (
    <PageContentContainer pt={'60px'}>
      <SolverForm paddingY={{ base: 6, md: 16 }} />
    </PageContentContainer>
  );
}
