'use client';

import { FormEvent, useMemo, useState } from 'react';

type Feedback = 'idle' | 'correct' | 'incorrect';

const tables = Array.from({ length: 11 }, (_, index) => index + 2);
const multipliers = Array.from({ length: 12 }, (_, index) => index + 1);

function nextMultiplier(current: number) {
  const available = multipliers.filter((multiplier) => multiplier !== current);
  return available[Math.floor(Math.random() * available.length)] ?? 1;
}

export default function Home() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const progress = Math.min(questionsAnswered, 10);
  const answerIsDisabled = feedback !== 'idle';
  const feedbackMessage = useMemo(() => {
    if (feedback === 'correct') return 'That’s right! Keep the streak going.';
    if (feedback === 'incorrect' && selectedTable) {
      return `The answer is ${selectedTable * multiplier}. You’re learning it!`;
    }
    return '';
  }, [feedback, multiplier, selectedTable]);

  function chooseTable(table: number) {
    setSelectedTable(table);
    setMultiplier(1);
    setAnswer('');
    setFeedback('idle');
    setErrorMessage('');
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTable || feedback !== 'idle') return;

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      setErrorMessage('Write an answer before checking.');
      return;
    }

    const numericAnswer = Number(trimmedAnswer);
    if (!Number.isInteger(numericAnswer) || numericAnswer < 0) {
      setErrorMessage('Use a whole number, like 24.');
      return;
    }

    setErrorMessage('');
    setQuestionsAnswered((current) => current + 1);

    if (numericAnswer === selectedTable * multiplier) {
      setFeedback('correct');
      setScore((current) => current + 1);
      setStreak((current) => current + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
  }

  function continuePractice() {
    setMultiplier((current) => nextMultiplier(current));
    setAnswer('');
    setFeedback('idle');
    setErrorMessage('');
  }

  function changeTable() {
    setSelectedTable(null);
    setAnswer('');
    setFeedback('idle');
    setErrorMessage('');
  }

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between" aria-label="Math Spark header">
          <button className="brand-mark" onClick={changeTable} type="button">
            <span className="brand-star" aria-hidden="true">
              ✦
            </span>
            <span>Math Spark</span>
          </button>
          <div className="header-note hidden sm:flex">
            <span className="dot dot-coral" aria-hidden="true" />
            <span>Practice makes progress</span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-14">
          <div className="max-w-xl">
            <p className="eyebrow">A little practice, a lot of sparkle</p>
            <h1 className="display-title">
              Make your
              <span className="title-highlight"> brain shine.</span>
            </h1>
            <p className="intro-copy">
              Pick a table, solve a few friendly questions, and build your multiplication
              superpowers one spark at a time.
            </p>

            <div className="sticker-strip" aria-label={`${streak} correct answers in a row`}>
              <span className="sticker-label">Your streak</span>
              <div className="sticker-dots" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    className={`sticker ${index < Math.min(streak, 5) ? 'sticker-earned' : ''}`}
                    key={index}
                  >
                    {index < Math.min(streak, 5) ? '✦' : '·'}
                  </span>
                ))}
              </div>
              <strong>{streak}</strong>
            </div>
          </div>

          <div className="practice-card">
            <div className="card-tape" aria-hidden="true" />
            {!selectedTable ? (
              <div className="selection-state">
                <div className="sparkle-burst" aria-hidden="true">
                  ✦
                </div>
                <p className="card-kicker">Ready when you are</p>
                <h2>Choose your table</h2>
                <p className="card-help">Which number would you like to practice today?</p>
                <div className="table-grid" role="group" aria-label="Choose a multiplication table">
                  {tables.map((table) => (
                    <button
                      className="table-button"
                      key={table}
                      onClick={() => chooseTable(table)}
                      type="button"
                    >
                      <span className="table-number">{table}</span>
                      <span className="table-times">×</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="question-state">
                <div className="question-topline">
                  <div>
                    <p className="card-kicker">Table of {selectedTable}</p>
                    <p className="question-count">Question {questionsAnswered + 1}</p>
                  </div>
                  <button className="change-button" onClick={changeTable} type="button">
                    Change table
                  </button>
                </div>
                <div className="progress-track" aria-label={`${progress} of 10 questions answered`}>
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.max(progress * 10, 4)}%` }}
                  />
                </div>

                <form onSubmit={submitAnswer}>
                  <fieldset className="question-fieldset" disabled={answerIsDisabled}>
                    <legend className="question-prompt">
                      <span>{selectedTable}</span> × <span>{multiplier}</span> ={' '}
                      <span className="question-mark">?</span>
                    </legend>
                    <label className="answer-label" htmlFor="answer">
                      Your answer
                    </label>
                    <input
                      autoFocus
                      className={`answer-input ${feedback === 'correct' ? 'answer-correct' : ''} ${feedback === 'incorrect' ? 'answer-incorrect' : ''}`}
                      id="answer"
                      inputMode="numeric"
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="?"
                      type="text"
                      value={answer}
                    />
                  </fieldset>
                  {errorMessage && (
                    <p className="form-error" role="alert">
                      {errorMessage}
                    </p>
                  )}
                  {feedback !== 'idle' && (
                    <div className={`feedback-message ${feedback}`} role="status">
                      <span className="feedback-icon" aria-hidden="true">
                        {feedback === 'correct' ? '✦' : '○'}
                      </span>
                      <span>{feedbackMessage}</span>
                    </div>
                  )}
                  {feedback === 'idle' ? (
                    <button className="primary-button" type="submit">
                      Check my answer <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button className="primary-button" onClick={continuePractice} type="button">
                      Next question <span aria-hidden="true">→</span>
                    </button>
                  )}
                </form>

                <div className="score-row" aria-label={`Score ${score}, streak ${streak}`}>
                  <div>
                    <span>Score</span>
                    <strong>{score}</strong>
                  </div>
                  <div>
                    <span>Streak</span>
                    <strong>{streak}</strong>
                  </div>
                  <div>
                    <span>Table</span>
                    <strong>{selectedTable}s</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="border-ink/10 text-ink/45 flex items-center justify-between border-t pt-5 text-xs font-bold tracking-[0.16em] uppercase">
          <span>Small steps. Big wins.</span>
          <span>✦ ✦ ✦</span>
        </footer>
      </div>
    </main>
  );
}
