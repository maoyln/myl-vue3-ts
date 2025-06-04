<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/components/props.html" target="_blank"
        >Props
      </a>
    </h1>

    <div>
      <h2>触发与监听事件</h2>
      <MyComponent01 msg="这是参数" @some-event="callback" />
      <MyComponent01 msg="组件的事件监听器也支持 .once 修饰符-once只能点击一次" @some-event.once="callback" />
    </div>

    <div>
      <h2>事件参数</h2>
      {{ numb }}
      <MyComponent02 msg="这是参数" @increase-by="handleIncrease" />
      <MyComponent02 msg="组件的事件监听器也支持 .once 修饰符-once只能点击一次" @increase-by.once="handleIncrease" />
    </div>

    <div>
      <h2>声明触发的事件</h2>
      <MyComponent03 msg="这是参数" @in-focus="handleInFocus" @submit="handleSubmit"/>
    </div>

    <div>
      <h2>setup外--声明触发的事件</h2>
      <MyComponent04 @in-focus="handleInFocus" @submit="handleSubmit"/>
    </div>

    <div>
      <h2>事件校验</h2>
      <MyComponent05 @submit-form="handleSubmitForm"/>
    </div>
    
  </div>


</template>

<script setup lang="ts">
import { ref } from "vue";
import MyComponent01 from './components/MyComponent01.vue'
import MyComponent02 from './components/MyComponent02.vue'
import MyComponent03 from './components/MyComponent03.vue'
import MyComponent04 from './components/MyComponent04.vue'
import MyComponent05 from './components/MyComponent05.vue'
const callback = () => {
  console.log(111);
}

const numb = ref(0)

const handleIncrease = (num: number) => {
  console.log(num);
  numb.value += num
}

const handleInFocus = (num: number) => {
  console.log(num, 'focus--外部');
}

const handleSubmit = () => {
  console.log('submit--外部');
}

const handleSubmitForm = (form: any) => {
  console.log(form, 'submitForm--外部');
  console.log('submitForm--外部');
}
</script>