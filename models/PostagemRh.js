const mongoose = require('mongoose')

const PostagemRh = mongoose.model('PostagemRh', {
    titulo: String,
    conteudo: String,
    autor: String
})
module.exports = PostagemRh