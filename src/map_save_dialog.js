import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Checkbox} from "@material-ui/core";
import FormControlLabel from '@material-ui/core/FormControlLabel';

export default function MapSaveDialog(props) {
    return (
        <div>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Export Options</DialogTitle>
                <DialogContent>
                    {/*<DialogContentText>*/}
                    {/*    {props.content}*/}
                    {/*</DialogContentText>*/}
                    {/*<TextField*/}
                    {/*    autoFocus*/}
                    {/*    margin="dense"*/}
                    {/*    id="name"*/}
                    {/*    label="Email Address"*/}
                    {/*    type="email"*/}
                    {/*    fullWidth*/}
                    {/*/>*/}
                    <FormControlLabel control={<Checkbox name="use_atomic"
                                                         onChange={props.handleAtomic}
                                                    />}
                                      label="One file per location" />

                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={props.handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
