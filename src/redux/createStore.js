function createStore(reducer, initialState = {}) {
  let state = initialState;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = listener => {
    listeners.push(listener);
    // 取消订阅
    return () => listeners = listeners.filter(l => l !== listener);
  };

  return { getState, dispatch, subscribe };
}

export default createStore;