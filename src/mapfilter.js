import React, {Component} from 'react'

class MapFilter extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        return <div className={'subgroup'}>
            <select
                value={this.props.filter_attr}
                onChange={this.props.handleAttr}>
                <option value={'location_name'}>Location Name</option>
                <option value={'observation_date'}>Observation Date</option>
                {/*<option value={'nobservations'}>NumberObservations</option>*/}
            </select>
            <select value={this.props.filter_comp}
                    onChange={this.props.handleComp}>
                <option value={'lt'}>&lt;</option>
                <option value={'gt'}>&gt;</option>
                <option value={'le'}>&le;</option>
                <option value={'ge'}>&ge;</option>
                <option value={'eq'}>==</option>
                <option value={'ne'}>!=</option>
            </select>

            <input id="standard-basic"
            onChange={this.props.handleStr}/>

                <button onClick={this.props.handleFilter}>Filter</button>
                <button onClick={this.props.handleClear}>Clear</button>


        </div>
    }
}

export default  MapFilter