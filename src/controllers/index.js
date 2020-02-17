module.exports = {
    index(req, res){
        try {
            res.json({"OK": "Index"})
            throw 'teste'
        } catch (error) {
            console.log(error)
        }        
    }
}