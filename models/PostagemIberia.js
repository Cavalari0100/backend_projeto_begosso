const mongoose = require('mongoose')

const PostagemIberia = mongoose.model('PostagemIberia', {
    titulo: String,
    conteudo: String,
    autor: String
})
module.exports = PostagemIberia