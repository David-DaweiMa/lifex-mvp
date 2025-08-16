// 测试设备识别机制
const testDeviceIdentification = () => {
  console.log('🧪 测试设备识别机制...');
  
  // 模拟设备指纹生成
  const generateDeviceFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        const canvasFingerprint = canvas.toDataURL();
        
        // 组合多个设备特征
        const features = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          canvasFingerprint.substring(0, 20),
          window.devicePixelRatio || 1
        ];
        
        // 生成简单的哈希
        const combined = features.join('|');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
      }
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
    }
    
    return 'fallback_' + Math.random().toString(36).substr(2, 6);
  };

  // 测试设备指纹生成
  console.log('\n📱 设备指纹信息:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Language:', navigator.language);
  console.log('Screen:', screen.width + 'x' + screen.height);
  console.log('Timezone Offset:', new Date().getTimezoneOffset());
  console.log('Device Pixel Ratio:', window.devicePixelRatio || 1);
  
  const fingerprint = generateDeviceFingerprint();
  console.log('Generated Fingerprint:', fingerprint);
  
  // 测试会话ID生成
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const sessionId = `anon_${timestamp}_${fingerprint}_${random}`;
  
  console.log('\n🆔 生成的会话ID:', sessionId);
  console.log('会话ID长度:', sessionId.length);
  
  // 测试存储机制
  console.log('\n💾 测试存储机制:');
  
  // 测试localStorage
  try {
    localStorage.setItem('test_session', sessionId);
    const retrieved = localStorage.getItem('test_session');
    console.log('localStorage:', retrieved === sessionId ? '✅ 工作正常' : '❌ 失败');
    localStorage.removeItem('test_session');
  } catch (error) {
    console.log('localStorage: ❌ 不可用', error.message);
  }
  
  // 测试sessionStorage
  try {
    sessionStorage.setItem('test_session', sessionId);
    const retrieved = sessionStorage.getItem('test_session');
    console.log('sessionStorage:', retrieved === sessionId ? '✅ 工作正常' : '❌ 失败');
    sessionStorage.removeItem('test_session');
  } catch (error) {
    console.log('sessionStorage: ❌ 不可用', error.message);
  }
  
  // 测试cookie
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `test_session=${sessionId};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    
    const nameEQ = "test_session=";
    const ca = document.cookie.split(';');
    let retrieved = null;
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        retrieved = c.substring(nameEQ.length, c.length);
        break;
      }
    }
    
    console.log('Cookie:', retrieved === sessionId ? '✅ 工作正常' : '❌ 失败');
    document.cookie = 'test_session=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  } catch (error) {
    console.log('Cookie: ❌ 不可用', error.message);
  }
  
  // 测试隐私模式检测
  console.log('\n🔒 隐私模式检测:');
  let isPrivateMode = false;
  
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (error) {
    isPrivateMode = true;
  }
  
  console.log('隐私模式:', isPrivateMode ? '✅ 检测到' : '❌ 未检测到');
  
  if (isPrivateMode) {
    console.log('⚠️  在隐私模式下，只能使用sessionStorage和cookie进行会话管理');
  }
  
  console.log('\n📊 设备识别能力评估:');
  console.log('- 设备指纹稳定性: 高（基于硬件特征）');
  console.log('- 跨浏览器识别: 部分支持（相同设备）');
  console.log('- 隐私模式支持: 有限（依赖cookie）');
  console.log('- 数据持久性: 高（多重存储机制）');
};

// 运行测试
testDeviceIdentification();
