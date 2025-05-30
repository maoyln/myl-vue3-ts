<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/essentials/forms.html" target="_blank"
        >表单输入绑定
      </a>
    </h1>

    <div>
      <h2>表单输入绑定</h2>

      <div>
        <p>Message is: {{ text }}</p>
        <!-- 方法一 -->
        <input :value="text" @input="handleInput" />
        <!-- 方法二 -->
        <input v-model="text" />
      </div>
    </div>

    <div>
      <h2>多文本</h2>

      <span>Multiline message is:</span>
      <p style="white-space: pre-line">{{ message }}</p>
      <textarea v-model="message" placeholder="add multiple lines"></textarea>
    </div>

    <div>
      <h2>复选框</h2>
      <input type="checkbox" id="checkbox" v-model="checked" />
      <label for="checkbox">{{ checked }}</label>

      <hr />
      <h2>多选框</h2>

      <div>Checked names: {{ checkedNames }}</div>

      <input type="checkbox" id="jack" value="Jack" v-model="checkedNames" />
      <label for="jack">Jack</label>

      <input type="checkbox" id="john" value="John" v-model="checkedNames" />
      <label for="john">John</label>

      <input type="checkbox" id="mike" value="Mike" v-model="checkedNames" />
      <label for="mike">Mike</label>
      <hr />

      <h2>单选</h2>

      <div>Picked: {{ picked }}</div>

      <input type="radio" id="one" value="One" v-model="picked" />
      <label for="one">One</label>

      <input type="radio" id="two" value="Two" v-model="picked" />
      <label for="two">Two</label>
      <hr />

      <h2>选择器</h2>
      <div>Selected: {{ selected }}</div>

      <select v-model="selected">
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>
      <hr />

      <h2>多选 (值绑定到一个数组)：</h2>
      <div>Selected: {{ selected }}</div>

      <select v-model="selected" multiple>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>
    </div>

    <div>
      <h2>多选 (值绑定到一个数组)</h2>
      <select v-model="selected">
        <option
          v-for="option in options"
          :value="option.value"
          :key="option.value"
        >
          {{ option.text }}
        </option>
      </select>

      <div>Selected: {{ selected }}</div>
    </div>

    <hr />

    <div>
      <h2>值绑定</h2>
      <!-- `picked` 在被选择时是字符串 "a" -->
       {{ picked }}
      <input type="radio" v-model="picked" value="a" />
      <input type="radio" v-model="picked" value="b" />
      <br>
      <!-- `toggle` 只会为 true 或 false -->
       {{toggle}}
      <input type="checkbox" v-model="toggle" />
      <input
        type="checkbox"
        v-model="toggle"
        :true-value="dynamicTrueValue"
        :false-value="dynamicFalseValue"
      />
      <br>

      <!-- `selected` 在第一项被选中时为字符串 "abc" -->
      <select v-model="selected">
        <option value="abc">ABC</option>
      </select>
    </div>

    <div>
      <h2>修饰符</h2>

      <ul>
        <li>lazy: 懒加载</li>
        <li>number: 转换为数字</li>
        <li>trim: 去除首尾空格</li>
      </ul>
      <div>Message is: {{ msg }}</div>
      <input v-model.lazy="msg" />
      <div>Age is: {{ age }}</div>
      <input v-model.number="age" />
      <div>Message is: {{ msgTrim }}</div>
      <input v-model.trim="msgTrim" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const text = ref("");

const message = ref("");

const checked = ref(false);

const checkedNames = ref([]);

const picked = ref("One");

const selected = ref("A");

const options = ref([
  { text: "One", value: "A" },
  { text: "Two", value: "B" },
  { text: "Three", value: "C" },
]);

const toggle = ref(false);
const dynamicTrueValue = ref("foo");
const dynamicFalseValue = ref("bar");

const handleInput = (event: Event) => {
  text.value = (event.target as HTMLInputElement).value;
};

const msg = ref("");
const msgTrim = ref("");
const age = ref(0);
// about 页面逻辑
</script>
