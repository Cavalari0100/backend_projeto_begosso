/* IMPORTS*/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
//Models
const Funcionario = require('./models/Funcionario')
const PostagemIberia = require('./models/PostagemIberia');
const PostagemTelemetria = require('./models/PostagemTelemetria');
const PostagemPcts = require('./models/PostagemPcts');
const PostagemTi = require('./models/PostagemTi');
const PostagemRh = require('./models/PostagemRh');
const PostagemBalanca = require('./models/PostagemBalanca');

//CONFIG JSON response
app.use(express.json())


//Configurando o Cors

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE,PATCH");
    next();
});

//FUNCTIONS END ROUTES FOR FUNCIONARIOS
//public rout

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "Ola,mundo" })
})

//privite route
app.get("/funcionario/:id", checkToken, async (req, res) => {
    const id = req.params.id

    //check user exist
    const funcionario = await Funcionario.findById(id, '-password')

    if (!funcionario) {
        return res.status(422).json({ Description_Err: 'Usuario não encontrado' })
    }
    return res.status(200).json({ funcionario })


})
//Function to check token
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ Description_Err: "Acesso negado" })
    }

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)

        next()

    } catch (error) {
        return res.status(400).json({ Description_Err: "Token invalido" })
    }
}

//Register Employee
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body
    //Check if all labels is present
    if (!name) {
        return res.status(422).json({ Description_Err: 'Nome do funcionario é obrigatorio' })
    }
    if (!email) {
        return res.status(422).json({ Description_Err: 'Email do funcionario é obrigatorio' })
    }
    if (!password) {
        return res.status(422).json({ Description_Err: 'Senha do funcionario é obrigatorio' })
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ Description_Err: 'As senha estão diferente, por favor digite novamente' })
    }
    //Check if user exist
    const userExist = await Funcionario.findOne({ email: email })

    if (userExist) {
        return res.status(422).json({ Description_Err: 'Por favor utiliza outro email' })
    }

    //creat password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const funcionario = new Funcionario({
        name,
        email,
        password: passwordHash,
    })

    try {
        await funcionario.save()
        console.log(funcionario)
        return res.status(200).json({ msg: 'Cadastro realizado' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'error no servidor' })
    }
})
//Login Funcionario
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body
    //validadtions
    if (!email) {
        return res.status(422).json({ Description_Err: 'Email do funcionario é obrigatorio' })
    }
    if (!password) {
        return res.status(422).json({ Description_Err: 'Senha do funcionario é obrigatorio' })
    }
    //checking if funcionario exist
    const funcionario = await Funcionario.findOne({ email: email })

    if (!funcionario) {
        return res.status(422).json({ Description_Err: 'Usuario não registrado no site' })
    }
    //check if password match
    const checkpass = await bcrypt.compare(password, funcionario.password)
    if (!checkpass) {
        return res.status(404).json({ Description_Err: 'Senha invalida' })
    }

    //validate login
    try {
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: funcionario._id,
            email: funcionario.email
        },
            secret,
        )

        return res.status(200).json({ Description_done: 'autenticação realizada com sucesso', token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ Description_Err: 'error no servidor' })
    }

})

//---------------------------------------------------END FUNCIONARIOS-------------------------------------------
//-------------------------------------FUNCTIONS END ROUTES FOR POSTAGEMIBERIA----------------------------------
//rota begin
app.get("/postagemiberia", async (req, res) => {
    const postagens = await PostagemIberia.find();
    return res.status(200).json(postagens)
})
//CREATE POSTAGEM
app.post("/postagemiberia/novapostagem", async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemIberia.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagemIberia = new PostagemIberia({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagemIberia.save()
        return res.status(200).json({ msg: "Postagem da iberia realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA IBERIA
app.put('/postagemiberia/alterarpostagemiberia/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagemtelemetria = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemIberia.updateOne({ _id: id }, postagemtelemetria)

        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemtelemetria)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA IBERIA
app.delete('/postagemiberia/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemIberia.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemIberia.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})

//Buscando postagem da iberia por ID
app.get("/postagemiberia/noticiaiberia/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagem = await PostagemIberia.findById(id)

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    const postagemiberia = await PostagemIberia.findById({ _id: Object(id) }).then(data => {
        return (
            {
                success: true,
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor: data.autor
            }
        )
    }).catch(err=>{
        return({
            success:false,
            data:err
        })
    });
    return res.status(200).send(postagemiberia)

})

//---------------------------------------------------END POSTAGEMIBERIA-------------------------------------------
//--------------------------------------FUNCTIONS END ROUTES FOR POSTAGEM TELEMETRIA----------------------------------
//rota begin
app.get("/postagemtelemetria", async (req, res) => {
    const postagens = await PostagemTelemetria.find();
    return res.status(200).json(postagens)
})
//CREATE POSTAGEM DA TELEMETRIA
app.post("/postagemtelemetria/novapostagem", async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemTelemetria.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagemTelemetria = new PostagemTelemetria({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagemTelemetria.save()
        return res.status(200).json({ msg: "Postagem da iberia realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA TELEMETRIA
app.put('/postagemtelemetria/telemetria/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagemtelemetria = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemTelemetria.updateOne({ _id: id }, postagemtelemetria)
        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemtelemetria)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA TELEMETRIA
app.delete('/postagemtelemetria/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemTelemetria.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemTelemetria.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//Buscando postagem da TELEMETRIA por ID
app.get("/postagemtelemetria/noticiatelemetria/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagem = await PostagemTelemetria.findById(id)

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    const postagemtelemetria = await PostagemTelemetria.findById({ _id: Object(id) }).then(data => {
        return (
            {
                success: true,
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor: data.autor
            }
        )
    }).catch(err=>{
        return({
            success:false,
            data:err
        })
    });
    return res.status(200).send(postagemtelemetria)

})
//---------------------------------------------------END POSTAGEMTELEMETRIA-------------------------------------------
//--------------------------------------FUNCTIONS END ROUTES FOR POSTAGEM PCTS----------------------------------------
//rota begin
app.get("/postagempcts", async (req, res) => {
    const postagens = await PostagemPcts.find();
    return res.status(200).json(postagens)
})
//CREATE POSTAGEM DA PCTS
app.post("/postagempcts/novapostagem", async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemPcts.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagemPcts = new PostagemPcts({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagemPcts.save()
        return res.status(200).json({ msg: "Postagem da pcts realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA PCTS
app.put('/postagempcts/pcts/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagemPcts = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemTelemetria.updateOne({ _id: id }, postagemPcts)
        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemPcts)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA PCTS
app.delete('/postagempcts/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemPcts.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemPcts.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//Buscando postagem da PCTS por ID
app.get("/postagempcts/noticiapcts/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagem = await PostagemPcts.findById(id)

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    const postagempcts = await PostagemPcts.findById({ _id: Object(id) }).then(data => {
        return (
            {
                success: true,
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor: data.autor
            }
        )
    }).catch(err=>{
        return({
            success:false,
            data:err
        })
    });
    return res.status(200).send(postagempcts)


})
//---------------------------------------------------END POSTAGEM PCTS-------------------------------------------
//--------------------------------------FUNCTIONS END ROUTES FOR POSTAGEM TI----------------------------------------
//rota begin
app.get("/postagemti", async (req, res) => {
    const postagemTi = await PostagemTi.find()
    return res.status(200).json( postagemTi )
})
//CREATE POSTAGEM DA PCTS
app.post("/postagemti/novapostagem", async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemTi.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagemTi = new PostagemTi({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagemTi.save()
        return res.status(200).json({ msg: "Postagem do TI realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA PCTS
app.put('/postagemti/ti/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagemTi = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemTi.updateOne({ _id: id }, postagemTi)
        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemTi)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA PCTS
app.delete('/postagemTi/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemTi.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemTi.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//Buscando postagem da PCTS por ID
app.get("/postagemti/noticiatia/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagem = await PostagemTi.findById(id)

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    const postagemti = await PostagemTi.findById({ _id: Object(id) }).then(data => {
        return (
            {
                success: true,
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor: data.autor
            }
        )
    }).catch(err=>{
        return({
            success:false,
            data:err
        })
    });
    return res.status(200).send(postagemti)

})
//---------------------------------------------------END POSTAGEM TI-------------------------------------------
//--------------------------------------FUNCTIONS END ROUTES FOR POSTAGEM RH----------------------------------------
//rota begin
app.get("/postagemrh", async (req, res) => {
    const postagemrh = await PostagemRh.find()
    return res.status(200).json({ postagemrh })
})
//CREATE POSTAGEM DA PCTS
app.post("/postagemrh/novapostagem", checkToken, async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemRh.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagemrh = new PostagemRh({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagemrh.save()
        return res.status(200).json({ msg: "Postagem do RH realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA PCTS
app.put('/postagemrh/rh/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagemrh = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemRh.updateOne({ _id: id }, postagemrh)
        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemrh)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA PCTS
app.delete('/postagemrh/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemRh.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemRh.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//Buscando postagem da PCTS por ID
app.get("/postagemrh/noticiarh/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagemrh = await PostagemRh.findById(id)

    if (!postagemrh) {
        return res.status(422).json({ Description_Err: 'Postagem do TI não encontrada' })
    }
    return res.status(200).json({ postagemrh })

})
//---------------------------------------------------END POSTAGEM RH-------------------------------------------
//--------------------------------------FUNCTIONS END ROUTES FOR POSTAGEM BALANCA----------------------------------------
//rota begin
app.get("/postagembalanca", async (req, res) => {
    const postagemBalanca = await PostagemBalanca.find()
    return res.status(200).json( postagemBalanca )
})
//CREATE POSTAGEM DA PCTS
app.post("/postagembalanca/novapostagem", async (req, res) => {
    const { titulo, conteudo, autor } = req.body
    //Validação de campos
    if (!titulo) {
        return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
    }

    if (!conteudo) {
        return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
    }

    if (!autor) {
        return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
    }

    //Validação se postagem já é existente
    const postagemExist = await PostagemBalanca.findOne({ titulo: titulo })
    if (postagemExist) {
        return res.status(422).json({ Description_Err: 'Esta postagem ja existe...' })
    }

    const postagembalanca = new PostagemBalanca({
        titulo,
        conteudo,
        autor
    })

    try {
        await postagembalanca.save()
        return res.status(200).json({ msg: "Postagem do RH realizada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//UPDATE POSTAGEM DA PCTS
app.put('/postagembalanca/balanca/:id', async (req, res) => {
    const id = req.params.id
    const { titulo, conteudo, autor } = req.body
    const postagembalanca = {
        titulo,
        conteudo,
        autor
    }
    try {
        if (!titulo) {
            return res.status(422).json({ Description_Err: 'Titulo é obrigatorio' })
        }

        if (!conteudo) {
            return res.status(422).json({ Description_Err: 'Conteudo é obrigatorio' })
        }

        if (!autor) {
            return res.status(422).json({ Description_Err: 'Autor é obrigatorio' })
        }

        const updatePostagem = await PostagemBalanca.updateOne({ _id: id }, postagembalanca)
        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagembalanca)

    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }
})
//DELETE POSTAGEM DA PCTS
app.delete('/postagembalanca/deletarpostagem/:id', async (req, res) => {

    const id = req.params.id
    const postagem = await PostagemBalanca.findOne({ _id: id })

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Ops parece que esta postagem não existe!!' })
    }
    try {
        await PostagemBalanca.deleteOne({ _id: id })
        res.status(200).json({ Description_done: "Postagem Deletada com sucesso!!" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})
//Buscando postagem da PCTS por ID
app.get("/postagembalanca/noticiabalanca/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagem = await PostagemBalanca.findById(id)

    if (!postagem) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    const postagembalanca = await PostagemBalanca.findById({ _id: Object(id) }).then(data => {
        return (
            {
                success: true,
                titulo: data.titulo,
                conteudo: data.conteudo,
                autor: data.autor
            }
        )
    }).catch(err=>{
        return({
            success:false,
            data:err
        })
    });
    return res.status(200).send(postagembalanca)

})
//---------------------------------------------------END POSTAGEM BALANCA-------------------------------------------
//CREDENTIAL MONGO
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.nxjn5.mongodb.net/?retryWrites=true&w=majority`
)
    .then(() => {
        app.listen(5000)
        console.log("Servidor rodando na prota 5000 e conectado ao data base mongo Api_Iberia_web_Site")
    })
    .catch((err) => console.log(err))