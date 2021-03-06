import React, { Component } from 'react'

import { CSVReader } from 'react-papaparse'
import { Icon, Button, Header, Modal } from 'semantic-ui-react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const buttonRef = React.createRef()

export default class CSVReader1 extends Component {
    state = { modalOpen: false, importing: false, data: {}, number: 0, errors: [], resultsModalOpen: false }

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => this.setState({ modalOpen: false })

    handleResultsClose = () => {
        this.setState({ resultsModalOpen: false })
        this.setState({data: {}})
        this.setState({errors: []})
    }

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

        // loop through users from CSV
        for await (let person of this.state.data) {

            // look for headers with data we want
            let emailKey = Object.keys(person.data).filter(key => RegExp('.*email.*', 'i').test(key));
            let firstKey = Object.keys(person.data).filter(key => RegExp('.*first.*', 'i').test(key));
            let lastKey = Object.keys(person.data).filter(key => RegExp('.*last.*', 'i').test(key));
            let statusKey = Object.keys(person.data).filter(key => RegExp('.*status.*', 'i').test(key));
            
            // if all required fields are found. In future add else statement and show error
            if (emailKey.length > 0 && firstKey.length > 0 && lastKey.length > 0 && statusKey.length > 0) {

                let validatedPerson = {
                    'first_name': person.data[firstKey],
                    'last_name': person.data[lastKey],
                    'email_address': person.data[emailKey],
                    'status': person.data[statusKey]
                }

                // add person
                const rawResponse = await fetch('http://127.0.0.1:8000/api/people', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(validatedPerson)
                });
                const content = await rawResponse.json();
                if (content.errors) {
                    this.setState({errors: [...this.state.errors, content.errors]})
                }
            }
        }

        // reset ui
        this.setState({ importing: false})
        this.setState({modalOpen: false})
        this.setState({resultsModalOpen: true})

        // this is hacky but since the upload and results dont share
        // state this is the easiest way to reload the results... obviously
        // should be different in a real app!
        window.location.reload(false);
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
                            <Modal
                                open={this.state.resultsModalOpen}
                                onClose={this.handleResultsClose}
                                basic
                                size='small'
                            >
                                <Header icon='browser' content='Import People Results' />
                                <Modal.Content>
                                    
                                    <h3>Import Done</h3>
                                    <p>There were {this.state.errors.length} errors.</p>

                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='red' onClick={this.handleResultsClose} inverted>
                                        <Icon name='cancel' /> Close
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                            </div>
                        )}
                    </CSVReader>
        )
    }
}
