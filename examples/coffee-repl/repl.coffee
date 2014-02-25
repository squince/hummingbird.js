# CLI Example
# You can just 'require' hummingbird if you run it locally via terminal or in a node.js app
hummingbird = require '../../hummingbird'
fs = require 'fs'
prompt = require 'prompt'

localIndex = "people.json"

# In this case, we'll build an autocomplete on person names.  Serialize the index out to disk if so desired.
buildIndex = (people) ->
  for person in people
    # indexed 'documents' must be a hash with id, name (thing to be tokenized) as required properties
    # any other arbitrary hash of name-value pairs will be stored but not tokenized
    index.add
      id: person.id,
      name: "#{person.fn} #{person.ln}"
      firstname: person.fn
      middleinitial: person.mi
      lastname: person.ln
      company: person.cn
      phone: person.pn
  fs.writeFileSync localIndex, JSON.stringify(index.toJSON(), null, '\t')

# Just print them out using console.log
printResults = (results) ->
  for result in results
    console.log "#{result.firstname} #{result.middleinitial} #{result.lastname} | #{result.company} (tel. #{result.phone})"
  console.log "\n"

# search for some string
# Keep searching until you wish to search no more
search = (err, arg) ->
  return false if arg.q is 'exit'
  serializedindex.search arg.q, printResults
  prompt.get ['q'], search


# Sample Data
# This is just a statically defined array of 'documents', but obviously you can get whatever data you want from wherever you want
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
