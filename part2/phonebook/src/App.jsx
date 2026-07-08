import { useEffect, useState } from 'react'
import personService from './persons'
const PersonForm = ({ handleNameChange, handleNumberChange, newName, newNumber, handleOnClick }) => {
  return (
    <form>
      <div>
        name: <input onChange={handleNameChange} value={newName} />
      </div>
      <div>
        number: <input onChange={handleNumberChange} value={newNumber} />
      </div>
      <div>
        <button type="submit" onClick={handleOnClick}>add</button>
      </div>
    </form>
  )
}
const Persons = ({ personsToShow, handleDelete }) => {
  return (
    personsToShow.map(person => (
      <div key={person.id}>
        {person.name} {person.number}
        <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
      </div>
    ))
  )
}
const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with: <input value={filter} onChange={handleFilterChange} />
    </div>
  )
}
const App = () => {
  const [persons, setPersons] = useState([])
  const [newNumber, setNewNumber] = useState('')
  const [newName, setNewName] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const Notification = ({ message }) => {
  if (!message) return null
  const style = {
    color: message.type === 'success' ? 'green' : 'red',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }


  return (
    <div style={style}>
      {message.text}
    </div>
  )
}




  const showNotification = (text, type = 'success') => {
  setNotification({ text, type })
  setTimeout(() => {
    setNotification(null)
  }, 4000) 
}

  useEffect(() => {
    personService.getAll().then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const handleOnClick = (event) => {
  event.preventDefault()
  if (newName === "") {
    alert("Enter a valid name")
    return
  }

  const existingPerson = persons.find(person => person.name === newName)
  if (existingPerson) {
    const confirmUpdate = window.confirm(
      `${newName} is already added to phonebook, replace the old number with a new one?`
    )
    if (confirmUpdate) {
      const updatedPerson = { ...existingPerson, number: newNumber }
      personService.update(existingPerson.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
          setNewName("")
          setNewNumber("")
          showNotification(`Updated ${returnedPerson.name}`, 'success')
        })
        .catch(() => {
          showNotification(
            `Information of ${existingPerson.name} has already been removed from server`,
            'error'
          )
          setPersons(persons.filter(p => p.id !== existingPerson.id))
        })
    }

  } else {
    const newPerson = { name: newName, number: newNumber }
    personService.create(newPerson).then(returnedPerson => {
      setPersons(persons.concat(returnedPerson))
      setNewName("")
      setNewNumber("")
      showNotification(`Added ${returnedPerson.name}`, 'success')
    })
    .catch(error => {
      showNotification(`${error}`, 'error')
    })
  }
}

  const handleDelete = (id, name) => {
  if (window.confirm(`Delete ${name}?`)) {
    personService.remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
        showNotification(`Deleted ${name}`, 'success')
      })
      .catch(() => {
        showNotification(`Person '${name}' was already removed from server`, 'error')
        setPersons(persons.filter(p => p.id !== id))
      })
  }
}




  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  
  return (
  <div>
    <h2>Phonebook</h2>
    <Notification message={notification} />
    <Filter filter={filter} handleFilterChange={handleFilterChange} />
    <PersonForm
      handleNameChange={handleNameChange}
      newName={newName}
      handleNumberChange={handleNumberChange}
      newNumber={newNumber}
      handleOnClick={handleOnClick}
    />
    <h2>Numbers</h2>
    <Persons personsToShow={personsToShow} handleDelete={handleDelete} />
  </div>
)
}
export default App