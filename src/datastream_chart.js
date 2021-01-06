import React, {Component} from 'react'
import { ResponsiveLine } from '@nivo/line'

class DatastreamChart extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        var ylabel = ''
        if (this.props.datastream){
            ylabel = this.props.datastream.name
            if (ylabel.startsWith('Depth')){
                ylabel = 'DTW (ft bgs)'
            }
        }

        const data = this.props.observations ? this.props.observations.map(obs => ({
            x: new Date(obs.phenomenonTime),
            y: obs.result})) : []

        const yreverse = Boolean(ylabel == 'DTW (ft bgs)')
        const dd = [{id: '1', data: data}]
        return (
            <div className='chart'>
                <ResponsiveLine
                    data={dd}
                    // margin={{ top: 50, right: 50, bottom: 50, left: 80}}
                    xScale={{ type: 'time'}}
                    xFormat="time:%Y-%m-%d %H:%M"
                    yFormat={(v)=>(v.toFixed(2))}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto',
                        stacked: true, reverse: yreverse }}
                    axisTop={null}
                    axisRight={null}
                    gridXValues={null}
                    axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Time',
                        legendOffset: 36,
                        legendPosition: 'middle',
                        format: '%m-%d',
                        tickValues: 10,
                    }}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: ylabel,
                        legendOffset: -60,
                        legendPosition: 'middle'
                    }}
                    useMesh={true}
                />
            </div>
        );
    }
}

export default DatastreamChart
