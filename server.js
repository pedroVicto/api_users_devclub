import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app =  express()
app.use(express.json());
app.use(cors())


app.post('/usuarios', async (req, res)  => {
    
     await prisma.user.create({
        data: {
           email: req.body.email,
           name: req.body.name,
           age: req.body.age
        },
    })

    res.status(201).json(req.body)
})

app.put('/usuarios/:id', async (req, res)  => {
    
     await prisma.user.update({
         where: {
           id: req.params.id,
         },
        data: {
           email: req.body.email,
           name: req.body.name,
           age: req.body.age
        },
    })

   res.status(201).json(req.body)
})
app.get('/usuarios', async (req, res)  => {
    
    const users = await prisma.user.findMany()

    res.status(200).json(users)
})

app.delete('/usuarios/:id', async (req, res) => {
    await prisma.user.delete({
        where: {
          id: req.params.id,
        },
    })

    res.status(200).json({ message: "Usuario deletado com sucesso!" })
})

const PORT = process.env.PORT

app.listen(3000, () => {
    console.log('Servidor rodando na porta ' + PORT)
})


/*
    1) tipo de rota /Método HTTP
    2) Endereço 


    Criar nossa API de usuarios:

    - Criar um novo usuário
    - Listar todos os usuários
    - Editar os usuarios
    -deletar um usuário

    victorpedrosilva445
    vaaCke7cFPsdaKm9
*/