import React, { Component } from 'react'

import { CSVReader } from 'react-papaparse'
import { Icon, Button, Header, Modal } from 'semantic-ui-react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const buttonRef = React.createRef()

export default class CSVReader2 extends Component {
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

    importGroups = async (e) => {
        this.setState({importing: true});
        console.log(this.state.data);

        // loop through groups from CSV
        for await (let group of this.state.data) {

            // search through headers for data we need
            let groupNameKey = Object.keys(group.data).filter(key => RegExp('(?:.*group.*)(?:.*name.*)', 'i').test(key));
            let firstKey = Object.keys(group.data).filter(key => RegExp('.*first.*', 'i').test(key));
            let lastKey = Object.keys(group.data).filter(key => RegExp('.*last.*', 'i').test(key));
            let emailKey = Object.keys(group.data).filter(key => RegExp('.*email.*', 'i').test(key));
            let fullKey = Object.keys(group.data).filter(key => RegExp('(?!.*first.*)(?!.*last)(?:^name)|(?:.*full.*)', 'i').test(key));
            
            let searchData = {};

            // if either a full name is found, or first and last
            if (fullKey.length > 0 || (firstKey.length > 0 && lastKey.length > 0)) {
                // search by name
                let firstName;
                let lastName;
                if (fullKey.length === 0) {
                    firstName = group.data[firstKey];
                    lastName = group.data[lastKey];
                } else {
                    let parts = group.data[fullKey].split(" ");
                    firstName = parts.shift();
                    lastName = parts.shift() || "";
                }
                searchData = {
                    first_name: firstName,
                    last_name: lastName
                }
                
            // if an email field is found
            } else if (emailKey.length > 0) {
                searchData = {
                    email_address: group.data[emailKey]
                }
            } else {
                console.log('no acceptible user key found');
            }

            let person;
            if (Object.keys(searchData).length !== 0) {
                console.log(searchData);
                // search for existing person
                const rawResponse = await fetch('http://127.0.0.1:8000/api/people/search', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(searchData)
                }).then(function (response) {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject(response);
                    }
                }).catch(function (err) {
                    console.warn('Could not find a person');
                });

                // if person found
                if (typeof rawResponse !== "undefined") {
                    person = rawResponse['data'];

                    let groupId;

                    // search for group by name
                    const rawResponse2 = await fetch('http://127.0.0.1:8000/api/groups/search/' + encodeURI(group.data[groupNameKey]), {
                        method: 'GET'
                    }).then(function (response) {
                        if (response.ok) {
                            return response.json();
                        } else {
                            return Promise.reject(response);
                        }
                    }).catch(function (err) {
                        console.warn('Could not find a group');
                    });

                    // if group found
                    if (typeof rawResponse2 !== "undefined") {
                        groupId = rawResponse2['data']['id'];
                    } else {

                        // add group
                        const rawResponse3 = await fetch('http://127.0.0.1:8000/api/groups', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ group_name: group.data[groupNameKey]})
                        });
                        const content = await rawResponse3.json();
                        groupId = content['data']['id'];
                    }

                    // add person to group
                    const rawResponse4 = await fetch('http://127.0.0.1:8000/api/people/'+ person['id']+'/group', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ group_id: groupId })
                    });

                }
            }
        }
        // reset ui
        this.setState({ importing: false })
        this.setState({ modalOpen: false })
        this.setState({ resultsModalOpen: true })

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
                            <Button primary content='Upload Group CSV' icon='upload' labelPosition='left'
                                onClick={this.handleOpenDialog}
                            />
                            <Modal
                                open={this.state.modalOpen}
                                onClose={this.handleClose}
                                basic
                                size='small'
                            >
                                <Header icon='browser' content='Import Groups' />
                                <Modal.Content>
                                    <h3>Are you sure you want to import file: {file && file.name}?</h3>
                                    <p>This will import {this.state.number} records of group membership.</p>
                                    <Dimmer active={this.state.importing} page={true}>
                                        <Loader 
                                            inverted 
                                            content={'Importing '+this.state.number+' records...'}
                                            inline='centered'
                                            size='large'
                                        />
                                    </Dimmer>

                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='green' onClick={this.importGroups} inverted>
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
                                <Header icon='browser' content='Import Group Results' />
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
