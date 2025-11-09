import { useState, useEffect } from 'react'
import Head from 'next/head'
import countries from '../data/countries.json'

export default function Home() {
  const [targetCountry, setTargetCountry] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [gameWon, setGameWon] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    selectRandomCountry()
  }, [])

  const selectRandomCountry = () => {
    const randomIndex = Math.floor(Math.random() * countries.length)
    setTargetCountry(countries[randomIndex])
    setGuesses([])
    setGameWon(false)
    setInput('')
    setSuggestions([])
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)

    if (value.length > 0) {
      const filtered = countries
        .filter(c => c.name.toLowerCase().startsWith(value.toLowerCase()))
        .filter(c => !guesses.find(g => g.name === c.name))
        .slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const makeGuess = (country) => {
    if (!targetCountry || guesses.find(g => g.name === country.name)) return

    const distance = calculateDistance(
      country.lat,
      country.lon,
      targetCountry.lat,
      targetCountry.lon
    )

    const guess = {
      ...country,
      distance: Math.round(distance),
      proximity: distance === 0 ? 100 : Math.max(0, 100 - (distance / 200))
    }

    setGuesses([guess, ...guesses])
    setInput('')
    setSuggestions([])

    if (country.code === targetCountry.code) {
      setGameWon(true)
    }
  }

  const getColorForProximity = (proximity) => {
    if (proximity === 100) return '#2ecc71'
    if (proximity > 90) return '#52c47f'
    if (proximity > 75) return '#76bc8d'
    if (proximity > 60) return '#9ab49b'
    if (proximity > 45) return '#beaca9'
    if (proximity > 30) return '#e2a4b7'
    if (proximity > 15) return '#ff9cc5'
    return '#ff94d3'
  }

  return (
    <>
      <Head>
        <title>Globle - Geography Game</title>
        <meta name="description" content="Guess the country in this geography game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header>
          <h1>🌍 Globle</h1>
          <p>Guess the mystery country!</p>
        </header>

        {showInstructions && (
          <div className="instructions">
            <button className="close-btn" onClick={() => setShowInstructions(false)}>×</button>
            <h2>How to Play</h2>
            <p>Guess countries to find the mystery country. The color shows how close you are:</p>
            <div className="color-guide">
              <div><span style={{background: '#2ecc71'}}></span> Correct!</div>
              <div><span style={{background: '#76bc8d'}}></span> Getting warm</div>
              <div><span style={{background: '#beaca9'}}></span> Lukewarm</div>
              <div><span style={{background: '#ff94d3'}}></span> Cold</div>
            </div>
          </div>
        )}

        {gameWon && (
          <div className="win-message">
            <h2>🎉 Congratulations!</h2>
            <p>You found <strong>{targetCountry.name}</strong> in {guesses.length} guesses!</p>
            <button onClick={selectRandomCountry}>Play Again</button>
          </div>
        )}

        <div className="game-area">
          <div className="input-section">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter country name..."
              disabled={gameWon}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map(country => (
                  <div
                    key={country.code}
                    className="suggestion"
                    onClick={() => makeGuess(country)}
                  >
                    {country.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="guesses">
            {guesses.map((guess, idx) => (
              <div
                key={idx}
                className="guess"
                style={{ backgroundColor: getColorForProximity(guess.proximity) }}
              >
                <span className="guess-name">{guess.name}</span>
                <span className="guess-distance">
                  {guess.distance === 0 ? '🎯' : `${guess.distance.toLocaleString()} km`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <footer>
          <button className="new-game" onClick={selectRandomCountry}>New Game</button>
          <button className="help-btn" onClick={() => setShowInstructions(true)}>?</button>
        </footer>
      </div>
    </>
  )
}
