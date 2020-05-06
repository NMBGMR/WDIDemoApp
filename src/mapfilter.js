import React, {Component} from 'react'
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button"
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

class MapFilter extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <Select
                value={this.props.filter_attr}
                onChange={this.props.handleAttr}>
                <MenuItem value={'observations'}>Observations</MenuItem>
                <MenuItem value={'nobservations'}>NumberObservations</MenuItem>
            </Select>
            <Select value={this.props.filter_comp}
                    onChange={this.props.handleComp}>
                <MenuItem value={'lt'}>&lt;</MenuItem>
                <MenuItem value={'gt'}>&gt;</MenuItem>
                <MenuItem value={'le'}>&le;</MenuItem>
                <MenuItem value={'ge'}>&ge;</MenuItem>
                <MenuItem value={'eq'}>==</MenuItem>
                <MenuItem value={'ne'}>!=</MenuItem>
            </Select>

            <TextField id="standard-basic"
            onChange={this.props.handleStr}/>
            <Button onClick={this.props.handleFilter}>Filter</Button>
            <Button onClick={this.props.handleClear}>Clear</Button>
        </div>
    }
}

export default  MapFilter