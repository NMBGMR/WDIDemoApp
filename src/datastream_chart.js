import React, { Component } from 'react'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';


class DatastreamChart extends Component {
    constructor(props) {
        super(props);
        this.state  = {
            observations: [],}
    }

    render() {

        const data = this.props.observations ? this.props.observations.map(obs => ({
            x: obs['@iot.id'],
            y: obs.result})) : []


        return (
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="y" stroke="#8884d8" dot={false}/>
                {/*<Line type="monotone" dataKey="uv" stroke="#82ca9d" />*/}
            </LineChart>
        );
    }
}

export default DatastreamChart


{/*<div>*/}
{/*    <V.VictoryChart height={200}>*/}
{/*        <V.VictoryLine*/}
{/*        data={data}*/}
{/*        x='x'*/}
{/*        y='y'*/}
{/*        />*/}
{/*    </V.VictoryChart>*/}
{/*</div>*/}