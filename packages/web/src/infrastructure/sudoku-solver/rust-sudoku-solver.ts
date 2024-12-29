import { SudokuSolver, SudokuSolverGame, SudokuSolverSolveOutput } from '@/ports/sudoku-solver';

export class RustSudokuSolver implements SudokuSolver {
  solve = async (game: SudokuSolverGame): Promise<SudokuSolverSolveOutput> => {
    throw Error('Not implemented');
  };

  validate = async (game: SudokuSolverGame): Promise<boolean> => {
    throw Error('Not implemented');
  };
}
