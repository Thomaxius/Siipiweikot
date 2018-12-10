import React from 'react';
import { Icon } from 'native-base';
import AddComponent from '../pages/AddComponent';
import DisplayComponent from '../pages/DisplayComponent';
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
        drawerIcon: () => <Icon name="home" />,
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
  }
);

export default NaviSide;
