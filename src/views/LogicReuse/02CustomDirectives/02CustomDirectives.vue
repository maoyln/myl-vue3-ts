<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/reusability/custom-directives.html"
        target="_blank"
        >自定义指令</a
      >
    </h1>
    <div>
      <div>
        <h2>介绍</h2>
        <div>
          任何以 v 开头的驼峰式命名的变量都可以当作自定义指令使用。在上述例子中，vHighlight 可以在模板中以 v-highlight 的形式使用。
        </div>
        <div>
          <Child01 />
        </div>
      </div>

      <hr>

      <div>
        <h2>自定义指令的使用时机</h2>
        <div>只有当所需功能只能通过直接的 DOM 操作来实现时，才应该使用自定义指令。</div>
        <div>
          <Child02 />
        </div>
      </div>

      <hr>

      <div>
        <h2>指令钩子</h2>

        <div>
          const myDirective = {
            // 在绑定元素的 attribute 前
            // 或事件监听器应用前调用
            created(el, binding, vnode) {
              // 下面会介绍各个参数的细节
            },
            // 在元素被插入到 DOM 前调用
            beforeMount(el, binding, vnode) {},
            // 在绑定元素的父组件
            // 及他自己的所有子节点都挂载完成后调用
            mounted(el, binding, vnode) {},
            // 绑定元素的父组件更新前调用
            beforeUpdate(el, binding, vnode, prevVnode) {},
            // 在绑定元素的父组件
            // 及他自己的所有子节点都更新后调用
            updated(el, binding, vnode, prevVnode) {},
            // 绑定元素的父组件卸载前调用
            beforeUnmount(el, binding, vnode) {},
            // 绑定元素的父组件卸载后调用
            unmounted(el, binding, vnode) {}
          }
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import Child01 from './components/Child01.vue';
  import Child02 from './components/Child02.vue';
  

  // 下面是【指令钩子】，（放在这里仅仅是为了方便阅读）
  const myDirective = {
      // 在绑定元素的 attribute 前
      // 或事件监听器应用前调用
      created(el, binding, vnode) {
        // 下面会介绍各个参数的细节
      },
      // 在元素被插入到 DOM 前调用
      beforeMount(el, binding, vnode) {},
      // 在绑定元素的父组件
      // 及他自己的所有子节点都挂载完成后调用
      mounted(el, binding, vnode) {},
      // 绑定元素的父组件更新前调用
      beforeUpdate(el, binding, vnode, prevVnode) {},
      // 在绑定元素的父组件
      // 及他自己的所有子节点都更新后调用
      updated(el, binding, vnode, prevVnode) {},
      // 绑定元素的父组件卸载前调用
      beforeUnmount(el, binding, vnode) {},
      // 绑定元素的父组件卸载后调用
      unmounted(el, binding, vnode) {}
    }
  
  </script>