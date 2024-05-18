import * as React from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function formatThaiDate(date) {
  const d = new Date(date);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

function HomeScreen({ navigation }) {
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    getData();
  }, []);

  function formatDate(date) {
    const weekendOffset = isWeekend(date);
    const d = new Date(date);
    d.setDate(d.getDate() - weekendOffset);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 6 ? 1 : day === 0 ? 2 : 0;
  };

  function getData(currencyId, startDate, endDate) {
    const start_period = startDate || formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
    const end_period = endDate || formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
    const apiKey = 'e51c6e12-6614-4409-b044-84edcc1c8813';

    axios
      .get('https://apigw1.bot.or.th/bot/public/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/', {
        params: {
          start_period: start_period,
          end_period: end_period,
          currency: currencyId || '',
        },
        headers: {
          'X-IBM-Client-Id': apiKey,
        },
      })
      .then((response) => {
        if (response.data.result.data.data_detail) {
          let data = response.data.result.data.data_detail;
          if (currencyId) {
            setListSevenDay(data);
          } else {
            setList(data);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  return (
    <FlatList
      style={styles.root}
      data={list}
      ItemSeparatorComponent={() => {
        return <View style={styles.separator} />;
      }}
      keyExtractor={(item) => item.currency_id}
      renderItem={({ item }) => {
        const iconName = `currency-${item.currency_id.toLowerCase()}`;

        return (
          <TouchableOpacity
            style={styles.card}
            onLongPress={() => navigation.navigate('Details', { data: { item } })}
          >
            <View style={styles.cardContent}>
              <Icon name={iconName} size={40} style={styles.icon} />
              <View style={styles.details}>
                <View style={styles.row}>
                  <Text style={styles.label}>วันที่:</Text>
                  <Text style={styles.value}>{formatThaiDate(item.period)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>สกุลเงิน:</Text>
                  <Text style={styles.value}>{item.currency_name_th}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>อัตราแลกเปลี่ยน:</Text>
                  <Text style={styles.valueCurrency}>{item.mid_rate} บาท</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>ซื้อตั๋วเงิน:</Text>
                  <Text style={styles.valueCurrency}>{item.buying_sight} บาท</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>ซื้อเงินโอน:</Text>
                  <Text style={styles.valueCurrency}>{item.buying_transfer} บาท</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>อัตราขาย:</Text>
                  <Text style={styles.valueCurrency}>{item.selling} บาท</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

function DetailsScreen({ route, navigation }) {
  const { data } = route.params || {};
  const [listSevenDay, setListSevenDay] = React.useState([]);

  React.useEffect(() => {
    if (data?.item?.currency_id) {
      const start_period = formatDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));
      const end_period = formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
      getData(data.item.currency_id, start_period, end_period);
    } else {
      setListSevenDay([]);
    }
  }, [data?.item?.currency_id]);

  function formatDate(date) {
    const weekendOffset = isWeekend(date);
    const d = new Date(date);
    d.setDate(d.getDate() - weekendOffset);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 6 ? 2 : day === 0 ? 3 : 0;
  };

  function getData(currencyId, startDate, endDate) {
    const start_period = startDate || formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
    const end_period = endDate || formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
    const apiKey = 'e51c6e12-6614-4409-b044-84edcc1c8813';

    axios
      .get('https://apigw1.bot.or.th/bot/public/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE/', {
        params: {
          start_period: start_period,
          end_period: end_period,
          currency: currencyId,
        },
        headers: {
          'X-IBM-Client-Id': apiKey,
        },
      })
      .then((response) => {
        if (response.data.result.data.data_detail) {
          setListSevenDay(response.data.result.data.data_detail);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.root}
        data={listSevenDay}
        ItemSeparatorComponent={() => {
          return <View style={styles.separator} />;
        }}
        keyExtractor={(item, i) => `${item.currency_id}-${i}`}
        renderItem={({ item }) => {
          const iconName = `currency-${item.currency_id.toLowerCase()}`;

          return (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Icon name={iconName} size={40} style={styles.icon} />
                <View style={styles.details}>
                  <View style={styles.row}>
                    <Text style={styles.label}>วันที่:</Text>
                    <Text style={styles.value}>{formatThaiDate(item.period)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>สกุลเงิน:</Text>
                    <Text style={styles.value}>{item.currency_name_th}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>อัตราแลกเปลี่ยน:</Text>
                    <Text style={styles.valueCurrency}>{item.mid_rate} บาท</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>ซื้อตั๋วเงิน:</Text>
                    <Text style={styles.valueCurrency}>{item.buying_sight} บาท</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>ซื้อเงินโอน:</Text>
                    <Text style={styles.valueCurrency}>{item.buying_transfer} บาท</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>อัตราขาย:</Text>
                    <Text style={styles.valueCurrency}>{item.selling} บาท</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function ExitScreen({ navigation }) {
  React.useEffect(() => {
    const backAction = () => {
      Alert.alert('ออกจากแอพ', 'คุณต้องการออกจากแอพใช่หรือไม่?', [
        {
          text: 'ยกเลิก',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'ตกลง', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.exitText}>กำลังปิดแอพ...</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <MaterialIcons name="menu" size={28} color="#fff" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
          headerLeft: () => null,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#3b5998',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        screenOptions={{ headerShown: false, drawerPosition: 'right' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        screenOptions={{ headerShown: false, drawerPosition: 'right', gestureEnabled: false }}
      >
        <Drawer.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />
        <Drawer.Screen
          name="Exit"
          component={ExitScreen}
          options={{
            title: 'Exit',
            headerRight: () => null,
            headerLeft: () => null,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#f5f5f5',
  },
  separator: {
    height: 1,
    backgroundColor: '#eaeaea',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 16,
    color: '#3b5998',
  },
  details: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  valueCurrency: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  period: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    color: '#FF4500',
  },
  currency_name_eng: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  midRate: {
    color: '#007AFF',
  },
  buyingSight: {
    color: '#34C759',
  },
  buyingTransfer: {
    color: '#FF9500',
  },
  selling: {
    color: '#FF3B30',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  exitText: {
    fontSize: 18,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b5998',
    padding: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});
