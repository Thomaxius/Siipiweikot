import React from 'react';
import { Icon, Button } from 'native-base';
import AddComponent from '../pages/AddComponent';
import DisplayComponent from '../pages/DisplayComponent';
import StatisticsComponent from '../pages/StatisticsComponent';
import { createDrawerNavigator } from 'react-navigation';
const NaviSide = createDrawerNavigator(
  {
    AddPage: {
      screen: AddComponent,
      navigationOptions: {
        drawerLabel: 'Lisää käynti ',
        drawerIcon: () => <Icon name="home" />,
      },
    },
    DisplayPage: {
      screen: DisplayComponent,
      navigationOptions: {
        drawerLabel: 'Näytä käynnit ',
        drawerIcon: () => <Icon name="list" />,
      },
    },
    StatisticsPage: {
      screen: StatisticsComponent,
      navigationOptions: {
        drawerLabel: 'Tilastot',
        drawerIcon: () => <Icon name="add" />,
      },
    },
  },
  {
    contentOptions: {
      labelStyle: {
        fontFamily: 'Arial',
      },
      activeTintColor: 'black',
      activeBackgroundColor: 'white',
      inactiveTintColor: 'gray',
      inactiveBackgroundColor: 'white',
    },
  },

);

export default NaviSide;
