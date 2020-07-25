import React from "react";
import ReactDOM from "react-dom";
import { Container, Header, Tab } from "semantic-ui-react";

import ResultsList from "./ResultsList";
import ResultsListGroups from "./ResultsListGroups";
import PersonUpload from "./PersonUpload";
import GroupUpload from "./GroupUpload";

const App = ({ children }) => (
  <Container style={{ margin: 20 }}>
    <Header as="h3"><span role="img" aria-label="logo">⛵️</span> Breeze Church Management </Header>

    {children}
  </Container>
);

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

const panes = [
  {
    menuItem: { key: 'people', icon: 'user', content: 'People' },
    render: () => <Tab.Pane attached={false}>
      <PersonUpload />
      <ResultsList />
    </Tab.Pane>,
  },
  {
    menuItem: { key: 'groups', icon: 'users', content: 'Groups' },
    render: () => <Tab.Pane attached={false}>
      <GroupUpload />
      <ResultsListGroups />
    </Tab.Pane>,
  },
]

ReactDOM.render(
  <App>
    <Tab menu={{ secondary: true }} panes={panes} />
  </App>,
  document.getElementById("root")
);
