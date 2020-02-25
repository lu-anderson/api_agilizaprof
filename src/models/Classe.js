const mongoose = require('mongoose')

const Classe = new mongoose.Schema({
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    school: String,
    discipline: String, 
    classe: String,
    students: [],
    diaries: [],
    diariesOfContents: [],
    codeSeries: Number,
    codeId: String,
    segment: String,
    displayText: String,
    learningObjectives: [],
    needUpdate: {
        type: Boolean,
        default: false
    },
    existDataForSaveInRealm: {
		type: Boolean,
        default: false,        
	},
	exitsDataForSaveInSigEduca: {
		type: Boolean,
		default: false
    },
    evaluatedUser: {
        type: Boolean,
        default: false
    },
    evaluatedInSigEduca: {
        type: Boolean,
        default: false
    },
    
}, {
    timestamps: true
})

module.exports = mongoose.model('Classe', Classe)


/*
    status: "modified"||""

    Tudo que precisa de atualização terá um campo
    com três possiveis valores, um para quando 
    existir dados vindos do celular, outro para
    quando existir dados vindos do core, ou seja
    precisa ser informado ao celular e um para 
    indicar que está tudo certo.

    existsDataForSaveInSigEduca
    existsDataForSaveInRealm
    synchronized


    O que deverá ser feito quando existir dados no 
    banco de dados online e no banco de dados offline

    Vamos pensar se realmente existe casos em que isso aconteça
    Nós estamos armazenando diários únicos com base na data.
    Por exemplo só existe um diário de presença para a data 17/02/2020
    e ele será guardado da seguinte forma
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInRealm'
    },

    isso significa que se salvar offline não existirá esse arquivo no
    banco de dados online, logo quando o usuário voltar a ficar
    online existirá apenas o arquivo offline e ele será carregado 
    para o banco de dados online.

    Neste ponto existe dois arquivos, um no banco de dados offline
    e um no banco de dados online e eles têm os mesmos dados

    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInMongoDB',
    }

    Posteriormente quando o core finalizar o lançamento desse diário
    no sigEduca, ele fará um chamada a api para atualizar esse diário.
    Aqui o banco de dados não sabe e nem precisa saber desta atualização.

    Quando o usuário entrar online novamente o app fará uma chamada a 
    api buscando por atualizações, os arquivos estarão da seguinte forma:

    offline:
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInMongoDB',
    }

    online: 
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInSigEduca',
    }

    a api retornará esse diário com o status "saveInSigEduca" e o app
    fará a atualização no banco de dados offline, ficando assim:

    offline:
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInSigEduca',
    }

    online: 
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInSigEduca',
    }


    Tendo essas informações acredito que o processo de sincronização deverá
    ocorrer da seguinte maneira:
    Quando o usuário fica online o app faz uma requição a api perguntando se
    existe alguma atualização, o ui terá que exibir um loading para o usuário
    não fazer outra requisição enquanto esse processo está ativo.
    Após a atualização dos dados o app enviará um requisão com novos arquivos 
    para o banco de dados.

    Para facilitar a busca dos dados por parte da api, o model de usuário deverá
    ter um campo para informar se existe dados para serem salvos no sigEduca
    ou se existe dados para serem salvos no realm. Pode ocorrer o caso em que
    que existem dados para serem salvos no sigEduca e no realm ao mesmo tempo?
    Poderá haver sim, pois pode acontecer de quando o usuário entrar online 
    o core ainda não tenha finalizado o lançamento de algum dado no sigEduca
    e se o usuário fizer outro lançamento ficaremos com a seguinte situação.
    Suponhamos que o usuário fez o lançamento dos seguintes diários
    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    },

    {
        date: dateObject(18/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    },
    {
        date: dateObject(19/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    }

    Neste ponto marcaremos o usuário como,existem dados para serem salvos no sigEduca
    O core entra em ação e faz alguns lançamentos e então marca o usuário com existe dados para serem salvos no realm

    Em outro momento o usuário entra online, aqui será sincronizado os dados.
    e rebemos os seguintes dados

    {
        date: dateObject(17/02/2020)
        students: [],
        status: 'saveInSigEduca',
        finished: true
    },

    {
        date: dateObject(18/02/2020)
        students: [],
        status: 'saveInSigEduca',
        finished: true
    },

    Então o usuário faz outro lançamento e teremos a seguinte situação

    {
        date: dateObject(19/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    },

    {
        date: dateObject(20/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    }

    Neste ponto o usuário está marcado como: existe dados para serem salvos no realm

    O core finaliza o lançamento dos dados anteriores

    ficando assim,

    {
        date: dateObject(19/02/2020)
        students: [],
        status: 'saveInSigEduca',
        finished: false
    },

    {
        date: dateObject(20/02/2020)
        students: [],
        status: 'saveInMongoDB',
        finished: false
    }

    Neste ponto o usuário está marcado como: existe dados para serem salvos no realm e no sigEduca.

    Portanto, toda vez que o core estiver trabalhando ele fará uma requisição a api buscando
    usuários marcados com 'exitsDataForSaveInSigEduca: true'. A api retornará todos os usuários
    nessa situação juntamente com os diários marcados com 'finished: false' e 'status: saveInMongoDB'.

    E toda vez que o usuário entrar online o app fará uma requisição a api buscando usuários
    marcado com 'existDataForSaveInRealm: true'. A api retornará todos os usuários nessa situação
    juntamente com os diários marcados com 'finished: false' e 'status: saveInSigEduca', a api
    atualizará o campo finished para true dos diários enviados. 

    
*/