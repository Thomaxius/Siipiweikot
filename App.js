import * as React from 'react';
import { Constants } from 'expo';
import NaviSide from './navigation/NaviSide';
import { Font, AppLoading } from 'expo';
const db = require('./pages/DatabaseComponent')

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  async componentWillMount() {
    db.initialDb()
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      'Ionicons': require('native-base/Fonts/Ionicons.ttf'),
      'MaterialIcons': require('native-base/Fonts/MaterialIcons.ttf'),
    })
    this.setState({ loading: false }); // Fontit ja iconit pitää ladata ennenkun appi renderöidään
  }
  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return <NaviSide />;
  } 
}
