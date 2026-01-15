<template>
  <!-- 留言墙 -->
  <div class="board-bg">
    <NavBar />
    <div class="board-container">
      <div
        v-for="(note, idx) in notes"
        :key="note.id"
        class="note"
        :style="getNoteStyle(note)"
        @mousedown="startDrag($event, idx)"
      >
        <div class="tape"></div>
        <div class="note-content">
          <div class="note-meta">
            <span>第{{ note.id }}条, {{ note.time }}</span>
          </div>
          <div class="note-text">{{ note.text }}</div>
          <div class="note-user">{{ note.user }}</div>
        </div>
      </div>
      <div class="board-center-title">写点啥吧</div>
      <div class="board-input" :class="{ focused: inputFocused }">
        <input 
          v-model="input"
          placeholder="说点什么吧"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
          @keyup.enter="addMessage"  
        />
        <button @click="addMessage">发送</button>  <!-- 修正：将addNote改为addMessage -->
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios'; // 新增：引入axios

const input = ref('');
const notes = reactive([]); // 初始化为空，从后端获取
const colors = ['#fff9b1', '#b1eaff', '#ffd1dc', '#caffb1', '#e1b1ff'];
const tapeColors = ['#f7d9a0', '#b1eaff', '#ffd1dc', '#caffb1', '#e1b1ff', '#f7b1b1'];
const inputFocused = ref(false);

// 修改：上传留言到后端
const addMessage = async () => {
  if (!input.value.trim()) return;
  
  // 生成随机样式（与后端表结构匹配）
  const newNote = {
    content: input.value,
    x: Math.random() * 900 + 50,
    y: Math.random() * 400 + 80,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: (Math.random() - 0.5) * 8,
    tape_color: tapeColors[Math.floor(Math.random() * tapeColors.length)]
  };

  try {
    // 添加认证头
    const token = localStorage.getItem('token');
    const { data } = await axios.post('http://localhost:3000/api/messages', newNote, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    notes.push(data);
    input.value = '';
  } catch (error) {
    console.error('上传留言失败:', error);
  }
};

// 拖拽逻辑
let dragIdx = null, offsetX = 0, offsetY = 0;
function startDrag(e, idx) {
  dragIdx = idx;
  offsetX = e.clientX - notes[idx].x;
  offsetY = e.clientY - notes[idx].y;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}
function onDrag(e) {
  if (dragIdx === null) return;
  notes[dragIdx].x = e.clientX - offsetX;
  notes[dragIdx].y = e.clientY - offsetY;
}
async function stopDrag() {
  if (dragIdx !== null) {
    const note = notes[dragIdx];
    // 保存位置到数据库
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/messages/${note.id}`, {
        x: note.x,
        y: note.y
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('位置保存成功:', note.id, note.x, note.y);
    } catch (error) {
      console.error('保存位置失败:', error);
    }
  }
  dragIdx = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}
function getNoteStyle(note) {
  return {
    left: note.x + 'px',
    top: note.y + 'px',
    background: note.color,
    zIndex: dragIdx === notes.indexOf(note) ? 99 : 10,
    transform: `rotate(${note.rotate || 0}deg)`,
    '--tape-color': note.tapeColor || '#f7d9a0'
  };
}
// 修改：获取留言时添加认证头
onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get('http://localhost:3000/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    notes.push(...data);
  } catch (error) {
    console.error('获取留言失败:', error);
  }
});
</script>

<style scoped>

.board-container {
  position: relative;
  min-height: 100vh;
}
.note {
  position: absolute;
  width: 220px;
  min-height: 140px;
  border-radius: 10px 10px 18px 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1.5px 0 #fff inset;
  padding: 1.2rem 1rem 1rem 1rem;
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.2s, transform 0.2s;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', 'PingFang SC', cursive, sans-serif;
  border-bottom: 2.5px dashed #eee;
}
.note:active {
  box-shadow: 0 16px 48px rgba(0,0,0,0.22);
  transform: scale(1.04);
  z-index: 99 !important;
}
.tape {
  width: 44px;
  height: 18px;
  border-radius: 6px 6px 2px 2px;
  position: absolute;
  top: -14px;
  left: 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  background: var(--tape-color, #f7d9a0);
  border: 1.5px solid #f3e1b1;
  z-index: 2;
}
.note-content {
  margin-top: 10px;
}
.note-meta {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
}
.note-text {
  font-size: 1.15rem;
  margin-bottom: 0.7rem;
  word-break: break-all;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', 'PingFang SC', cursive, sans-serif;
}
.note-user {
  text-align: right;
  font-size: 0.95rem;
  color: #444;
  font-weight: bold;
}
.board-center-title {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  font-size: 2.2rem;
  color: #333;
  font-weight: bold;
  text-shadow: 0 2px 8px #fff;
  pointer-events: none;
}
.board-input {
  position: absolute;
  left: 50%;
  top: calc(48% + 60px); /* 在"写点啥吧"下方一些 */
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(255,255,255,0.55);
  border-radius: 18px;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 4px 18px rgba(66,185,131,0.10);
  border: 2px solid #e1e1e1;
  backdrop-filter: blur(6px);
  transition: background 0.25s, box-shadow 0.25s, border 0.25s, backdrop-filter 0.25s;
  z-index: 20;
}
.board-input.focused {
  background: #fff;
  box-shadow: 0 8px 32px rgba(66,185,131,0.18);
  border: 2.5px solid #42b983;
  backdrop-filter: none;
}
.board-input input {
  border-radius: 20px;
  padding: 0.5rem 1rem;
  background: #f7f7fa;
  border: none;
  outline: none;
  font-size: 1.1rem;
  width: 220px;
}
.board-input button {
  background: linear-gradient(90deg, #42b983 0%, #36a2cf 100%);
  box-shadow: 0 2px 8px rgba(66,185,131,0.10);
  font-weight: bold;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.board-input button:hover {
  background: #36a2cf;
}
.board-bg::after {
  content: '';
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(255,255,255,0.08);
  pointer-events: none;
  z-index: 0;
  backdrop-filter: blur(1.5px);
}
</style>