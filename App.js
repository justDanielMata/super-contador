/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import {NavigationContainer} from '@react-navigation/native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {createStackNavigator} from '@react-navigation/stack';
import store, {
  createGame,
  createPlayer as reduxCreatePlayer,
  deletePlayer,
  editPayer,
  addScore,
  substractScore,
} from './redux/redux';

const Stack = createStackNavigator();

const closeRow = (rowMap, rowKey) => {
  if (rowMap[rowKey]) {
    rowMap[rowKey].closeRow();
  }
};
const deleteRow = (player, rowMap, dispatch) => {
  closeRow(rowMap, player.id);
  dispatch(deletePlayer(player));
};

const PlayerList = ({navigation}) => {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.players);
  return players.length ? (
    <SwipeListView
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={(data, rowMap) => (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,
            backgroundColor: 'white',
          }}
          underlayColor={'#AAA'}>
          <Text>{data.item.name}</Text>
        </View>
      )}
      renderHiddenItem={(data, rowMap) => (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 15,
          }}>
          <Pressable
            onPress={() => {
              closeRow(rowMap, data.item.id);
              navigation.navigate('EditPlayer', {player: data.item});
            }}>
            <Text>Edit</Text>
          </Pressable>

          <Pressable
            style={[
              {
                alignItems: 'center',
                bottom: 0,
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 75,
              },
            ]}
            onPress={() => deleteRow(data.item, rowMap, dispatch)}>
            <Text>Delete</Text>
          </Pressable>
        </View>
      )}
      leftOpenValue={75}
      rightOpenValue={-75}
      previewRowKey={'0'}
      previewOpenValue={-40}
      previewOpenDelay={3000}
    />
  ) : null;
};

const EditPlayer = ({route, navigation}) => {
  const {player} = route.params;
  const dispatch = useDispatch();
  const [name, setName] = useState(player.name);
  return (
    <View>
      <TextInput value={name} onChangeText={(t) => setName(t)} />
      <Pressable
        onPress={() => {
          dispatch(editPayer({...player, name}));
          navigation.goBack();
        }}>
        <Text>Save</Text>
      </Pressable>
    </View>
  );
};

const ScoreScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const [number, setNumber] = useState('0');
  const {player} = route.params;
  return (
    <View>
      <TextInput
        value={number}
        keyboardType="number-pad"
        onChangeText={(t) => setNumber(t)}
      />
      <Pressable
        onPress={() => {
          dispatch(addScore({playerId: player.id, number: Number(number)}));
          navigation.goBack();
        }}>
        <Text>Add</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(
            substractScore({playerId: player.id, number: Number(number)}),
          );
          navigation.goBack();
        }}>
        <Text>Subscribe</Text>
      </Pressable>
    </View>
  );
};

const PlayerItem = ({player, navigation}) => {
  const score = useSelector((state) => getScore(player.id, state));
  const history = useSelector((state) => getHistory(player.id, state));
  const [showHistory, setShowHistory] = useState(false);
  return (
    <View>
      <Text>{player.name}</Text>
      <Text>{score}</Text>
      <Pressable onPress={() => setShowHistory(!showHistory)}>
        <Text>View History</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Score', {player})}>
        <Text>Score</Text>
      </Pressable>
      {showHistory && history.map((h) => <Text>{h}</Text>)}
    </View>
  );
};
const GameScreen = ({navigation}) => {
  const game = useSelector((state) => state.game);
  return (
    <View>
      {Object.values(game).map((p) => (
        <PlayerItem player={p} navigation={navigation} />
      ))}
    </View>
  );
};

const Home = ({navigation}) => {
  const [name, setName] = useState('');
  const players = useSelector((state) => state.players);
  const dispatch = useDispatch();
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <PlayerList navigation={navigation} />

      <View>
        <TextInput
          value={name}
          styles={{backgroundColor: 'white', width: '100%'}}
          onChangeText={(t) => setName(t)}
        />
        <Pressable
          onPress={() => {
            const player = createPlayer(name);
            setName('');
            dispatch(reduxCreatePlayer(player));
          }}>
          <Text>Add</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => {
          dispatch(createGame(players));
          navigation.navigate('Game');
        }}>
        <Text>Create Game</Text>
      </Pressable>
    </View>
  );
};

const App: () => React$Node = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator>
          <Stack.Screen name={'Home'} component={Home} />
          <Stack.Screen name={'EditPlayer'} component={EditPlayer} />
          <Stack.Screen name={'Score'} component={ScoreScreen} />
          <Stack.Screen name={'Game'} component={GameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

// utils

function createPlayer(name) {
  return {
    id: uuidv4(),
    name,
    score: 0,
    history: [],
  };
}

function getScore(playerId, state) {
  const player = state.game[playerId];
  return player.history.length
    ? player.history.reduce((prev, curr) => prev + curr, 0)
    : 0;
}

function getHistory(playerId, state) {
  const player = state.game[playerId];
  return player.history;
}
