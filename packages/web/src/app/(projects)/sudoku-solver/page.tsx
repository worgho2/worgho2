import { PageContentContainer } from '@/components';
import { Metadata } from 'next';
import { baseMetadata } from '@/helpers';
import { SolverForm } from './solver-form';

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
