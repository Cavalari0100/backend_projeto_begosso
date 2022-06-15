const mongoose = require('mongoose')

const PostagemPcts = mongoose.model('PostagemPcts', {
    titulo: String,
    conteudo: String,
    autor: String
})
module.exports = PostagemPcts