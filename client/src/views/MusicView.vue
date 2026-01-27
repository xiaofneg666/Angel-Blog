

<template>

  <div class="music-player">
    <!-- 背景层 -->
    <div class="background"></div>
    <NavBar></NavBar>
    <!-- 歌词区域 -->
    <div class="lyrics-container">
      <div class="lyrics">
        <p class="lyric-line">And they won't need to know</p>
        <p class="lyric-line">And they won't need to know</p>
        <p class="lyric-line">I know we'll end up alone</p>
        <p class="lyric-line">And they won't need to know</p>
        <p class="lyric-line">our names or our faces</p>
        <p class="lyric-line active">But they will carry on for us</p>
        <p class="lyric-line">And it's a long way forward,</p>
        <p class="lyric-line">so trust in me</p>
        <p class="lyric-line">I'll give them shelter like</p>
        <p class="lyric-line">so trust in me</p>
        <p class="lyric-line">I'll give them shelter like</p>
        <p class="lyric-line">you've done for me</p>
      </div>
    </div>
    
    <!-- 主播放器区域 -->
    <div class="player-main">
      <!-- 专辑封面和歌曲信息 -->
      <div class="song-info">
        <div class="album-art">
          <img src="../../public/1.jpg" alt="专辑封面">
        </div>
        <div class="song-details">
          <h2 class="song-title">Shelter</h2>
          <p class="artist-album">Porter Robinson, Madeon · Shelter · 2016</p>
          <p class="format-info">OGG · 131 kbps · 48.0 kHz · Stereo</p>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container">
        <div class="time-display">02:13</div>
        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div class="waveform"></div>
            <div class="progress-fill"></div>
            <div class="progress-handle"></div>
          </div>
        </div>
        <div class="time-display">03:38</div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="controls">
        <!-- 左侧按钮 -->
        <div class="control-buttons left">
          <button class="control-btn">
            <i class="icon icon-prev"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-play"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-next"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-repeat"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-shuffle"></i>
          </button>
        </div>
        
        <!-- 右侧按钮 -->
        <div class="control-buttons right">
          <button class="control-btn">
            <i class="icon icon-volume"></i>
          </button>
          <div class="volume-slider">
            <input type="range" min="0" max="100" value="80">
          </div>
          <button class="control-btn">
            <i class="icon icon-queue"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-list"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-settings"></i>
          </button>
          <button class="control-btn">
            <i class="icon icon-fullscreen"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 右下角音量图标 -->
    <div class="volume-icon">
      <i class="icon icon-volume"></i>
    </div>
  </div>
</template>

<script setup>
// import {ref} from 'vue'
import NavBar from '@/components/NavBar.vue'
// 暂时为空，后续添加交互功能
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* 主容器 */
.music-player {
  position: relative;
  width: 100vw;
  height: 160vh;
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 50%, #3498db 100%);
  color: white;
  overflow: hidden;
}

.background {
  position: fixed; /* 使用fixed而不是absolute，确保覆盖整个视口 */
  top: 0;
  left: 0;
  width: 100%; /* 视口宽度 */
  height: 100%; /* 视口高度 */
  background: linear-gradient(135deg, rgba(26, 42, 58, 0.9) 0%, rgba(44, 62, 80, 0.8) 50%, rgba(52, 152, 219, 0.7) 100%);
  z-index: -1; /* 确保背景在内容下方 */
}

/* 歌词区域 */
.lyrics-container {
  position: absolute;
  top: -160px;
  left: 6%;
  right: 40%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  box-sizing: border-box;
  text-align: left;
}

.lyrics {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 25px;
  flex: 0 0 auto;
  height: 50%;
  width: 100%;
  max-width: 800px;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.lyric-line {
  margin: 0;
  font-size: 1.5vw;
  line-height: 1.5;
  opacity: 0.3;
  transition: all 0.3s ease;
  max-width: 100%;
  width: auto;
  color: rgba(255, 255, 255, 0.5);
  word-break: break-word;
}

.lyric-line.active {
  font-size: 2.5vw;
  font-weight: 700;
  opacity: 1;
  transform: scale(1.05);
  color: white;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .lyric-line {
    font-size: 24px;
  }
  
  .lyric-line.active {
    font-size: 48px;
  }
  
  .lyrics-container {
    right: 20%;
  }
}

@media (max-width: 768px) {
  .lyrics-container {
    left: 10px;
    right: 10px;
    padding: 60px 10px;
  }
  
  .lyric-line {
    font-size: 20px;
  }
  
  .lyric-line.active {
    font-size: 40px;
  }
  
  .lyrics {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .lyric-line {
    font-size: 16px;
  }
  
  .lyric-line.active {
    font-size: 32px;
  }
  
  .lyrics {
    gap: 15px;
  }
}

/* 主播放器区域 */
.player-main {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  /* background: rgba(0, 0, 0, 0.3); */
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

/* 歌曲信息 */
.song-info {
  position: absolute;
  bottom: 140px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.album-art {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 300px;
  padding-top: 20px;
}

.song-title {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.2;
  word-break: break-word;
}

.artist-album {
  margin: 0;
  font-size: 24px;
  opacity: 0.8;
  margin-bottom: 10px;
  line-height: 1.3;
  word-break: break-word;
}

.format-info {
  margin: 0;
  font-size: 18px;
  opacity: 0.6;
  line-height: 1.4;
  word-break: break-word;
}

/* 响应式设计 - 播放器区域 */
@media (max-width: 1200px) {
  .song-title {
    font-size: 28px;
  }
  
  .artist-album {
    font-size: 20px;
  }
  
  .format-info {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .song-info {
    bottom: 120px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
  
  .album-art {
    width: 120px;
    height: 120px;
  }
  
  .song-details {
    min-width: auto;
    padding-top: 10px;
  }
  
  .song-title {
    font-size: 24px;
  }
  
  .artist-album {
    font-size: 18px;
  }
  
  .format-info {
    font-size: 14px;
  }
  
  .player-main {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .song-info {
    bottom: 100px;
  }
  
  .album-art {
    width: 100px;
    height: 100px;
  }
  
  .song-title {
    font-size: 20px;
  }
  
  .artist-album {
    font-size: 16px;
  }
  
  .player-main {
    padding: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.time-display {
  font-size: 14px;
  opacity: 0.8;
  width: 55px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.progress-bar-wrapper {
  flex: 1;
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 100%;
}

.waveform {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.2) 4px);
  background-size: 12px 100%;
  animation: wave 2s linear infinite;
}

@keyframes wave {
  0% { transform: translateX(-12px); }
  100% { transform: translateX(12px); }
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.1s ease;
}

.progress-handle {
  position: absolute;
  top: 50%;
  left: 60%;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

/* 控制按钮 */
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.control-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.control-btn i {
  font-size: 20px;
}

/* 音量滑块 */
.volume-slider {
  width: 100px;
  margin: 0 10px;
  opacity: 0.8;
}

.volume-slider input[type="range"] {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.volume-slider input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: none;
}

/* 右下角音量图标 */
.volume-icon {
  position: absolute;
  bottom: 40px;
  right: 40px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-icon:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.5);
}

.volume-icon i {
  color: white;
  font-size: 18px;
}

/* 图标样式 */
.icon {
  font-style: normal;
  display: inline-block;
  width: 1em;
  height: 1em;
  text-align: center;
  line-height: 1;
}

/* 自定义图标 */
.icon-prev:before { content: '⏮'; }
.icon-play:before { content: '⏸'; }
.icon-next:before { content: '⏭'; }
.icon-repeat:before { content: '🔁'; }
.icon-shuffle:before { content: '🔀'; }
.icon-volume:before { content: '🔊'; }
.icon-queue:before { content: '📋'; }
.icon-list:before { content: '📝'; }
.icon-settings:before { content: '⚙️'; }
.icon-fullscreen:before { content: '⛶'; }

/* 响应式设计 */
@media (max-width: 768px) {
  .player-main {
    left: 20px;
    right: 20px;
    bottom: 20px;
    padding: 15px;
  }
  
  .song-info {
    flex-direction: column;
    text-align: center;
  }
  
  .album-art {
    width: 80px;
    height: 80px;
  }
  
  .song-title {
    font-size: 18px;
  }
  
  .controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .volume-slider {
    width: 150px;
  }
  
  .volume-icon {
    bottom: 30px;
    right: 30px;
  }
}
</style>
    