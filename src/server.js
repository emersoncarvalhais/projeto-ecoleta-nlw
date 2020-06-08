//inciando o servidor
const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db")

//configurar pasta publica
server.use(express.static("public"))

//habiltar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

//utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true //nao restornar arquivos guardados na memoria com versao antiga

})

//configurar caminhos da aplicação
//pagina incial
//req: requisicao (pedido)
//res: resposta
// variavel global __dirname (nome do diretorio que estou) que será concatenada com  
//uma string informando o caminho do arquivo que quero enviar nesse caso o index.html
server.get("/", (req, res) =>{
    return res.render("index.html")
})
// render tem a função de entender que eu tenho nunjucks configurado
server.get("/create-point", (req, res) =>{
    //req.query = query string da nossa url
    // console.log(req.query)


    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //req.body = ao corpo do nosso formulário
    // console.log(req.body)

    //inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?)
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro")

        }

        console.log("Cadastrado com Sucesso")
        console.log(this)

        return res.render("create-point.html", {saved:true}) 
    }
    
    db.run(query, values, afterInsertData)

})

server.get("/search", (req, res) =>{

    const search = req.query.search

    if(search == "") {
        //pesquisa vazia
        return res.render("search-results.html", {total: 0}) 
    }

    //pegar o banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
       if(err) {
           return console.log(err)
       }

       const total = rows.length

       //mostrar os dados HTML com os dados do banco de dados
       return res.render("search-results.html", {places: rows, total: total})
    })

    
})



//ligar o servidor
server.listen(3000)