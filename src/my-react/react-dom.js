import { REACT_TEXT, REACT_FORWARD_REF, MOVE, PLACEMENT, REACT_PROVIDER, REACT_CONTEXT } from "./stants";
import addEvent from './event';

// hooks
let hooksState = []; // 保存数据
let hooksIndex = 0;  // hooks的索引
let schellUpdate; // 更新函数



function render(element, container) {
  mount(element, container);
  // 更新
  schellUpdate = () => {
    hooksIndex = 0;
    twoVnode(container, element, element);
  }
}

export function useState(initialState) {
  // 赋值
  hooksState[hooksIndex] = hooksState[hooksIndex] || initialState;
  let currentIndex = hooksIndex;
  function setState(newState) {
    hooksState[currentIndex] = newState;
    // 实现更新
    schellUpdate();
  }
  return [hooksState[hooksIndex++], setState];
}

export function userEffect(callBack, deps) {
  let currentIndex = hooksIndex;
  if (hooksState[hooksIndex]) {
    let [destroy, lastDeps] = hooksState[hooksIndex];
    let areDepsEqual = deps ? deps.every((item, index) => item === lastDeps[index]) : false;
    if (areDepsEqual) {
      hooksIndex++;
    } else {
      destroy && destroy();
      setTimeout(() => {
        hooksState[currentIndex] = [callBack(), deps];
      }, 0);
      hooksIndex++;
    }
  } else {
    // 页面渲染完毕,挂载完毕执行
    setTimeout(() => {
      hooksState[currentIndex] = [callBack(), deps];
    }, 0);
    hooksIndex++;
  }
}

export function userLayoutEffect(callBack, deps) {
  let currentIndex = hooksIndex;
  if (hooksState[hooksIndex]) {
    let [destroy, lastDeps] = hooksState[hooksIndex];
    let areDepsEqual = deps ? deps.every((item, index) => item === lastDeps[index]) : false;
    if (areDepsEqual) {
      hooksIndex++;
    } else {
      destroy && destroy();
      queueMicrotask(() => {
        hooksState[currentIndex] = [callBack(), deps];
      });
      hooksIndex++;
    }
  } else {
    // 开启微任务
    queueMicrotask(() => {
      hooksState[currentIndex] = [callBack(), deps];
    });
    hooksIndex++;
  }
}

export function useRef(initialState) {
  hooksState[hooksIndex] = hooksState[hooksIndex] || { current: initialState };
  return hooksState[hooksIndex++];
}

export function useReducer(reducer, initialState) {
  hooksState[hooksIndex] = hooksState[hooksIndex] || initialState;
  let currentIndex = hooksIndex;
  function dispatch(action) {
    let newState = reducer(hooksState[currentIndex], action);
    hooksState[currentIndex] = newState;
    schellUpdate();
  }
  return [hooksState[currentIndex], dispatch];
}


export function useMemo(factory, deps) {
  if (hooksState[hooksIndex]) {
    let [memo, oldDeps] = hooksState[hooksIndex];
    let areDepsEqual = deps ? deps.every((item, index) => item === oldDeps[index]) : false;
    if (areDepsEqual) {
      hooksIndex++;
      return memo;
    } else {
      let newMemo = factory();
      hooksState[hooksIndex++] = [newMemo,deps];
    }
  } else {
    let newMemo = factory();
    hooksState[hooksIndex++] = [newMemo, deps];
    return newMemo; 
  }
}

export function useCallback(callback, deps) {
  if (hooksState[hooksIndex]) {
    let [oldCallback, oldDeps] = hooksState[hooksIndex];
    let areDepsEqual = deps ? deps.every((item, index) => item === oldDeps[index]) : false;
    if (areDepsEqual) {
      hooksIndex++;
      return oldCallback;
    } else {
      hooksState[hooksIndex++] = [callback,deps];
    }
  } else {
    hooksState[hooksIndex++] = [callback, deps];
    return callback; 
  }
}

function mount(element, container) {
  // vdom => 真实dom
  // if (!element) return;
  let newDom = createDom(element);
  // 挂载到容器中
  if (newDom) container.appendChild(newDom);
  if (newDom && newDom.componentDidMount) {
    newDom.componentDidMount();
  }
}

function createDom(element) {
  if (typeof element == 'string' || typeof element == 'number' || element == null) {
    element = {
      content: element,
      type: REACT_TEXT,
      $$typeof: REACT_TEXT
    };
  }
  // 创建真实dom
  let { type, props, ref } = element;
  let dom;
  
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForWardRef(element);
  }
  if (type && type.$$typeof === REACT_PROVIDER) {
    return mountProviderComponent(element);
  }
  if (type && type.$$typeof === REACT_CONTEXT) {
    return mountContextComponent(element);
  }
  if (type === REACT_TEXT) {
    dom = document.createTextNode(element.content);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) { // 类组件
      return mountClassComponent(element);
    }
    // 函数组件
    dom = mountFunctionComponent(element, dom);
  } else {
    dom = document.createElement(element.type);
  }
  // 添加属性
  if (props) {
    // 首次挂载
    updateDomProperties(dom, {}, props);
    // 递归创建子节点
    if (props.children) {
      changeChildren(props.children, dom, props);
    }
  }

  
  element.dom = dom; // 保存真实dom 
  if (ref) {
    ref.current = dom;
  }
  return dom;
}

function mountProviderComponent(vnode) {
  let { type, props } = vnode;
  let context = type._context;
  context._currentValue = props.value;
  let renderVnode = props.children;
  if (!renderVnode) return null;
  vnode.oldRenderVnode = renderVnode;
  return createDom(renderVnode);
}

function mountContextComponent(vnode) {
  let { type, props } = vnode;
  let context = type._context;
  let value = context._currentValue;
  let renderElement = props.children(value);
  if (!renderElement) return null;
  return createDom(renderElement);
}

function mountForWardRef(element) {
  let { type, props, ref } = element;
  let renderElement = type.render(props, ref);
  if (!renderElement) return null;
  return createDom(renderElement);
}

function mountClassComponent(element) {
  let { type, props, ref } = element;
  let componentInstance = new type(props);
  // 处理context
  if (type.contextType) {
    // 给实例添加值
    componentInstance.context = type.contextType._currentValue;
  }
  element.classInstance = componentInstance;
  if (ref) {
    ref.current = componentInstance;
  }
  // 组件将要挂载
  if (componentInstance.componentWillMount) {
    componentInstance.componentWillMount();
  }
  let renderElement = componentInstance.render();
  element.oldRenderVnode = componentInstance.oldRenderVnode = renderElement;
  if (!renderElement) return null;
  const dom = createDom(renderElement);
  // 组件挂载完
  if (componentInstance.componentDidMount) {
    dom.componentDidMount = componentInstance.componentDidMount;
  }
  return dom;
}

function mountFunctionComponent(vdom) {
  let { type, props } = vdom;
  let renderElement = type(props); // 获取函数的返回值
  vdom.oldRenderVnode = renderElement;
  return createDom(renderElement);
}

function changeChildren(children, dom, props) {
  if (typeof children == 'string' || typeof children == 'number') {
    children = {
      content: children,
      type: REACT_TEXT,
      $$typeof: REACT_TEXT
    };
    mount(children, dom);
  } else if (typeof children == 'object' && children.type) {
    // diff
    props.children.mountIndex = 0;
    mount(children, dom);
  } else if(Array.isArray(children)){
    children.forEach((child, index) => {
      // diff
      child.mountIndex = index;
      mount(child, dom);
    });
  }
}

function updateDomProperties(dom, prevProps, nextProps) {
  for (let key in nextProps) {
    // 添加属性
    if (key === "children") {
      continue;
    } else if (key === "style") {
      let styleObject = nextProps[key];
      for (let styleName in styleObject) {
        dom.style[styleName] = styleObject[styleName];
      }
    } else if (key.startsWith("on")) {
      // dom[key.toLowerCase()] = nextProps[key];
      addEvent(dom, key.toLowerCase(), nextProps[key]);
    } else {
      // 添加属性
      dom[key] = nextProps[key];
    }
  }
  for (let key in prevProps) {
    // 删除属性
    if (!nextProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}
// 实现更新
export function twoVnode(parentDom, oldVnode, newVnode, nextDOM) {
  
  //暴力法
  // let newDom = createDom(newVnode);
  // let oldDom = findDom(oldVnode);
  // parentDom.replaceChild(newDom, oldDom);
  // return;
  console.log('111', parentDom, oldVnode, newVnode, nextDOM);
  // 更新
  if (!oldVnode && !newVnode) {
    return;
  } else if (oldVnode && !newVnode) { // 旧的有新的没有  直接删除
    unMountVnode(oldVnode);
  } else if (!oldVnode && newVnode) { // 旧的没有新的有  直接创建
    mountVnode(parentDom, newVnode, nextDOM);
    // let newDom = findDom(newVnode);
    // // 位置
    // if (nextDOM) {
    //   parentDom.insertBefore(newDom, nextDOM);
    // } else {
    //   parentDom.appendChild(newDom);
    // }
    // // 生命周期
    // // if (newVnode.classInstance && newVnode.classInstance.componentDidMount) {
    // //   newVnode.classInstance.componentDidMount();
    // // }
    // if (newDom.componentDidMount) {
    //   newDom.componentDidMount();
    // }
  } else if (oldVnode && newVnode && oldVnode.type !== newVnode.type) { // 类型不同
    // 删除旧的
    unMountVnode(oldVnode);
    // // 创建新的
    // let newDom = findDom(newVnode);
    // // 位置
    // if (nextDOM) {
    //   parentDom.insertBefore(newDom, nextDOM);
    // } else {
    //   parentDom.appendChild(newDom);
    // }
    mountVnode(parentDom, newVnode, nextDOM);
  } else { // 类型相同更新元素
    updateElement(oldVnode, newVnode);
  }
}

// 更新元素
function updateElement(oldVnode, newVnode) {
  // 文本 节点 函数组件  不同类型不复用
  if (oldVnode.type.$$typeof === REACT_PROVIDER && newVnode.type.$$typeof === REACT_PROVIDER) {
    updateProviderComponent(oldVnode, newVnode);
  } else if (oldVnode.type.$$typeof === REACT_CONTEXT && newVnode.type.$$typeof === REACT_CONTEXT) {
    updateContextComponent(oldVnode, newVnode);
  } else if (oldVnode.type === REACT_TEXT && newVnode.type === REACT_TEXT) {
    let currentDOM = newVnode.dom = findDom(oldVnode);
    if (oldVnode.content !== newVnode.content) {
      currentDOM.textContent = newVnode.content;
    }
  } else if (typeof oldVnode.type === 'string') { // 原生标签
    let currentDOM = newVnode.dom = findDom(oldVnode);
    // 更新属性
    updateDomProperties(currentDOM, oldVnode.props, newVnode.props);
    // 处理子节点
    // if (oldVnode.props.children && newVnode.props.children) {
      
    // }
    updateChildren(currentDOM, oldVnode.props.children, newVnode.props.children);
  } else if (typeof oldVnode.type === 'function') { // 函数、类组件
    if (oldVnode.type.isReactComponent) { // 类组件
      // newVnode.classInstance = oldVnode.classInstance;
      updateClassComponent(oldVnode, newVnode);
    } else {
      updateFunctionComponent(oldVnode, newVnode);
    }
  }
}

function updateProviderComponent(oldVnode, newVnode){
  let oldDom = findDom(oldVnode);
  let parentDom  = oldDom.parentNode;
  let { type, props } = newVnode;
  let context = type._context;
  context._currentValue = props.value; // 改变context值
  let renderVnode = props.children;
  twoVnode(parentDom, oldVnode.oldRenderVnode, renderVnode, oldDom.nextSibling);
  newVnode.oldRenderVnode = renderVnode;
}

function updateContextComponent(oldVnode, newVnode){
  let oldDom = findDom(oldVnode);
  let parentDom  = oldDom.parentNode;
  let { type, props } = newVnode;
  let context = type._context;
  let renderVnode = props.children(context._currentValue);
  twoVnode(parentDom, oldVnode.oldRenderVnode, renderVnode, oldDom.nextSibling);
  newVnode.oldRenderVnode = renderVnode;
}

// 更新类组件
function updateClassComponent(oldVnode, newVnode) {
  let classInstance = newVnode.classInstance = oldVnode.classInstance;
  // 更新
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVnode.props);
  }
  // if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(newVnode.props, classInstance.state)) {
  //   return;
  // }
  // 更新 -> component.js - Update
  // classInstance.props = newVnode.props;
  // 组件将要更新
  console.log('updateClassComponent', oldVnode, newVnode);
  classInstance.update.emitUpdate(newVnode.props);
}

// 更新函数组件
function updateFunctionComponent(oldVnode, newVnode) {
  let parentDom = findDom(oldVnode).parentNode;
  let nextDOM = findDom(oldVnode).nextSibling;
  let { type, props } = newVnode;
  let renderVnode = type(props);
  twoVnode(parentDom, oldVnode.oldRenderVnode, renderVnode, nextDOM);
  oldVnode.oldRenderVnode = renderVnode;
}

// 更新子元素
function updateChildren(parentDom, oldChildren, newChildren) {

  oldChildren = Array.isArray(oldChildren) ? oldChildren : [oldChildren];
  newChildren = Array.isArray(newChildren) ? newChildren : [newChildren]; 
  oldChildren = oldChildren.filter(item => item);
  newChildren = newChildren.filter(item => item);
  // 遍历
  // let maxLength = Math.max(oldChildren.length, newChildren.length);
  // for (let i = 0; i < maxLength; i++) { // 遍历
  //   let oldChild = oldChildren[i];
  //   let newChild = newChildren[i];
  //   // 注意位置
  //   let nextDOM = oldChildren.find((item, index) => index > i && item && findDom(item));
  //   twoVnode(parentDom, oldChild, newChild, nextDOM && findDom(nextDOM));
  // }
  // react diff
  // 1.同级节点进行比较
  // 2.不是同类型的节点，直接删除重建
  // 3.相同类型的节点，比较props，更新props
  // 实现
  // Map key映射表   lastPlaceIndex  老元素中一遍历最大的位置
  let keyedOldMap = {};
  console.log('updateChildren', oldChildren, newChildren);
  for (let i = 0; i < oldChildren.length; i++) {
    let oldChild = oldChildren[i];
    let key = oldChild.key || i;
    keyedOldMap[key] = oldChild;
  }
  let lastPlaceIndex = 0; // 位移标志
  let patch = [];  // 需处理的数据

  newChildren.forEach((newChild, i) => {
    newChild.mountIndex = i; // 给新的添加索引
    let key = newChild.key || i;
    let oldChild = keyedOldMap[key];
    if (oldChild) {
      // 更新属性
      updateElement(oldChild, newChild);
      // 是否移动
      if (oldChild.mountIndex < lastPlaceIndex) { // 移动
        patch.push({
          type: MOVE,
          oldVnode: oldChild,
          newVnode: newChild,
          mountIndex: i,
        });
      }
      delete keyedOldMap[key];
      lastPlaceIndex = Math.max(lastPlaceIndex, oldChild.mountIndex);
    } else { // 插入
      patch.push({
        type: PLACEMENT,
        newVnode: newChild,
        mountIndex: i,
      });
    }
  });
  // 删除旧元素中需要位置移动的或不需要的节点
  let moveChildren = patch.filter((item) => item.type === MOVE).map(v => v.oldVnode);
  Object.values(keyedOldMap).concat(moveChildren).forEach(oldChildren => {
    let oldDom = findDom(oldChildren);
    parentDom.removeChild(oldDom);
  });
  // 处理需要移动或新增的节点
  patch.forEach(item => {
    let { type, oldVnode, newVnode, mountIndex } = item;
    let childNodes = parentDom.childNodes;
    if (type === PLACEMENT) {
      let newDOM = createDom(newVnode);
      let childNode = childNodes[mountIndex];
      if (childNode) {
        parentDom.insertBefore(newDOM, childNode);
      } else {
        parentDom.appendChild(newDOM);
      }
    } else if (type === MOVE) {
      let oldDom = findDom(oldVnode);
      let childNode = childNodes[mountIndex];
      if (childNode) {
        parentDom.insertBefore(oldDom, childNode);
      } else {
        parentDom.appendChild(oldDom);
      }
    }
  })
}

// 添加新的
function mountVnode(parentDom, vnode, nextDOM) {
  let newDom = createDom(vnode);
  // 位置
  if (nextDOM) {
    parentDom.insertBefore(newDom, nextDOM);
  } else {
    parentDom.appendChild(newDom);
  }
  // 生命周期
  if (newDom.componentDidMount) {
    newDom.componentDidMount();
  }
}

// 删除节点
function unMountVnode(vnode) {
  let { props, ref } = vnode;
  let dom = findDom(vnode);
  if (vnode.classInstance && vnode.classInstance.componentWillUnmount) {
    vnode.classInstance.componentWillUnmount();
  }
  if (ref) {
    ref.current = null;
  }
  if (props.children) {
    let children = Array.isArray(props.children) ? props.children : [props.children];
    children.forEach((child) => {
      unMountVnode(child);
    });
  }
  // 删除元素
  if (dom) {
    dom.parentNode.removeChild(dom);
  }
}

// 获取真实DOM
export function findDom(vnode) {
  if (!vnode) return null;
  if (vnode.dom) {
    return vnode.dom;
  } else {
    return findDom(vnode.oldRenderVnode);
  }
}

const ReactDOM = {
  render,
  createPortal: render,
};

export default ReactDOM;
