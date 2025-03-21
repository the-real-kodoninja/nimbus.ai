import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LanguageModelUI from './components/LanguageModelUI';
import HistoryLog from './pages/HistoryLog';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={LanguageModelUI} />
        <Route path="/history" component={HistoryLog} />
      </Switch>
    </Router>
  );
};

export default App;