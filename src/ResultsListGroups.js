import React, { Component } from 'react'
import { Table, Icon } from 'semantic-ui-react'

class ResultsListGroups extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
    }

    componentDidMount() {
        let filledGroups = [];
        // Get all groups
        fetch("http://localhost:8000/api/groups")
          .then(response => response.json())
          .then(async (groups) => {

            // loop through groups to get people
            for await (let group of groups.data) {
              // get people in group
              const rawResponse = await fetch("http://localhost:8000/api/groups/"+group.id+"/people")
              const people = await rawResponse.json();
              group.people = people;
              filledGroups.push(group);
            }
            this.setState({ groups: filledGroups })
          });
    }

    render() {
        var groups = this.state.groups || [];
        console.log(groups);

        return (
          <div>
            <h1>Groups</h1>
            {
              groups.map((group, index) => {
                return (
                  <Table celled padded fixed striped key={index}>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell colSpan='3'><Icon name='users' /> {group.group_name}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {
                        group.people.map((person, index) => {
                          return (
                            <Table.Row key={index}>
                              <Table.Cell>{person.first_name}</Table.Cell>
                              <Table.Cell>{person.last_name}</Table.Cell>
                              <Table.Cell>{person.email_address}</Table.Cell>
                            </Table.Row>
                          );
                        })
                      }
                    </Table.Body>
                  </Table>
                );
              })
            }
          </div>
        );
    }

}

export default ResultsListGroups
