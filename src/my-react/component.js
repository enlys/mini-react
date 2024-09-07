import { twoVnode, findDom } from './react-dom';


export const updateQueue = {
  isBatchData: false, // 标识是否批量更新
  updates: [],  // 批量更新队列
  batchUpdate() {
    // 批量更新
    updateQueue.updates.forEach(update => {
      update.updateComponent();
    });
    updateQueue.updates.length = 0;
    updateQueue.isBatchData = false;
  },
};

class Component {

  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    this.update = new Update(this);
  }
  setState(partialState) {
    // 异步： 事件绑定函数 React自身内部方法
    // 同步： 其余全是同步
    // 更新器
    this.update.addState(partialState);
  }
  forceUpdate() {
    let newVnode = this.render();
    let oldVnode = this.oldRenderVnode;
    let oldDom = findDom(oldVnode);
    // context静态属性
    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }
    // console.log('forceUpdate', this);
    // 更新组件视图
    twoVnode(oldDom.parentNode, oldVnode, newVnode);
    this.oldRenderVnode = newVnode;
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }
}

class Update {
  constructor(classInstance) {
    this.classInstance = classInstance; // 父组件实例
    this.paddingState = [];
  }
  addState(partialState) {
    this.paddingState.push(partialState);
    this.emitUpdate();
  }
  // 触发更新
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    console.log('nextProps', nextProps, updateQueue.isBatchData);
    if (updateQueue.isBatchData) {
      // 批量更新
      updateQueue.updates.push(this);
      return;
    }
    this.updateComponent();
  }
  updateComponent() {
    // 获取数据 => 更新组件
    if (this.nextProps || this.paddingState.length > 0) { // 内部数据源改变  props改变
      shouldUpdate(this.classInstance, this.getState(), this.nextProps);
    }
  }
  getState() { // 获取最新·数据
    let { paddingState, classInstance } = this;
    let { state } = classInstance;
    paddingState.forEach(partialState => {
      state = Object.assign({}, state, partialState);
    });
    // 每次获取完数据清空
    paddingState.length = 0;
    return state;
  }
}

// 获取最新数据，根据最新数据生产新vnode,根据新vnode生成新dom
function shouldUpdate(classInstance, partialState, nextProps) {
  // 添加生命周期事件
  let willUpdate = true;
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, partialState)) {
    willUpdate = false;
  }
  // 更新状态
  classInstance.state = partialState;

  if (nextProps) {
    classInstance.props = nextProps;
  }
  console.log('shouldUpdate', classInstance);
  if (willUpdate) {
    // 更新组件
    classInstance.forceUpdate();
  }
  
}

export default Component;