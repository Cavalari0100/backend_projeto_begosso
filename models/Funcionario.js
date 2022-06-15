const mongoose = require('mongoose')

const Funcionario = mongoose.model('Funcionario', {
    name: String,
    email: String,
    password: String
})
module.exports = Funcionario