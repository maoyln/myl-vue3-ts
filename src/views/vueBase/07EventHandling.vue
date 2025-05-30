<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/event-handling.html"
        target="_blank"
        >事件处理
      </a>
    </h1>

    <hr>
    <div>
      <h2>监听事件</h2>
      <div>我们可以使用 v-on 指令 (简写为 @) 来监听 DOM 事件，并在事件触发时执行对应的 JavaScript。用法：v-on:click="handler" 或 @click="handler"。</div>
      <br>
      <div>
        事件处理器 (handler) 的值可以是：
        <ul>
          <li>内联事件处理器：事件被触发时执行的内联 JavaScript 语句 (与 onclick 类似)。</li>
          <li>方法事件处理器：一个指向组件上定义的方法的属性名或是路径。</li>
        </ul>
      </div>
    </div>

    <hr>

    <div>
      <h2>內联事件处理器</h2>
      <div>内联事件处理器通常用于简单场景，例如：</div>
      <button @click="count++">Add 1</button>
      <span>Count is: {{ count }}</span>
    </div>

    <hr>

    <div>
      <h2>方法事件处理器</h2>
      <div>随着事件处理器的逻辑变得愈发复杂，内联代码方式变得不够灵活。因此 v-on 也可以接受一个方法名或对某个方法的调用。</div>
      <!-- `greet` 是上面定义过的方法名 -->
      <button @click="greet">Greet</button>
    </div>
    <hr>

    <div>
      <h2>在内联处理器中调用方法</h2>
      <button @click="say('hello')">Say hello</button>
      <button @click="say('bye')">Say bye</button>
    </div>
    <hr>

    <div>
      <h2>在内联事件处理器中访问事件参数</h2>
      <!-- 使用特殊的 $event 变量 -->
      <button @click="warn('表格还不能提交.', $event)">
        Submit
      </button>

      <!-- 使用内联箭头函数 -->
      <button @click="(event) => warn('表格还不能提交.', event)">
        Submit
      </button>
    </div>
    <hr>

    <div>
      <h2>事件修饰符</h2>

      <ul>
        <li>.stop: 阻止事件冒泡</li>
        <li>.prevent: 阻止默认行为</li>
        <li>.once: 事件只触发一次</li>
        <li>.native: 监听原生 DOM 事件</li>
        <li>.self: 只当事件发生在当前元素上时触发</li>
        <li>.capture: 事件使用事件捕获模式</li>
        <li>.passive: 事件的默认行为被浏览器取消</li>
      </ul>

      <!-- 单击事件将停止传递 -->
      <button @click.stop="doClickModifier">stop</button>

      <!-- 提交事件将不再重新加载页面 -->
      <form @submit.prevent="doClickModifier">prevent</form>

      <!-- 修饰语可以使用链式书写 -->
      <button @click.stop.prevent="doClickModifier">prevent-stop阻止</button>

      <!-- 也可以只有修饰符 -->
      <form @submit.prevent>prevent</form>

      <!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
      <!-- 例如：事件处理器不来自子元素 -->
      <div @click.self="doClickModifier">self</div>

      <!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
      <!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
      <div @click.capture="doClickModifier">capture</div>

      <!-- 点击事件最多被触发一次 -->
      <button @click.once="doClickModifier">once</button>

      <!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
      <!-- 以防其中包含 `event.preventDefault()` -->
      <div @scroll.passive="doClickModifier">passive</div>
    </div>
    <hr>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)

const name = ref('Vue.js')

function greet(event: any) {
  console.log(`Hello ${name.value}!`)
  // `event` 是 DOM 原生事件
  if (event) {
    console.log(event);
    console.log(event.target.tagName)
  }
}

function say(message: string) {
  console.log(message)
}

function warn(message: string, event: Event) {
  // 这里可以访问原生事件
  console.log(message);
  console.log(event);
  if (event) {
    event.preventDefault()
  }
  console.log(message)
}

/**
 * 事件处理器 modifier
 * @param {Event} event - 事件对象
 */
function doClickModifier(event: any) {
  console.log(event)
  console.log('doClickModifier')
}

</script>