import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_CONTEXT,
  REACT_PROVIDER,
} from "./stants";
import { createTextElement, shallowEqual } from "./util";
import Component from "./component";
import {
  useState,
  useReducer,
  useMemo,
  useCallback,
  userEffect,
  userLayoutEffect,
  useRef,
} from "./react-dom";

function createElement(type, config, children) {
  let key, ref;
  let props = { ...config };
  if (config) {
    key = config.key;
    ref = config.ref;
    delete config.key;
    delete config.ref;
  }
  if (arguments.length > 3) {
    // console.log('children', arguments);
    props.children = Array.prototype.slice.call(arguments, 2).map((child) => {
      return createTextElement(child);
    });
  } else if (arguments.length === 3) {
    props.children = createTextElement(children);
  }
  // react   元素
  return {
    $$typeof: REACT_ELEMENT,
    key,
    ref,
    type,
    props,
  };
}

function createRef() {
  // 获取真实DOM
  return {
    current: null,
  };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

function createContext(defaultValue) {
  let context = {
    $$typeof: REACT_CONTEXT,
    _currentValue: defaultValue,
  };
  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context,
  };
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context,
  };
  return context;
}

// 克隆旧元素
function cloneElement(element, config, children) {
  let props = { ...element.props, ...config };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map((child) => {
      return createTextElement(child);
    });
  } else if (arguments.length === 3) {
    props.children = createTextElement(children);
  }
  return {
    ...element,
    props,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }
}

class Fragment extends Component {
  render() {
    return this.props.children;
  }
}

function useImperativeHandle(ref, factory) {
  ref.current = factory();
}

function useContext(context) {
  return context._currentValue;
}

const react = {
  createElement,
  Component,
  PureComponent,
  Fragment,
  createRef,
  forwardRef,
  createContext,
  cloneElement,
  useState,
  useReducer,
  useMemo,
  useCallback,
  userEffect,
  userLayoutEffect,
  useRef,
  useImperativeHandle,
  useContext
};

export default react;
