function bindActionCreators(actionCreators, dispatch) {
  let bindAction = {};
  for (let key in actionCreators) {
    bindAction[key] = bundActionCreators(actionCreators[key], dispatch);
  }

  function bundActionCreators(creators, dispatch) {
    return function(...args) {
      return dispatch(creators(...args));
    }
  }

  return bindAction;
}

export default bindActionCreators;