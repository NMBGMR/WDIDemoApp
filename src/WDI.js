import React, { Component } from 'react';
import axios from "axios";

import './main.css'
import DatastreamsTable from './datastreams_table'
import ThingsTable from './thing_table'
import DatastreamChart from './datastream_chart'
import ThingsMap from './map'
import ObservationsTable from "./observations_table";
import LocationsTable from "./locations_table";


class WDI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            observations: null,
            datastreams: null,
            locations: []
        }
    }

    handleSelect(selection){
        if(selection){
            if (selection.isSelected) {
                axios.get(selection.row.link+'/Datastreams').then(
                    res => {
                        const ds = res.data.value.map(v => ({id: v['@iot.id'],
                            name: v.name,
                            unit: v.unitOfMeasurement.name,
                            link:v['@iot.selfLink']}))

                        this.setState({datastreams: ds})
                    }
                )
            }else {
                this.setState({datastreams: []})
            }

        }else{
            this.setState({datastreams: []})
        }
    }

    handleDSSelect(selection){

        if(selection){
            if (selection.isSelected){


                axios.get(selection.row.link+'/ObservedProperty').then(
                    res => {
                        const obs = res.data.value



                        this.setState({observations: obs})
                    }
                )
                axios.get(selection.row.link+'/Observations').then(
                    res => {
                        const obs = res.data.value
                        this.setState({observations: obs})
                    }
                )


            }else{
                this.setState({observations: null})
            }
        }else{
            this.setState({observations: null})
        }
    }


    render() {
        return (
            <div>
                <div className="hcontainer" style={{ marginTop: 50}}>
                    <div className="divL">
                        <h3>MAP</h3>
                        <ThingsMap
                            center={[34.359593, -106.906871]}
                            zoom={6}
                            onSelect={e => {

                                axios.get(e.target.options.properties.link).then(res => {
                                        this.setState({locations: [{id: res.data['@iot.id'],
                                                name: res.data['name'],
                                                description: res.data['description'],
                                                lat: res.data.location.coordinates[1],
                                                lon: res.data.location.coordinates[0]
                                            }]})
                                        console.log(res.data)
                                })

                                axios.get(e.target.options.properties.link+'/Things').then( res =>{
                                    let things = res.data.value.map(v => ({id: v['@iot.id'],
                                        name: v.name,
                                        link:v['@iot.selfLink'],
                                        point_id:v.properties['@nmbgmr.point_id'],
                                    }))

                                    this.setState({things: things,
                                        datastreams: null,
                                        observations: null})
                                })

                            }}
                        />
                        <h3>Chart</h3>
                        <div className='chart'>
                            <DatastreamChart observations={this.state.observations}/>
                        </div>

                    </div>

                    <div className="divR">
                        <h3>Locations</h3>
                        <LocationsTable
                            locations={this.state.locations}
                            selectable={false} />

                        <h3>Things</h3>
                        <ThingsTable
                            things={this.state.things}
                            onSelect={(selection)=>this.handleSelect(selection)} />

                        <h3>Datastreams</h3>
                        <DatastreamsTable
                            onSelect = {(selection)=> this.handleDSSelect(selection)}
                            datastreams={this.state.datastreams}/>

                        <h3>Observations</h3>
                        <ObservationsTable items={this.state.observations}/>
                    </div>

                </div>
                <div className="hcontainer">
                    <div className='divL'>

                    </div>
                    <div className='divR'>

                    </div>

                </div>
            </div>
        );
    }
}

export default WDI;