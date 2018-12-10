import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {
  Container,
  Content,
  List,
  ListItem,
  Body,
  Text,
  Button,
  Icon
} from 'native-base';
import { ListView } from 'react-native';
import moment from 'moment';

const db = require('./DatabaseComponent')

const formatDate = (date) => moment(date).format("ddd DD.MM.YYYY")
const formatTime = (time) => moment(time).format("HH:mm")

let Restaurants = {
}


class DisplayComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kaynnit: [],
      loading: true,
      basic: true
    }
    this.populateRestaurants = this.populateRestaurants.bind(this)
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
  }

  async populateRestaurants(_, results) { // Täytetään ylhäällä oleva restaurants-dicti tietokannasta haetuilla ravintoloilla
    if (results.rows._array === undefined || results.rows._array.length == 0) {
      return
    }
    results.rows._array.forEach((item) => (Restaurants[item.restaurantid] = item.fullname))
  }

async componentWillMount() {
   await db.getRestaurants(this.populateRestaurants)
    await db.getVisits(this.querySuccess)
  }

  querySuccess = async (_, results) => {
    if (this.state.loading) {
      this.setState({ kaynnit: results.rows._array});
    }
    this.setState({
      loading: false
     })
  }

  async deleteRow(data) {
    await db.deleteVisit(data.visitid)
    let kaynnitCopy = [...this.state.kaynnit]
    let index = kaynnitCopy.indexOf(data)
    kaynnitCopy.splice(index, 1)
    this.setState({kaynnit: kaynnitCopy} )
  }

  renderItem = kaynti => {
    console.log(this.state.kaynnit)
    return (
      <ListItem 
        onPress={(data) => console.log(Object.values(data))
        }>
        <Body>
          <Text note style={styles.centeredBold}>{formatDate(kaynti.date)}</Text>
          <Text></Text>
          <Text note>Aika: {formatTime(kaynti.arrive_time)}-{formatTime(kaynti.food_arrive_time)}</Text>
          <Text note>Kesto: {moment(kaynti.food_arrive_time).diff(moment(kaynti.arrive_time), 'hours', true).toFixed(2)}h</Text>
          <Text note>Ateria: {kaynti.meal}</Text>
          <Text note>Ravintola: {Restaurants[kaynti.restaurantid]}</Text>
          {kaynti.other_info && <Text note>Muuta: {kaynti.other_info}</Text>}
        </Body>
      </ListItem>
    )
  }

  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }

    if (this.state.kaynnit.length === 0) {
      return (
        <Container style={styles.container}>
          <Content>
            <Text style={styles.centeredBold}>Ei listattavia käyntejä.</Text>
          </Content>
        </Container>
      );
    }
    return (
      
      <Container style={styles.container}>
        <Content>
          <List dataSource={this.ds.cloneWithRows(this.state.kaynnit)} renderRightHiddenRow={data => <Button danger full onPress={() => this.deleteRow(data)}><Icon active name="trash" /></Button>} leftOpenValue={75} rightOpenValue={-75} dataArray={this.state.kaynnit} renderRow={this.renderItem} />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,
    backgroundColor: 'white',
  },
  bold: {
    fontWeight: "bold"
  },
  centeredBold: {
    fontWeight: "bold",
    textAlign: 'center',
  }
});

export default DisplayComponent;
