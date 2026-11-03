/**
 * Report Export Service
 * Handles exporting revenue reports to Excel and PDF formats
 * Uses browser APIs to avoid external dependencies
 */

import { RevenueStatisticsData } from "./revenue-statistics.service";
import { cleanMarkdown } from "../utils";

export interface ReportData {
  statistics: RevenueStatisticsData;
  aiReportText: string;
  period: {
    type: "day" | "week" | "month";
    label: string;
    startDate: string;
    endDate: string;
  };
  generatedAt: Date;
}

class ReportExportService {
  /**
   * Export report to Excel format (CSV format - Excel compatible)
   */
  async exportToExcel(data: ReportData): Promise<void> {
    try {
      // Create CSV content (Excel can open CSV files)
      let csvContent = "\uFEFF"; // BOM for UTF-8
      
      // Header
      csvContent += "BÁO CÁO THỐNG KÊ DOANH THU\n";
      csvContent += `Khoảng thời gian: ${data.period.label}\n`;
      csvContent += `Từ ngày: ${this.formatDate(data.period.startDate)}\n`;
      csvContent += `Đến ngày: ${this.formatDate(data.period.endDate)}\n`;
      csvContent += `Ngày tạo: ${data.generatedAt.toLocaleString("vi-VN")}\n\n`;
      
      // Tổng quan
      csvContent += "=== TỔNG QUAN ===\n";
      csvContent += "Chỉ số,Giá trị\n";
      csvContent += `"Tổng doanh thu","${data.statistics.totalRevenue.toLocaleString("vi-VN")} VNĐ"\n`;
      csvContent += `"Tổng số đơn hàng","${data.statistics.userStats.totalOrders.toLocaleString("vi-VN")}"\n`;
      csvContent += `"Giá trị đơn hàng trung bình","${data.statistics.userStats.avgOrderValue.toLocaleString("vi-VN")} VNĐ"\n`;
      csvContent += `"Tổng số người dùng","${data.statistics.userStats.totalUsers.toLocaleString("vi-VN")}"\n`;
      csvContent += `"Người dùng hoạt động","${data.statistics.userStats.activeUsers.toLocaleString("vi-VN")}"\n`;
      csvContent += `"Người dùng mới tháng này","${data.statistics.userStats.newUsersThisMonth.toLocaleString("vi-VN")}"\n`;
      csvContent += `"Doanh thu trung bình/người dùng","${data.statistics.userStats.avgRevenuePerUser.toLocaleString("vi-VN")} VNĐ"\n\n`;
      
      // Chi tiết đơn hàng
      csvContent += "=== CHI TIẾT ĐƠN HÀNG ===\n";
      csvContent += "Trạng thái,Số lượng\n";
      csvContent += `"Chờ xử lý",${data.statistics.ordersByStatus.PENDING}\n`;
      csvContent += `"Đã xác nhận",${data.statistics.ordersByStatus.CONFIRMED}\n`;
      csvContent += `"Đang xử lý",${data.statistics.ordersByStatus.PROCESSING}\n`;
      csvContent += `"Đã giao hàng",${data.statistics.ordersByStatus.SHIPPED}\n`;
      csvContent += `"Đã giao",${data.statistics.ordersByStatus.DELIVERED}\n`;
      csvContent += `"Đã hủy",${data.statistics.ordersByStatus.CANCELLED}\n`;
      csvContent += `"Hoàn thành",${data.statistics.ordersByStatus.COMPLETED}\n\n`;
      
      // Top Spenders
      if (data.statistics.userStats.topSpenders.length > 0) {
        csvContent += "=== TOP SPENDERS ===\n";
        csvContent += "Tên,Email,Số đơn,Tổng chi tiêu\n";
        data.statistics.userStats.topSpenders.forEach((user) => {
          csvContent += `"${user.fullName || user.username}","${user.email}",${user.totalOrders},"${user.totalSpent.toLocaleString("vi-VN")} VNĐ"\n`;
        });
        csvContent += "\n";
      }
      
      // Top Buyers
      if (data.statistics.userStats.topBuyers.length > 0) {
        csvContent += "=== TOP BUYERS ===\n";
        csvContent += "Tên,Email,Số đơn,Tổng chi tiêu\n";
        data.statistics.userStats.topBuyers.forEach((user) => {
          csvContent += `"${user.fullName || user.username}","${user.email}",${user.totalOrders},"${user.totalSpent.toLocaleString("vi-VN")} VNĐ"\n`;
        });
        csvContent += "\n";
      }
      
      // Phân tích AI
      csvContent += "=== PHÂN TÍCH AI ===\n";
      const cleanedAiText = cleanMarkdown(data.aiReportText);
      const aiLines = cleanedAiText.split("\n").filter((line) => line.trim());
      aiLines.forEach((line) => {
        csvContent += `"${line.replace(/"/g, '""')}"\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bao-cao-doanh-thu-${data.period.label.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting to Excel:", error);
      throw new Error(
        error.message || "Không thể xuất file Excel. Vui lòng thử lại."
      );
    }
  }

  /**
   * Export report to PDF format (using print dialog with optimized HTML)
   */
  async exportToPDF(data: ReportData): Promise<void> {
    try {
      // Create HTML content for PDF (simplified CSS to avoid color function issues)
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Báo cáo thống kê doanh thu</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      padding: 0;
      margin: 0;
      line-height: 1.6;
      color: rgb(51, 51, 51);
      background-color: rgb(255, 255, 255);
      width: 100%;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
    }
    .header {
      text-align: center;
      border-bottom: 3px solid rgb(139, 105, 20);
      padding: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: rgb(139, 105, 20);
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .header-info {
      margin-top: 10px;
      font-size: 12px;
      color: rgb(102, 102, 102);
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: rgb(139, 105, 20);
      margin-bottom: 15px;
      border-left: 4px solid rgb(139, 105, 20);
      padding-left: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table th {
      background-color: rgb(139, 105, 20);
      color: rgb(255, 255, 255);
      padding: 10px;
      text-align: left;
      font-weight: bold;
      border: 1px solid rgb(109, 80, 16);
    }
    table td {
      padding: 8px 10px;
      border-bottom: 1px solid rgb(221, 221, 221);
      border-left: 1px solid rgb(238, 238, 238);
      border-right: 1px solid rgb(238, 238, 238);
    }
    table tr:nth-child(even) {
      background-color: rgb(249, 249, 249);
    }
    table tr:last-child td {
      border-bottom: 1px solid #ddd;
    }
    .ai-analysis {
      background-color: rgb(245, 245, 245);
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
      font-size: 11px;
      line-height: 1.8;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgb(221, 221, 221);
      font-size: 10px;
      color: rgb(102, 102, 102);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BÁO CÁO THỐNG KÊ DOANH THU</h1>
    <div class="header-info">
      <p><strong>Khoảng thời gian:</strong> ${data.period.label}</p>
      <p><strong>Từ ngày:</strong> ${this.formatDate(data.period.startDate)} <strong>Đến ngày:</strong> ${this.formatDate(data.period.endDate)}</p>
      <p><strong>Ngày tạo:</strong> ${data.generatedAt.toLocaleString("vi-VN")}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. TỔNG QUAN</div>
    <table>
      <thead>
        <tr>
          <th>Chỉ số</th>
          <th>Giá trị</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tổng doanh thu</td>
          <td>${data.statistics.totalRevenue.toLocaleString("vi-VN")} VNĐ</td>
        </tr>
        <tr>
          <td>Tổng số đơn hàng</td>
          <td>${data.statistics.userStats.totalOrders.toLocaleString("vi-VN")}</td>
        </tr>
        <tr>
          <td>Giá trị đơn hàng trung bình</td>
          <td>${data.statistics.userStats.avgOrderValue.toLocaleString("vi-VN")} VNĐ</td>
        </tr>
        <tr>
          <td>Tổng số người dùng</td>
          <td>${data.statistics.userStats.totalUsers.toLocaleString("vi-VN")}</td>
        </tr>
        <tr>
          <td>Người dùng hoạt động</td>
          <td>${data.statistics.userStats.activeUsers.toLocaleString("vi-VN")}</td>
        </tr>
        <tr>
          <td>Người dùng mới tháng này</td>
          <td>${data.statistics.userStats.newUsersThisMonth.toLocaleString("vi-VN")}</td>
        </tr>
        <tr>
          <td>Doanh thu trung bình/người dùng</td>
          <td>${data.statistics.userStats.avgRevenuePerUser.toLocaleString("vi-VN")} VNĐ</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">2. CHI TIẾT ĐƠN HÀNG</div>
    <table>
      <thead>
        <tr>
          <th>Trạng thái</th>
          <th>Số lượng</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Chờ xử lý</td>
          <td>${data.statistics.ordersByStatus.PENDING}</td>
        </tr>
        <tr>
          <td>Đã xác nhận</td>
          <td>${data.statistics.ordersByStatus.CONFIRMED}</td>
        </tr>
        <tr>
          <td>Đang xử lý</td>
          <td>${data.statistics.ordersByStatus.PROCESSING}</td>
        </tr>
        <tr>
          <td>Đã giao hàng</td>
          <td>${data.statistics.ordersByStatus.SHIPPED}</td>
        </tr>
        <tr>
          <td>Đã giao</td>
          <td>${data.statistics.ordersByStatus.DELIVERED}</td>
        </tr>
        <tr>
          <td>Đã hủy</td>
          <td>${data.statistics.ordersByStatus.CANCELLED}</td>
        </tr>
        <tr>
          <td>Hoàn thành</td>
          <td>${data.statistics.ordersByStatus.COMPLETED}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${data.statistics.userStats.topSpenders.length > 0 ? `
  <div class="section">
    <div class="section-title">3. TOP SPENDERS</div>
    <table>
      <thead>
        <tr>
          <th>Tên</th>
          <th>Email</th>
          <th>Số đơn</th>
          <th>Tổng chi tiêu</th>
        </tr>
      </thead>
      <tbody>
        ${data.statistics.userStats.topSpenders.map((user) => `
        <tr>
          <td>${user.fullName || user.username}</td>
          <td>${user.email}</td>
          <td>${user.totalOrders}</td>
          <td>${user.totalSpent.toLocaleString("vi-VN")} VNĐ</td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>
  ` : ""}

  <div class="section">
    <div class="section-title">4. PHÂN TÍCH AI</div>
    <div class="ai-analysis">${cleanMarkdown(data.aiReportText).replace(/\n/g, "<br>")}</div>
  </div>

  <div class="footer">
    <p>Báo cáo được tạo tự động bởi hệ thống AI - Nhà Sách Online</p>
    <p>Ngày tạo: ${data.generatedAt.toLocaleString("vi-VN")}</p>
  </div>
</body>
</html>
      `;

      // Create a hidden iframe to render the PDF content
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      document.body.appendChild(iframe);

      // Write HTML to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Không thể tạo iframe document");
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load
      await new Promise((resolve) => {
        if (iframe.contentWindow) {
          iframe.contentWindow.onload = () => resolve(undefined);
        }
        setTimeout(() => resolve(undefined), 500);
      });

      // Trigger print from iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }

      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    } catch (error: any) {
      console.error("Error exporting to PDF:", error);
      throw new Error(
        error.message || "Không thể xuất file PDF. Vui lòng thử lại."
      );
    }
  }

  /**
   * Format date string
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  }
}

export const reportExportService = new ReportExportService();
export default reportExportService;
