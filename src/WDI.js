import React, { Component } from 'react';
import axios from "axios";

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
            selected_link: null,
            obs_limit: '',
            nobs_limit: 0,
            obs_order: 'asc'
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
                retrieveItems(selection.row.link+'/Observations?$orderby=phenomenonTime '+this.state.obs_order,
                    this.state.obs_limit, // this should be an editable attribute
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

    loadObservations(start, end, limit, order){
        if (this.state.selected_link){
            start = start? start: this.state.startDate
            end = end? end: this.state.endDate
            limit = limit? limit: this.state.nobs_limit
            order = order? order: this.state.obs_order
            const url =this.state.selected_link+'/Observations?$orderby=phenomenonTime '+ order +
                '&$filter=phenomenonTime gt '+start.toISOString() +
                ' and phenomenonTime lt '+end.toISOString()
            console.log(url)
            retrieveItems(url,
                limit,
                (result)=>{this.setState({observations: result})})
        }
    }

    handleStartPost(date) {
        this.setState({'startDate': date})
        this.loadObservations(date, null, null, null)

    }

    handleEndPost(date) {
        this.setState({'endDate': date})
        this.loadObservations(null, date, null, null)
    }

    handleLimit(event) {
        let l = event.target.value
        let n = l? parseInt(l): -1

        this.setState({nobs_limit: n, obs_limit: l});
        this.loadObservations(null, null, n, null)
    }

    handleOrder(event){
        this.setState({obs_order: event.target.value})
        this.loadObservations(null, null, null, event.target.value)
    }

    render() {
        return (
            <div>
                <div className="hcontainer" style={{ marginTop: 50}}>
                    <div className="divL">
                        <ThingsMap
                            // center={[34.359593, -106.906871]}
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
                        <div className={'group'}>
                            <div className='chart'>
                                <DatastreamChart
                                    datastream = {this.state.datastream}
                                    observations={this.state.observations}/>
                            </div>
                        </div>


                    </div>

                    <div className="divR">
                        <div className={'group'}>
                            <h3>Locations</h3>
                            <LocationsTable
                                locations={this.state.locations}
                                selectable={false} />
                        </div>
                        <div className={'group'}>
                        <h3>Things</h3>
                        <ThingsTable
                            things={this.state.things}
                            onSelect={(selection)=>this.handleSelect(selection)} />
                        </div>
                            <div className={'group'}>
                        <h3>Datastreams</h3>
                            <DatastreamsTable
                            onSelect = {(selection)=> this.handleDSSelect(selection)}
                            datastreams={this.state.datastreams}/>
                            </div>
                        <div className={'group'}>
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
                            <div className='divR'>
                                <h4>Limit</h4>
                                <form>
                                    <label>
                                        <input type="text"
                                               value={this.state.obs_limit}
                                               onChange={(event)=>this.handleLimit(event)} />
                                    </label>
                                </form>
                                <form>
                                    <select name="orderby" onChange={(event)=>this.handleOrder(event)}>
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </form>
                            </div>

                        </div>
                        <ObservationsTable
                            observationsExportPath={this.state.observationsExportPath}
                            items={this.state.observations}/>
                        </div>
                    </div>
                    {/*<div className='divR'>*/}
                    {/*    <div className={'group'}>*/}
                    {/*        <h3>CKAN</h3>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>

                <div>
                    <p align='center'><b>Developed by Jake Ross 2020</b></p>
                </div>

            </div>
        );
    }
}

export default WDI;