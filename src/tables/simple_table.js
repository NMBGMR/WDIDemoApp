import React from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import '../main.css'
import useStyles from "../styles";


function SimpleTable(props){
    const data = props.items ? props.items : []
    const classes = useStyles();

    const labels = props.columns.map((c, i)=>{
        return (<TableCell className={classes.sizeSmall} key={i}>{c.label}</TableCell>)
    })

    function Rows(props){
        let rows = [];
        for (let i=0; i<props.columns.length; i++){
            rows.push(<TableCell  className={classes.sizeSmall} key={i+1}>{props.row[props.columns[i].key]}</TableCell>)
        }
        return rows;
    }

    return (
        <TableContainer component={Paper}>
            <Table  size='small' aria-label="a dense table">
                <TableHead>
                    <TableRow >
                        {labels}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((r, index) => {
                        return (
                            <TableRow
                                className={classes.row}
                                key={r.id}
                                      hover>
                                <Rows row={r} columns={props.columns}/>
                            </TableRow>
                        )})
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )

}

export default SimpleTable
