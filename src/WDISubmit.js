import React, { Component } from 'react';
import axios from "axios";

const CLOWDER_API = 'http://localhost:8000/api'

function uploadurl(datasetid, key){
    const auth='?key=' + key
    return CLOWDER_API+'/uploadToDataset/'+datasetid+auth
}

class WDISubmit extends Component{
    constructor() {
        super();
        this.state = {metafile: null,
                      obsfile: null,
                      dataset_id: '5ebdc06de4b0e53a77505c0d'}
    }

    checkMimeType=(event, types)=>{
        //getting file object
        let files = event.target.files
        //define message container
        let err = ''
        // list allow mime type
        // const types = ['image/png', 'image/jpeg', 'image/gif']
        // loop access array
        for(let x = 0; x<files.length; x++){
            // compare file type find doesn't matach
            if (types.every(type => files[x].type !== type)) {
                // create error message and assign to container
                err += files[x].type+' is not a supported format\n';
            }
        }

        if (err !== ''){ // if message not same old that mean has error
            event.target.value = null // discard selected file
            console.log(err)
            alert(err)
            return false;
        }
        return true;
    }

    handleMeta = e=>{
        if (this.checkMimeType(e, ['application/x-yaml',]))
        this.setState({metafile: e.target.files[0]})
    }

    handleObs = e=>{
        if (this.checkMimeType(e, ['text/csv',])){
            this.setState({obsfile: e.target.files[0]})
        }

    }

    handleUpload = e=>{
        console.log('upload')
        // if (this.state.metafile && this.state.obsfile){
        if (this.state.metafile){
            const key = '2c8042c8-05bf-48a2-b74c-3494385f1aca'

            const data = new FormData()
            data.append('meta', this.state.metafile)
            console.log(data)

            axios.post(uploadurl(this.state.dataset_id,key),
                    data, {}).then(res=>{
                // console.log(res.statusText)
                // const data = new FormData()
                // data.append('obs', this.state.obsfile)
                // axios.post(uploadurl(this.state.dataset_id, key),
                //     data, {})
            })

        }else{
            alert('Please select an obs.csv and meta.yml file')
        }

    }
    handleDatasetID=e=>{
        this.setState({dataset_id: e.target.value})
    }

    render() {
        return (<div>
            <p>This is a submission form for ST Data</p>
            <form>
                <div>
                    <label>
                    DatasetID:
                    <input type="text" value={this.state.dataset_id}
                       onChange={this.handleDatasetID}/>
                    </label>
                </div>
                <div>
                    <label>
                        Meta.yml
                        <input type="file" name="file" onChange={this.handleMeta}/>
                    </label>
                </div>
                <div>
                    <label>
                        Obs.csv
                        <input type="file" name="file" onChange={this.handleObs}/>
                    </label>
                </div>

                <button className='btn btn-success btn-block'
                        onClick={this.handleUpload}>Upload
                </button>
            </form>

        </div>)
    }
}
export default WDISubmit;