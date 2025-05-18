import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser, Lightbulb, Redo2, Undo2, Plus } from "lucide-react";

const GamePage = () => {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userInput, setUserInput] = useState(Array(81).fill(null));
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentPuzzleId, setCurrentPuzzleId] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [notes, setNotes] = useState(Array(81).fill().map(() => new Set()));
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const MAX_MISTAKES = 3;
  const MAX_HINTS = 3;

  // Fetch puzzle
  useEffect(() => {
    const fetchPuzzle = async () => {
      const storedPuzzleId = localStorage.getItem(`currentPuzzle_${difficulty}`);
      const storedData = localStorage.getItem("sudokuData");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData[difficulty]) {
          const puzzles = parsedData[difficulty];

          if (storedPuzzleId) {
            const storedPuzzle = puzzles.find((p) => p.id === storedPuzzleId);
            if (storedPuzzle) {
              loadPuzzle(storedPuzzle);
              return;
            }
          }

          selectRandomPuzzle(puzzles);
          return;
        }
      }

      try {
        const response = await axios.get("/data/categorized_puzzles.json");
        const puzzles = response.data[difficulty];
        localStorage.setItem("sudokuData", JSON.stringify(response.data));

        if (puzzles && puzzles.length > 0) {
          selectRandomPuzzle(puzzles);
        }
      } catch (error) {
        console.error("Error fetching puzzles:", error);
      }
    };

    const selectRandomPuzzle = (puzzles) => {
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      loadPuzzle(randomPuzzle);
      localStorage.setItem(`currentPuzzle_${difficulty}`, randomPuzzle.id);
    };

    const loadPuzzle = (puzzleData) => {
      const initialPuzzle = puzzleData.puzzle.split("");
      setPuzzle(initialPuzzle);
      setSolution(puzzleData.solution.split(""));
      setUserInput(Array(81).fill(null));
      setCurrentPuzzleId(puzzleData.id);
      setHistory([]);
      setRedoHistory([]);
      setMistakes(0);
      setHintsRemaining(MAX_HINTS);
      setNotes(Array(81).fill().map(() => new Set()));
    };

    fetchPuzzle();
  }, [difficulty]);

  // Handle game over when mistakes exceed maximum
  useEffect(() => {
    if (mistakes >= MAX_MISTAKES) {
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [mistakes, navigate]);

  // Handle cell selection
  const handleCellClick = (index) => {
    if (mistakes >= MAX_MISTAKES) return;
    setSelectedCell(index);
  };

  // Handle number input
  const handleNumberInput = useCallback((num) => {
    if (selectedCell === null || puzzle[selectedCell] !== "." || mistakes >= MAX_MISTAKES) return;

    const newUserInput = [...userInput];
    const newHistory = [
      ...history,
      { index: selectedCell, prevValue: userInput[selectedCell], newValue: num }
    ];

    newUserInput[selectedCell] = num;
    setUserInput(newUserInput);
    setHistory(newHistory);
    setRedoHistory([]);

    // Check if the input is correct
    if (num !== solution[selectedCell]) {
      setMistakes(mistakes + 1);
    }
  }, [selectedCell, userInput, history, solution, mistakes, puzzle]);

  // Handle erase
  const handleErase = useCallback(() => {
    if (
      selectedCell === null ||
      puzzle[selectedCell] !== "." ||
      userInput[selectedCell] === null ||
      mistakes >= MAX_MISTAKES
    ) return;

    const newUserInput = [...userInput];
    const newHistory = [
      ...history,
      { index: selectedCell, prevValue: userInput[selectedCell], newValue: null }
    ];

    newUserInput[selectedCell] = null;
    setUserInput(newUserInput);
    setHistory(newHistory);
    setRedoHistory([]);
  }, [selectedCell, userInput, history, puzzle, mistakes]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || mistakes >= MAX_MISTAKES) return;

    const lastAction = history[history.length - 1];
    const newUserInput = [...userInput];
    newUserInput[lastAction.index] = lastAction.prevValue;

    setUserInput(newUserInput);
    setRedoHistory([...redoHistory, lastAction]);
    setHistory(history.slice(0, -1));
  }, [history, redoHistory, userInput, mistakes]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0 || mistakes >= MAX_MISTAKES) return;

    const nextAction = redoHistory[redoHistory.length - 1];
    const newUserInput = [...userInput];
    newUserInput[nextAction.index] = nextAction.newValue;

    setUserInput(newUserInput);
    setHistory([...history, nextAction]);
    setRedoHistory(redoHistory.slice(0, -1));
  }, [redoHistory, history, userInput, mistakes]);

  // Handle hint
  const handleHint = useCallback(() => {
    if (
      selectedCell === null ||
      puzzle[selectedCell] !== "." ||
      hintsRemaining <= 0 ||
      mistakes >= MAX_MISTAKES
    ) return;

    const correctValue = solution[selectedCell];
    const newUserInput = [...userInput];
    newUserInput[selectedCell] = correctValue;

    setUserInput(newUserInput);
    setHistory([
      ...history,
      { index: selectedCell, prevValue: userInput[selectedCell], newValue: correctValue }
    ]);
    setRedoHistory([]);
    setHintsRemaining(hintsRemaining - 1);
  }, [selectedCell, solution, userInput, history, hintsRemaining, mistakes, puzzle]);

  // Handle new random puzzle
  const handleNewPuzzle = useCallback(() => {
    const storedData = localStorage.getItem("sudokuData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData[difficulty]) {
        const puzzles = parsedData[difficulty];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        loadPuzzle(randomPuzzle);
        localStorage.setItem(`currentPuzzle_${difficulty}`, randomPuzzle.id);
      }
    }
  }, [difficulty]);

  const loadPuzzle = (puzzleData) => {
    const initialPuzzle = puzzleData.puzzle.split("");
    setPuzzle(initialPuzzle);
    setSolution(puzzleData.solution.split(""));
    setUserInput(Array(81).fill(null));
    setCurrentPuzzleId(puzzleData.id);
    setHistory([]);
    setRedoHistory([]);
    setMistakes(0);
    setHintsRemaining(MAX_HINTS);
    setNotes(Array(81).fill().map(() => new Set()));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mistakes >= MAX_MISTAKES) return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "z" && e.ctrlKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "y" && e.ctrlKey) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "h") {
        handleHint();
      } else if (e.key === "ArrowUp" && selectedCell !== null && selectedCell >= 9) {
        setSelectedCell(selectedCell - 9);
      } else if (e.key === "ArrowDown" && selectedCell !== null && selectedCell < 72) {
        setSelectedCell(selectedCell + 9);
      } else if (e.key === "ArrowLeft" && selectedCell !== null && selectedCell % 9 !== 0) {
        setSelectedCell(selectedCell - 1);
      } else if (e.key === "ArrowRight" && selectedCell !== null && selectedCell % 9 !== 8) {
        setSelectedCell(selectedCell + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumberInput, handleErase, handleUndo, handleRedo, handleHint, selectedCell, mistakes]);

  // Calculate positions of selected cell
  const selectedRow = selectedCell !== null ? Math.floor(selectedCell / 9) : null;
  const selectedCol = selectedCell !== null ? selectedCell % 9 : null;
  const selectedDigit = selectedCell !== null ? 
    (userInput[selectedCell] || puzzle[selectedCell] !== "." ? puzzle[selectedCell] : null) : 
    null;
  const selectedSubgrid = selectedCell !== null
    ? Math.floor(selectedRow / 3) * 3 + Math.floor(selectedCol / 3)
    : null;

  // Calculate remaining numbers
  const remainingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
    const countInPuzzle = puzzle.filter(c => c === num.toString()).length;
    const countInUserInput = userInput.filter(c => c === num.toString()).length;
    return 9 - countInPuzzle - countInUserInput;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <div className="space-y-4 w-auto">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <div className={mistakes >= MAX_MISTAKES ? "text-red-500" : ""}>
            Mistakes: {mistakes}/{MAX_MISTAKES}
          </div>
          <div>{difficulty.toUpperCase()}</div>
        </div>

        {/* Sudoku Grid */}
        <div className={`sudoku border-2 rounded-2xl overflow-hidden w-full ${mistakes >= MAX_MISTAKES ? "border-red-500" : "border-slate-400"}`}>
          {Array(81).fill().map((_, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const subgrid = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            const cellValue = puzzle[index] !== "." ? puzzle[index] : userInput[index];
            const isInitial = puzzle[index] !== ".";
            const isError = !isInitial && userInput[index] && userInput[index] !== solution[index];

            // Highlight states
            const isSameRowOrCol = selectedCell !== null &&
              (row === selectedRow || col === selectedCol);
            const isSameSubgrid = selectedCell !== null && subgrid === selectedSubgrid;
            const isSameDigit = selectedDigit && cellValue === selectedDigit;
            const isSelected = index === selectedCell;

            return (
              <div
                key={index}
                tabIndex={mistakes >= MAX_MISTAKES ? -1 : 0}
                className={`aspect-square flex items-center justify-center relative
                  border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isSelected ? "bg-blue-800/30 z-10" : ""}
                  ${isSameRowOrCol ? "bg-blue-900/20" : ""}
                  ${isSameSubgrid ? "bg-blue-800/10" : ""}
                  ${isSameDigit && cellValue ? "bg-blue-700/30" : ""}
                  ${isError ? "bg-red-500/30" : ""}
                  ${
                    !isSelected && !isSameRowOrCol && !isSameSubgrid && !isSameDigit && !isError
                      ? "hover:bg-slate-800/10"
                      : ""
                  }
                  ${col % 3 === 2 && col !== 8 ? "border-r-2 border-slate-400" : ""}
                  ${row % 3 === 2 && row !== 8 ? "border-b-2 border-slate-400" : ""}`}
                onClick={() => handleCellClick(index)}
                onFocus={() => handleCellClick(index)}
              >
                {isInitial ? (
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xl">
                    {cellValue}
                  </span>
                ) : cellValue ? (
                  <span className={`font-semibold text-xl ${isError ? "text-red-500" : "text-blue-600 dark:text-blue-400"}`}>
                    {cellValue}
                  </span>
                ) : (
                  <div className="w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <div key={num} className="flex items-center justify-center">
                        {notes[index]?.has(num) && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {num}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            <button 
              onClick={handleNewPuzzle}
              className="bg-slate-900 text-slate-400 hover:text-slate-50 p-2 hover:bg-slate-800 size-10 rounded-md cursor-pointer"
            >
              <Plus className="size-6" />
            </button>

            <button 
              onClick={handleUndo}
              disabled={history.length === 0 || mistakes >= MAX_MISTAKES}
              className="bg-slate-900 text-slate-400 hover:text-slate-50 p-2 hover:bg-slate-800 size-10 rounded-md cursor-pointer disabled:opacity-50"
            >
              <Undo2 className="size-6" />
            </button>

            <button 
              onClick={handleRedo}
              disabled={redoHistory.length === 0 || mistakes >= MAX_MISTAKES}
              className="bg-slate-900 text-slate-400 hover:text-slate-50 p-2 hover:bg-slate-800 size-10 rounded-md cursor-pointer disabled:opacity-50"
            >
              <Redo2 className="size-6" />
            </button>

            <button 
              onClick={handleErase}
              disabled={
                selectedCell === null ||
                puzzle[selectedCell] !== "." ||
                userInput[selectedCell] === null ||
                mistakes >= MAX_MISTAKES
              }
              className="bg-slate-900 text-slate-400 hover:text-slate-50 p-2 hover:bg-slate-800 size-10 rounded-md cursor-pointer disabled:opacity-50"
            >
              <Eraser className="size-6" />
            </button>

            <button 
              onClick={handleHint}
              disabled={
                selectedCell === null || 
                puzzle[selectedCell] !== "." || 
                hintsRemaining <= 0 ||
                mistakes >= MAX_MISTAKES
              }
              className="relative bg-slate-900 text-slate-400 hover:text-slate-50 p-2 hover:bg-slate-800 size-10 rounded-md cursor-pointer disabled:opacity-50"
            >
              <div className="text-xs p-1 absolute bg-blue-500 text-slate-50 rounded-full size-4 font-semibold flex items-center justify-center top-0 right-0">
                {hintsRemaining}
              </div>
              <Lightbulb className="size-6" />
            </button>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-9 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num.toString())}
                disabled={mistakes >= MAX_MISTAKES}
                className="font-semibold flex flex-col items-center justify-center p-1 rounded-md bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <span className="text-lg text-blue-400">{num}</span>
                <span className="text-xs text-slate-500">
                  {remainingNumbers[num - 1]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;