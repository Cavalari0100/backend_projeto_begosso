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
const PostagemIberia = require('./models/PostagemIberia')

//CONFIG JSON response
app.use(express.json())


//Configurando o Cors

app.use((req, res, next) => {
    //console.log("acessou o medle")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", 'GET,POST,PUT,DELETE')

    app.use(cors());
    next()
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
//FUNCTIONS END ROUTES FOR POSTAGEMIBERIA
//rota begin
app.get("/postagemiberia", async (req, res) => {
    const postagens = await PostagemIberia.find()
    return res.status(200).json({ postagens })
})
//CREATE POSTAGEM
app.post("/postagemiberia/novapostagem", checkToken, async (req, res) => {
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
        return res.status(422).json({ Description_Err: 'O titulo ja esta sendo usado em outra postagem...' })
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
    const postagemiberia = {
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

        const updatePostagem = await PostagemIberia.updateOne({ _id: id }, postagemiberia)

        if (updatePostagem.matchedCount === 0) {
            return res.status(422).json({ Description_Err: 'ops algo deu errado!!' })
        }

        res.status(200).json(postagemiberia)

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
        await PostagemIberia.deleteOne({_id:id})
        res.status(200).json({Description_done:"Postagem Deletada com sucesso!!"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({ Description_Err: "Ocorreu um erro com o servidor, tente novamente mais tarde" })
    }

})





//Buscando postagem da iberia por ID
app.get("/postagemiberia/noticiaiberia/:id", async (req, res) => {

    const id = req.params.id

    //check user exist
    const postagemiberia = await PostagemIberia.findById(id)

    if (!postagemiberia) {
        return res.status(422).json({ Description_Err: 'Postagem iberia não encontrada' })
    }
    return res.status(200).json({ postagemiberia })

})

//---------------------------------------------------END POSTAGEMIBERIA-------------------------------------------

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