import React from 'react';
import { Router, useNavigator, useLocation } from '../react-router/index' 
import { createBrowserHistory } from '../history'
export  * from '../react-router/index' 
// 提供路由的实现
function BrowserRouter({children}) {
  let historyRef =  React.useRef();
  if(!historyRef.current) {
    historyRef.current = createBrowserHistory()
  }
  let history = historyRef.current;
  // 获取最新的路由地址
  let [state, setState] = React.useState({
    action: history.action,  // 路由动作
    location: history.location // 路由地址
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
  return <Router 
  children={children} 
  location={state.location} 
  navigator={history} 
  navigatorType={state.action}
  />
}

function HashRouter() {

}

export function Link({ to, ...rest }) {

  let navigator = useNavigator();
  function handleClick(e) {
    
    e.preventDefault();
    navigator(to);
  }
  return (
    <a href={to} {...rest} onClick={handleClick}></a>
  );
}

export function NavLink({
  className: classNameProp = '',
  style: styleProp = {},
  end = false,
  to,
  children,
  ...rest
}) {
  let location = useLocation();
  let pathname = location.pathname;
  let isActive = pathname === to;
  let className;
  if (typeof classNameProp === 'function') {
    className = classNameProp({ isActive });  
  } else {
    className = classNameProp;
  }

  let style = typeof styleProp === 'function' ? styleProp({ isActive }) : styleProp;
  return (
    <Link to={to} className={className} style={style} {...rest}></Link>
  );
}

export function Navigate({ to }) {
  // 实际就是跳转到新的地址
  let navigator = useNavigator();
  React.useEffect(() => navigator(to), [navigator, to]);
  return null;
}

export {
  BrowserRouter,
  HashRouter,
}