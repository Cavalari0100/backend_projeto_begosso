const mongoose = require('mongoose')

const PostagemTi = mongoose.model('PostagemTi', {
    titulo: String,
    conteudo: String,
    autor: String
})
module.exports = PostagemTi