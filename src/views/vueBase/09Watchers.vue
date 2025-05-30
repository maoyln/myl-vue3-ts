<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/essentials/watchers.html" target="_blank"
        >监听器
      </a>
    </h1>

    <div>
      <h2>基本演示</h2>

      <p>
        Ask a yes/no question:
        <input v-model="question" :disabled="loading" />
      </p>
      <p>{{ answer }}</p>
    </div>

    <hr>

    <div>
      <h2>侦听数据源类型(侦听多个数据)</h2>
      <div>x:
        <input type="text" v-model.number="x">

      </div>
      <div>y:
        <input type="text" v-model.number="y">
      </div>
    </div>

    <hr>
    <div>
      <h2>深层侦听器</h2>
      <p>obj.Count: {{ obj.count }}</p>
      <p>Count: {{ obj }}</p>
      <button @click="handleObj">Increment</button>
    </div>

    <hr>

    <div>
      <h2>即时回调的侦听器{ immediate: true }</h2>
      <h2>只执行一次  { once: true }</h2>
      <div>

      </div>
    </div>

    <hr>
    <div>
      <h2>watch vs. watchEffect</h2>
      <!-- watch(source, callback, {
        flush: 'sync'
      })
      
      watchEffect(callback, {
        flush: 'sync'
      }) -->
      <h2>watchSyncEffect</h2>
      <!-- watchSyncEffect(() => {
        /* 在响应式数据变化时同步执行 */
      }) -->

      <h2>停止监听</h2>
      <!-- const unwatch = watchEffect(() => {})

      // ...当该侦听器不再需要时
      unwatch() -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'

const question = ref('')
const answer = ref('Questions usually contain a question mark. ;-)')
const loading = ref(false)

// 可以直接侦听一个 ref
watch(question, async (newQuestion, oldQuestion) => {
  console.log(oldQuestion, 'oldQuestion');
  if (newQuestion.includes('?')) {
    loading.value = true
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    } finally {
      loading.value = false
    }
  }
})

const x = ref(0)
const y = ref(0)

// 单个 ref
watch(x, (newX) => {
  console.log(`x is ${newX}`)
})

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 多个来源组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})


const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {

  console.log(newValue, 'newValue');
  console.log(oldValue, 'oldValue');
  // 在嵌套的属性变更时触发
  // 注意：`newValue` 此处和 `oldValue` 是相等的
  // 因为它们是同一个对象！
})

// 下面代码没用
watch(() => obj, (newValue, oldValue) => {
console.log(newValue, 'newValue--1');
console.log(oldValue, 'oldValue--1');
// 在嵌套的属性变更时触发
// 注意：`newValue` 此处和 `oldValue` 是相等的
// 因为它们是同一个对象！
})

// 监听多个数据
watch([() => obj.count], (newValue, oldValue) => {
console.log(newValue, 'newValue--1');
console.log(oldValue, 'oldValue--1');
// 在嵌套的属性变更时触发
// 注意：`newValue` 此处和 `oldValue` 是相等的
// 因为它们是同一个对象！
})

// 监听耽搁数据
watch(() => obj.count, (newValue, oldValue) => {
console.log(newValue, 'newValue--2');
console.log(oldValue, 'oldValue--2');
// 在嵌套的属性变更时触发
// 注意：`newValue` 此处和 `oldValue` 是相等的
// 因为它们是同一个对象！
})

const handleObj = () => {
  obj.count++
}

// { immediate: true } 我们可以通过传入 immediate: true 选项来强制侦听器的回调立即执行：
watch(
  obj,
  (newValue, oldValue) => {
    // 立即执行，且当 `source` 改变时再次执行
    console.log(newValue, 'newValue---immediate');
    console.log(oldValue, 'oldValue---immediate');
  },
  { immediate: true }
)

watch(
  obj,
  (newValue, oldValue) => {
    // 立即执行，且当 `source` 改变时再次执行
    console.log(newValue, 'newValue---once');
    console.log(oldValue, 'oldValue---once');
  },
  { once: true }
)

</script>