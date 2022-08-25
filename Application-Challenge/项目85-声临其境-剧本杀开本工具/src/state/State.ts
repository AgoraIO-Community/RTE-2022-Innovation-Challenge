import React from "react";
export default function useMethods<T extends Record<string, (...args: any[]) => any>>(methods: T) {
    const { current } = React.useRef({
      methods,
      func: undefined as T | undefined,
    });
    current.methods = methods;
  
    // 只初始化一次
    if (!current.func) {
      const func = Object.create(null);
      Object.keys(methods).forEach((key) => {
        // 包裹 function 转发调用最新的 methods
        func[key] = (...args: unknown[]) => current.methods[key].call(current.methods, ...args);
      });
      // 返回给使用方的变量
      current.func = func;
    }
  
    return current.func as T;
  }