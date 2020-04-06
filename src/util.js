import axios from "axios";

const getItems = (url, maxCalls, i, items, resolve, reject) =>{
    axios.get(url).then(response=>{
        const ritems = items.concat(response.data.value)
        if (response.data['@iot.nextLink']!=null && i<maxCalls){
            getItems(response.data['@iot.nextLink'], maxCalls, i+1, ritems, resolve, reject)
        }else{
            resolve(ritems)
        }
    })
}

const retrieveItems = (url, maxcalls, callback) => {
    new Promise((resolve, reject) => {
        getItems(url, maxcalls, 0, [], resolve, reject)}).then(callback)
}

export default retrieveItems