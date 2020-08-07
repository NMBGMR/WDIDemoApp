const axios =require('axios');
const url = 'http://34.106.91.141/api/datasets'
axios.get(url).then(success=>{
    console.log(success.data)
})