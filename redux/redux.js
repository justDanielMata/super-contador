import {configureStore, createSlice, combineReducers} from '@reduxjs/toolkit';

const playersSlice = createSlice({
  name: 'players',
  initialState: [],
  reducers: {
    createPlayer(state, action) {
      state.push(action.payload);
    },
    deletePlayer(state, {payload}) {
      return state.filter((p) => p.id !== payload.id);
    },
    editPayer(state, {payload}) {
      const newPlayerList = state.filter((p) => p.id !== payload.id);
      return newPlayerList.concat(payload);
    },
  },
});

const gameSlice = createSlice({
  name: 'game',
  initialState: {},
  reducers: {
    createGame(state, {payload}) {
      const game = payload.reduce((prev, curr) => {
        return {...prev, [curr.id]: curr};
      }, {});
      return game;
    },
    addScore(state, {payload}) {
      const {playerId, number} = payload;
      state[playerId].history.push(number);
    },
    substractScore(state, {payload}) {
      const {playerId, number} = payload;
      state[playerId].history.push(-number);
    },
  },
});

export const {createGame, addScore, substractScore} = gameSlice.actions;
export const {createPlayer, editPayer, deletePlayer} = playersSlice.actions;

const reducer = combineReducers({
  game: gameSlice.reducer,
  players: playersSlice.reducer,
});
const store = configureStore({
  reducer,
});

export default store;
