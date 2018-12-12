import React, { Component } from 'react';
import { Modal, View, StyleSheet, Text, Image} from 'react-native';
import {Button, Icon} from 'native-base'
import {ImagePicker, Permissions, Location } from 'expo'
import t from 'tcomb-form-native'; // 0.6.9
import moment from 'moment';
import { Paikanna } from '../api/Paikanna';
const Form = t.form.Form;

const formatDate = (date) => moment(date).format("DD.MM.YYYY")
const formatTime = (time) =>  moment(time).format("HH:mm")
const db = require('./DatabaseComponent')
const _ = require('lodash');

const Meals = {
  '1': 'Wings 10kpl X-hot',
  '2': 'Party platter'
}



let Restaurants = {
}

const kaupungit = { // En ehdi tehdä tätä oikein
  "Helsinki" : 1,
  "Tampere": 2,
  "Espoo": 3,
  "Vantaa": 4

}

const Kaynti = t.struct({
  date: t.Date,
  arrive_time: t.Date,
  food_arrive_time: t.Date,
  meal: t.enums(Meals),
  restaurant: t.enums(Restaurants),
  other_info: t.String
});

// Ylikirjoitetaan tcomb-formin asetukset
t.form.Form.stylesheet.controlLabel.normal.fontSize = 15;
t.form.Form.stylesheet.dateValue.normal.fontSize = 14;
t.form.Form.stylesheet.formGroup.normal.marginBottom = 5;
t.form.Form.stylesheet.dateValue.normal.marginBottom = 3;
t.form.Form.stylesheet.controlLabel.normal.marginBottom = 5;
t.form.Form.stylesheet.textbox.normal.marginBottom = 3;

const options = {
    fields: {
        date: {
          label: 'PVM', // Näytössä näkyvä teksti
          mode: 'date',
          config: {
            dialogMode: 'calendar',
            defaultValueText: 'Valitse päivämäärä..', // Valintakentässä näkyvä placeholder-teksti
            format: (date) => formatDate(date),
          },
        },
        arrive_time: {
          label: 'Ruuan tilauskellonaika..',
          mode: 'time',
          factory: t.form.Radio,
          config: {
            dialogMode: 'calendar',
            defaultValueText: 'Valitse ruuan tilauskellonaika..',
            format: (time) => formatTime(time),
          },
        },
        food_arrive_time: {
          label: 'Ruuan saapumisaika',
          mode: 'time',
          config: {
            dialogMode: 'calendar',
            defaultValueText: 'Valitse ruuan saapumisaika..',
            format: (time) => formatTime(time),
          }
        },
        meal: {
          label: 'Ateria',
        },
        restaurant: {
          label: 'Valitse ravintola',
          },
        other_info: {
          label: 'Muuta',
          }
        },
  }

class ModalExample extends Component {
  constructor(props) {
  super(props)

  this.state = {
    modalVisible: false,
  }
}

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {


    return (
      <View>
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setModalVisible(!this.state.modalVisible)
            }}>
            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#00000080'}}>

              {/*Jos käyttäjä lisää kuvan, venytetään boxia isommaksi*/}
              <View style={(!this.props.photo ? {backgroundColor: '#fff', padding: 20,
                width: 310,
                height: 175} : {backgroundColor: '#fff', padding: 20,
                width: 310,
                height: 350})}>

                <Text>Ota kuva tai valitse kirjastosta</Text>
                {this.props.photo &&  (
                  <Image source={{ uri: this.props.photo }} style={styles.image} />
                )}
              <View style={styles.buttonContainer}>
              <Button small light rounded style={styles.littleButton} onPress={this.props.takePhoto}>
              <Text style={{marginLeft: "25%",  color:"white"}}>Ota kuva</Text>
            </Button>
            <Button small light rounded style={styles.littleButton} onPress={this.props.getPhoto}>
            <Text style={{marginLeft: "15%",  color:"white"}}>Valitse kuva</Text>
            </Button>
            </View>
            <Button rounded block style={{backgroundColor: "#ff5f00"}}  onPress={() => {this.setModalVisible(false)}}>
            <Text style={{color:"white"}}>Hyväksy</Text>
            </Button>
              </View>
            </View>
          </Modal>
        </View>
        <Button style={styles.wideButton}
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <Text style={{marginLeft: "35%", color:"white"}}>Lisää kuva</Text>
          {this.state.photo && <Icon name='checkmark-circle' iconStyle={{color: "white"}} />} 
          </Button>
      </View>
    );
  }
}

export default class AddComponent extends Component {
      constructor(props) {
      super(props)
    this.state = {
        value: {
            date: null,
            arrive_time: null,
            food_arrive_time: null,
            meal: '',
            restaurant: '',
            other_info: ''
        },
        loading: true,
        error: false,
        modalVisible: false,
        photo: null,
        isMounted: false
    }
    this.populateRestaurants = this.populateRestaurants.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getLocation = this.getLocation.bind(this)
  }

handleSubmit() {
    if (!this.state.value.date) {
      alert("Päivämäärä puuttuu.")
      return
    }
    if (!this.state.value.arrive_time) {
      alert("Saapumisaika puuttuu.")
      return
    }
    if (!this.state.value.food_arrive_time) {
      alert("Ruuan saapumisaika puuttuu.")
      return
    }
    if (!this.state.value.meal) {
      alert("Valitse ateria.")
      return
    }
    if (!this.state.value.restaurant) {
      alert("Valitse ravintola.")
      return
    }
    console.log(moment(this.state.value.food_arrive_time).diff(moment(this.state.value.arrive_time), 'hours', true) < 0
    )
    console.log(moment(this.state.value.food_arrive_time).diff(moment(this.state.value.arrive_time), 'hours', true) > 0
    )
    if (moment(this.state.value.food_arrive_time).diff(moment(this.state.value.arrive_time), 'hours', true) < 0) {
      alert("Ruuan saapumisaika ei voi olla ennen tilausaikaa.")
      return
    }
    db.addVisit(
          this.state.value.date,
          this.state.value.arrive_time,
          this.state.value.food_arrive_time,
          Meals[this.state.value.meal],
          this.state.value.other_info,         
          this.state.photo,
          this.state.value.restaurant
      )
    this.success()
}

async success() {
    alert("Käynti lisätty!")
    this.setState({        value: {
      date: null,
      arrive_time: null,
      food_arrive_time: null,
      meal: '',
      restaurant: '',
      other_info: ''
  },})
}

 async populateRestaurants(_, results) { // Täytetään ylhäällä oleva restaurants-dicti tietokannasta haetuilla ravintoloilla
    if (results.rows._array === undefined || results.rows._array.length == 0) {
      return
    }
    results.rows._array.forEach((item) => (Restaurants[item.restaurantid] = item.fullname))
  }

async componentWillMount() {
   await db.getRestaurants(this.populateRestaurants)
   await Paikanna(this.getLocation)
   this.setState({
    loading: false
})
 }

takePhoto = async () => {
  let {status} = await Permissions.askAsync(Permissions.CAMERA)
  if (status == 'granted') { // Tehdään asioita vaan, jos käyttäjä hyväksyy pyynnön
      let result = await ImagePicker.launchCameraAsync({
        base64: true,
    })
    if (!result.cancelled) {
      this.setState({ photo: result.uri, modalVisible: false  })
    }
  }
}

getPhoto = async () => {
  let {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
  if (status == 'granted') { // Tehdään asioita vaan, jos käyttäjä hyväksyy pyynnön
      let result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
      })

      if (!result.cancelled) {
        this.setState({ photo: result.uri, modalVisible: false })

      }
  }
}

getLocation = async (lat, lon, status) => {
  if (status === 200) {
    let location = { latitude: lat, longitude: lon }
    let geocode = await Location.reverseGeocodeAsync(location)
    this.setState({         value: {
                                restaurant: kaupungit[geocode[0].city],
                              },
                  })
  }
}

  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />
    }
    return (
      <View style={styles.container}>
        <Form type={Kaynti} options={options} ref={(f) => this.form = f} onChange={(value) => this.setState({value})} value={this.state.value} />
        {/** (this.state.arrive_time && this.state.food_arrive_time) && <this.state.duration /> **/}
        <ModalExample getPhoto={this.getPhoto} takePhoto={this.takePhoto} photo={this.state.photo}/>
        <Button style={styles.wideButton} onPress={() => this.handleSubmit()} ><Text adjustsFontSizeToFit={true} style={{marginLeft: "35%", color:"white"}}>Lisää käynti</Text></Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    position: "relative"
  },
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
    position: "relative"
  },
  image: {
    flex: 1,
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 10,
  },
  littleButton: {
    height: 45,
    width: 140,
    marginRight: 10,
    marginTop: 10,
    backgroundColor: "#ff5f00",
    position: "relative"
  },
  wideButton: {
    width: "100%",
    margin: 4,
    backgroundColor: "#ff5f00",
    position: "relative"
  },
});
