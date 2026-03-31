export function buildInitialState(config = {}) {
  const today = new Date();
  const iso = (delta = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + delta);
    return d.toISOString();
  };

  return {
    user: {
      id: config?.demoUser?.id || "demo-user",
      name: config?.demoUser?.name || "Demo User",
      email: config?.demoUser?.email || "demo@lifesync.local",
      plan: config?.demoUser?.plan || "starter"
    },
    meta: {
      lastCloudSyncAt: null,
      cloudConnected: false,
      mode: "local",
      monthlyAiCredits: 120,
      usedAiCredits: 6
    },
    settings: {
      theme: "dark",
      currency: "VND",
      notificationsEnabled: false,
      defaultRoute: "dashboard"
    },
    finance: {
      monthlyBudget: 8000000,
      transactions: [
        { id: crypto.randomUUID(), type: "expense", amount: 45000, category: "Ăn uống", note: "Cà phê", createdAt: iso(-1) },
        { id: crypto.randomUUID(), type: "expense", amount: 120000, category: "Di chuyển", note: "Xăng xe", createdAt: iso(-2) },
        { id: crypto.randomUUID(), type: "income", amount: 4500000, category: "Lương", note: "Dạy thêm", createdAt: iso(-5) },
        { id: crypto.randomUUID(), type: "expense", amount: 320000, category: "Học tập", note: "Mua sách", createdAt: iso(-3) }
      ]
    },
    productivity: {
      tasks: [
        { id: crypto.randomUUID(), title: "Soạn bài hình học 11", priority: "high", deadline: iso(1), done: false },
        { id: crypto.randomUUID(), title: "Đăng bài bán máy tính", priority: "medium", deadline: iso(2), done: false },
        { id: crypto.randomUUID(), title: "Viết tài liệu web", priority: "high", deadline: iso(0), done: true }
      ],
      habits: [
        { id: crypto.randomUUID(), title: "Pomodoro 4 phiên", streak: 6, icon: "⏰" },
        { id: crypto.randomUUID(), title: "Ghi chi tiêu cuối ngày", streak: 4, icon: "💸" }
      ],
      pomodoro: {
        duration: 25 * 60,
        remaining: 25 * 60,
        running: false,
        lastStartedAt: null,
        sessionCount: 3
      }
    },
    wellness: {
      moods: [
        { id: crypto.randomUUID(), mood: 4, note: "Khá ổn", createdAt: iso(-1) },
        { id: crypto.randomUUID(), mood: 3, note: "Hơi mệt", createdAt: iso(-2) }
      ],
      journal: [
        { id: crypto.randomUUID(), entry: "Cần tối ưu cấu trúc landing + giữ retention.", createdAt: iso(-1) }
      ],
      metrics: {
        heightCm: 168,
        weightKg: 62,
        waterMlToday: 1200
      }
    },
    assistant: {
      messages: [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Tập trung 2 module kiếm tiền trước: Finance và Productivity. Đó là lõi retention của bản thực chiến này.",
          createdAt: iso(0)
        }
      ]
    },
    syncLog: []
  };
}
