hummingbird = require '../hummingbird'
fs = require 'fs'
prompt = require 'prompt'

localIndex = "./examples/output/cm_index.json"

logTiming = (message) ->
  d = new Date()
  console.log "#{d.getHours()}:#{d.getMinutes()}:#{d.getSeconds()}.#{d.getMilliseconds()} - #{message}"

writeFiles = () ->
  logTiming "Started writing"
  fs.writeFileSync localIndex, JSON.stringify(index.toJSON())
  logTiming "Finished writing"

buildIndex = (people) ->
  for person in people
    # indexed 'documents' must be a hash with id, name (thing to be tokenized), and arbitrary hash of name-value pairs called meta
    index.add
      id: person.id,
      name: "#{person.fn} #{person.ln}"
      meta:
        firstname: person.fn
        middleinitial: person.mi
        lastname: person.ln
        company: person.cn
        phone: person.pn
  writeFiles()

printResults = (results) ->
  for result in results
    console.log "#{result.score}: #{result.meta.firstname} #{result.meta.middleinitial} #{result.meta.lastname} | #{result.meta.company} (#{result.meta.phone})"
  console.log "\n"

search = (err, arg) ->
  return false if arg.q is 'exit'
  serializedindex.search arg.q, printResults
  prompt.get ['q'], search


# Sample Data
people = [
  {
    id: 123
    fn: 'Steve'
    ln: 'Quince'
    mi: 'P'
    cn: 'Gerson Lehrman Group'
    pn: '867.5309'},
  {
    id: 456
    fn: 'Dan'
    ln: 'Griffis'
    mi: ''
    cn: 'Gerson Lehrman Group'
    pn: '123.456.9999'}
]

# Build & Serialize Index
hummingbird.loggingOn = false
index = new hummingbird
index.tokenizer = new hummingbird.tokenizer(3)
buildIndex(people)

# Load & Search Index
serializedindex = hummingbird.Index.load(JSON.parse(fs.readFileSync localIndex, ['utf8']))
prompt.message = "Enter query (or 'exit' to quit)"
prompt.start()
prompt.get ['q'], search
