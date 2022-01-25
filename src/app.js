const express = require('express')
const cors = require('cors')
const app = express()
const routes = require('./routes')
const PORT = process.env.PORT || 3005
app.use(cors())
app.use(express.json()) 
app.use('/', routes)
 
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})