const mongoose = require('mongoose')

const PostagemTelemetria = mongoose.model('PostagemTelemetria',{
    titulo:String,
    conteudo:String,
    autor:String
})
module.exports = PostagemTelemetria