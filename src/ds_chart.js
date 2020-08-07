
import Chart from "react-google-charts";
import React, {Component} from 'react'

class DSChart extends Component{
    render() {
        var data = [[{type:'datetime', label:'Time'},
                     {type: 'number', label: this.props.datastream?this.props.datastream.name:''}],]
        var start, end
        if (this.props.observations){
            var vs = this.props.observations.map(f=>([new Date(f['phenomenonTime']),
                f['result']]))
            data = data.concat(vs)
            var dates = vs.map(f=>(f[0]))
            var end=new Date(Math.max.apply(null, dates));
            var start=new Date(Math.min.apply(null,dates));
            console.log(start, end)
        }


        return (
            <div>
                <Chart
                    width={400}
                    // height={300}
                    chartType="LineChart"
                    loader={<div>Loading Chart</div>}
                    data = {data}
                    options={{
                        hAxis: {
                            title: 'Time'
                        },
                        vAxis: {
                            title: this.props.datastream?this.props.datastream.name : ''
                        },
                      intervals: { style: 'sticks' },
                      legend: 'none',
                    }}
                    chartPackages={['corechart', 'controls']}
                    controls={
                                [
                                    {
                                        controlType: 'ChartRangeFilter',
                                        options: {
                                                    filterColumnIndex: 0,
                                                    ui: {
                                                            chartType: 'LineChart',
                                                            chartOptions: {
                                                                            chartArea: { width: '90%', height: '50%' },
                                                                            hAxis: { baselineColor: 'none' },
                                                            },
                                                    },
                                        },
                                        controlPosition: 'bottom',
                                        controlWrapperParams: {
                                                                state: {
                                                                            range: {
                                                                                        start: start,
                                                                                        end: end
                                                                            }
                                                                },
                                        }
                                    }
                                ]
                    }
                  />
            </div>
        )
    }

}

export default DSChart;