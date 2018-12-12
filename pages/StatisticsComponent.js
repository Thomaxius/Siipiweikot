import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import {
  Container,
  Content,
  Text
} from 'native-base';
import { ListView } from 'react-native';
import moment from 'moment';

const db = require('./DatabaseComponent')

const formatDate = (date) => moment(date).format("ddd DD.MM.YYYY")
const formatTime = (time) => moment(time).format("HH:mm")
const highestOccurence = (arr) => arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop() // Palauttaa listassa eniten esiintyvän muuttujan


let Restaurants = { //Tämä haetaan tietokannasta ja päivitetään alla
}

class DisplayComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kaynnit: [],
      loading: true,
      basic: true,
      mostPopularMeal:"",
      mostPopularRestaurant:"",
      totaltimewaited:"",
      averagetimewaited:""
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

  countTotals = async (arr) => {
    let allmeals = []
    let allrestaurantsVisited = []
    let totaltimeWaited = 0
    arr.forEach((kaynti) => {
        allmeals.push(kaynti.meal)
        allrestaurantsVisited.push(kaynti.restaurantid)
        totaltimeWaited += (moment(kaynti.food_arrive_time).diff(moment(kaynti.arrive_time), 'minutes', true))
    })
    this.setState({
        mostPopularMeal:highestOccurence(allmeals),
        mostPopularRestaurant:Restaurants[highestOccurence(allrestaurantsVisited)],
        totaltimewaited:totaltimeWaited.toFixed(2),
        averagetimewaited:(totaltimeWaited / arr.length).toFixed(2)
      })

  }

  querySuccess = async (_, results) => {
    if (this.state.loading) {
      this.setState({ kaynnit: results.rows._array})
    await this.countTotals(results.rows._array)
    this.setState({
      loading: false
         })
       }
  }



  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }

    if (this.state.kaynnit.length === 0) {
      return (
        <Container style={styles.container}>
          <Content>
            <Text style={styles.centeredBold}>Ei käyntejä, ei tilastoja.</Text>
          </Content>
        </Container>
      )
    }

    return (
          <Container style={styles.container}>
            <Content>
              <Text>Suosituin ateria: {this.state.mostPopularMeal}</Text>
              <Text>Suosituin ravintola: {this.state.mostPopularRestaurant}</Text>
              <Text>Ruuan odotusaika yhteensä: {this.state.totaltimewaited} minuuttia</Text>
              <Text>Keskiverto odotusaika: {this.state.averagetimewaited} minuuttia</Text>
            </Content>
          </Container>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 23,
    backgroundColor: 'white',
  },
  bold: {
    fontWeight: "bold"
  },
  centeredBold: {
    fontWeight: "bold",
    textAlign: 'center',
  },
  image: {
    flex: 1,
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default DisplayComponent;
