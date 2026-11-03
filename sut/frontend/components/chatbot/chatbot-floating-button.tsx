"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Image as ImageIcon,
  Paperclip,
  MapPin,
  Phone,
  MessageSquare,
  X as XIcon,
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
import Image from "next/image";
import { chatService, type AttachmentRequest as ChatAttachmentRequest } from "@/lib/services/chat.service";

interface Attachment {
  id: string;
  type: "image" | "file" | "location";
  url?: string;
  file?: File;
  name?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: Attachment[];
}

// Thông tin cửa hàng (có thể lấy từ API sau)
const STORE_INFO = {
  name: "Nhà Sách Online",
  phone: "1900-123-456",
  email: "contact@bookstore.vn",
  address: "12 Đường Nguyễn Văn Bảo, Gò Vấp, HCM",
};

export function ChatbotFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Xin chào! Tôi là trợ lý AI của Nhà Sách Online. Tôi có thể giúp bạn tìm sách, tư vấn về sản phẩm, hoặc trả lời các câu hỏi về đơn hàng. Bạn cần hỗ trợ gì hôm nay?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Quick suggestions
  const quickSuggestions = [
    "Xin chào!",
    "Sách bán chạy",
    "Hôm nay là ngày mấy",
    "Sách trong khoảng giá 100k-200k",
  ];

  // Show suggestions only when there are few messages (just welcome message or empty)
  const showSuggestions = messages.length <= 1;

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

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    };

    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachMenu]);

  const handleSend = useCallback(async () => {
    if ((input.trim() === "" && attachments.length === 0) || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim() || "",
      isUser: true,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    const currentAttachments = [...attachments];
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      // Convert attachments to API format
      const chatAttachments: ChatAttachmentRequest[] = currentAttachments.map(
        (att) => ({
          type: att.type,
          url: att.url,
          name: att.name,
          location: att.location,
        })
      );

      // Call chatbot API
      const response = await chatService.sendMessage({
        message: currentInput || "",
        sessionId: sessionId,
        attachments: chatAttachments.length > 0 ? chatAttachments : undefined,
      });

      // Update sessionId if received
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
  }, [input, attachments, loading, sessionId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith("image/") ? "image" : "file",
        file,
        name: file.name,
        url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      };
      setAttachments((prev) => [...prev, attachment]);
    });

    // Reset input
    e.target.value = "";
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const attachment: Attachment = {
            id: Date.now().toString(),
            type: "location",
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          };
          setAttachments((prev) => [...prev, attachment]);
          setShowAttachMenu(false);
        },
        () => {
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleCallStore = () => {
    window.location.href = `tel:${STORE_INFO.phone}`;
  };

  const handleChatStore = () => {
    // Có thể mở một cửa sổ chat khác hoặc chuyển sang chế độ chat với nhân viên
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Bạn đang kết nối với nhân viên tư vấn của ${STORE_INFO.name}. Vui lòng chờ trong giây lát...`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle quick suggestion click
  const handleQuickSuggestion = useCallback(async (suggestion: string) => {
    if (loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: suggestion,
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
  }, [loading, sessionId]);


  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
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
          "sm:bottom-8 sm:right-8"
        )}
        aria-label="Mở chatbot AI"
      >
        <MessageCircle className="h-6 w-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-pulse">
            AI
          </span>
        )}
      </button>

      {/* Chatbot Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          // Reset session when closing dialog (optional - comment out if you want to keep session)
          // if (!open) {
          //   setSessionId(null);
          //   setMessages([
          //     {
          //       id: "welcome",
          //       text: "Xin chào! Tôi là trợ lý AI của Nhà Sách Online. Tôi có thể giúp bạn tìm sách, tư vấn về sản phẩm, hoặc trả lời các câu hỏi về đơn hàng. Bạn cần hỗ trợ gì hôm nay?",
          //       isUser: false,
          //       timestamp: new Date(),
          //     },
          //   ]);
          // }
        }}
      >
        <DialogContent
          className={cn(
            "flex max-h-[calc(100vh-8rem)] h-[500px] max-w-md flex-col p-0",
            "sm:h-[550px] sm:max-w-lg sm:max-h-[calc(100vh-10rem)]",
            "md:h-[600px]",
            // Position at bottom right corner instead of center
            "!top-auto !left-auto !bottom-24 !right-6",
            "!translate-x-0 !translate-y-0",
            "sm:!bottom-28 sm:!right-8",
            // Ensure it doesn't overflow above
            "overflow-hidden"
          )}
          showCloseButton={true}
        >
          {/* Header */}
          <DialogHeader className="border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Trợ lý AI
                  </DialogTitle>
                  <p className="text-xs text-primary-foreground/80">
                    {STORE_INFO.name}
                  </p>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={handleChatStore}
                  title="Chat với cửa hàng"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={handleCallStore}
                  title="Gọi cho cửa hàng"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Store Info */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {STORE_INFO.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {STORE_INFO.address}
              </span>
            </div>
          </DialogHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
            <div className="flex flex-col gap-4">
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
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mb-1">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={cn(
                              "rounded-lg overflow-hidden",
                              message.isUser
                                ? "bg-primary/20"
                                : "bg-muted/50"
                            )}
                          >
                            {attachment.type === "image" && attachment.url && (
                              <div className="relative max-w-[200px] max-h-[200px]">
                                <Image
                                  src={attachment.url}
                                  alt={attachment.name || "Image"}
                                  width={200}
                                  height={200}
                                  className="object-cover rounded-lg"
                                  unoptimized
                                />
                              </div>
                            )}
                            {attachment.type === "file" && (
                              <div className="flex items-center gap-2 p-2">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs truncate max-w-[150px]">
                                  {attachment.name}
                                </span>
                              </div>
                            )}
                            {attachment.type === "location" && attachment.location && (
                              <a
                                href={`https://www.google.com/maps?q=${attachment.location.lat},${attachment.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 hover:underline"
                              >
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">
                                  {attachment.location.address || "Vị trí của tôi"}
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Text Message */}
                    {message.text && (
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
                    )}
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
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {showSuggestions && !loading && (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-medium",
                      "bg-muted text-muted-foreground",
                      "hover:bg-primary hover:text-primary-foreground",
                      "transition-colors duration-200",
                      "border border-border hover:border-primary"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="border-t bg-background px-4 py-3">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative flex items-center gap-2 rounded-lg border border-border bg-muted p-2"
                  >
                    {attachment.type === "image" && attachment.url && (
                      <div className="relative h-12 w-12 overflow-hidden rounded">
                        <Image
                          src={attachment.url}
                          alt={attachment.name || "Preview"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    {attachment.type === "file" && (
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    )}
                    {attachment.type === "location" && (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="max-w-[100px] truncate text-xs">
                      {attachment.name || "Vị trí"}
                    </span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {/* Attach Button */}
              <div className="relative" ref={attachMenuRef}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={loading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                {/* Attach Menu */}
                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 z-10 flex flex-col gap-1 rounded-lg border border-border bg-background p-1 shadow-lg">
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Ảnh
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Paperclip className="h-4 w-4" />
                      Tệp
                    </button>
                    <button
                      onClick={handleLocationClick}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
                    >
                      <MapPin className="h-4 w-4" />
                      Định vị
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden Inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={loading || (input.trim() === "" && attachments.length === 0)}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Nhấn Enter để gửi
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
