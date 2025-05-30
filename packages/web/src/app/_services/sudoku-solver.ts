import init, { solve } from '@worgho2/sudoku-solver';

export type SudokuSolverBoardType =
  | '4_regular'
  | '5_cross'
  | '6_brickwall'
  | '6_ladder'
  | '7_diagonal'
  | '8_brickwall'
  | '8_ladder'
  | '8_cross'
  | '9_regular'
  | '10_brickwall'
  | '10_ladder'
  | '10_ladder_2'
  | '10_diagonal'
  | '10_diamond'
  | '12_cross'
  | '12_short_and_long'
  | '12_ladder'
  | '12_brickwall'
  | '16_regular';

export type SudokuSolverBoard = number[][];

export type SudokuSolverGame = {
  board: SudokuSolverBoard;
  type: SudokuSolverBoardType;
};

export type SudokuSolverSolveOutput =
  | {
      error: undefined;
      game: SudokuSolverGame;
    }
  | {
      error: 'INVALID_GAME' | 'SOLUTION_NOT_FOUND';
    };

export interface SudokuSolver {
  solve(game: SudokuSolverGame): Promise<SudokuSolverSolveOutput>;
  validate(game: SudokuSolverGame): Promise<boolean>;
}

export class SudokuSolverImpl implements SudokuSolver {
  private static mapBoardType = (boardType: SudokuSolverBoardType): string => {
    const mapper: Record<SudokuSolverBoardType, string> = {
      '4_regular': 'B4Regular',
      '5_cross': 'B5Cross',
      '6_brickwall': 'B6Brickwall',
      '6_ladder': 'B6Ladder',
      '7_diagonal': 'B7Diagonal',
      '8_brickwall': 'B8Brickwall',
      '8_ladder': 'B8Ladder',
      '8_cross': 'B8Cross',
      '9_regular': 'B9Regular',
      '10_brickwall': 'B10Brickwall',
      '10_ladder': 'B10Ladder',
      '10_ladder_2': 'B10Ladder2',
      '10_diagonal': 'B10Diagonal',
      '10_diamond': 'B10Diamond',
      '12_cross': 'B12Cross',
      '12_short_and_long': 'B12ShortAndLong',
      '12_ladder': 'B12Ladder',
      '12_brickwall': 'B12Brickwall',
      '16_regular': 'B16Regular',
    };

    return mapper[boardType];
  };

  solve = async (game: SudokuSolverGame): Promise<SudokuSolverSolveOutput> => {
    try {
      await init();

      const board = solve({
        board: game.board.map((row) => row.map((cell) => (cell === 0 ? -1 : cell))),
        board_type: SudokuSolverImpl.mapBoardType(game.type),
      }) as number[][];

      return {
        error: undefined,
        game: {
          type: game.type,
          board,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        error: 'SOLUTION_NOT_FOUND',
      };
    }
  };

  validate = async (game: SudokuSolverGame): Promise<boolean> => {
    throw Error('Not implemented');
  };
}
