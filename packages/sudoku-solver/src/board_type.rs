pub enum BoardType {
    B4Regular,
    B5Cross,
    B6Brickwall,
    B6Ladder,
    B7Diagonal,
    B8Brickwall,
    B8Ladder,
    B8Cross,
    B9Regular,
    B10Brickwall,
    B10Ladder,
    B10Ladder2,
    B10Diagonal,
    B10Diamond,
    B12Brickwall,
    B12Cross,
    B12Ladder,
    B12ShortAndLong,
    B16Regular,
}

impl BoardType {
    pub fn from_string(board_type: &str) -> Result<BoardType, &str> {
        match board_type {
            "B4Regular" => Ok(BoardType::B4Regular),
            "B5Cross" => Ok(BoardType::B5Cross),
            "B6Brickwall" => Ok(BoardType::B6Brickwall),
            "B6Ladder" => Ok(BoardType::B6Ladder),
            "B7Diagonal" => Ok(BoardType::B7Diagonal),
            "B8Brickwall" => Ok(BoardType::B8Brickwall),
            "B8Ladder" => Ok(BoardType::B8Ladder),
            "B8Cross" => Ok(BoardType::B8Cross),
            "B9Regular" => Ok(BoardType::B9Regular),
            "B10Brickwall" => Ok(BoardType::B10Brickwall),
            "B10Ladder" => Ok(BoardType::B10Ladder),
            "B10Ladder2" => Ok(BoardType::B10Ladder2),
            "B10Diagonal" => Ok(BoardType::B10Diagonal),
            "B10Diamond" => Ok(BoardType::B10Diamond),
            "B12Brickwall" => Ok(BoardType::B12Brickwall),
            "B12Cross" => Ok(BoardType::B12Cross),
            "B12Ladder" => Ok(BoardType::B12Ladder),
            "B12ShortAndLong" => Ok(BoardType::B12ShortAndLong),
            "B16Regular" => Ok(BoardType::B16Regular),
            _ => Err("Unknown board type"),
        }
    }

    pub fn get_order(&self) -> i32 {
        match self {
            BoardType::B4Regular => 4,
            BoardType::B5Cross => 5,
            BoardType::B6Brickwall => 6,
            BoardType::B6Ladder => 6,
            BoardType::B7Diagonal => 7,
            BoardType::B8Brickwall => 8,
            BoardType::B8Ladder => 8,
            BoardType::B8Cross => 8,
            BoardType::B9Regular => 9,
            BoardType::B10Brickwall => 10,
            BoardType::B10Ladder => 10,
            BoardType::B10Ladder2 => 10,
            BoardType::B10Diagonal => 10,
            BoardType::B10Diamond => 10,
            BoardType::B12Brickwall => 12,
            BoardType::B12Cross => 12,
            BoardType::B12Ladder => 12,
            BoardType::B12ShortAndLong => 12,
            BoardType::B16Regular => 16,
        }
    }

    /**
     * TODO: Load from binary
     */
    pub fn get_edge_model(&self) -> Vec<Vec<Vec<(i32, i32)>>> {
        match self {
            BoardType::B4Regular => vec![],
            BoardType::B5Cross => vec![],
            BoardType::B6Brickwall => vec![],
            BoardType::B6Ladder => vec![],
            BoardType::B7Diagonal => vec![],
            BoardType::B8Brickwall => vec![],
            BoardType::B8Ladder => vec![],
            BoardType::B8Cross => vec![],
            BoardType::B9Regular => vec![],
            BoardType::B10Brickwall => vec![],
            BoardType::B10Ladder => vec![],
            BoardType::B10Ladder2 => vec![],
            BoardType::B10Diagonal => vec![],
            BoardType::B10Diamond => vec![],
            BoardType::B12Brickwall => vec![],
            BoardType::B12Cross => vec![],
            BoardType::B12Ladder => vec![],
            BoardType::B12ShortAndLong => vec![],
            BoardType::B16Regular => vec![],
        }
    }
}
