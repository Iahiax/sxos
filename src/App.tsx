import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

const commands = {
  help: () => `
    المساعدة المتوفرة:
    
    الأوامر السحابية (Google Cloud):
    gcloud config list     - عرض إعدادات الحساب
    gcloud projects list   - عرض المشاريع
    gcloud compute instances list - عرض قائمة الخوادم
    gcloud compute instances create - إنشاء خادم جديد
    gcloud compute instances delete - حذف خادم
    gcloud compute instances start  - تشغيل خادم
    gcloud compute instances stop   - إيقاف خادم
    gcloud compute ssh              - الاتصال بالخادم عبر SSH
    gcloud storage ls               - عرض ملفات التخزين
    gcloud storage cp               - نسخ ملفات
    
    أوامر Docker:
    docker ps             - عرض الحاويات النشطة
    docker images         - عرض الصور المتوفرة
    docker build          - بناء صورة جديدة
    docker run            - تشغيل حاوية
    docker stop           - إيقاف حاوية
    docker rm             - حذف حاوية
    docker rmi            - حذف صورة
    docker pull           - تحميل صورة
    docker push           - رفع صورة
    docker exec           - تنفيذ أمر في حاوية
    
    أوامر Git:
    git init             - إنشاء مستودع جديد
    git clone            - نسخ مستودع
    git status           - عرض حالة المستودع
    git add              - إضافة ملفات للمتابعة
    git commit           - حفظ التغييرات
    git push             - رفع التغييرات
    git pull             - تحديث المستودع المحلي
    git branch           - إدارة الفروع
    git checkout         - التبديل بين الفروع
    git merge            - دمج الفروع
    
    أوامر عامة:
    clear               - مسح الشاشة
    exit                - خروج
    help                - عرض هذه المساعدة
    download            - تحميل محتوى المحاكي
  `,
  
  'gcloud config list': () => `
    [core]
    account = user@example.com
    project = my-cloud-project
    region = us-central1
    zone = us-central1-a
  `,
  
  'gcloud projects list': () => `
    PROJECT_ID          NAME                PROJECT_NUMBER
    my-cloud-project    مشروع تجريبي       123456789
    test-project       مشروع اختباري      987654321
  `,
  
  'gcloud compute instances list': () => `
    NAME          ZONE           MACHINE_TYPE  STATUS
    instance-1    us-central1-a  e2-medium    RUNNING
    instance-2    us-central1-b  e2-small     STOPPED
  `,
  
  'docker ps': () => `
    CONTAINER ID   IMAGE          COMMAND       STATUS        PORTS
    abc123def456   nginx:latest   "/docker-…"   Up 2 hours    80/tcp
    def456abc789   redis:latest   "redis-…"     Up 5 hours    6379/tcp
  `,
  
  'docker images': () => `
    REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
    nginx         latest    ad4c705f24d2   2 weeks ago    187MB
    redis         latest    621ceef7494a   3 weeks ago    117MB
  `,
  
  'git status': () => `
    On branch main
    Your branch is up to date with 'origin/main'.
    
    Changes not staged for commit:
      modified:   src/App.tsx
  `,

  download: () => {
    const terminalContent = terminalInstance.current?.buffer.active.getLine(0)?.translateToString() || '';
    const blob = new Blob([terminalContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return 'جاري تحميل محتوى المحاكي...';
  }
};

function App() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    
    terminalInstance.current = term;

    let commandBuffer = '';
    
    term.writeln('مرحباً بك في محاكي الأوامر السحابية 🚀');
    term.writeln('اكتب help للمساعدة\n');
    term.write('$ ');

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) { // Enter
        term.writeln('');
        const command = commandBuffer.trim();
        
        if (command) {
          if (commands[command as keyof typeof commands]) {
            term.writeln(commands[command as keyof typeof commands]());
          } else if (command === 'clear') {
            term.clear();
          } else if (command === 'exit') {
            term.writeln('شكراً لاستخدام المحاكي!');
            return;
          } else {
            term.writeln(`خطأ: الأمر '${command}' غير موجود`);
          }
        }
        
        commandBuffer = '';
        term.write('$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1);
          term.write('\b \b');
        }
      } else if (printable) {
        commandBuffer += key;
        term.write(key);
      }
    });

    window.addEventListener('resize', () => {
      fitAddon.fit();
    });

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl text-white mb-4 text-right">محاكي الأوامر السحابية</h1>
        <div 
          ref={terminalRef} 
          className="bg-[#1e1e1e] rounded-lg shadow-lg p-2 h-[600px]"
        />
      </div>
    </div>
  );
}

export default App;