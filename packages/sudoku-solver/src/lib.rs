use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

mod board_type;
mod game;
mod graph;
mod node;

#[cfg(test)]
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[derive(Serialize, Deserialize)]
pub struct SolveInput {
    board: Vec<Vec<i32>>,
    board_type: String,
}

#[wasm_bindgen]
pub fn solve(js_input: JsValue) -> Result<JsValue, JsError> {
    let input: SolveInput = serde_wasm_bindgen::from_value(js_input)?;
    let board_type = board_type::BoardType::from_string(&input.board_type)
        .or(Err(JsError::new("Invalid board type")))?;
    let game = game::Game::new(input.board, board_type);
    let success = game.solve();

    if !success {
        return Err(JsError::new("Failed to solve board"));
    }

    Ok(serde_wasm_bindgen::to_value(&game.get_board())?)
}
