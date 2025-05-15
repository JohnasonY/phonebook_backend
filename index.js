const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

// middleware
app.use(express.json())
// app.use(morgan('tiny'))
app.use(cors())
// new token must return a string
morgan.token('req-body', (request, response) => {
  if (request.method === 'POST')
    return JSON.stringify(request.body)
  else
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
  const now = new Date()
  const fullDateAndTime = now.toString()

  const personCount = persons.length
  // "send" can only do once
  response.send(`<div>Phonebook has info for ${personCount} people</div>
                 <div>${fullDateAndTime}</div>
                `)
})

app.get('/api/persons/:id', (request, response) => {
  //ex. request.params = {id: '1'}
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person){
    response.json(person)
  } else {
    // .end() finishes the response (no body content is sent).
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  // successfully delete with no body content sent
  response.status(204).end()
})

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}


app.post('/api/persons', (request, response) => {
  // console.log(request.body);
  
  const body = request.body
  
  // name is not provided
  if (!body.name)
    return response.status(400).json({
      error: 'name is missing'
  })
  // number is not provided
  else if (!body.number)
    return response.status(400).json({
      error: 'number is missing'
  })
  // name exists
  else if (persons.some(person => person.name === body.name))
    return response.status(400).json({
      error: 'name already exists'
  })
  else{
    const randID = String(getRandomIntInclusive(0, 999999999999999))
    const newPerson = {
      id: randID,
      name: body.name,
      number: body.number,
    }

    persons = persons.concat(newPerson)
    response.json(newPerson)

  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
