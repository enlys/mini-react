import { updateQueue } from "./component";

// 合成事件
export default function addEvent(dom, eventType, eventHandler) {
  let store = dom.eventStore || (dom.eventStore = {});
  store[eventType] = eventHandler;
  if (store[eventType]) {
    document[eventType] = dispatchEvent;
  }
}

function dispatchEvent(event) {
  let { target, type } = event;
  let eventType = `on${type}`;
  let store = target.eventStore;
  let handler = store && store[eventType];
  // 合并事件对象
  let SyntheticBaseEvent = createBaseEvent(event);
  updateQueue.isBatchData = true;
  handler && handler(SyntheticBaseEvent);
  updateQueue.isBatchData = false;
  updateQueue.batchUpdate();

}

function createBaseEvent(event) {
  // 合并事件对象
  let syntheticEvent = {};
  for (const key in event) {
    syntheticEvent[key] = event[key];
  }
  syntheticEvent.nativeEvent = event;
  syntheticEvent.preventDefault = preventDefault(event);
  return syntheticEvent;
}

// 处理默认事件
function preventDefault(event) {
  return function () {
    if (!event) { // 兼容ie
      window.event.returnValue = false;
    }
    if (event.preventDefault) { // 兼容标准浏览器
      event.preventDefault();
    }
  }
}