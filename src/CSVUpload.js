import React, { Component } from 'react'

import { CSVReader } from 'react-papaparse'
import { Icon, Button, Header, Modal } from 'semantic-ui-react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const buttonRef = React.createRef()

export default class CSVReader1 extends Component {
    state = { modalOpen: false, importing: false, data: {}, number: 0 }

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => this.setState({ modalOpen: false })

    handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point 
        if (buttonRef.current) {
            buttonRef.current.open(e)
        }
    }

    handleOnFileLoad = (data) => {
        console.log('---------------------------')
        console.log(data)
        this.setState({data: data});
        this.setState({ number: Object.keys(data).length})
        this.handleOpen();
        console.log('---------------------------')
    }

    handleOnError = (err, file, inputElem, reason) => {
        console.log(err)
    }

    handleOnRemoveFile = (data) => {
        console.log('---------------------------')
        console.log(data)
        console.log('---------------------------')
    }

    handleRemoveFile = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef.current) {
            buttonRef.current.removeFile(e)
        }
    }

    importPeople = async (e) => {
        this.setState({importing: true});
        console.log(this.state.data);
        // import users
        for await (let person of this.state.data) {
            console.log(person.data);
        };
        console.log('done');
        // this.handleClose();
    }

    importUser = (user) => {

    }

    render() {
        return (
                    <CSVReader
                        ref={buttonRef}
                        onFileLoad={this.handleOnFileLoad}
                        onError={this.handleOnError}
                        noClick
                        noDrag
                        onRemoveFile={this.handleOnRemoveFile}
                        config={{
                            worker: true,
                            header: true,
                            skipEmptyLines: true
                        }}
                    >
                        {({ file }) => (
                            <div>
                            <Button primary content='Upload People CSV' icon='upload' labelPosition='left'
                                onClick={this.handleOpenDialog}
                            />
                            <Modal
                                open={this.state.modalOpen}
                                onClose={this.handleClose}
                                basic
                                size='small'
                            >
                                <Header icon='browser' content='Import People' />
                                <Modal.Content>
                                    <h3>Are you sure you want to import file: {file && file.name}?</h3>
                                    <p>This will import {this.state.number} people.</p>
                                    <Dimmer active={this.state.importing} page={true}>
                                        <Loader 
                                            inverted 
                                            content={'Importing '+this.state.number+' people...'}
                                            inline='centered'
                                            size='large'
                                        />
                                    </Dimmer>

                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='green' onClick={this.importPeople} inverted>
                                        <Icon name='checkmark' /> Import
                </Button>
                            <Button color='red' onClick={this.handleClose} inverted>
                                <Icon name='cancel' /> Cancel
                </Button>
                                </Modal.Actions>
                            </Modal>
                            </div>
                        )}
                    </CSVReader>
        )
    }
}
