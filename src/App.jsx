import React, { useState, useEffect } from 'react';
import './App.css';
import words from './words.json';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>        
        <p>{props.message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Play Again</Button>
      </Modal.Footer>
    </Modal>
  );
}

function App() {
    const handleInputChange = (rowIndex, index, event) => {
      const value = event.target.value.toUpperCase();
      const newGuessRows = [...guessRows];
      newGuessRows[rowIndex].guess[index] = value;
      setGuessRows(newGuessRows);

      if (value === '') {
        const prevInput = document.querySelector(`input[name=letter-${rowIndex}-${index - 1}]`);
        if (prevInput) prevInput.focus();
      } else if (index < 4) {
        const nextInput = document.querySelector(`input[name=letter-${rowIndex}-${index + 1}]`);
        if (nextInput) nextInput.focus();
      }
    };

    const handleKeyDown = (rowIndex, index, event) => {
      // Handle backspace key
      if (event.key === 'Backspace' && guessRows[rowIndex].guess[index] === '') {
        // If current input is empty and backspace is pressed, move to previous input
        const prevInput = document.querySelector(`input[name=letter-${rowIndex}-${index - 1}]`);
        if (prevInput) {
          prevInput.focus();
          // Clear the previous input's value
          const newGuessRows = [...guessRows];
          newGuessRows[rowIndex].guess[index - 1] = '';
          setGuessRows(newGuessRows);
        }
      }
    };

  const [secretWord, setSecretWord] = useState('');  
  const [gameOver, setGameOver] = useState(false);
  const initialGuessRows = Array(5).fill(null).map(() => ({
    guess: ['', '', '', '', ''],
    feedback: ['', '', '', '', '']
  }));
  
  const [guessRows, setGuessRows] = useState(initialGuessRows); // 5 rows of guesses
  const [modalShow, setModalShow] = React.useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const resetGame = () => {
    setGuessRows(initialGuessRows);
    setGameOver(false);
    setModalShow(false);    
    setModalContent({ title: "", message: "" });
    fetchSecretWord(); // Add this line to generate a new secret word
    
    // Add this to focus the first input after a short delay
    setTimeout(() => {
      const firstInput = document.querySelector('input[name=letter-0-0]');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100); // Short delay to ensure DOM is updated
  };

  useEffect(() => {
    fetchSecretWord();
  }, []);

  const fetchSecretWord = async () => {
    const randomIndex = Math.floor(Math.random() * words.words.length);
    setSecretWord(words.words[randomIndex]);
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
      const animationDelay = 5 * 0.3 * 1000;
  
      if (isWon) {
        // Longer vibration for winning
        vibrateDevice(200);
        setTimeout(() => {            
          setModalContent({ title: "Congratulations!", message: `You guessed the word: ${secretWord} in ${currentRow + 1} tries.` });            
          setGameOver(true);            
          setModalShow(true);
        }, animationDelay);          
      } else if (currentRow === 4) {          
          setTimeout(() => {                          
            setModalContent({ title: "Game Over!", message: `The word was: ${secretWord}.` });              
            setGameOver(true);              
            setModalShow(true);
          }, animationDelay);                      
      }
       else {
        const nextInput = document.querySelector(`input[name=letter-${currentRow + 1}-0]`);      
        
    
        if (nextInput) {
          setTimeout(() => { nextInput.focus(); }, 0);
        }
        
        // Medium vibration for game over
        vibrateDevice(150);
        
      }
      setGuessRows(newGuessRows);
  
    };

   
    
    const handleNewGameClick = () => {
        startNewGame();      
    };
  
    const isRowReadOnly = (row, rowIdx) => {  
      const currentRowIndex = guessRows.findIndex(row => row.feedback.every(fb => fb === ''));
      return rowIdx !== currentRowIndex && row.feedback.every(fb => fb === '');
        
    }

  // Add this after the isRowReadOnly function
  const vibrateDevice = (duration = 50) => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(duration);
    }
  };

  const [activeInput, setActiveInput] = useState({ row: 0, col: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleInputFocus = (rowIndex, index) => {
    setActiveInput({ row: rowIndex, col: index });
  };

  const handleVirtualKeyPress = (key) => {
    // Add vibration when any key is pressed
    vibrateDevice(50);
    const { row, col } = activeInput;
    
    // Check if we're on an active row
    const currentRowIndex = guessRows.findIndex(row => row.feedback.every(fb => fb === ''));
    if (row !== currentRowIndex || gameOver) return;
    
    if (key === 'BACKSPACE') {
      // Handle backspace
      if (guessRows[row].guess[col] !== '') {
        // If current position has a letter, delete it
        const newGuessRows = [...guessRows];
        newGuessRows[row].guess[col] = '';
        setGuessRows(newGuessRows);
      } else if (col > 0) {
        // Move to previous position and delete that letter
        const newGuessRows = [...guessRows];
        newGuessRows[row].guess[col - 1] = '';
        setGuessRows(newGuessRows);
        setActiveInput({ row, col: col - 1 });
        // Focus the previous input
        const prevInput = document.querySelector(`input[name=letter-${row}-${col - 1}]`);
        if (prevInput) prevInput.focus();
      }
    } else if (key === 'ENTER') {
      // Handle enter key
      handleSubmit(new Event('submit'));
    } else {
      // Handle letter keys
      if (col < 5) {
        const newGuessRows = [...guessRows];
        newGuessRows[row].guess[col] = key;
        setGuessRows(newGuessRows);
        
        // Move to next position if not at the end
        if (col < 4) {
          setActiveInput({ row, col: col + 1 });
          // Focus the next input
          const nextInput = document.querySelector(`input[name=letter-${row}-${col + 1}]`);
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  // Virtual keyboard layout - remove ENTER from the third row
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'] // Removed ENTER
  ];

  return (
    <div className="App">
      <h1 className='title'>Word Guessing Game</h1>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(e);
                handleKeyDown(rowIdx, index, e);
              }}
              onFocus={() => handleInputFocus(rowIdx, index)}
              className={`letter-box ${row.feedback[index] || ''}`} // Use the feedback class
              name={`letter-${rowIdx}-${index}`}
              readOnly={isMobile || isRowReadOnly(row, rowIdx) || gameOver}
              inputMode={isMobile ? "none" : "text"}
            />
          ))}
          </div>
        ))}
      </div>
      
      {guessRows.findIndex(row => row.feedback.every(fb => fb === '')) !== -1 && (
        <button className="button" type="button" onClick={handleSubmit} disabled={!isGuessValid(guessRows[guessRows.findIndex(row => row.feedback.every(fb => fb === ''))].guess)}>Guess</button>
      )}
      
      {isMobile && (
        <div className="virtual-keyboard">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key) => (
                <button
                  key={key}
                  className={`keyboard-key ${key === 'ENTER' ? 'key-enter' : ''} ${key === 'BACKSPACE' ? 'key-backspace' : ''}`}
                  onClick={() => handleVirtualKeyPress(key)}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => {resetGame(); }}
        title={modalContent.title}
        message={modalContent.message}        
      />
    </div>
  );
}

export default App;
