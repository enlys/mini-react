// import React from 'React';
// import ReactDOM from 'React-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
// import React from 'react';
import React from './my-react/react';
import reactDOM from './my-react/react-dom';

// let element = React.createElement(
//   'div',
//   {
//     id: 'hello',
//     className: 'world',
//     style: {
//       fontSize: '30px',
//       color: 'red'
//     }
//   },
//   'Hello World', 11, React.createElement('span', null, 'Hello World')
// );

function functionComponent() {
  return React.createElement('div', null, 'function component');
}

function FTextInput(props) {
  console.log('FTextInput',props);
  return (
    <div>
      { props.name }
      <input></input>
    </div>
  );
}

let FTextInput2 = React.forwardRef(FTextInput);

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }
  getFocus() {
    this.input.current.focus();
  }
  render() {
    return (
      <div>
        { this.props.name }
        <input ref={this.input}></input>
      </div>
    );
  }
}

// 组件数据来源 props state
class ClassComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      age: 12,
      list: ['a','b', 'c','d', 'e','f']
    };
    this.result = React.createRef(); // { current:真实DOM }
    this.a = React.createRef();
    this.b = React.createRef();
    // setTimeout(() => {
    //   this.setState({
    //     age: this.state.age + 1
    //   });
    // }, 1500);
  }

  handleClick = () => {
    console.log('handleClick'); 
    // updateQueue.isBatchData = true;
    this.setState({
      age: this.state.age + 1
    });
    this.setState({
      age: this.state.age + 1
    });
    // updateQueue.isBatchData = false;
    // updateQueue.batchUpdate();
  }
  sum = () => {
    // console.log(this.a.current.value, this.b.current.value);
    // this.result.current.value = Number(this.a.current.value) + Number(this.b.current.value);
    console.log('sum');
    this.setState({
      age: this.state.age + 1,
      list: ['a','d', 'g', 'e','f', 'b', 'c']
    });
  }
  focus = () => {
    this.a.current.getFocus();
  }
  focusB = () => {
    this.b.current.focus();
  }
  render() {
    // return React.createElement('div', null, [
    //   React.createElement('div', null,  this.state.age),
    //   React.createElement('div', null, this.props.name),
    //   React.createElement('button', { onClick: this.handleClick }, 'click')
    // ]);
    // return (
    //   <div>
    //     <div>{ this.state.age }class111 component { this.props.name }</div>
    //     <button onClick={ this.handleClick } >click</button>
    //   </div>
    // );
    return ( 
      <div>
        {/* <input ref={this.a}></input> */}
        {/* <TextInput  ref={this.a} ></TextInput>
        + */}
        {/* <FTextInput2 ref={this.b} name={this.state.age}></FTextInput2> */}
        {/* <button onClick={ this.sum } >sum</button>
        <button onClick={ this.focus } >focus</button>
        <button onClick={ this.focusB } >focus</button>
        <input ref={this.result}></input> */}
        <TextInput  name={this.state.age} ></TextInput>
        <button onClick={ this.sum } >sum</button>
        <ul>
        {
          this.state.list.map((item, index) => <li key={index}>{item}</li>)
        }
        </ul>
      </div>
    );
  }
}



// const element2 = React.createElement(functionComponent);

const element3 = React.createElement(ClassComponent, { name: 'class component' });

console.log('class', element3);

reactDOM.render(element3, document.getElementById('root'));

// context 使用
// 使用 a = React.createContext(defaultValue)
// <a.Provider value={value}>
// </a.Provider>
// 取值
// 1. static contextType = a;
// 2. this.context
// <a.Consumer>
// </a.Consumer>