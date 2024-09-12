import React from "react";

const NavigationContext = React.createContext(null); // history
const LocationContext = React.createContext(null); // 当前路由
const RouterContext = React.createContext(null); // 路由

export function Router({ children, navigator, location }) {
  return (
    <NavigationContext.Provider value={{navigator}}>
      <LocationContext.Provider children={children} value={{location}}>
      </LocationContext.Provider>
    </NavigationContext.Provider>
  );
}

// 路由表
export function Routes(_ref4) {
  const { children } = _ref4;
  const routes = createRoutesFromChildren(children);
  const element = useRoutes(routes);
  console.log('路由对应组件:', element);
  return element;
}


export function useLocation() {
  return React.useContext(LocationContext).location;
}
function compilePath(path) {
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "") // Ignore trailing / and /*, we'll handle it below
  .replace(/^\/*/, "/") // Make sure it has a leading /
  .replace(/[\\.*+^${}|()[\]]/g, "\\$&") // Escape special regex chars
  .replace(/\/:([\w-]+)(\?)?/g, (_, paramName, isOptional) => {
    params.push({
      paramName,
      isOptional: isOptional != null
    });
    return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
  });;
  regexpSource += "$";
  let matcher = new RegExp(regexpSource);
  return [matcher, params];
}
function matchPath(path, pathname) {
  let [matcher, compiledParams] = compilePath(path) // 正则
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce((memo, _ref, index) => {
    let {
      paramName,
      isOptional
    } = _ref;
    // We need to compute the pathnameBase here using the raw splat value
    // instead of using params["*"] later because it will be decoded then
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo[paramName] = undefined;
    } else {
      memo[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
  };
}

function useRoutes(routes) {
  const location = useLocation();
  let pathname = location.pathname || '/';
  for (let i = 0; i < routes.length; i++) {
    let route = routes[i];
    let match = matchPath(route.path, pathname);
    if (match) {
      // 将路由参数返回到路由组件中
      return React.cloneElement(route.element, { ...route.element.props, match });
    }
  }
}

function createRoutesFromChildren(children) {
  let routes = [];
  React.Children.forEach(children, (element, index) => {
    let route = {
      element: element.props.element,
      path: element.props.path,
    };
    routes.push(route);
  });
  return routes;
}

export function Route(_props) {
  console.log('route', _props);
}


export function useNavigator() {
  let navigator = React.useContext(NavigationContext).navigator;
  let navigter = React.useCallback((to) => {
    navigator.push(to);
  }, [navigator]);
  return navigter;
}