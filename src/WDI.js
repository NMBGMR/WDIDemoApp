import React, { Component } from 'react';
import axios from "axios";

import './main.css'
import DatastreamsTable from './datastreams_table'
import ThingsTable from './thing_table'
import DatastreamChart from './datastream_chart'
import ThingsMap from './map'
import ObservationsTable from "./observations_table";
import LocationsTable from "./locations_table";
import retrieveItems from './util'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


class WDI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            observations: null,
            datastreams: null,
            locations: [],
            thing: '',
            location: '',
            startDate: new Date(),
            endDate: new Date(),
            selected_link: null
        }
    }

    handleSelect(selection){
        if(selection){
            if (selection.isSelected) {
                this.setState({ thing: selection.row.name })
                axios.get(selection.row.link+'/Datastreams').then(
                    res => {
                        this.setState({ datastreams: res.data.value.map(v => ({id: v['@iot.id'],
                                            name: v.name,
                                            unit: v.unitOfMeasurement.name,
                                            link:v['@iot.selfLink']}))})})
            } else { this.setState({ datastreams: []}) }
        } else { this.setState({ datastreams: []}) }
    }

    handleDSSelect(selection){
        if(selection){
            if (selection.isSelected){
                const ep = (this.state.location +'-'+this.state.thing+'-'+selection.row.name).replace(/\s/g, '_')
                retrieveItems(selection.row.link+'/Observations?$orderBy=phenomenonTime',
                    2, // this should be an editable attribute
                    (result)=>{
                    const dates = result.map(v=>(new Date(v['phenomenonTime'])))
                    this.setState({observations: result,
                                        observationsExportPath: ep,
                                        datastream: selection.row,
                                        selected_link: selection.row.link,
                                        startDate: dates[0],
                                        endDate: dates[dates.length-1]})})
            } else { this.setState({observations: null, datastream: null, observationsExportPath:null}) }
        } else { this.setState({observations: null, datastream: null, observationsExportPath:null}) }
    }

    loadObservations(start, end){
        if (this.state.selected_link){
            start = start? start: this.state.startDate
            end = end? end: this.state.endDate

            const url =this.state.selected_link+'/Observations?$orderBy=phenomenonTime'+
                '&$filter=phenomenonTime gt '+start.toISOString() +
                ' and phenomenonTime lt '+end.toISOString()
            console.log(url)
            retrieveItems(url,
                100,
                (result)=>{this.setState({observations: result})})
        }
    }

    handleStartPost(date) {
        this.setState({'startDate': date})
        this.loadObservations(date, null)

    }

    handleEndPost(date) {
        this.setState({'endDate': date})
        this.loadObservations(null, date)
    }

    render() {
        return (
            <div>
                <div>
                    <h1 align='center'>New Mexico Water Data Demo App</h1>
                </div>
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
                                            }], location: res.data['name']})
                                })

                                axios.get(e.target.options.properties.link+'/Things').then( res =>{
                                    let things = res.data.value.map(v => ({id: v['@iot.id'],
                                        name: v.name,
                                        link:v['@iot.selfLink'],
                                        point_id:v.properties ? v.properties['@nmbgmr.point_id']: ''
                                    }))

                                    this.setState({things: things,
                                        datastreams: null,
                                        observations: null})
                                })

                            }}
                        />
                        <h3>Chart</h3>
                        <div className='chart'>
                            <DatastreamChart
                                datastream = {this.state.datastream}
                                observations={this.state.observations}/>
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
                        <div className='hcontainer'>
                            <div className='divL'>
                                <h4>Start Date</h4>
                                <DatePicker
                                    selected={this.state.startDate}
                                    onChange={(date)=> this.handleStartPost(date)}
                                />
                            </div>
                            <div className='divR'>
                                <h4>End Date</h4>
                                <DatePicker
                                    selected={this.state.endDate}
                                    onChange={(date)=> this.handleEndPost(date)}
                                />
                            </div>
                        </div>
                        <ObservationsTable
                            observationsExportPath={this.state.observationsExportPath}
                            items={this.state.observations}/>
                    </div>

                </div>

                <div>
                    <p align='center'><b>Developed by Jake Ross 2020</b></p>
                </div>

            </div>
        );
    }
}

export default WDI;