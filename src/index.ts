/*
    10 + 3 Math puzzle game
    
    In the middle there is a random number.
    Using the up, down, left and right operations in the correct order
    try to get 13 as a result.

    Controls: Use arrow keys to select the operations!
*/


import { setCanvasPixelated, setGlEnable, vec2, Sound, drawText, engineInit, Color, keyWasPressed, setShowWatermark, drawRect } from "littlejsengine";
import { startGameRound } from "./helpers";
import { GameRound, Operation, OPERATION_TYPE } from "./types";
import { COLOR_PALETTE, DIFFICULTY, GAME_STATE } from "./constants";
import { renderBackground, renderInstructions, renderLevel, renderMaxLevel } from "./render-functions";

// do not use pixelated rendering
setCanvasPixelated(false);
setGlEnable(false);
// remove watermark
setShowWatermark(false);


// sound effects
const sound_goodMove = new Sound([,0,349.2282]);
const sound_badMove = new Sound([,0,146.8324,,,.5,,.3,,,,,,,,,,,.2]);

// ***********game variables************
  let gameRound: GameRound;
  let addOperand: number;
  let subOperand: number;
  let divOperand: number;
  let mulOperand: number;
  let gameState = GAME_STATE.PLAYING;
  let level = 1;
  let maxLevel = localStorage.getItem("maxLevel");
// *************************************

const createOperands = (gameRound: GameRound) => {
  gameRound.sequence.forEach(op => {
    if (op.type === OPERATION_TYPE.ADD) {
      addOperand = op.value;
    } else if (op.type === OPERATION_TYPE.SUB) {
      subOperand = op.value;
    } else if (op.type === OPERATION_TYPE.MUL) {
      mulOperand = op.value;
    } else if (op.type === OPERATION_TYPE.DIV) {
      divOperand = op.value;
    }
  });
};

const resetOperands = () => {
  addOperand = undefined;
  subOperand = undefined;
  divOperand = undefined;
  mulOperand = undefined;
};

const resetGame = () => {
  maxLevel = localStorage.getItem("maxLevel");
  let currentDifficulty = DIFFICULTY.easy;
  if (level > 10) {
    currentDifficulty = DIFFICULTY.hard;
  } else if (level > 5) {
    currentDifficulty = DIFFICULTY.medium;
  }
  gameRound = startGameRound(currentDifficulty);
  resetOperands();
  createOperands(gameRound);
  gameState = GAME_STATE.PLAYING;
};

const nextLevel = () => {
  if (level !== 12) {
    level += 1;
  } else {
    level = level + 2;
  }
  resetGame();
}

const updateCurrentResult = (op: Operation) => {
  if (op.type === OPERATION_TYPE.ADD) {
    gameRound.initialNumber += op.value;
  } else if (op.type === OPERATION_TYPE.SUB) {
    gameRound.initialNumber -= op.value;
  } else if (op.type === OPERATION_TYPE.MUL) {
    gameRound.initialNumber *= op.value;
  } else if (op.type === OPERATION_TYPE.DIV) {
    gameRound.initialNumber /= op.value;
  }
};

function gameInit()
{
  gameRound = startGameRound();
  createOperands(gameRound);
}


function gameUpdate()
{
  const sendAnswer = (answerOperation: OPERATION_TYPE) => {
    const op = gameRound.sequence.pop();
    if (op.type === answerOperation) {
      resetOperands();
      createOperands(gameRound);
      updateCurrentResult(op);
      sound_goodMove.play();
      if (gameRound.sequence.length === 0) {
        gameState = GAME_STATE.WIN;
      }
    } else {
      gameState = GAME_STATE.LOSE;
      sound_badMove.play();
      if (level > Number(maxLevel)) {
        localStorage.setItem("maxLevel", String(level));
      }
    }
  }

  if (gameState === GAME_STATE.PLAYING && keyWasPressed("ArrowUp") && addOperand) {
    sendAnswer(OPERATION_TYPE.ADD);
  } else if (gameState === GAME_STATE.PLAYING && keyWasPressed("ArrowRight") && mulOperand) {
    sendAnswer(OPERATION_TYPE.MUL);
  } else if (gameState === GAME_STATE.PLAYING && keyWasPressed("ArrowDown") && subOperand) {
    sendAnswer(OPERATION_TYPE.SUB);
  } else if (gameState === GAME_STATE.PLAYING && keyWasPressed("ArrowLeft") && divOperand) {
    sendAnswer(OPERATION_TYPE.DIV);
  } else if (gameState === GAME_STATE.WIN && keyWasPressed("Enter")) {
    nextLevel();
  } else if (gameState === GAME_STATE.LOSE && keyWasPressed("Enter")) {{
    level = 1;
    resetGame();
  }}
}

function gameUpdatePost(){}

function gameRender()
{
  renderBackground();

  renderLevel(level);

  if (maxLevel) {
    renderMaxLevel(maxLevel);
  }

  if (gameState === GAME_STATE.WIN) {
    drawRect(vec2(-0.05, 0), vec2(1.7, 1.7), COLOR_PALETTE.GREEN);
  } else {
    drawRect(vec2(-0.05, 0), vec2(1.7, 1.7), COLOR_PALETTE.BLUE);
  }
  drawText(gameRound.initialNumber.toString(), vec2(0, 0), 1, COLOR_PALETTE.WHITE, 4, COLOR_PALETTE.TRANSPARENT);

  if (addOperand) {
    drawText("+", vec2(0, 2), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawText(String(addOperand), vec2(0, 4), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawRect(vec2(0, 4), vec2(1.7, 1.7), COLOR_PALETTE.ORANGE);
  }
  
  if (subOperand) {
    drawText("-", vec2(0, -2), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawText(String(subOperand), vec2(0, -4), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawRect(vec2(0, -4), vec2(1.7, 1.7), COLOR_PALETTE.ORANGE);
  }
  
  if (mulOperand) {
    drawText("x", vec2(2, 0), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawText(String(mulOperand), vec2(4, 0), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawRect(vec2(4, 0), vec2(1.7, 1.7), COLOR_PALETTE.ORANGE);
  }
  
  if (divOperand) {
    drawText("/", vec2(-2, 0), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawText(String(divOperand), vec2(-4, 0), 1, COLOR_PALETTE.WHITE, 2, COLOR_PALETTE.TRANSPARENT);
    drawRect(vec2(-4, 0), vec2(1.7, 1.7), COLOR_PALETTE.ORANGE);
  }

  if (level <= 3) {
    renderInstructions();
  }

  switch (gameState) {
    case GAME_STATE.WIN:
        const successColor = new Color();
        drawText("Correct! Press enter to continue...", vec2(0, 6), 1, COLOR_PALETTE.GREEN, 2, COLOR_PALETTE.TRANSPARENT);
      break;
      case GAME_STATE.LOSE:
        const errorColor = new Color();
        drawText("Wrong! Press enter to continue...", vec2(0, 6), 1, COLOR_PALETTE.RED, 2, COLOR_PALETTE.TRANSPARENT);
    break;
  }
}

function gameRenderPost(){}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, []);

