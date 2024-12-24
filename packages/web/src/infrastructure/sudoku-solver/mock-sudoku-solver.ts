import { SudokuSolver, SudokuSolverGame, SudokuSolverSolveOutput } from '@/ports/sudoku-solver';

export class MockSudokuSolver implements SudokuSolver {
  solve = async (game: SudokuSolverGame): Promise<SudokuSolverSolveOutput> => {
    const dimension = game.board.length;

    return Promise.resolve({
      error: undefined,
      game: {
        type: game.type,
        board: Array.from({ length: dimension }, (_, i) =>
          Array.from({ length: dimension }, (_, j) => {
            if (game.board[i][j] === 0) {
              return Math.floor(Math.random() * dimension) + 1;
            }

            return game.board[i][j];
          })
        ),
      },
    });
  };

  validate = async (game: SudokuSolverGame): Promise<boolean> => {
    return Promise.resolve(true);
  };
}
