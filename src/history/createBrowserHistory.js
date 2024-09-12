function createBrowserHistory() {
  let globalHistory = window.history;
  let listens = [];
  let state = {};
  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    globalHistory.goBack();
  }

  function goForward() {
    globalHistory.forward();
  }

  function push(pathname, nextState) {
    const action = 'PUSH';
    if (typeof pathname === 'object') {
      state = pathname.state;
      pathname = pathname.pathname;
    } else {
      state = nextState;
    }
    globalHistory.pushState(state, null, pathname);
    notify({
      action,
      location: {
        pathname,
        state
      }
    });
  }

  function listen(listener) {
    listens.push(listener);
    return () => {
      listens = listens.filter(item => item !== listener);
    } 
  }
  function notify(newState) {
    Object.assign(history, newState);
    history.length = globalHistory.length;
    listens.forEach(listener => listener({
      location: history.location,
      action: history.action
    }));
  }

  window.onpopstate = () => {
    notify({
      action: 'POP',
      location: {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        state: window.location.state,
      }
    })
  }
  let history = {
    action: 'POP',
    go,
    goBack,
    goForward,
    push,
    listen,
    location: {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: window.location.state,
    }
  };
  return history;
}

export default createBrowserHistory;