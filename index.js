// load environment varible(sensitive info such as database connection string with password)
require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const app = express()
var morgan = require('morgan')
// const cors = require('cors')

// middleware
app.use(express.json())
// app.use(morgan('tiny'))
// app.use(cors())
// new token must return a string
morgan.token('req-body', (request, response) => {
  if (request.method === 'POST')
    return JSON.stringify(request.body)
  else
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))
app.use(express.static('dist'))

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

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
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

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person)
        return response.json(person)
      else
        return response.status(404).end()
    })
    .catch(error => next(error))
  
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).json(result)
    })
    .catch(error => next(error))
})

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}


app.post('/api/persons', (request, response, next) => {
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
  // else if (persons.some(person => person.name === body.name))
  //   return response.status(400).json({
  //     error: 'name already exists'
  // })
  else{
    // const randID = String(getRandomIntInclusive(0, 999999999999999))
    const newPerson = new Person({
      name: body.name,
      number: body.number,
    })

    newPerson.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
