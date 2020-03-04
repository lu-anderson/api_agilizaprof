module.exports = {
    index(req, res){
        try {
            return res.json({"OK": "Index"})
        } catch (error) {
            console.log(error)
        }        
    }
}