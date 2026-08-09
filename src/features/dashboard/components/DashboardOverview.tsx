'use client';

import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useCountUp } from '@/hooks/useCountUp';
import { Product } from '@/data/products';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardOverviewProps {
  animKey: number;
  productsList: Product[];
}

export default function DashboardOverview({ animKey, productsList }: DashboardOverviewProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Count-up Animated Metrics
  const animatedRevenue = useCountUp(128500000, 1600, animKey);
  const animatedOrders = useCountUp(342, 1600, animKey);
  const animatedProducts = useCountUp(productsList.length, 1600, animKey);
  const animatedCustomers = useCountUp(1250, 1600, animKey);

  // 1. Line Chart Data & Options
  const lineChartData: ChartData<'line'> = useMemo(() => {
    return {
      labels: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: [6500000, 8200000, 7800000, 9500000, 11200000, 10800000, 12500000, 14000000, 13200000, 15800000, 17500000, 19200000],
          borderColor: '#2e7d32',
          borderWidth: 3.5,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(46, 125, 50, 0.2)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(46, 125, 50, 0.35)');
            gradient.addColorStop(1, 'rgba(46, 125, 50, 0.0)');
            return gradient;
          },
          fill: true,
          tension: 0.38,
          pointRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#2e7d32',
          pointBorderWidth: 3,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#2e7d32',
          pointHoverBorderColor: '#ffffff',
        },
      ],
    };
  }, [animKey]);

  const lineChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        y: {
          type: 'number' as const,
          easing: 'easeInOutBack' as const,
          duration: 1000,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 110;
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Doanh thu: ${context.raw.toLocaleString('vi-VN')}đ`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (val: any) => (val / 1000000) + ' Tr' },
          grid: { color: '#f1f5f9' },
        },
        x: { grid: { display: false } },
      },
    };
  }, [animKey]);

  // 2. Doughnut Chart Data & Options: Multi-Slice Staggered Radial Elastic Pop & Hover Push
  const doughnutChartData: ChartData<'doughnut'> = useMemo(() => {
    const catMap: Record<string, { name: string; revenue: number; color: string }> = {
      'noi-that': { name: 'Nội thất gia dụng', revenue: 0, color: '#2e7d32' },
      'den': { name: 'Đèn & Chiếu sáng', revenue: 0, color: '#2563eb' },
      'trang-tri': { name: 'Đồ trang trí Decor', revenue: 0, color: '#f59e0b' },
      'decor': { name: 'Đồ trang trí Decor', revenue: 0, color: '#f59e0b' },
      'luu-tru': { name: 'Giỏ & Kệ lưu trữ', revenue: 0, color: '#8b5cf6' },
      'gom-su': { name: 'Gốm sứ thủ công', revenue: 0, color: '#ec4899' },
      'nha-bep': { name: 'Đồ dùng Nhà bếp', revenue: 0, color: '#06b6d4' },
    };

    if (productsList && productsList.length > 0) {
      productsList.forEach(p => {
        const cat = p.category || 'decor';
        const rev = (p.price || 0) * (p.soldCount || 10);
        if (catMap[cat]) {
          catMap[cat].revenue += rev;
        } else {
          catMap[cat] = { name: p.categoryName || cat, revenue: rev, color: '#64748b' };
        }
      });
    }

    if (catMap['decor'] && catMap['trang-tri']) {
      catMap['trang-tri'].revenue += catMap['decor'].revenue;
      delete catMap['decor'];
    }

    const activeCats = Object.values(catMap).filter(c => c.revenue > 0);
    const labels = activeCats.length > 0 ? activeCats.map(c => c.name) : ['Nội thất gia dụng', 'Đèn & Chiếu sáng', 'Đồ trang trí Decor', 'Giỏ & Kệ lưu trữ'];
    const data = activeCats.length > 0 ? activeCats.map(c => c.revenue) : [48500000, 32000000, 28000000, 20000000];
    const bgColors = activeCats.length > 0 ? activeCats.map(c => c.color) : ['#2e7d32', '#2563eb', '#f59e0b', '#8b5cf6'];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 12,
        },
      ],
    };
  }, [productsList, animKey]);

  const doughnutChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1800,
        easing: 'easeOutBack' as const,
      },
      animations: {
        numbers: {
          type: 'number' as const,
          properties: ['circumference', 'endAngle'],
          easing: 'easeInOutBack' as const,
          duration: 1200,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 160; // 160ms staggered delay per slice
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 700 },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle' as const,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => ` ${context.label}: ${context.raw.toLocaleString('vi-VN')}đ`,
          },
        },
      },
      cutout: '65%',
    };
  }, [animKey]);

  // 3. Top 10 Best Sellers Bar Chart
  const top10ProductsData: ChartData<'bar'> = useMemo(() => {
    const productsCopy = [...productsList];
    productsCopy.sort((a, b) => {
      const revA = a.price * (a.soldCount || 10);
      const revB = b.price * (b.soldCount || 10);
      return revB - revA;
    });

    const top10 = productsCopy.slice(0, 10);

    return {
      labels: top10.map(p => p.name.length > 16 ? p.name.substring(0, 16) + '...' : p.name),
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: top10.map(p => p.price * (p.soldCount || 10)),
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#10b981';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#047857');
            gradient.addColorStop(0.5, '#10b981');
            gradient.addColorStop(1, '#34d399');
            return gradient;
          },
          hoverBackgroundColor: '#065f46',
          borderRadius: 6,
          borderWidth: 0,
          barPercentage: 0.5,
          categoryPercentage: 0.8,
        }
      ]
    };
  }, [productsList]);

  const top10ChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        y: {
          type: 'number' as const,
          easing: 'easeOutBack' as const,
          duration: 1400,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 120;
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Doanh thu: ${context.raw.toLocaleString('vi-VN')}đ`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => val >= 1000000 ? (val / 1000000) + ' Tr' : val.toLocaleString('vi-VN'),
            font: { family: 'Plus Jakarta Sans', size: 10, weight: 600 },
          },
          grid: { color: '#f1f5f9' },
        },
        x: {
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 9, weight: 700 },
          },
          grid: { display: false },
        },
      },
    };
  }, []);

  return (
    <div className="admin-tab-page" id="tab-overview">
      {/* 4 KPI CARDS ROW (4 SQUARE CARDS) */}
      <section className="kpi-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* KPI Card 1: Revenue */}
        <div className="kpi-card kpi-card-animated" key={`kpi-1-${animKey}`} style={{ animationDelay: '0ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Doanh thu tháng này</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="kpi-trend">
            <i className="fa-solid fa-arrow-trend-up"></i>
            <span>+12.5% so với tháng trước</span>
          </div>
        </div>

        {/* KPI Card 2: Orders */}
        <div className="kpi-card kpi-card-animated" key={`kpi-2-${animKey}`} style={{ animationDelay: '100ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Số đơn hàng</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedOrders} đơn
          </div>
          <div className="kpi-trend">
            <i className="fa-solid fa-arrow-trend-up"></i>
            <span>+8.2% đơn hoàn tất</span>
          </div>
        </div>

        {/* KPI Card 3: Products */}
        <div className="kpi-card kpi-card-animated" key={`kpi-3-${animKey}`} style={{ animationDelay: '200ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Tổng sản phẩm</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedProducts} món
          </div>
          <div className="kpi-trend" style={{ color: 'var(--primary-color)' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>Đang kinh doanh</span>
          </div>
        </div>

        {/* KPI Card 4: Customers */}
        <div className="kpi-card kpi-card-animated" key={`kpi-4-${animKey}`} style={{ animationDelay: '300ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Khách hàng</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-users-viewfinder"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedCustomers.toLocaleString('vi-VN')} người
          </div>
          <div className="kpi-trend">
            <i className="fa-solid fa-arrow-trend-up"></i>
            <span>+15.3% thành viên mới</span>
          </div>
        </div>
      </section>

      {/* CHARTS GRID */}
      <section className="charts-grid">
        {/* Line Chart Card */}
        <div className="chart-card chart-card-animated" key={`chart-line-card-${animKey}`} style={{ animationDelay: '350ms' }}>
          <div className="chart-header">
            <div className="chart-title-group">
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-line" style={{ color: '#2e7d32' }}></i>
                <span>Doanh thu theo các tháng (2025)</span>
              </h3>
              <span className="chart-subtitle">Thống kê biến động tổng doanh thu hàng tháng từ Tháng 1 đến Tháng 12</span>
            </div>
          </div>

          <div className="chart-container">
            <Line ref={chartRef} key={`line-canvas-${animKey}`} data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart Card */}
        <div className="chart-card chart-card-animated" key={`chart-doughnut-card-${animKey}`} style={{ animationDelay: '450ms' }}>
          <div className="chart-header">
            <div className="chart-title-group">
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-pie" style={{ color: '#2563eb' }}></i>
                <span>Doanh thu theo danh mục</span>
              </h3>
              <span className="chart-subtitle">Tỷ trọng doanh thu đóng góp theo từng nhóm ngành hàng</span>
            </div>
          </div>

          <div className="chart-container doughnut-chart-container">
            <Doughnut key={`doughnut-canvas-${animKey}`} data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </section>

      {/* Full-width Bar Chart: Top 10 Best Sellers */}
      <div 
        className="chart-card chart-card-animated" 
        key={`chart-bar-card-${animKey}`} 
        style={{ animationDelay: '550ms', marginTop: '24px' }}
      >
        <div className="chart-header">
          <div className="chart-title-group">
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-chart-column" style={{ color: '#10b981' }}></i>
              <span>Top 10 Sản Phẩm Doanh Thu Cao Nhất 🚀</span>
            </h3>
            <span className="chart-subtitle">Thống kê doanh thu tích lũy dựa trên số lượng đã bán thực tế</span>
          </div>
        </div>

        <div className="chart-container" style={{ height: '360px' }}>
          <Bar key={`bar-canvas-${animKey}`} data={top10ProductsData} options={top10ChartOptions} />
        </div>
      </div>
    </div>
  );
}
