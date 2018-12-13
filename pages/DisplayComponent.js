import React, { Component } from 'react'
import { Modal, StyleSheet, View, Image } from 'react-native'
import {
  Container,
  Content,
  List,
  ListItem,
  Body,
  Text,
  Button,
  Icon
} from 'native-base'
import { ListView } from 'react-native'
import moment from 'moment'

const db = require('./DatabaseComponent')

const formatDate = (date) => moment(date).format("ddd DD.MM.YYYY")
const formatTime = (time) => moment(time).format("HH:mm")

let Restaurants = {
}

class ModalExample extends Component {
  state = {
    modalVisible: false,
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    return (
      <View style={{marginTop: 22}}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible)
          }}>
          <View style={{marginTop: 22}}>
          <View style={(!this.props.photo ? {backgroundColor: '#fff', padding: 20,
          width: 310,
          height: 175} : {backgroundColor: '#fff', padding: 20,
          width: 310,
          height: 350})}>
            <Body>
            <Text note style={styles.centeredBold}>{formatDate(this.props.kaynti.date)}</Text>
            <Text></Text>
            <Text note>Aika: {formatTime(this.props.kaynti.arrive_time)}-{formatTime(this.props.kaynti.food_arrive_time)}</Text>
            <Text note>Kesto: {moment(this.props.kaynti.food_arrive_time).diff(moment(this.props.kaynti.arrive_time), 'hours', true).toFixed(2)}h</Text>
            <Text note>Ateria: {this.props.kaynti.meal}</Text>
            <Text note>Ravintola: {Restaurants[this.props.kaynti.restaurantid]}</Text>
            {!!this.props.kaynti.other_info && <Text note>Muuta: {this.props.kaynti.other_info}</Text>}
            {!!this.props.kaynti.photo && <Image source={{ uri: this.props.kaynti.photo }} style={styles.image}   />}
            {!!this.props.kaynti.photo && <Text>Tässä pitäis näkyä kuva.</Text>}
          </Body>
            </View>
          </View>
        </Modal>
        <ListItem
        onPress={() => this.setState({modalVisible:true})}>
        <Body>
          <Text note style={styles.centeredBold}>{formatDate(this.props.kaynti.date)}</Text>
          <Text></Text>
          <Text note>Aika: {formatTime(this.props.kaynti.arrive_time)}-{formatTime(this.props.kaynti.food_arrive_time)}</Text>
          <Text note>Kesto: {moment(this.props.kaynti.food_arrive_time).diff(moment(this.props.kaynti.arrive_time), 'hours', true).toFixed(2)}h</Text>
          <Text note>Ateria: {this.props.kaynti.meal}</Text>
          <Text note>Ravintola: {Restaurants[this.props.kaynti.restaurantid]}</Text>
          {!!this.props.kaynti.other_info && <Text note>Muuta: {this.props.kaynti.other_info}</Text>}
        </Body>
      </ListItem>
      </View>
    );
  }
}


class DisplayComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kaynnit: [],
      loading: true,
      basic: true,
      modalVisible: false,
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
      this.setState({ kaynnit: results.rows._array.sort(function(a, b){
        return new Date(a.date) - new Date(b.date)})}) // Järjestetään rivit päivämäärän mukaan
    }
    this.setState({
      loading: false
     })
  }

  async deleteRow(data) {
    await db.deleteVisit(data.visitid)
    await db.getVisits(this.querySuccess)
    this.setState({loading: true})
  }

  renderItem = kaynti => {
    return (
      <ModalExample kaynti={kaynti} />
    )
  }

  render() {
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
          <List dataSource={this.ds.cloneWithRows(this.state.kaynnit)} renderRightHiddenRow={data => <Button danger full onPress={() => this.deleteRow(data)}><Icon active name="trash"/></Button>} rightOpenValue={-75} dataArray={this.state.kaynnit} renderRow={this.renderItem} />
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
