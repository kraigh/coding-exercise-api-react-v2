import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

class ResultsListGroups extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
    }

    componentDidMount() {
        let filledGroups = [];
        fetch("http://localhost:8000/api/groups")
          .then(response => response.json())
          .then(async (groups) => {
            for await (let group of groups.data) {
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
                  <div>
                  <h2 key={index}>{group.group_name}</h2>
                    {
                      group.people.map((person, index) => {
                        return (
                          <p key={index}>{person.first_name}</p>
                        );
                      })
                    }
                  </div>
                );
              })
            }
          </div>
        );
    }

}

export default ResultsListGroups
