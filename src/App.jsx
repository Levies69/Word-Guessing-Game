import React, { useState, useEffect } from 'react';
import './App.css';
import words from './words.json';

function App() {
  const [secretWord, setSecretWord] = useState('');
  const [guess, setGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const initialGuessRows = Array(5).fill(null).map(() => ({
    guess: ['', '', '', '', ''],
    feedback: ['', '', '', '', '']
  }));
  const [modalContent, setModalContent] = useState(null);
  const [guessRows, setGuessRows] = useState(initialGuessRows); // 5 rows of guesses
  const resetGame = () => {    
    setGuessRows(initialGuessRows);
    setGameOver(false);
  };

  useEffect(() => {
    fetchSecretWord();
  }, []);

  const fetchSecretWord = async () => {
    const randomIndex = Math.floor(Math.random() * words.words.length);
    setSecretWord(words.words[randomIndex]);
  };


    const handleInputChange = (rowIndex, index, event) => {
    const value = event.target.value.toUpperCase();
    const newGuessRows = [...guessRows];

    newGuessRows[rowIndex].guess[index] = value.length <= 1 ? value.toUpperCase() : newGuessRows[rowIndex].guess[index]; // Update the current cell
    setGuessRows(newGuessRows);

    // Move focus to the next input if a value is entered and it's not the last input
    if (value.length <= 1 && value && index < 4) {
      const nextInput = document.querySelector(`input[name=letter-${rowIndex}-${index + 1}]`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Handle backspace: Clear the current cell and move to the previous one
    if (event.nativeEvent.inputType === 'deleteContentBackward' && index > 0) {
      const prevInput = document.querySelector(`input[name=letter-${rowIndex}-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }
  };

  const startNewGame = () => {
    fetchSecretWord();
    setGuessRows(initialGuessRows);
    setGameOver(false); // Ensure game over state is reset
  }

  const isGuessValid = (guessArray) => {
    return guessArray.every((letter) => letter !== '');
  };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (gameOver) return;
  
      // Ensure secretWord is fetched before proceeding
      if (!secretWord) {
        await fetchSecretWord();
      }
  
      const currentRow = guessRows.findIndex(row => row.feedback.every(fb => fb === ''));
      if (currentRow === -1) return;
  
      let newGuessRows = [...guessRows];
      let guessArray = newGuessRows[currentRow].guess;
      if (!isGuessValid(guessArray)) return;
  
      const secretArray = secretWord.split('');
      const newFeedback = [...newGuessRows[currentRow].feedback]; // Initialize with existing feedback
      guessArray.forEach((letter, index) => {
        if (letter === secretArray[index]) {
          newFeedback[index] = 'correct'; // Correct letter and position
        } else if (secretArray.includes(letter)) {
          newFeedback[index] = 'present'; // Correct letter, wrong position
        } else {
          newFeedback[index] = 'absent'; // Letter not in the word
        }
      });
  
      newGuessRows[currentRow].feedback = newFeedback;
  
        const isWon = guessArray.join('') === secretWord;
        const isLastRow = currentRow === 4;
        const animationDelay = 5 * 0.2 * 1000; // Assuming each flip takes 0.2s
    
        if (isWon) {
          setTimeout(() => {
            setModalContent({
              title: "Congratulations!",
              message: `You guessed the word: ${secretWord} in ${currentRow + 1} tries.`,
              secretWord: secretWord,
            });
          }, animationDelay);
          setGameOver(true);
        } else if (isLastRow) {
          setTimeout(() => {
            setModalContent({ title: "Game Over!", message: `The word was: ${secretWord}.`, secretWord: secretWord });
          }, animationDelay);
          setGameOver(true);
        } else {
          const nextInput = document.querySelector(`input[name=letter-${currentRow + 1}-0]`);      
          
    
          if (nextInput) {
            setTimeout(() => { nextInput.focus(); }, 0);
          }
          
        }
        setGuessRows(newGuessRows);
  
    };

    const ResultModal = ({ isOpen, onClose, title, message, secretWord }) => {
      if (!isOpen) return null;
    
      return (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{title}</h2>
            
            {message && (
            <p>{message}</p>
            )}
            
            <button onClick={onClose}>Play Again</button>
          </div>
        </div>
      );
    };
    
    const handleNewGameClick = () => {
        startNewGame();
      setModalContent(null);
    };
  
    const isRowReadOnly = (row, rowIdx) => {  
      const currentRowIndex = guessRows.findIndex(row => row.feedback.every(fb => fb === ''));
      return rowIdx !== currentRowIndex && row.feedback.every(fb => fb === '');
        
    }

  return (
    <div className="App">
      <h1>Word Guessing Game</h1>
      <div className="game-board">
        {guessRows.map((row, rowIdx) => (
          <div key={rowIdx} className="guess-row">
            {row.guess.map((letter, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              size="1"
              value={letter}
              onChange={(e) => handleInputChange(rowIdx, index, e)}
              className={`letter-box ${row.feedback[index] || ''}`} // Use the feedback class
              name={`letter-${rowIdx}-${index}`}
              readOnly={isRowReadOnly(row, rowIdx) || gameOver}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
            />
          ))}
          </div>
        ))}
      </div>
      {guessRows.findIndex(row => row.feedback.every(fb => fb === '')) !== -1 && (
        <button type="button" onClick={handleSubmit} disabled={!isGuessValid(guessRows[guessRows.findIndex(row => row.feedback.every(fb => fb === ''))].guess)}>Guess</button>
      )}
      {modalContent && (
        <ResultModal isOpen={gameOver} onClose={handleNewGameClick} title={modalContent.title} message={modalContent.message} secretWord={modalContent.secretWord}/>

      )}

    </div>
  );
}

export default App;
