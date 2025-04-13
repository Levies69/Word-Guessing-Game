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
        const animationDelay = 5 * 0.2 * 1000; // Assuming each flip takes 0.2s
    
        if (isWon) {
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
