const mongoose = require('mongoose')

const PostagemBalanca = mongoose.model('PostagemBalanca', {
    titulo: String,
    conteudo: String,
    autor: String
})
module.exports = PostagemBalanca