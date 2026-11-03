"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  Download,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, cleanMarkdown } from "@/lib/utils";
import { chatService } from "@/lib/services/chat.service";
import { revenueStatisticsService, RevenueStatisticsData } from "@/lib/services/revenue-statistics.service";
import { reportExportService } from "@/lib/services/report-export.service";
import { useRevenueData } from "@/hooks/use-revenue-data";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isProactive?: boolean; // Message được AI tự động gửi
}

interface ReportPeriod {
  type: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  label: string;
}

export function RevenueChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<string | null>(null);
  const [currentReportData, setCurrentReportData] = useState<{
    statistics: RevenueStatisticsData;
    period: ReportPeriod;
  } | null>(null);
  const [hasShownProactiveMessage, setHasShownProactiveMessage] = useState(false);
  const [hasProactiveSuggestion, setHasProactiveSuggestion] = useState(false);
  const [isWaitingForPeriod, setIsWaitingForPeriod] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { summaryCards, revenueByMonth } = useRevenueData();

  // Auto scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Generate proactive suggestion based on revenue data
  const generateProactiveSuggestion = useCallback(async () => {
    try {
      // Analyze current data
      const currentCard = summaryCards[0]; // Tổng doanh thu
      const trend = currentCard.trend;
      const delta = currentCard.delta;

      // Extract percentage from delta (e.g., "+7.3% so với tháng trước")
      const match = delta.match(/([+-]?\d+\.?\d*)%/);
      const percentage = match ? parseFloat(match[1]) : 0;

      let suggestion = "";
      if (trend === "up" && percentage > 5) {
        suggestion = `🎉 Doanh thu ${delta.toLowerCase()}. Bạn có muốn tôi tạo báo cáo chi tiết để phân tích xu hướng này không?`;
      } else if (trend === "up") {
        suggestion = `📈 Doanh thu đang tăng trưởng. Tôi có thể tạo báo cáo thống kê chi tiết cho bạn. Bạn muốn báo cáo theo ngày, tuần hay tháng?`;
      } else if (trend === "down") {
        suggestion = `📉 Doanh thu ${delta.toLowerCase()}. Tôi có thể phân tích nguyên nhân và đưa ra khuyến nghị. Bạn có muốn tạo báo cáo không?`;
      } else {
        suggestion = `📊 Tôi có thể tạo báo cáo thống kê doanh thu chi tiết cho bạn. Bạn muốn báo cáo theo ngày, tuần hay tháng?`;
      }

      // Add proactive message
      const proactiveMessage: Message = {
        id: `proactive-${Date.now()}`,
        text: suggestion,
        isUser: false,
        timestamp: new Date(),
        isProactive: true,
      };

      setMessages((prev) => [...prev, proactiveMessage]);
    } catch (error) {
      console.error("Error generating proactive suggestion:", error);
    }
  }, [summaryCards]);

  // Proactive: Analyze data and show suggestion when component mounts or data changes
  useEffect(() => {
    if (!hasShownProactiveMessage && summaryCards.length > 0) {
      // Delay to ensure page is loaded
      const timer = setTimeout(() => {
        generateProactiveSuggestion();
        setHasShownProactiveMessage(true);
        setHasProactiveSuggestion(true);
        // Auto-open dialog to show proactive suggestion
        setIsOpen(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [summaryCards, hasShownProactiveMessage, generateProactiveSuggestion]);

  // Generate AI report
  const generateReport = useCallback(
    async (period?: ReportPeriod) => {
      setIsGeneratingReport(true);
      setLoading(true);

      try {
        // Collect statistics data
        let statsData: RevenueStatisticsData;
        try {
          statsData = await revenueStatisticsService.collectStatisticsData(
            period
          );
        } catch (error: any) {
          // Handle database connection error (6.e1)
          console.error("Database connection error:", error);
          const errorMessage: Message = {
            id: `error-db-${Date.now()}`,
            text:
              "Lỗi kỹ thuật: Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsGeneratingReport(false);
          setLoading(false);
          return;
        }

        // Check if data is empty (6a)
        if (
          statsData.totalRevenue === 0 &&
          statsData.userStats.totalOrders === 0
        ) {
          const noDataMessage: Message = {
            id: `no-data-${Date.now()}`,
            text:
              "Không có dữ liệu cho khoảng thời gian này. Bạn có muốn chọn thời gian khác không? (Ví dụ: tháng trước, tuần trước)",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, noDataMessage]);
          setIsGeneratingReport(false);
          setLoading(false);
          return;
        }

        // Prepare prompt for AI
        const prompt = buildReportPrompt(statsData, period);

        // Send to AI
        let response;
        try {
          response = await chatService.sendMessage({
            message: prompt,
            sessionId: sessionId,
          });
        } catch (error: any) {
          // Handle Gemini API error (8.e1)
          console.error("Gemini API error:", error);
          const errorMessage: Message = {
            id: `error-ai-${Date.now()}`,
            text:
              "Xin lỗi, không thể xử lý yêu cầu tạo báo cáo. Hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsGeneratingReport(false);
          setLoading(false);
          return;
        }

        if (response.sessionId) {
          setSessionId(response.sessionId);
        }

        // Add AI report message
        const cleanedResponse = cleanMarkdown(response.response);
        const reportMessage: Message = {
          id: `report-${Date.now()}`,
          text: cleanedResponse,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, reportMessage]);
        setCurrentReport(cleanedResponse);
        // Save report data for export
        setCurrentReportData({
          statistics: statsData,
          period: period || {
            type: "month",
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
            label: "tháng hiện tại",
          },
        });
      } catch (error: any) {
        // Handle general AI processing error (9a)
        console.error("Error generating report:", error);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text:
            error.message ||
            "Xin lỗi, đã có lỗi xảy ra khi tạo báo cáo. Vui lòng thử lại sau.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsGeneratingReport(false);
        setLoading(false);
      }
    },
    [sessionId]
  );

  // Build prompt for AI report generation
  const buildReportPrompt = (
    data: RevenueStatisticsData,
    period?: ReportPeriod
  ): string => {
    const periodLabel = period?.label || "tháng hiện tại";

    return `Hãy tạo báo cáo thống kê doanh thu cho ${periodLabel} với cấu trúc sau:

1. TỔNG QUAN:
- Tổng doanh thu: ${data.totalRevenue.toLocaleString("vi-VN")} VNĐ
- Tổng số đơn hàng: ${data.userStats.totalOrders}
- Giá trị đơn hàng trung bình: ${data.userStats.avgOrderValue.toLocaleString("vi-VN")} VNĐ

2. KPI CHÍNH:
- Tổng số người dùng: ${data.userStats.totalUsers}
- Người dùng hoạt động: ${data.userStats.activeUsers}
- Người dùng mới tháng này: ${data.userStats.newUsersThisMonth}
- Doanh thu trung bình/người dùng: ${data.userStats.avgRevenuePerUser.toLocaleString("vi-VN")} VNĐ

3. CHI TIẾT ĐƠN HÀNG:
- Đơn chờ xử lý: ${data.ordersByStatus.PENDING}
- Đơn đã xác nhận: ${data.ordersByStatus.CONFIRMED}
- Đơn đang xử lý: ${data.ordersByStatus.PROCESSING}
- Đơn đã giao: ${data.ordersByStatus.DELIVERED}
- Đơn đã hủy: ${data.ordersByStatus.CANCELLED}

4. XU HƯỚNG:
- Phân tích xu hướng doanh thu
- So sánh với kỳ trước (nếu có dữ liệu)
- Nhận diện các điểm nổi bật

5. KHUYẾN NGHỊ:
- Đưa ra các khuyến nghị cụ thể để cải thiện doanh thu

Hãy tạo báo cáo chi tiết, dễ hiểu và có cấu trúc rõ ràng.`;
  };

  // Handle user message
  const handleSend = useCallback(async () => {
    if (input.trim() === "" || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const inputLower = currentInput.toLowerCase();
      
      // Check if user is responding to period question
      if (isWaitingForPeriod) {
        let period: ReportPeriod | undefined;

        if (inputLower.includes("ngày") || inputLower.includes("hôm nay")) {
          const today = new Date();
          period = {
            type: "day",
            startDate: today.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
            label: "hôm nay",
          };
        } else if (
          inputLower.includes("tuần") ||
          inputLower.includes("week")
        ) {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          period = {
            type: "week",
            startDate: weekStart.toISOString().split("T")[0],
            endDate: weekEnd.toISOString().split("T")[0],
            label: "tuần này",
          };
        } else if (
          inputLower.includes("tháng") ||
          inputLower.includes("month") ||
          inputLower.includes("năm") ||
          inputLower.includes("year")
        ) {
          // Handle "tháng này", "tháng trước", "năm này", etc.
          if (inputLower.includes("tháng này") || inputLower.includes("tháng hiện tại")) {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            period = {
              type: "month",
              startDate: monthStart.toISOString().split("T")[0],
              endDate: monthEnd.toISOString().split("T")[0],
              label: "tháng này",
            };
          } else if (inputLower.includes("tháng trước")) {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            period = {
              type: "month",
              startDate: lastMonth.toISOString().split("T")[0],
              endDate: lastMonthEnd.toISOString().split("T")[0],
              label: "tháng trước",
            };
          } else if (inputLower.includes("năm này") || inputLower.includes("năm hiện tại")) {
            const now = new Date();
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear(), 11, 31);
            period = {
              type: "month",
              startDate: yearStart.toISOString().split("T")[0],
              endDate: yearEnd.toISOString().split("T")[0],
              label: "năm này",
            };
          } else {
            // Default to current month if just "tháng"
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            period = {
              type: "month",
              startDate: monthStart.toISOString().split("T")[0],
              endDate: monthEnd.toISOString().split("T")[0],
              label: "tháng này",
            };
          }
        }

        if (period) {
          setIsWaitingForPeriod(false);
          await generateReport(period);
        } else {
          // Still unclear, ask again
          const clarificationMessage: Message = {
            id: `clarify-${Date.now()}`,
            text:
              "Vui lòng chọn một trong các tùy chọn: hôm nay, tuần này, tháng này, tháng trước, hoặc năm này.",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, clarificationMessage]);
          setLoading(false);
          return;
        }
        return;
      }

      // Check if user wants to generate report
      const reportKeywords = [
        "báo cáo",
        "thống kê",
        "report",
        "tạo báo cáo",
        "xuất báo cáo",
        "doanh thu",
      ];
      const wantsReport = reportKeywords.some((keyword) =>
        inputLower.includes(keyword)
      );

      if (wantsReport) {
        // Extract period from user input
        let period: ReportPeriod | undefined;

        if (inputLower.includes("ngày") || inputLower.includes("hôm nay")) {
          const today = new Date();
          period = {
            type: "day",
            startDate: today.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
            label: "hôm nay",
          };
        } else if (
          inputLower.includes("tuần") ||
          inputLower.includes("week")
        ) {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          period = {
            type: "week",
            startDate: weekStart.toISOString().split("T")[0],
            endDate: weekEnd.toISOString().split("T")[0],
            label: "tuần này",
          };
        } else if (
          inputLower.includes("tháng") ||
          inputLower.includes("month") ||
          inputLower.includes("năm") ||
          inputLower.includes("year")
        ) {
          // Handle "tháng này", "tháng trước", "năm này", etc.
          if (inputLower.includes("tháng này") || inputLower.includes("tháng hiện tại")) {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            period = {
              type: "month",
              startDate: monthStart.toISOString().split("T")[0],
              endDate: monthEnd.toISOString().split("T")[0],
              label: "tháng này",
            };
          } else if (inputLower.includes("tháng trước")) {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            period = {
              type: "month",
              startDate: lastMonth.toISOString().split("T")[0],
              endDate: lastMonthEnd.toISOString().split("T")[0],
              label: "tháng trước",
            };
          } else if (inputLower.includes("năm này") || inputLower.includes("năm hiện tại")) {
            const now = new Date();
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear(), 11, 31);
            period = {
              type: "month",
              startDate: yearStart.toISOString().split("T")[0],
              endDate: yearEnd.toISOString().split("T")[0],
              label: "năm này",
            };
          } else {
            // Default to current month if just "tháng"
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            period = {
              type: "month",
              startDate: monthStart.toISOString().split("T")[0],
              endDate: monthEnd.toISOString().split("T")[0],
              label: "tháng này",
            };
          }
        }

        if (period) {
          // Period found, generate report
          await generateReport(period);
        } else {
          // No period specified, ask for clarification
          setIsWaitingForPeriod(true);
          const clarificationMessage: Message = {
            id: `clarify-${Date.now()}`,
            text:
              "Bạn muốn báo cáo theo khoảng thời gian nào? (Ví dụ: hôm nay, tuần này, tháng này, tháng trước, hoặc năm này)",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, clarificationMessage]);
          setLoading(false);
          return;
        }
      } else {
        // Regular chat
        const response = await chatService.sendMessage({
          message: currentInput,
          sessionId: sessionId,
        });

        if (response.sessionId) {
          setSessionId(response.sessionId);
        }

        const botMessage: Message = {
          id: Date.now().toString() + "bot",
          text: cleanMarkdown(response.response),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + "error",
        text:
          error.message ||
          "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId, generateReport, isWaitingForPeriod]);

  // Export report to file
  const exportReport = useCallback(
    async (format: "excel" | "pdf") => {
      if (!currentReport || !currentReportData) {
        const errorMessage: Message = {
          id: `export-error-${Date.now()}`,
          text: "Không có báo cáo để xuất. Vui lòng tạo báo cáo trước.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      try {
        setLoading(true);

        const reportData = {
          statistics: currentReportData.statistics,
          aiReportText: currentReport,
          period: currentReportData.period,
          generatedAt: new Date(),
        };

        if (format === "excel") {
          await reportExportService.exportToExcel(reportData);
        } else {
          await reportExportService.exportToPDF(reportData);
        }

        const successMessage: Message = {
          id: `export-success-${Date.now()}`,
          text: `Đã xuất báo cáo ${format.toUpperCase()} thành công!`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } catch (error: any) {
        // Handle file export error (13a, 13.e1)
        console.error("Error exporting report:", error);
        const errorMessage: Message = {
          id: `export-error-${Date.now()}`,
          text:
            error.message ||
            "Không thể xuất file. Vui lòng copy nội dung báo cáo thủ công hoặc liên hệ quản trị viên nếu vấn đề vẫn tiếp tục.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [currentReport, currentReportData]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setHasProactiveSuggestion(false); // Clear notification when opened
        }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex h-14 w-14 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/50",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-xl hover:shadow-primary/60",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "animate-in fade-in-0 zoom-in-95",
          "sm:bottom-8 sm:right-8",
          "relative"
        )}
        aria-label="Mở AI trợ lý báo cáo"
      >
        <Sparkles className="h-6 w-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-pulse">
            AI
          </span>
        )}
        {/* Proactive suggestion notification badge */}
        {hasProactiveSuggestion && !isOpen && (
          <div className="absolute -top-2 -left-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white shadow-lg animate-bounce">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            Gợi ý mới
          </div>
        )}
      </button>

      {/* Chatbot Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setHasProactiveSuggestion(false); // Clear notification when closed
          }
        }}
      >
        <DialogContent
          className={cn(
            "flex max-h-[calc(100vh-8rem)] h-[500px] max-w-md flex-col p-0",
            "sm:h-[550px] sm:max-w-lg sm:max-h-[calc(100vh-10rem)]",
            "md:h-[600px]",
            // Position at bottom right corner
            "!top-auto !left-auto !bottom-24 !right-6",
            "!translate-x-0 !translate-y-0",
            "sm:!bottom-28 sm:!right-8",
            "overflow-hidden"
          )}
          showCloseButton={true}
        >
          {/* Header */}
          <DialogHeader className="border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    AI Trợ lý Báo cáo
                  </DialogTitle>
                  <p className="text-xs text-primary-foreground/80">
                    Phân tích & Tạo báo cáo thống kê
                  </p>
                </div>
              </div>
              {/* Export buttons */}
              {currentReport && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => exportReport("excel")}
                    title="Xuất Excel"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => exportReport("pdf")}
                    title="Xuất PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
            <div className="flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex max-w-[75%] flex-col gap-1 items-start">
                    <div className="rounded-2xl bg-muted px-4 py-2.5 text-foreground">
                      <p className="text-sm leading-relaxed">
                        Xin chào! Tôi là AI trợ lý báo cáo. Tôi có thể giúp bạn
                        tạo báo cáo thống kê doanh thu chi tiết. Hãy cho tôi biết
                        bạn muốn báo cáo theo ngày, tuần hay tháng?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "flex max-w-[75%] flex-col gap-1",
                      message.isUser ? "items-end" : "items-start"
                    )}
                  >
                    {message.isProactive && (
                      <span className="text-xs text-muted-foreground px-1">
                        💡 Gợi ý tự động
                      </span>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5",
                        message.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {(loading || isGeneratingReport) && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {isGeneratingReport
                        ? "Đang tạo báo cáo..."
                        : "Đang xử lý..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Container */}
          <div className="border-t bg-background px-4 py-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập yêu cầu tạo báo cáo..."
                disabled={loading || isGeneratingReport}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={loading || isGeneratingReport || input.trim() === ""}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Nhấn Enter để gửi • Gợi ý: "Tạo báo cáo tháng này"
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
